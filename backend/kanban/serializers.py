from rest_framework import serializers
from .models import ContentItem, KANBAN_COLUMNS, MediaAsset, ContentComment
from kanban.ws import send_to_client_and_user
from core.notifications import notify_content_item_event

class ContentItemMoveSerializer(serializers.Serializer):
    target_column = serializers.ChoiceField(choices=[col[0] for col in KANBAN_COLUMNS])

    def validate(self, attrs):
        user = self.context['request'].user
        item = self.context['content_item']
        target_column = attrs['target_column']
        if not item.can_move(user, target_column):
            raise serializers.ValidationError({"error": "Permission denied to move this item."})
        return attrs

    def save(self):
        item = self.context['content_item']
        target_column = self.validated_data['target_column']
        user = self.context['request'].user
        try:
            item._history_user = user
        except Exception:
            pass
        item.move_to(user, target_column)

        try:
            client_id = getattr(item, "client_id", None)
            if client_id:
                send_to_client_and_user(
                    client_id,
                    "content_item_status_changed",
                    {"content_item_id": item.id, "column": item.column},
                )

            notify_content_item_event(
                content_item=item,
                actor_user_id=getattr(user, "id", None),
                title="Card moved",
                body=f"{item.title} moved to {item.column}",
                data={
                    "event": "content_item_status_changed",
                    "content_item_id": item.id,
                    "column": item.column,
                },
            )
        except Exception:
            pass
        return item

class ContentItemApprovalSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=["approve", "revise"])
    revise_notes = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def validate(self, attrs):
        user = self.context['request'].user
        item = self.context['content_item']
        if item.column != "client_approval":
            raise serializers.ValidationError({"error": "Item not in client approval stage."})
        if user.type not in ["manager", "client"]:
            raise serializers.ValidationError({"error": "Only client or manager can approve/revise."})
        return attrs

    def save(self):
        item = self.context['content_item']
        action = self.validated_data['action']
        user = self.context['request'].user
        try:
            item._history_user = user
        except Exception:
            pass
        if action == "approve":
            item.approval_status = "approved"
            item.column = "scheduled"
        elif action == "revise":
            item.approval_status = "revise_needed"
            item.column = "content_writing"  # Send back to content writing
            item.revise_requested = True
            item.revise_count = (item.revise_count or 0) + 1
            notes = self.validated_data.get("revise_notes")
            if notes is not None:
                item.revise_notes = notes
        item.save()

        try:
            client_id = getattr(item, "client_id", None)
            if client_id:
                send_to_client_and_user(
                    client_id,
                    "content_item_status_changed",
                    {
                        "content_item_id": item.id,
                        "column": item.column,
                        "approval_status": item.approval_status,
                        "action": action,
                    },
                )

            notify_content_item_event(
                content_item=item,
                actor_user_id=getattr(user, "id", None),
                title="Content updated",
                body=f"{item.title}: {action}",
                data={
                    "event": "content_item_status_changed",
                    "content_item_id": item.id,
                    "column": item.column,
                    "approval_status": item.approval_status,
                    "action": action,
                },
            )
        except Exception:
            pass
        return item


from rest_framework import serializers
from kanban.models import ContentItem, KANBAN_COLUMNS, APPROVAL_STATUS, ContentItemCommentRead
from core.models import CustomUser, Service
from invoice.models import Invoice
from django.utils import timezone


class InvoiceMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = ['id', 'invoice_id', 'status', 'date', 'due_date', 'total_amount']


class MediaAssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaAsset
        fields = [
            'id',
            'file',
            'public_url',
            'media_type',
            'order',
            'uploaded_by',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class UserMiniSerializer(serializers.ModelSerializer):
    """Lightweight user info for display"""
    class Meta:
        model = CustomUser
        fields = ['id', 'first_name', 'last_name', 'type']


class ServiceMiniSerializer(serializers.ModelSerializer):
    """Minimal service info for content linkage"""
    category = serializers.CharField(source='category.name', read_only=True)
    hsn = serializers.CharField(read_only=True)

    class Meta:
        model = Service
        fields = ['id', 'name', 'hsn', 'category']


class ContentItemSerializer(serializers.ModelSerializer):
    """
    Main serializer for Kanban items.
    Includes read/write support and readable related fields.
    """
    client = UserMiniSerializer(read_only=True)
    created_by = UserMiniSerializer(read_only=True)
    service = ServiceMiniSerializer(read_only=True)
    assigned_to = UserMiniSerializer(read_only=True)
    approved_by = UserMiniSerializer(read_only=True)
    invoice = InvoiceMiniSerializer(read_only=True)
    media_assets = MediaAssetSerializer(many=True, read_only=True)

    client_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(),
        write_only=True,
        source='client',
        required=False,
        allow_null=True,
    )
    created_by_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(),
        write_only=True,
        source='created_by',
        required=False,
        allow_null=True,
    )
    service_id = serializers.PrimaryKeyRelatedField(
        queryset=Service.objects.all(), write_only=True, source='service', allow_null=True
    )

    invoice_id = serializers.PrimaryKeyRelatedField(
        queryset=Invoice.objects.all(),
        write_only=True,
        source='invoice',
        allow_null=False,
        required=True,
    )
    assigned_to_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(), write_only=True, source='assigned_to', allow_null=True, required=False
    )
    approved_by_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(), write_only=True, source='approved_by', allow_null=True, required=False
    )

    column_display = serializers.SerializerMethodField()
    approval_display = serializers.SerializerMethodField()
    unread_comments_count = serializers.SerializerMethodField()

    class Meta:
        model = ContentItem
        fields = [
            'id',
            'title',
            'creative_copy',
            'due_date',
            'platforms',
            'column',
            'column_display',
            'priority',
            'approval_status',
            'approval_display',

            'client',
            'client_id',
            'created_by',
            'created_by_id',
            'service',
            'service_id',

            'invoice',
            'invoice_id',
            'assigned_to',
            'assigned_to_id',
            'approved_by',
            'approved_by_id',
            'approved_at',

            'revise_requested',
            'revise_count',
            'revise_notes',

            'post_action',
            'scheduled_at',
            'posted_at',

            'content_type',
            'post_caption',
            'platform_caption_overrides',
            'hashtags',
            'is_carousel',
            'link_url',
            'location',
            'location_id',

            'post_failed',
            'post_error',
            'external_post_id',

            'media_assets',
            'unread_comments_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_column_display(self, obj):
        return dict(KANBAN_COLUMNS).get(obj.column, obj.column)

    def get_approval_display(self, obj):
        return dict(APPROVAL_STATUS).get(obj.approval_status, obj.approval_status)

    def get_unread_comments_count(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if not user or not getattr(user, 'is_authenticated', False):
            return 0

        last_read_at = (
            ContentItemCommentRead.objects.filter(content_item=obj, user=user)
            .values_list('last_read_at', flat=True)
            .first()
        )

        qs = obj.comments.all()
        if last_read_at:
            qs = qs.filter(created_at__gt=last_read_at)
        return qs.count()

    def validate(self, data):
        """Custom validation to ensure proper fields and roles."""
        title = data.get('title')
        if not title:
            raise serializers.ValidationError({"error": "Title is required."})

        invoice = data.get('invoice')
        if invoice is None:
            raise serializers.ValidationError({"invoice_id": "Invoice is required."})

        client = data.get('client')
        if client is not None and invoice is not None and client != invoice.client:
            raise serializers.ValidationError(
                {"client_id": "Client must match invoice client."}
            )

        if data.get('platforms') and not isinstance(data['platforms'], list):
            raise serializers.ValidationError({"error": "Platforms must be a list."})

        return data

    def create(self, validated_data):
        user = self.context['request'].user
        # Default created_by to request user unless provided explicitly
        validated_data.setdefault('created_by', user)

        # Force creation in backlog only
        validated_data['column'] = 'backlog'

        # Default client when not provided (title is the only required field)
        if validated_data.get('client') is None:
            if getattr(user, 'type', None) == 'client':
                # Clients cannot create items; keep consistent anyway
                validated_data['client'] = user
            else:
                invoice = validated_data.get('invoice')
                if invoice is not None:
                    validated_data['client'] = invoice.client

        item = ContentItem(**validated_data)
        # Ensure django-simple-history captures the actor, even if middleware
        # isn't configured or threadlocals aren't available.
        try:
            item._history_user = user
        except Exception:
            pass
        item.save()
        return item

    def update(self, instance, validated_data):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if user and getattr(user, 'is_authenticated', False):
            try:
                instance._history_user = user
            except Exception:
                pass
        old_column = getattr(instance, "column", None)
        updated = super().update(instance, validated_data)

        # Realtime: column changes (covers PATCH /content-items/<id>/ with {column: ...})
        try:
            new_column = getattr(updated, "column", None)
            if old_column != new_column:
                client_id = getattr(updated, "client_id", None)
                if client_id:
                    send_to_client_and_user(
                        client_id,
                        "content_item_status_changed",
                        {
                            "content_item_id": updated.id,
                            "column": new_column,
                            "from_column": old_column,
                        },
                    )
        except Exception:
            pass

        return updated

    def to_representation(self, instance):
        """Ensure consistent success format when needed."""
        representation = super().to_representation(instance)
        return representation


class ContentCommentReplySerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()

    class Meta:
        model = ContentComment
        fields = ["id", "author", "role", "text", "date"]

    def get_author(self, obj):
        u = obj.author
        if not u:
            return "Unknown"
        full = (u.get_full_name() or "").strip()
        return full or (u.email or "User")

    def get_date(self, obj):
        # frontend expects a string; use ISO (frontend formats if desired)
        return obj.created_at.isoformat() if obj.created_at else ""


class ContentCommentSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()

    content_item_id = serializers.PrimaryKeyRelatedField(
        queryset=ContentItem.objects.all(), write_only=True, source="content_item"
    )

    class Meta:
        model = ContentComment
        fields = [
            "id",
            "content_item_id",
            "author",
            "role",
            "text",
            "date",
            "replies",
            "parent",
        ]
        extra_kwargs = {
            "role": {"required": False, "allow_blank": True, "allow_null": True},
            "parent": {"write_only": True, "required": False, "allow_null": True}
        }

    def get_author(self, obj):
        u = obj.author
        if not u:
            return "Unknown"
        full = (u.get_full_name() or "").strip()
        return full or (u.email or "User")

    def get_date(self, obj):
        return obj.created_at.isoformat() if obj.created_at else ""

    def get_replies(self, obj):
        # single reply max, but frontend uses `replies: Comment[]`
        rep = getattr(obj, "reply", None)
        if rep:
            return [ContentCommentReplySerializer(rep).data]
        return []

    def validate(self, attrs):
        parent = attrs.get("parent")
        content_item = attrs.get("content_item")
        if parent:
            # Only allow replying to a top-level comment
            if parent.parent_id is not None:
                raise serializers.ValidationError(
                    {"parent": "You can only reply to a top-level comment."}
                )
            # Single reply rule
            if hasattr(parent, "reply") and parent.reply is not None:
                raise serializers.ValidationError(
                    {"parent": "This comment already has a reply."}
                )
            # Content item must match parent
            if content_item and parent.content_item_id != content_item.id:
                raise serializers.ValidationError(
                    {"content_item_id": "Reply must match parent content item."}
                )
        return attrs

    def create(self, validated_data):
        request = self.context.get("request")
        user = getattr(request, "user", None)

        validated_data["author"] = user if user and user.is_authenticated else None
        if user and getattr(user, "type", None) == "client":
            validated_data["role"] = "client"
        else:
            validated_data["role"] = "agency"

        comment = super().create(validated_data)

        # Author has effectively "read" the thread up to this point.
        if user and getattr(user, 'is_authenticated', False):
            try:
                ContentItemCommentRead.objects.update_or_create(
                    content_item=comment.content_item,
                    user=user,
                    defaults={"last_read_at": timezone.now()},
                )
            except Exception:
                pass

        try:
            content_item = getattr(comment, "content_item", None)
            client_id = getattr(content_item, "client_id", None)
            if client_id:
                send_to_client_and_user(
                    client_id,
                    "comment_added",
                    {
                        "content_item_id": comment.content_item_id,
                        "comment_id": comment.id,
                        "parent_id": comment.parent_id,
                        "created_at": comment.created_at.isoformat() if comment.created_at else "",
                    },
                )

            from core.notifications import notify_content_item_event

            if content_item:
                is_reply = comment.parent_id is not None
                notify_content_item_event(
                    content_item=content_item,
                    actor_user_id=getattr(user, "id", None),
                    title="New reply" if is_reply else "New comment",
                    body=f"{content_item.title}",
                    data={
                        "event": "comment_added",
                        "content_item_id": comment.content_item_id,
                        "comment_id": comment.id,
                        "parent_id": comment.parent_id,
                    },
                )
        except Exception:
            pass

        return comment