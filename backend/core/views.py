from rest_framework import viewsets
from .models import CustomUser, Service, ClientProfile, ServiceCategory
from .serializers import UserSerializer, ServiceSerializer, ClientProfileSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import EmployeeSignupSerializer, ClientSignupSerializer, EmployeeSerializer
from .serializers import ServiceCategorySerializer, ServiceListSerializer
from .serializers import ClientCreateUpdateSerializer, ClientProfileSerializer
from .serializers import UserWithBusinessSerializer
from django.db import transaction
from django.core.cache import cache
from core.utils import send_otp_email
import random
import string

class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer


class ServiceCategoryViewSet(viewsets.ModelViewSet):
    queryset = ServiceCategory.objects.all()
    serializer_class = ServiceCategorySerializer

class ClientProfileViewSet(viewsets.ModelViewSet):
    queryset = ClientProfile.objects.select_related('user').all()
    serializer_class = ClientProfileSerializer


class EmployeeViewSet(viewsets.ModelViewSet):
    """CRUD for employee users (non-client types).

    Endpoint: /employee/ (list, create), /employee/{id}/ (retrieve, update, delete)
    """
    queryset = CustomUser.objects.exclude(type='client')
    serializer_class = EmployeeSerializer

    def perform_create(self, serializer):
        # created employee should be active by default and have no usable password
        obj = serializer.save(is_active=True)
        obj.set_unusable_password()
        obj.save()


class ClientSignupInitiateAPIView(APIView):
    """Initiate client signup: validate payload, send OTP to contact email, cache payload until verification."""
    def post(self, request):
        serializer = ClientSignupSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        validated = serializer.validated_data
        contact_email = validated.get('contact_person', {}).get('email') if isinstance(validated.get('contact_person'), dict) else None
        if contact_email:
            contact_email = contact_email.strip().lower()
        if not contact_email:
            return Response({'detail': 'contact_person.email is required for OTP.'}, status=status.HTTP_400_BAD_REQUEST)

        # generate 6-digit numeric OTP
        otp = ''.join(random.choices(string.digits, k=6))

        # cache key
        cache_key = f"client_signup:{contact_email}"
        cache_timeout = 600  # 10 minutes
        cache.set(cache_key, {'payload': validated, 'otp': otp}, cache_timeout)

        # send OTP via email (uses core.utils.send_otp_email)
        try:
            send_otp_email(contact_email, otp, user_name=validated.get('contact_person', {}).get('first_name'))
        except Exception as e:
            return Response({'detail': 'Failed to send OTP'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'detail': 'OTP sent to contact email'}, status=status.HTTP_200_OK)


class ClientSignupVerifyAPIView(APIView):
    """Verify OTP and create client and contact user/profile."""
    @transaction.atomic
    def post(self, request):
        contact_email = request.data.get('contact_email')
        if contact_email:
            contact_email = contact_email.strip().lower()
        otp = request.data.get('otp')
        if not contact_email or not otp:
            return Response({'detail': 'contact_email and otp are required'}, status=status.HTTP_400_BAD_REQUEST)

        cache_key = f"client_signup:{contact_email}"
        data = cache.get(cache_key)
        if not data:
            return Response({'detail': 'No pending signup found or OTP expired'}, status=status.HTTP_404_NOT_FOUND)

        if str(data.get('otp')) != str(otp):
            return Response({'detail': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

        # create profile using stored payload
        payload = data.get('payload')
        try:
            profile = ClientSignupSerializer().create(payload)
        except Exception as e:
            return Response({'detail': 'Failed to create client profile'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        cache.delete(cache_key)
        return Response({'id': profile.id, 'company_name': profile.company_name}, status=status.HTTP_201_CREATED)


class ClientUsersAPIView(APIView):
    """Public endpoint for clients to list users with optional business info."""
    def get(self, request):
        # Optionally filter by type via query param ?type=client
        user_type = request.query_params.get('type')
        qs = CustomUser.objects.all()
        if user_type:
            qs = qs.filter(type=user_type)
        serializer = UserWithBusinessSerializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ClientViewSet(viewsets.ModelViewSet):
    """CRUD for clients along with their business info.

    - GET/POST /clients/
    - GET/PUT/PATCH/DELETE /clients/{id}/
    """
    queryset = ClientProfile.objects.select_related('user').all()

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return ClientCreateUpdateSerializer
        return ClientProfileSerializer

    def perform_create(self, serializer):
        # serializer.create returns a ClientProfile
        profile = serializer.save()
        return profile

    def perform_destroy(self, instance):
        # delete associated user and profile
        try:
            user = instance.user
            instance.delete()
            if user:
                user.delete()
        except Exception:
            # fallback: delete profile only
            instance.delete()
