from django.contrib import admin

from authentication.models import OTP


@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
	list_display = ("id", "email", "purpose", "otp", "is_verified", "created_at")
	search_fields = ("email", "purpose",)
