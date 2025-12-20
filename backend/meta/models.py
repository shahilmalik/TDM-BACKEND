

from django.db import models
from .encryption import EncryptedTextField
from core.models import ClientProfile

class MetaAccessToken(models.Model):
	STATUS_CHOICES = [
		("active", "Active"),
		("expired", "Expired"),
		("invalid", "Invalid"),
	]
	account_label = models.CharField(max_length=128)
	access_token = EncryptedTextField()  # Encrypted at rest via django-fernet-fields
	meta_user_id = models.CharField(max_length=128, blank=True, null=True)  # Facebook/Meta user ID
	profile_picture_url = models.URLField(blank=True, null=True)  # Profile picture from Meta
	expires_at = models.DateTimeField()
	status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="active")
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return f"{self.account_label} ({self.status})"

class ClientPageMapping(models.Model):
	client = models.ForeignKey(ClientProfile, on_delete=models.CASCADE, related_name='page_mappings')
	fb_page_id = models.CharField(max_length=128)
	ig_account_id = models.CharField(max_length=128, null=True, blank=True)
	page_access_token = EncryptedTextField()  # Encrypted at rest via django-fernet-fields
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return f"Client {self.client.user.email} → FB Page {self.fb_page_id}"
