from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ContentItem, ContentComment, MediaAsset, ContentItemCommentRead
from .serializers import (
    ContentItemMoveSerializer,
    ContentItemApprovalSerializer,
    ContentCommentSerializer,
    MediaAssetSerializer,
)
from kanban.serializers import ContentItemSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils.dateparse import parse_datetime
from django.utils import timezone
from typing import Any
from .models import KANBAN_COLUMNS, APPROVAL_STATUS

class ContentItemViewSet(viewsets.ModelViewSet):
    queryset = ContentItem.objects.select_related(
        "client",
        "created_by",
        "service",
        "invoice",
        "assigned_to",
        "approved_by",
    ).prefetch_related("media_assets")
    serializer_class = ContentItemSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        user = request.user
        if getattr(user, "type", None) not in ["superadmin", "manager"]:
            return Response(
                {"success": False, "error": "Only managers can create content items."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().create(request, *args, **kwargs)

    # Move item to another column
    @action(detail=True, methods=['post'])
    def move(self, request, pk=None):
        item = self.get_object()
        serializer = ContentItemMoveSerializer(data=request.data, context={'request': request, 'content_item': item})
        if serializer.is_valid():
            serializer.save()
            return Response({"success": True, "item": ContentItemSerializer(item).data})
        return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    # Approve or revise in client approval
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        item = self.get_object()
        serializer = ContentItemApprovalSerializer(data=request.data, context={'request': request, 'content_item': item})
        if serializer.is_valid():
            serializer.save()
            return Response({"success": True, "item": ContentItemSerializer(item).data})
        return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    # Schedule a creative/post (sets scheduled_at and moves to scheduled)
    @action(detail=True, methods=["post"], url_path="schedule")
    def schedule(self, request, pk=None):
        item = self.get_object()
        user = request.user
        if getattr(user, "type", None) not in ["superadmin", "manager"]:
            return Response(
                {"success": False, "error": "Permission denied."},
                status=status.HTTP_403_FORBIDDEN,
            )

        raw_dt = request.data.get("scheduled_at")
        if not raw_dt:
            return Response(
                {"success": False, "error": "scheduled_at is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        dt = parse_datetime(str(raw_dt))
        if dt is None:
            return Response(
                {"success": False, "error": "Invalid datetime format for scheduled_at."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if timezone.is_naive(dt):
            dt = timezone.make_aware(dt, timezone.get_current_timezone())

        item.scheduled_at = dt
        item.post_action = "schedule"
        item.column = "scheduled"
        try:
            item._history_user = user
        except Exception:
            pass
        item.save()
        return Response({"success": True, "item": ContentItemSerializer(item).data})

    @action(
        detail=True,
        methods=["post"],
        url_path="media",
        parser_classes=[MultiPartParser, FormParser],
    )
    def media(self, request, pk=None):
        """Attach a media file to a content item."""
        item = self.get_object()
        user = request.user
        if getattr(user, "type", None) == "client":
            return Response(
                {"success": False, "error": "Permission denied."},
                status=status.HTTP_403_FORBIDDEN,
            )

        f = request.FILES.get("file")
        if not f:
            return Response(
                {"success": False, "error": "file is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        media_type = str(request.data.get("media_type") or "").lower().strip()
        if not media_type:
            ct = getattr(f, "content_type", "") or ""
            media_type = "image" if ct.startswith("image/") else "video"
        if media_type not in ["image", "video"]:
            media_type = "image"

        try:
            order = int(request.data.get("order") or 0)
        except Exception:
            order = 0

        if order <= 0:
            try:
                order = (item.media_assets.count() or 0) + 1
            except Exception:
                order = 1

        asset = MediaAsset.objects.create(
            content_item=item,
            file=f,
            media_type=media_type,
            order=order,
            uploaded_by=user,
            is_active=True,
        )

        return Response(
            {
                "success": True,
                "asset": MediaAssetSerializer(asset).data,
                "item": ContentItemSerializer(item).data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["get"], url_path="activity")
    def activity(self, request, pk=None):
        """Return activity history for this content item using django-simple-history."""
        item = self.get_object()

        def format_user(u: Any) -> str:
            # Only show "System" when the change was made without a user context
            # (e.g., background tasks).
            if not u:
                return "System"
            try:
                first_name = (getattr(u, "first_name", "") or "").strip()
                if first_name:
                    return first_name
                email = (getattr(u, "email", "") or "").strip()
                if email:
                    return email
                return str(getattr(u, "pk", "")) or "User"
            except Exception:
                return "User"

        column_labels = dict(KANBAN_COLUMNS)
        approval_labels = dict(APPROVAL_STATUS)

        # Newest first
        history_qs = item.history.all().order_by("-history_date")
        history_list = list(history_qs)

        tracked_fields = [
            "title",
            "column",
            "priority",
            "due_date",
            "assigned_to_id",
            "approval_status",
            "revise_requested",
            "revise_count",
            "post_action",
            "scheduled_at",
            "posted_at",
            "invoice_id",
            "service_id",
        ]

        def get_val(obj: Any, field: str):
            try:
                return getattr(obj, field)
            except Exception:
                return None

        def describe_change(current: Any, previous: Any) -> str:
            # history_type: + created, ~ changed, - deleted
            ht = getattr(current, "history_type", "~")
            if ht == "+":
                return "Created the task"
            if ht == "-":
                return "Deleted the task"

            changes = {}
            if previous is not None:
                for f in tracked_fields:
                    a = get_val(current, f)
                    b = get_val(previous, f)
                    if a != b:
                        changes[f] = (b, a)

            # Prefer meaningful summaries
            if "column" in changes:
                new_col = changes["column"][1]
                return f"Moved to {column_labels.get(new_col, new_col)}"
            if "approval_status" in changes:
                new_val = changes["approval_status"][1]
                return f"Approval status set to {approval_labels.get(new_val, new_val)}"
            if "assigned_to_id" in changes:
                return "Updated assignee"
            if "scheduled_at" in changes:
                new_dt = changes["scheduled_at"][1]
                if new_dt:
                    try:
                        return f"Scheduled for {new_dt.isoformat()}"
                    except Exception:
                        return "Scheduled"
                return "Removed schedule"
            if "revise_requested" in changes and changes["revise_requested"][1] is True:
                return "Requested revision"
            if changes:
                # Generic but still helpful
                fields = ", ".join(list(changes.keys())[:3])
                extra = "" if len(changes) <= 3 else f" (+{len(changes) - 3} more)"
                return f"Updated {fields}{extra}"
            return "Updated the task"

        out = []
        for idx, current in enumerate(history_list):
            previous = history_list[idx + 1] if idx + 1 < len(history_list) else None
            actor = getattr(current, "history_user", None)
            out.append(
                {
                    "id": str(getattr(current, "history_id", idx)),
                    "user": format_user(actor),
                    "action": describe_change(current, previous),
                    "timestamp": getattr(current, "history_date").isoformat()
                    if getattr(current, "history_date", None)
                    else "",
                }
            )

        return Response({"success": True, "history": out})

    @action(detail=True, methods=["post"], url_path="comments/mark-read")
    def mark_comments_read(self, request, pk=None):
        """Mark all comments for this item as read by the current user."""
        item = self.get_object()
        user = request.user
        ContentItemCommentRead.objects.update_or_create(
            content_item=item,
            user=user,
            defaults={"last_read_at": timezone.now()},
        )
        return Response(
            {
                "success": True,
                "unread_comments_count": 0,
                "last_read_at": timezone.now().isoformat(),
            }
        )


class ContentCommentViewSet(viewsets.ModelViewSet):
    queryset = ContentComment.objects.select_related(
        "content_item",
        "author",
        "parent",
    )
    serializer_class = ContentCommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        # List only top-level comments by default
        qs = qs.filter(parent__isnull=True)
        content_item_id = self.request.query_params.get("content_item")
        if content_item_id:
            qs = qs.filter(content_item_id=content_item_id)
        return qs.order_by("created_at")

    @action(detail=True, methods=["post"], url_path="reply")
    def reply(self, request, pk=None):
        parent = self.get_object()
        data = {
            "content_item_id": parent.content_item_id,
            "parent": parent.id,
            "text": request.data.get("text", ""),
        }
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        reply = serializer.save()
        # return the updated parent comment shape (with replies)
        parent.refresh_from_db()
        out = self.get_serializer(parent).data
        return Response(out, status=status.HTTP_201_CREATED)
