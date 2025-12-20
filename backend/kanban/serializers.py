from rest_framework import serializers
from .models import ContentItem, KANBAN_COLUMNS, MediaAsset

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
        item.move_to(self.context['request'].user, target_column)
        return item

class ContentItemApprovalSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=["approve", "revise"])

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
        if action == "approve":
            item.approval_status = "approved"
            item.column = "scheduled"
        elif action == "revise":
            item.approval_status = "revise_needed"
            item.column = "content_writing"  # Send back to content writing
        item.save()
        return item


from rest_framework import serializers
from kanban.models import ContentItem, KANBAN_COLUMNS, APPROVAL_STATUS, PACKAGE_TYPES
from core.models import CustomUser, Service
from invoice.models import Invoice


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
        queryset=CustomUser.objects.all(), write_only=True, source='client'
    )
    created_by_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(), write_only=True, source='created_by'
    )
    service_id = serializers.PrimaryKeyRelatedField(
        queryset=Service.objects.all(), write_only=True, source='service', allow_null=True
    )

    invoice_id = serializers.PrimaryKeyRelatedField(
        queryset=Invoice.objects.all(), write_only=True, source='invoice', allow_null=True, required=False
    )
    assigned_to_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(), write_only=True, source='assigned_to', allow_null=True, required=False
    )
    approved_by_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(), write_only=True, source='approved_by', allow_null=True, required=False
    )

    column_display = serializers.SerializerMethodField()
    approval_display = serializers.SerializerMethodField()
    package_display = serializers.SerializerMethodField()

    class Meta:
        model = ContentItem
        fields = [
            'id',
            'title',
            'description',
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

            'package',
            'package_display',

            'revise_requested',
            'revise_count',
            'revise_notes',

            'post_action',
            'scheduled_at',
            'posted_at',

            'content_type',
            'caption',
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
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_column_display(self, obj):
        return dict(KANBAN_COLUMNS).get(obj.column, obj.column)

    def get_approval_display(self, obj):
        return dict(APPROVAL_STATUS).get(obj.approval_status, obj.approval_status)

    def get_package_display(self, obj):
        return dict(PACKAGE_TYPES).get(obj.package, obj.package)

    def validate(self, data):
        """Custom validation to ensure proper fields and roles."""
        title = data.get('title')
        if not title:
            raise serializers.ValidationError({"error": "Title is required."})

        if data.get('platforms') and not isinstance(data['platforms'], list):
            raise serializers.ValidationError({"error": "Platforms must be a list."})

        return data

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['created_by'] = user
        return super().create(validated_data)

    def to_representation(self, instance):
        """Ensure consistent success format when needed."""
        representation = super().to_representation(instance)
        return representation