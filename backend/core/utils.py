from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from django.conf import settings
from django.template.loader import render_to_string

class SendEmailException(Exception):
    """Custom exception for email sending failure"""
    pass

def send_otp_email(email, otp, user_name=None):
    subject = "Your OTP Code - Tarviz Digimart"

    html_content = render_to_string(
        "otp_email.html",
        {
            "otp": otp,
            "company_name": "Tarviz Digimart",
            "user": user_name or ""
        }
    )

    message = Mail(
        from_email=settings.DEFAULT_FROM_EMAIL,
        to_emails=email,
        subject=subject,
        html_content=html_content,
    )

    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        response = sg.send(message)
        if response.status_code >= 400:
            raise SendEmailException(f"SendGrid error: {response.status_code}")
    except Exception as e:
        print("SendGrid error:", e)
        raise SendEmailException("Failed to send OTP email") from e
