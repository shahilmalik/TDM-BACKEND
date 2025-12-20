from rest_framework import serializers
from .models import MetaAccessToken, ClientPageMapping

class MetaAccessTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = MetaAccessToken
        fields = ['id', 'account_label', 'expires_at', 'status', 'created_at', 'updated_at']
        read_only_fields = ['status', 'created_at', 'updated_at']

class ClientPageMappingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientPageMapping
        fields = ['id', 'client_id', 'fb_page_id', 'ig_account_id', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
