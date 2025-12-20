import base64
from cryptography.fernet import Fernet
from django.db import models
from django.conf import settings


def get_fernet_cipher():
    """Get Fernet cipher instance using Django SECRET_KEY."""
    key = base64.urlsafe_b64encode(settings.SECRET_KEY.encode()[:32].ljust(32, b'\0'))
    return Fernet(key)


class EncryptedTextField(models.TextField):
    """Custom encrypted text field using Fernet encryption."""
    
    def get_prep_value(self, value):
        if value is None:
            return value
        cipher = get_fernet_cipher()
        encrypted = cipher.encrypt(value.encode())
        return base64.b64encode(encrypted).decode()
    
    def from_db_value(self, value, expression, connection):
        if value is None:
            return value
        try:
            cipher = get_fernet_cipher()
            decrypted = cipher.decrypt(base64.b64decode(value.encode()))
            return decrypted.decode()
        except Exception:
            return value
    
    def to_python(self, value):
        if value is None or isinstance(value, str):
            return value
        return str(value)
