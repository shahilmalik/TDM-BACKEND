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
import logging
import traceback
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import action
from authentication.models import OTP
from django.core.cache import cache

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

        # prevent OTP being sent if the contact email already exists
        try:
            if CustomUser.objects.filter(email=contact_email).exists():
                return Response(
                    {
                        'detail': 'contact person email is already registered',
                        'errors': {'contact_person': ['A user with this email already exists.']},
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except Exception:
            # On any unexpected DB error, continue with normal flow (will be surfaced later)
            pass

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
            logging.exception("Failed to create client profile")
            tb = traceback.format_exc()
            return Response({'detail': 'Failed to create client profile', 'error': str(e), 'traceback': tb}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        cache.delete(cache_key)
        # return serialized profile (includes nested `user_detail`) for frontend convenience
        serialized = ClientProfileSerializer(profile).data

        # generate JWT tokens so frontend can authenticate immediately
        try:
            refresh = RefreshToken.for_user(profile.user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)
        except Exception:
            access_token = None
            refresh_token = None

        resp_body = {'success': True, 'detail': 'Account created successfully', 'data': serialized}
        if access_token:
            resp_body.update({'token': access_token, 'refresh': refresh_token})

        return Response(resp_body, status=status.HTTP_201_CREATED)


class ClientSignupResendAPIView(APIView):
    """Resend OTP for a pending client signup using the cached payload.

    POST payload: {"contact_email": "..."}
    """
    def post(self, request):
        contact_email = request.data.get('contact_email')
        if contact_email:
            contact_email = contact_email.strip().lower()
        if not contact_email:
            return Response({'detail': 'contact_email is required'}, status=status.HTTP_400_BAD_REQUEST)

        cache_key = f"client_signup:{contact_email}"
        data = cache.get(cache_key)
        if not data:
            return Response({'detail': 'No pending signup found or OTP expired'}, status=status.HTTP_404_NOT_FOUND)

        # generate new OTP and update cache
        otp = ''.join(random.choices(string.digits, k=6))
        data['otp'] = otp
        cache.set(cache_key, data, 600)

        # attempt to send OTP
        try:
            payload = data.get('payload', {})
            user_name = None
            try:
                user_name = payload.get('contact_person', {}).get('first_name')
            except Exception:
                user_name = None
            send_otp_email(contact_email, otp, user_name=user_name)
        except Exception as e:
            logging.exception("Failed to resend OTP for signup")
            return Response({'detail': 'Failed to resend OTP'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'detail': 'OTP resent to contact email'}, status=status.HTTP_200_OK)


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

    @action(detail=True, methods=['post'])
    def initiate_contact_email_change(self, request, pk=None):
        """Start OTP flow to change contact person's email. Expects {'contact_email': 'new@example.com'}"""
        client = self.get_object()
        new_email = request.data.get('contact_email')
        if not new_email:
            return Response({'detail': 'contact_email is required'}, status=status.HTTP_400_BAD_REQUEST)
        new_email = new_email.strip().lower()

        # Don't allow if email already exists for other user
        try:
            if CustomUser.objects.filter(email=new_email).exclude(id=client.user.id).exists():
                return Response({'detail': 'Email already in use'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            pass

        # generate OTP and cache pending change
        otp = ''.join(random.choices(string.digits, k=6))
        cache_key = f"client_email_change:{client.id}:{new_email}"
        cache.set(cache_key, {'new_email': new_email, 'requested_by': request.user.id}, 600)

        # persist pending email on profile so verification can survive cache expiry
        try:
            client.pending_contact_email = new_email
            client.pending_contact_email_verified = False
            client.save()
        except Exception:
            logging.exception("Failed to persist pending contact email on ClientProfile")

        try:
            # persist OTP record for verification
            OTP.objects.create(email=new_email, otp=otp, purpose='reset')
            send_otp_email(new_email, otp, user_name=client.user.first_name)
        except Exception:
            return Response({'detail': 'Failed to send OTP'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'detail': 'OTP sent to new email'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def verify_contact_email_change(self, request, pk=None):
        """Verify OTP and apply contact email change. Expects {'contact_email': 'new@example.com', 'otp': '123456'}"""
        client = self.get_object()
        new_email = request.data.get('contact_email')
        otp = request.data.get('otp')
        if new_email:
            new_email = new_email.strip().lower()
        if not new_email or not otp:
            return Response({'detail': 'contact_email and otp required'}, status=status.HTTP_400_BAD_REQUEST)

        cache_key = f"client_email_change:{client.id}:{new_email}"
        data = cache.get(cache_key)
        if not data:
            # Cache entry missing or expired — don't fail immediately.
            # The OTP itself was persisted in the OTP table during initiation,
            # so allow verification to proceed by checking the OTP record.
            logging.warning(f"No cache for email change {cache_key} — attempting direct OTP verification")

        # verify OTP exists and is not expired
        try:
            otp_obj = OTP.objects.filter(email=new_email, otp=otp, purpose='reset', is_verified=False).latest('created_at')
        except OTP.DoesNotExist:
            return Response({'detail': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
        if otp_obj.is_expired():
            return Response({'detail': 'OTP expired'}, status=status.HTTP_400_BAD_REQUEST)

        # mark verified; persist verification and mark pending email on profile
        otp_obj.is_verified = True
        otp_obj.save()

        try:
            # Store pending email on ClientProfile and mark verified.
            client.pending_contact_email = new_email
            client.pending_contact_email_verified = True
            client.save()
            # remove cache if present
            cache.delete(cache_key)
        except Exception:
            return Response({'detail': 'Failed to persist pending email change'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'detail': 'Contact email verification successful. The email will be applied when you save your profile.'}, status=status.HTTP_200_OK)
