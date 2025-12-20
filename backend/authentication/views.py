from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import SignupSerializer, LoginSerializer, SendOTPSerializer, ResetPasswordSerializer, VerifySignupOTPSerializer

class AuthViewSet(viewsets.ViewSet):

    # --------------------------
    # Signup
    # --------------------------
    @action(detail=False, methods=['post'])
    def signup(self, request):
        serializer = SendOTPSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.save()
            return Response(data)
        return Response({"success": False, "errors": serializer.errors}, status=400)

    @action(detail=False, methods=['post'])
    def verify_signup_otp(self, request):
        serializer = VerifySignupOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Get client_id if user has a profile
        client_id = None
        try:
            if hasattr(user, 'profile'):
                client_id = user.profile.id
        except:
            pass

        return Response({
            "success": True,
            "message": "Account created successfully",
            "user": SignupSerializer(user).data,
            "client_id": client_id,
        }, status=201)

    # --------------------------
    # Login
    # --------------------------
    @action(detail=False, methods=['post'])
    def signin(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            
            # Get client_id if user has a profile
            client_id = None
            try:
                if hasattr(user, 'profile'):
                    client_id = user.profile.id
            except:
                pass
            
            return Response({
                "success": True,
                "token": str(refresh.access_token),
                "refresh": str(refresh),
                "user": SignupSerializer(user).data,
                "client_id": client_id,
            })
        return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    # --------------------------
    # Send OTP
    # --------------------------
    @action(detail=False, methods=['post'])
    def send_otp(self, request):
        serializer = SendOTPSerializer(data=request.data)
        if serializer.is_valid():
            otp_data = serializer.save()
            return Response({"success": True, "data": otp_data})
        return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    # --------------------------
    # Reset password
    # --------------------------
    @action(detail=False, methods=['post'])
    def reset_password(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"success": True, "message": "Password reset successful"})
        return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
