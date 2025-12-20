from django.core.mail import send_mail
from django.conf import settings
import random
import string
from django.core.cache import cache


def generate_otp(length=6):
    """Generate a random 6-digit OTP."""
    return ''.join(random.choices(string.digits, k=length))


def send_otp_email(email, otp):
    """Send OTP to email."""
    subject = "Meta Integration OTP"
    message = f"Your OTP for Meta Access Token verification is: {otp}\n\nThis OTP is valid for 15 minutes."
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [email],
        fail_silently=False,
    )


def store_otp(user_id, otp, timeout=900):
    """Store OTP in cache (15 minutes = 900 seconds)."""
    cache.set(f"meta_otp_{user_id}", otp, timeout)


def verify_otp(user_id, provided_otp):
    """Verify provided OTP against stored OTP."""
    stored_otp = cache.get(f"meta_otp_{user_id}")
    if stored_otp is None:
        return False
    return str(provided_otp) == str(stored_otp)


def clear_otp(user_id):
    """Clear OTP after successful verification."""
    cache.delete(f"meta_otp_{user_id}")


def store_pending_token(user_id, token_data, timeout=900):
    """Store pending token data before verification."""
    cache.set(f"meta_pending_token_{user_id}", token_data, timeout)


def get_pending_token(user_id):
    """Retrieve pending token data."""
    return cache.get(f"meta_pending_token_{user_id}")


def clear_pending_token(user_id):
    """Clear pending token data after verification."""
    cache.delete(f"meta_pending_token_{user_id}")
