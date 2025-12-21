from rest_framework import serializers
from .models import Invoice, InvoiceItem, PaymentMode, PaymentTerm, BusinessInfo, Payment
from core.serializers import UserSerializer
from core.models import CustomUser




class InvoiceItemSerializer(serializers.ModelSerializer):
    service_name = serializers.SerializerMethodField()

    class Meta:
        model = InvoiceItem
        fields = ('id', 'service', 'service_name', 'description', 'unit_price', 'quantity', 'line_total')
        read_only_fields = ('line_total',)

    def get_service_name(self, obj):
        return obj.service.name if obj.service else None


class PaymentModeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMode
        fields = ('id', 'name')


class PaymentTermSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentTerm
        fields = ('id', 'name', 'days', 'description')


class BusinessInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessInfo
        fields = '__all__'


class PaymentSerializer(serializers.ModelSerializer):
    invoice = serializers.PrimaryKeyRelatedField(queryset=Invoice.objects.all())
    payment_mode = serializers.PrimaryKeyRelatedField(
        queryset=PaymentMode.objects.all(), allow_null=True, required=False
    )
    payment_mode_detail = PaymentModeSerializer(source='payment_mode', read_only=True)
    received_by = UserSerializer(read_only=True)

    class Meta:
        model = Payment
        fields = (
            'id', 'invoice', 'amount', 'payment_mode', 'payment_mode_detail',
            'reference', 'paid_at', 'received_by'
        )


class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True)
    # accept client id on write, but produce a dict on read via to_representation
    client = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all())
    authorized_by = serializers.SerializerMethodField()
    payment_mode = serializers.PrimaryKeyRelatedField(queryset=PaymentMode.objects.all(), allow_null=True, required=False)
    payment_term = serializers.PrimaryKeyRelatedField(queryset=PaymentTerm.objects.all(), allow_null=True, required=False)
    paid_amount = serializers.SerializerMethodField()
    pending_amount = serializers.SerializerMethodField()
    status_label = serializers.SerializerMethodField()
    has_pipeline = serializers.SerializerMethodField()
    sender_business_info_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Invoice
        fields = (
            'id', 'invoice_id', 'client', 'date', 'start_date', 'due_date', 'items',
            'gst_percentage', 'gst_amount', 'total_amount', 'paid_amount', 'pending_amount',
            'status', 'status_label', 'payment_mode', 'payment_term', 'authorized_by', 'has_pipeline',
            'sender_name', 'sender_logo', 'sender_address', 'sender_phone', 'sender_email',
            'sender_bank_account_name', 'sender_bank_account_number', 'sender_bank_name', 'sender_ifsc',
            'sender_business_info_id',
            'created_at', 'updated_at'
        )

    def get_client(self, obj):
        user = obj.client
        return {'id': user.id, 'first_name': user.first_name, 'last_name': user.last_name, 'email': user.email}

    def get_authorized_by(self, obj):
        u = obj.authorized_by
        if not u:
            return None
        return {'id': u.id, 'first_name': u.first_name, 'last_name': u.last_name, 'email': u.email}

    def get_paid_amount(self, obj):
        return obj.paid_amount

    def get_pending_amount(self, obj):
        return obj.pending_amount

    def get_status_label(self, obj):
        try:
            return obj.get_status_display()
        except Exception:
            return obj.status

    def get_has_pipeline(self, obj):
        try:
            for it in obj.items.select_related('service').all():
                svc = getattr(it, 'service', None)
                if svc and getattr(svc, 'is_pipeline', False):
                    return True
        except Exception:
            return False
        return False

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        sender_bi_id = validated_data.pop('sender_business_info_id', None)

        # snapshot sender business info: prefer explicit id, otherwise use singleton/latest
        sender_snapshot = {}
        bi = None
        if sender_bi_id:
            try:
                bi = BusinessInfo.objects.get(pk=sender_bi_id)
            except BusinessInfo.DoesNotExist:
                bi = None
        else:
            bi = BusinessInfo.objects.order_by('-created_at').first()

        if bi:
            sender_snapshot = {
                'sender_name': bi.name,
                'sender_logo': bi.logo,
                'sender_address': bi.address,
                'sender_phone': bi.phone,
                'sender_email': bi.email,
                'sender_bank_account_name': bi.bank_account_name,
                'sender_bank_account_number': bi.bank_account_number,
                'sender_bank_name': bi.bank_name,
                'sender_ifsc': bi.ifsc,
            }

        invoice = Invoice.objects.create(**validated_data, **sender_snapshot)

        # create invoice items
        for it in items_data:
            InvoiceItem.objects.create(
                invoice=invoice,
                service=it.get('service'),
                description=it.get('description', ''),
                unit_price=it.get('unit_price'),
                quantity=it.get('quantity', 1),
            )

        # refresh from db to ensure totals are updated
        invoice.refresh_from_db()
        return invoice

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        # replace client pk with a small dict for readability
        user = instance.client
        rep['client'] = {
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
        }
        return rep

