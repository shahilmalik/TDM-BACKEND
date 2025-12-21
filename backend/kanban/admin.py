from django.contrib import admin

from kanban.models import ContentItem


@admin.register(ContentItem)
class ContentItemAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "column",
        "client",
        "service",
        "created_by",
        "approval_status",
        "due_date",
        "created_at"
    )
    search_fields = (
        "id",
        "title",
        "client__email",
        "created_by__email"
    )
    list_filter = ("column", "approval_status", "created_at")
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        ("Content Details", {
            "fields": ("title", "creative_copy", "post_caption", "due_date", "platforms")
        }),
        ("Kanban Status", {
            "fields": ("column", "approval_status")
        }),
        ("Relations", {
            "fields": ("client", "service", "created_by")
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )
