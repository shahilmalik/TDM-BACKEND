# --------------------------
# Invoices and Payments
# --------------------------
from django.db import models
from django.utils import timezone
from django.db import transaction
from core.models import BaseModel, CustomUser, Service, ClientProfile
from django.core.exceptions import ValidationError
import calendar
import string


INVOICE_STATUS = [
    ("unpaid", "Pending Payment"),
    ("partially_paid", "Partially Paid"),
    ("paid", "Paid"),
    ("cancelled", "Cancelled"),
]


class PaymentMode(BaseModel):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class PaymentTerm(BaseModel):
    name = models.CharField(max_length=100)
    days = models.IntegerField(default=0)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class BusinessInfo(BaseModel):
    """Our (sender) business information snapshot source."""
    name = models.CharField(max_length=200)
    logo = models.CharField(max_length=500, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    secondary_email = models.EmailField(blank=True, null=True) 
    bank_account_name = models.CharField(max_length=200, blank=True, null=True)
    bank_account_number = models.CharField(max_length=64, blank=True, null=True)
    bank_name = models.CharField(max_length=200, blank=True, null=True)
    ifsc = models.CharField(max_length=32, blank=True, null=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Enforce singleton: do not allow creating a new instance if one already exists
        if not self.pk and BusinessInfo.objects.exists():
            raise ValidationError("Only one BusinessInfo instance is allowed. Update the existing one instead.")
        
        if self.bank_account_name:
            self.bank_account_name = self.bank_account_name.upper()
        if self.bank_account_number:
            self.bank_account_number = self.bank_account_number.upper()
        if self.bank_name:
            self.bank_name = self.bank_name.upper()
        if self.ifsc:
            self.ifsc = self.ifsc.upper()

        super().save(*args, **kwargs)


class Invoice(BaseModel):
    """Invoice snapshot. Immutable after creation.

    Invoice number format: <client_code><invoice_pk><MON><YY>
      - client_code: two-letter code derived from client's company name (unique)
      - invoice_pk: the Django pk of the invoice
      - MON: first three letters of current month (upper)
      - YY: last two digits of year
    """
    invoice_id = models.CharField(max_length=64, unique=True, blank=True)
    client = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='invoices')
    # snapshot business info for sender (so future changes don't affect past invoices)
    sender_name = models.CharField(max_length=200, blank=True, null=True)
    sender_logo = models.CharField(max_length=500, blank=True, null=True)
    sender_address = models.TextField(blank=True, null=True)
    sender_phone = models.CharField(max_length=50, blank=True, null=True)
    sender_email = models.EmailField(blank=True, null=True)
    sender_bank_account_name = models.CharField(max_length=200, blank=True, null=True)
    sender_bank_account_number = models.CharField(max_length=64, blank=True, null=True)
    sender_bank_name = models.CharField(max_length=200, blank=True, null=True)
    sender_ifsc = models.CharField(max_length=32, blank=True, null=True)

    # payment and term choices
    payment_mode = models.ForeignKey(PaymentMode, on_delete=models.SET_NULL, null=True, blank=True)
    payment_term = models.ForeignKey(PaymentTerm, on_delete=models.SET_NULL, null=True, blank=True)

    # dates
    date = models.DateField(auto_now_add=True)
    # Start date for services/content delivery associated with this invoice.
    start_date = models.DateField(blank=True, null=True)
    due_date = models.DateField(blank=True, null=True)

    # gst percentage for whole invoice
    gst_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    gst_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # totals cached on invoice creation
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    # payments aggregated from Payment records; status reflects payment state
    status = models.CharField(max_length=20, choices=INVOICE_STATUS, default='unpaid')

    # authorized_by: the user who created/authorized the invoice
    authorized_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='authorized_invoices')

    def __str__(self):
        return self.invoice_id or f"Invoice-{self.pk}"

    @property
    def paid_amount(self):
        return sum([p.amount for p in self.payments.all()])

    @property
    def pending_amount(self):
        if self.total_amount is None:
            return None
        return max(self.total_amount - self.paid_amount, 0)

    def _generate_client_code(self, company_name):
        name = (company_name or '').lower()
        # keep only letters
        letters = [c for c in name if c in string.ascii_lowercase]
        if not letters:
            return 'xx'
        # try first two letters
        candidates = []
        if len(letters) >= 2:
            candidates.append(''.join(letters[0:2]))
        # try replacing second char with subsequent chars
        for i in range(1, len(letters)):
            candidates.append(letters[0] + letters[i])
        # try pairs of letters (i,j)
        for i in range(len(letters)):
            for j in range(i+1, len(letters)):
                candidates.append(letters[i] + letters[j])

        # ensure unique against other client profiles' stored codes
        from core.models import ClientProfile
        existing = set(ClientProfile.objects.exclude(client_code__isnull=True).values_list('client_code', flat=True))
        for cand in candidates:
            cand = cand[:2]
            if cand not in existing:
                return cand
        # fallback: base + digit
        for d in range(10):
            alt = (letters[0] + letters[1])[:1] + str(d)
            if alt not in existing:
                return alt
        return 'zz'

    def _generate_invoice_id(self):
        # client_code must exist on client.profile.client_code or be generated
        client_profile = None
        try:
            client_profile = self.client.profile
        except Exception:
            client_profile = None

        client_code = None
        if client_profile and getattr(client_profile, 'client_code', None):
            client_code = client_profile.client_code
        else:
            company = client_profile.company_name if client_profile else self.client.get_full_name()
            client_code = self._generate_client_code(company)
            # persist to client profile if possible
            if client_profile:
                client_profile.client_code = client_code
                client_profile.save()

        mon = calendar.month_abbr[self.date.month].upper()[:3]
        yy = str(self.date.year)[-2:]
        return f"{client_code}{self.pk}{mon}{yy}".upper()

    def save(self, *args, **kwargs):
        # immutable after creation: disallow updates to core fields once created
        if self.pk:
            orig = Invoice.objects.filter(pk=self.pk).first()
            if orig:
                # prevent modifying core immutable fields once set (allow total_amount to be
                # populated the first time invoice items are added)
                protected = ['client_id', 'invoice_id', 'sender_name', 'sender_bank_account_number']
                for field in protected:
                    if getattr(orig, field, None) != getattr(self, field, None):
                        raise ValidationError('Invoices are immutable once created')

                # total_amount is allowed to be set if it was previously None (initial calculation).
                # Disallow changes to total_amount if it already had a value.
                orig_total = getattr(orig, 'total_amount', None)
                new_total = getattr(self, 'total_amount', None)
                if orig_total is not None and orig_total != new_total:
                    raise ValidationError('Invoices are immutable once created')

        is_new = self.pk is None
        # on create, compute totals, gst and snapshot business info
        if is_new:
            # calculate total from items if items set later; but items usually created after invoice
            # we'll compute totals after related InvoiceItem saves via a helper; here set date
            self.date = timezone.now().date()

        super().save(*args, **kwargs)

        # ensure invoice_id set after pk available
        if not self.invoice_id:
            self.invoice_id = self._generate_invoice_id()
            super().save(update_fields=['invoice_id'])



