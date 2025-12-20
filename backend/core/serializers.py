from rest_framework import serializers
from core.models import CustomUser, Service, ClientProfile, USER_TYPES, ServiceCategory

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = '__all__'


class EmployeeSerializer(serializers.ModelSerializer):
    """Serializer for employee CRUD endpoints. Exposes a minimal, safe set of fields."""
    class Meta:
        model = CustomUser
        fields = (
            'id', 'salutation', 'first_name', 'last_name', 'email',
            'phone', 'country_code', 'type', 'created_at', 'updated_at', 'archived'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'


class ServiceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        fields = ('id', 'name', 'slug')


# Keep a compact serializer for listing services with category name and hsn
class ServiceListSerializer(serializers.ModelSerializer):
    category = ServiceCategorySerializer(read_only=True)

    class Meta:
        model = Service
        fields = ('id', 'service_id', 'name', 'hsn', 'category')

class ClientProfileSerializer(serializers.ModelSerializer):
    user_detail = None

    class ClientUserPublicSerializer(serializers.ModelSerializer):
        """Safe subset of CustomUser fields suitable for client/profile responses."""
        class Meta:
            model = CustomUser
            fields = (
                'id',
                'salutation',
                'first_name',
                'last_name',
                'email',
                'phone',
                'country_code',
                'type',
                'is_active',
                'created_at',
                'updated_at',
                'archived',
            )

    # Keep the existing `user` field behavior (id) for writes,
    # but also include a nested view for reads.
    user_detail = ClientUserPublicSerializer(source='user', read_only=True)

    class Meta:
        model = ClientProfile
        fields = '__all__'


class EmployeeSignupSerializer(serializers.Serializer):
    salutation = serializers.ChoiceField(choices=CustomUser.SALUTATION_CHOICES, required=False, allow_null=True)
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    email = serializers.EmailField(required=False, allow_null=True, allow_blank=True)
    phone = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    country_code = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    role = serializers.ChoiceField(choices=USER_TYPES)

    def validate_role(self, value):
        return value

    def create(self, validated_data):
        role = validated_data.pop('role')
        user = CustomUser.objects.create(
            salutation=validated_data.get('salutation'),
            first_name=validated_data.get('first_name'),
            last_name=validated_data.get('last_name'),
            email=validated_data.get('email'),
            phone=validated_data.get('phone'),
            country_code=validated_data.get('country_code'),
            type=role,
            is_active=True,
        )
        user.set_unusable_password()
        user.save()
        return user


class ContactPersonSerializer(serializers.Serializer):
    salutation = serializers.ChoiceField(choices=CustomUser.SALUTATION_CHOICES, required=False, allow_null=True)
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    email = serializers.EmailField()
    phone = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    country_code = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    password = serializers.CharField(write_only=True)

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = CustomUser.objects.create(
            salutation=validated_data.get('salutation'),
            first_name=validated_data.get('first_name'),
            last_name=validated_data.get('last_name'),
            email=validated_data.get('email'),
            phone=validated_data.get('phone'),
            country_code=validated_data.get('country_code'),
            type='client',
            is_active=True,
        )
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        return user


class ClientSignupSerializer(serializers.Serializer):
    company_name = serializers.CharField()
    billing_address = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    gstin = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    business_email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)
    business_phone = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    business_phone_country_code = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    whatsapp_updates = serializers.BooleanField(default=False)
    contact_person = ContactPersonSerializer()

    def create(self, validated_data):
        contact_data = validated_data.pop('contact_person')
        contact_serializer = ContactPersonSerializer(data=contact_data)
        contact_serializer.is_valid(raise_exception=True)
        contact_user = contact_serializer.save()

        profile = ClientProfile.objects.create(
            user=contact_user,
            company_name=validated_data.get('company_name'),
            billing_address=validated_data.get('billing_address'),
            gstin=validated_data.get('gstin'),
            business_email=validated_data.get('business_email'),
            business_phone=validated_data.get('business_phone'),
            business_phone_country_code=validated_data.get('business_phone_country_code'),
            whatsapp_updates=validated_data.get('whatsapp_updates', False),
            contact_person=contact_user,
        )
        return profile


class ClientBusinessSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientProfile
        fields = (
            'company_name',
            'billing_address',
            'gstin',
            'business_email',
            'business_phone',
            'business_phone_country_code',
            'whatsapp_updates',
            'designation',
        )


class UserWithBusinessSerializer(serializers.ModelSerializer):
    created_at = serializers.DateTimeField()
    updated_at = serializers.DateTimeField()
    archived = serializers.BooleanField()
    salutation = serializers.CharField(allow_null=True, allow_blank=True)
    country_code = serializers.CharField(allow_null=True, allow_blank=True)
    whatsapp_updates = serializers.BooleanField()
    type = serializers.CharField()
    profile = ClientBusinessSerializer(source='profile', read_only=True)

    class Meta:
        model = CustomUser
        fields = (
            'id', 'created_at', 'updated_at', 'archived',
            'salutation', 'country_code', 'whatsapp_updates',
            'first_name', 'last_name', 'email', 'phone', 'type',
            'profile',
        )


class ClientCreateUpdateSerializer(serializers.Serializer):
    """Serializer for creating/updating clients along with their business info.

    - Creates a `CustomUser` with `type='client'` and an associated `ClientProfile`.
    - Does NOT accept a password (clients are created without usable password).
    """
    company_name = serializers.CharField()
    billing_address = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    gstin = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    business_email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)
    business_phone = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    business_phone_country_code = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    whatsapp_updates = serializers.BooleanField(default=False)

    contact_person = serializers.DictField()  # expecting a dict with user fields

    def validate_contact_person(self, value):
        # basic required fields for contact person
        if not value.get('first_name') or not value.get('last_name') or not value.get('email'):
            raise serializers.ValidationError('contact_person must include first_name, last_name and email')
        return value

    def create(self, validated_data):
        contact_data = validated_data.pop('contact_person')
        # normalize email
        contact_email = contact_data.get('email')
        if contact_email:
            contact_data['email'] = contact_email.strip().lower()

        user = CustomUser.objects.create(
            salutation=contact_data.get('salutation'),
            first_name=contact_data.get('first_name'),
            last_name=contact_data.get('last_name'),
            email=contact_data.get('email'),
            phone=contact_data.get('phone'),
            country_code=contact_data.get('country_code'),
            type='client',
            is_active=True,
        )
        user.set_unusable_password()
        user.save()

        profile = ClientProfile.objects.create(
            user=user,
            company_name=validated_data.get('company_name'),
            billing_address=validated_data.get('billing_address'),
            gstin=validated_data.get('gstin'),
            business_email=validated_data.get('business_email'),
            business_phone=validated_data.get('business_phone'),
            business_phone_country_code=validated_data.get('business_phone_country_code'),
            whatsapp_updates=validated_data.get('whatsapp_updates', False),
        )
        return profile

    def update(self, instance, validated_data):
        # instance is a ClientProfile
        contact_data = validated_data.pop('contact_person', None)
        # update profile fields
        for attr in ['company_name', 'billing_address', 'gstin', 'business_email', 'business_phone', 'business_phone_country_code', 'whatsapp_updates']:
            if attr in validated_data:
                setattr(instance, attr, validated_data.get(attr))

        # update user
        if contact_data:
            user = instance.user
            # normalize email if present
            if contact_data.get('email'):
                contact_data['email'] = contact_data.get('email').strip().lower()
            for field in ['salutation', 'first_name', 'last_name', 'email', 'phone', 'country_code']:
                if field in contact_data:
                    setattr(user, field, contact_data.get(field))
            user.save()

        instance.save()
        return instance

    def to_representation(self, instance):
        # instance will be a ClientProfile
        return ClientProfileSerializer(instance).data
