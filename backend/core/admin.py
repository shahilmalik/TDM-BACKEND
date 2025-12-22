from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib import messages
from simple_history.admin import SimpleHistoryAdmin

from core.models import CustomUser, Service, ServiceCategory, ClientProfile, DeviceToken


class CustomUserChangeForm(forms.ModelForm):
    """Form to edit CustomUser with password change capability"""
    password = forms.CharField(
        label="Password",
        widget=forms.PasswordInput,
        required=False,
        help_text="Leave blank to keep the current password. Enter a new password to change it."
    )

    class Meta:
        model = CustomUser
        fields = '__all__'

    def save(self, commit=True):
        user = super().save(commit=False)
        password = self.cleaned_data.get('password')
        if password:
            user.set_password(password)
        if commit:
            user.save()
        return user


@admin.register(CustomUser)
class UserAdmin(SimpleHistoryAdmin):
    form = CustomUserChangeForm
    list_display = (
        "id",
        "first_name",
        "last_name",
        "type",
        "email",
        "phone",
        "is_active",
        "created_at",
        "updated_at",
        "archived"
    )
    search_fields = (
        "first_name",
        "last_name",
        "email",
        "phone"
    )
    list_filter = ("type", "is_active", "is_staff", "created_at")
    fieldsets = (
        ("Personal Info", {
            "fields": ("salutation", "first_name", "last_name", "email", "phone", "password")
        }),
        ("Account Type & Status", {
            "fields": ("type", "is_active", "is_staff", "is_superuser")
        }),
        ("Contact Preferences", {
            "fields": ("country_code", "whatsapp_updates")
        }),
        ("Permissions", {
            "fields": ("groups", "user_permissions"),
            "classes": ("collapse",)
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at", "archived"),
            "classes": ("collapse",)
        }),
    )
    readonly_fields = ("created_at", "updated_at")


@admin.register(Service)
class ServiceAdmin(SimpleHistoryAdmin):
    list_display = (
        "id",
        "service_id",
        "name",
        "price",
        "is_active",
        "is_pipeline",
        "category"
    )
    search_fields = ("name", "service_id", "category__name")
    list_filter = ("is_active", "is_pipeline", "category", "created_at")
    fieldsets = (
        ("Service Details", {
            "fields": ("service_id", "name", "category", "description")
        }),
        ("Pricing", {
            "fields": ("price", "hsn")
        }),
        ("Pipeline", {
            "fields": ("is_pipeline", "pipeline_config")
        }),
        ("Status", {
            "fields": ("is_active",)
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at", "archived"),
            "classes": ("collapse",)
        }),
    )
    readonly_fields = ("created_at", "updated_at")


@admin.register(ServiceCategory)
class ServiceCategoryAdmin(SimpleHistoryAdmin):
    list_display = ("id", "name", "slug")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}
    readonly_fields = ("created_at", "updated_at")


@admin.register(ClientProfile)
class ClientProfileAdmin(SimpleHistoryAdmin):
    list_display = (
        "id",
        "user",
        "company_name",
        "client_code",
        "gstin",
        "created_at"
    )
    search_fields = (
        "company_name",
        "client_code",
        "user__email",
        "gstin"
    )
    list_filter = ("created_at", "whatsapp_updates")
    fieldsets = (
        ("User Account", {
            "fields": ("user",)
        }),
        ("Business Details", {
            "fields": ("company_name", "client_code", "billing_address", "gstin")
        }),
        ("Contact Information", {
            "fields": ("business_email", "business_phone", "business_phone_country_code")
        }),
        ("Preferences", {
            "fields": ("whatsapp_updates",)
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at", "archived"),
            "classes": ("collapse",)
        }),
    )
    readonly_fields = ("created_at", "updated_at", "client_code")


@admin.register(DeviceToken)
class DeviceTokenAdmin(SimpleHistoryAdmin):
    list_display = (
        "id",
        "user",
        "platform",
        "device_id",
        "token",
        "last_seen_at",
        "created_at",
        "archived",
    )
    search_fields = (
        "user__email",
        "user__first_name",
        "user__last_name",
        "token",
        "device_id",
    )
    list_filter = (
        "platform",
        "archived",
        "created_at",
        "last_seen_at",
    )
    readonly_fields = (
        "created_at",
        "updated_at",
        "last_seen_at",
    )

