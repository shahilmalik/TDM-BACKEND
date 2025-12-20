from django.contrib import admin
from .models import MetaAccessToken, ClientPageMapping


@admin.register(MetaAccessToken)
class MetaAccessTokenAdmin(admin.ModelAdmin):
    list_display = ("id", "account_label", "meta_user_id", "expires_at", "status", "created_at")
    search_fields = ("account_label", "meta_user_id")
    list_filter = ("status", "created_at")
    readonly_fields = ("created_at", "updated_at")


@admin.register(ClientPageMapping)
class ClientPageMappingAdmin(admin.ModelAdmin):
    list_display = ("id", "client", "fb_page_id", "ig_account_id", "created_at")
    search_fields = ("client__user__email", "fb_page_id", "ig_account_id")
    list_filter = ("created_at",)
    readonly_fields = ("created_at", "updated_at")