class InvoiceItem(BaseModel):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items')
    service = models.ForeignKey(Service, on_delete=models.SET_NULL, null=True, blank=True)
    description = models.TextField(blank=True, null=True)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    quantity = models.IntegerField(default=1)

    @property
    def line_total(self):
        return self.unit_price * self.quantity

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # after saving an item, update invoice totals
        invoice = self.invoice
        total = sum([it.line_total for it in invoice.items.all()])
        gst_amount = (total * (invoice.gst_percentage or 0)) / 100
        invoice.total_amount = total + gst_amount
        invoice.gst_amount = gst_amount
        invoice.save()


class Payment(BaseModel):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_mode = models.ForeignKey(PaymentMode, on_delete=models.SET_NULL, null=True, blank=True)
    reference = models.CharField(max_length=200, blank=True, null=True)
    paid_at = models.DateTimeField(auto_now_add=True)
    received_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='received_payments')

    def save(self, *args, **kwargs):
        with transaction.atomic():
            super().save(*args, **kwargs)
            invoice = self.invoice
            paid = invoice.paid_amount
            if paid <= 0:
                invoice.status = 'unpaid'
            elif paid < (invoice.total_amount or 0):
                invoice.status = 'partially_paid'
            else:
                invoice.status = 'paid'
            # save status only (invoice is immutable for other fields)
            Invoice.objects.filter(pk=invoice.pk).update(status=invoice.status)
