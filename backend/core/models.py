from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from simple_history.models import HistoricalRecords

# --------------------------
# Base model
# --------------------------
class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    archived = models.BooleanField(default=False)
    history = HistoricalRecords(inherit=True)

    class Meta:
        abstract = True

# --------------------------
# Custom user
# --------------------------
USER_TYPES = [
    ("client", "Client"),
    ("superadmin", "Superadmin"),
    ("manager", "Manager"),
    ("content_writer", "Content Writer"),
    ("designer", "Designer"),
]

class CustomUserManager(BaseUserManager):
    def create_user(self, email=None, phone=None, password=None, **extra_fields):
        if not email and not phone:
            raise ValueError("The Email or Phone must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, phone=phone, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email=email, password=password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin, BaseModel):
    SALUTATION_CHOICES = [
        ('Mr', 'Mr'),
        ('Mrs', 'Mrs'),
        ('Ms', 'Ms'),
        ('Dr', 'Dr'),
        ('Mx', 'Mx'),
    ]
    salutation = models.CharField(max_length=10, choices=SALUTATION_CHOICES, blank=True, null=True)
    country_code = models.CharField(max_length=6, blank=True, null=True)
    whatsapp_updates = models.BooleanField(default=False)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True, null=True, blank=True)
    phone = models.CharField(max_length=15, unique=True, null=True, blank=True)
    type = models.CharField(max_length=20, choices=USER_TYPES)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'  # Login can be customized later with email or phone
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"

# --------------------------
# Services
# --------------------------
class ServiceCategory(BaseModel):
    """Separate model for service categories so categories are CRUD-able."""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True, null=True)

    def __str__(self):
        return self.name


class Service(BaseModel):
    service_id = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    category = models.ForeignKey(ServiceCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='services')
    hsn = models.CharField(max_length=10, blank=True, null=True)

    def __str__(self):
        return self.name

# --------------------------
# Client profile
# --------------------------
class ClientProfile(BaseModel):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='profile')
    
    # Business details
    company_name = models.CharField(max_length=100)
    billing_address = models.TextField(blank=True, null=True)
    gstin = models.CharField(max_length=15, blank=True, null=True)
    business_email = models.EmailField(blank=True, null=True)
    business_phone = models.CharField(max_length=15, blank=True, null=True)
    business_phone_country_code = models.CharField(max_length=6, blank=True, null=True)
    whatsapp_updates = models.BooleanField(default=False)
    # Temporary pending contact email change requested via OTP flow.
    pending_contact_email = models.EmailField(blank=True, null=True)
    pending_contact_email_verified = models.BooleanField(default=False)
    # two-letter client code used in invoice numbers; generated if missing
    client_code = models.CharField(max_length=4, blank=True, null=True, unique=True)


