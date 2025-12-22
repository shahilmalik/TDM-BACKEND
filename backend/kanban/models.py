from django.conf import settings
from django.db import models
from django.utils import timezone
from core.models import BaseModel, CustomUser, Service


KANBAN_COLUMNS = [
    ("backlog", "Backlog"),
    ("content_writing", "Content Writing"),
    ("design_creative", "Design/Creative"),
    ("internal_review", "Internal Review"),
    ("client_approval", "Client Approval"),
    ("finalized", "Finalized"),
    ("ready", "Ready to Post"),
    ("scheduled", "Scheduled"),
    ("posted", "Posted"),
]

POST_ACTION = [
    ("instant", "Instant Post"),
    ("schedule", "Schedule Post"),
    ("manual", "Manual Posting"),
]

CONTENT_TYPE = [
    ("single", "Single Image"),
    ("carousel", "Carousel"),
    ("reel", "Reel / Video"),
    ("story", "Story"),
    ("cover", "Cover"),
    ("banner", "Banner"),
    ("flyer", "Flyer"),
    ("logo", "Logo"),
    ("package_design", "Package Design"),
]

PRIORITY_LEVEL = [
    ("low", "Low"),
    ("medium", "Medium"),
    ("high", "High"),
]

APPROVAL_STATUS = [
    ("pending", "Pending"),
    ("approved", "Approved"),
    ("revise_needed", "Revise Needed"),
]

class ContentItem(BaseModel):
    title = models.CharField(max_length=200)
    creative_copy = models.TextField(blank=True, null=True)
    due_date = models.DateField(null=True, blank=True)
    platforms = models.JSONField(default=list)
    column = models.CharField(max_length=50, choices=KANBAN_COLUMNS, default='backlog')

    # priority & assignment
    priority = models.CharField(max_length=10, choices=PRIORITY_LEVEL, default="low")
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_content_items",
    )

    client = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='content_items')
    service = models.ForeignKey(Service, on_delete=models.SET_NULL, null=True)
    invoice = models.ForeignKey(
        "invoice.Invoice",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="content_items",
    )
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='created_content_items')
    approval_status = models.CharField(max_length=20, choices=APPROVAL_STATUS, default="pending")

    # approval
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_content_items",
    )
    approved_at = models.DateTimeField(null=True, blank=True)

    # revision tracking
    revise_requested = models.BooleanField(default=False)
    revise_count = models.PositiveIntegerField(default=0)
    revise_notes = models.TextField(blank=True, null=True)

    # posting decision
    post_action = models.CharField(max_length=10, choices=POST_ACTION, default="manual")
    scheduled_at = models.DateTimeField(null=True, blank=True)
    posted_at = models.DateTimeField(null=True, blank=True)

    # platform & creative metadata
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPE, blank=True, null=True)
    post_caption = models.TextField(blank=True, null=True)
    platform_caption_overrides = models.JSONField(default=dict, blank=True)
    hashtags = models.JSONField(default=list, blank=True)
    is_carousel = models.BooleanField(default=False)
    link_url = models.URLField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    location_id = models.CharField(max_length=100, blank=True, null=True)

    # posting result
    post_failed = models.BooleanField(default=False)
    post_error = models.TextField(blank=True, null=True)
    external_post_id = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        ordering = ["-created_at"]

    def can_move(self, user, target_column):
        """Check if user can move item to target_column"""
        if user.type in ["superadmin", "manager"]:
            return True
        if self.column == "backlog" and target_column == "content_writing" and user.type == "manager":
            return True
        if self.column == "content_writing" and target_column == "design_creative" and user.type == "content_writer":
            return True
        if self.column == "design_creative" and target_column == "internal_review" and user.type == "designer":
            return True
        if self.column == "internal_review" and target_column == "client_approval" and user.type == "manager":
            return True
        if self.column == "client_approval" and target_column in ["scheduled", "revise_needed"] and user.type == "client":
            return True
        return False

    def move_to(self, user, target_column):
        if not self.can_move(user, target_column):
            raise ValueError("You do not have permission to move this item.")
        try:
            self._history_user = user
        except Exception:
            pass
        self.column = target_column
        # Reset approval status if moving to client approval
        if target_column == "client_approval":
            self.approval_status = "pending"
        self.save()


class MediaAsset(BaseModel):
    content_item = models.ForeignKey(
        "kanban.ContentItem",
        on_delete=models.CASCADE,
        related_name="media_assets",
    )

    file = models.FileField(upload_to="content_media/")
    public_url = models.URLField(blank=True, null=True)
    media_type = models.CharField(
        max_length=10,
        choices=[("image", "Image"), ("video", "Video")],
    )
    order = models.PositiveIntegerField(default=0)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order"]


class MetaLocationCache(BaseModel):
    name = models.CharField(max_length=255)
    place_id = models.CharField(max_length=100, unique=True)

    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    raw_response = models.JSONField()
    last_verified_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=["name"])]

    def __str__(self):
        return f"{self.name} ({self.place_id})"


COMMENT_ROLES = [
    ("client", "Client"),
    ("agency", "Agency"),
]


class ContentComment(BaseModel):
    content_item = models.ForeignKey(
        "kanban.ContentItem",
        on_delete=models.CASCADE,
        related_name="comments",
    )
    # A comment can have only one reply. The reply is itself a ContentComment with parent set.
    parent = models.OneToOneField(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="reply",
    )

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="content_comments",
    )
    role = models.CharField(max_length=10, choices=COMMENT_ROLES)
    text = models.TextField()

    class Meta:
        ordering = ["created_at"]

    def clean(self):
        # replies cannot reply to replies
        if self.parent and self.parent.parent_id is not None:
            raise ValueError("You can only reply to a top-level comment.")
        # keep replies scoped to the same content item
        if self.parent and self.content_item and self.parent.content_item != self.content_item:
            raise ValueError("Reply content item must match parent content item.")

    def save(self, *args, **kwargs):
        # If reply, inherit content_item from parent (single source of truth)
        if self.parent is not None:
            self.content_item = self.parent.content_item
        super().save(*args, **kwargs)


class ContentItemCommentRead(BaseModel):
    """Tracks the last time a user read the comments for a content item."""

    content_item = models.ForeignKey(
        "kanban.ContentItem",
        on_delete=models.CASCADE,
        related_name="comment_reads",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="comment_reads",
    )
    last_read_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ("content_item", "user")
        indexes = [
            models.Index(fields=["content_item", "user"]),
            models.Index(fields=["user", "last_read_at"]),
        ]
