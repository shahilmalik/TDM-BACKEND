from rest_framework import serializers
from django.contrib.auth import authenticate
from core.models import CustomUser
import random
from core.utils import send_otp_email
from .models import OTP
# --------------------------
# Signup serializer
# --------------------------
class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['first_name', 'last_name', 'email', 'phone', 'password', 'type']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = CustomUser.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user

# --------------------------
# Login serializer (email or phone)
# --------------------------
class LoginSerializer(serializers.Serializer):
    email = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if not email:
            raise serializers.ValidationError({"error": "Email is required."})
        
        user = None

        if '@' in email:
            user = authenticate(email=email, password=password)
        else:
            try:
                user_obj = CustomUser.objects.get(phone=email)
                user = authenticate(email=user_obj.email, password=password)
            except CustomUser.DoesNotExist:
                pass

        if not user:
            raise serializers.ValidationError({"error": "Invalid credentials."})

        attrs['user'] = user
        return attrs

# --------------------------
# Send OTP serializer
# --------------------------
OTP_STORE = {}  # Simple in-memory store; replace with Redis/db in production

class SendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    purpose = serializers.ChoiceField(choices=['signup', 'reset'])
    user_name = serializers.CharField(required=False, allow_blank=True)

    def create(self, validated_data):
        otp_code = str(random.randint(100000, 999999))

        # Save OTP in DB
        OTP.objects.create(
            email=validated_data['email'],
            otp=otp_code,
            purpose=validated_data['purpose']
        )

        try:
            send_otp_email(
                email=validated_data['email'],
                otp=otp_code,
                user_name=validated_data.get('user_name')
            )
        except SendEmailException as e:
            # Graceful API response
            return {
                "email": validated_data['email'],
                "success": False,
                "message": str(e)
            }

        return {
            "email": validated_data['email'],
            "success": True,
            "message": "OTP sent successfully"
        }

# Reset password serializer
# --------------------------
class ResetPasswordSerializer(serializers.Serializer):
    phone = serializers.CharField()
    otp = serializers.CharField()
    new_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        phone = attrs.get('phone')
        otp = attrs.get('otp')
        if OTP_STORE.get(phone) != otp:
            raise serializers.ValidationError({"error": "Invalid OTP."})
        return attrs

    def save(self):
        phone = self.validated_data['phone']
        new_password = self.validated_data['new_password']
        user = CustomUser.objects.get(phone=phone)
        user.set_password(new_password)
        user.save()
        OTP_STORE.pop(phone, None)
        return user

class VerifySignupOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        try:
            otp_obj = OTP.objects.filter(
                email=data['email'],
                otp=data['otp'],
                purpose='signup',
                is_verified=False
            ).latest('created_at')
        except OTP.DoesNotExist:
            raise serializers.ValidationError("Invalid OTP")

        if otp_obj.is_expired():
            raise serializers.ValidationError("OTP expired")

        data['otp_obj'] = otp_obj
        return data

    def create(self, validated_data):
        otp_obj = validated_data['otp_obj']
        otp_obj.is_verified = True
        otp_obj.save()

        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user
