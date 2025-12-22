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
from decimal import Decimal


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
    address_2 = models.TextField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    secondary_email = models.EmailField(blank=True, null=True)
    gstin = models.CharField(max_length=15, blank=True, null=True)
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
        
        if self.gstin:
            self.gstin = self.gstin.upper()
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
    gst_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal("0"))
    gst_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0"))

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
        payments_rel = getattr(self, "payments", None)
        if payments_rel is None:
            return Decimal("0")
        return sum((p.amount for p in payments_rel.all()), Decimal("0"))

    @property
    def pending_amount(self):
        if self.total_amount is None:
            return None
        pending = (self.total_amount or Decimal("0")) - (self.paid_amount or Decimal("0"))
        return pending if pending > Decimal("0") else Decimal("0")

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
        client_profile = getattr(self.client, "profile", None)

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

                # NOTE: Totals are derived from InvoiceItem rows and must be allowed to update as
                # items are added/edited/deleted. Do not treat total_amount (and derived gst_amount)
                # as immutable at the model layer.

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
        # Use a direct queryset instead of the reverse relation for better static typing support.
        total = sum(
            (it.line_total for it in InvoiceItem.objects.filter(invoice=invoice)),
            Decimal("0"),
        )
        gst_pct = getattr(invoice, "gst_percentage", None) or Decimal("0")
        gst_amount = (total * gst_pct) / Decimal("100")
        invoice.total_amount = total + gst_amount
        invoice.gst_amount = gst_amount
        invoice.save()

        # Realtime event: invoice item recorded
        try:
            from kanban.ws import send_to_client_and_user
            from core.notifications import notify_invoice_event

            client_id = getattr(invoice, "client_id", None)
            if client_id:
                send_to_client_and_user(
                    client_id,
                    "invoice_item_recorded",
                    {
                        "invoice_id": invoice.pk,
                        "invoice_item_id": self.pk,
                        "total_amount": str(getattr(invoice, "total_amount", ""))
                        if getattr(invoice, "total_amount", None) is not None
                        else None,
                        "gst_amount": str(getattr(invoice, "gst_amount", ""))
                        if getattr(invoice, "gst_amount", None) is not None
                        else None,
                    },
                )

                notify_invoice_event(
                    invoice=invoice,
                    title="Invoice updated",
                    body=f"Invoice {invoice.invoice_id or invoice.pk} has a new item",
                    data={
                        "event": "invoice_item_recorded",
                        "invoice_id": invoice.pk,
                        "invoice_item_id": self.pk,
                    },
                )
        except Exception:
            pass


class Payment(BaseModel):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_mode = models.ForeignKey(PaymentMode, on_delete=models.SET_NULL, null=True, blank=True)
    reference = models.CharField(max_length=200, blank=True, null=True)
    paid_at = models.DateTimeField(auto_now_add=True)
    received_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='received_payments')

    def save(self, *args, **kwargs):
        with transaction.atomic():
            # Capture current status from DB so we can detect status changes.
            prev_status = None
            try:
                invoice_pk = getattr(self, "invoice_id", None) or getattr(getattr(self, "invoice", None), "pk", None)
                if invoice_pk is not None:
                    prev_status = Invoice.objects.filter(pk=invoice_pk).values_list("status", flat=True).first()
            except Exception:
                prev_status = None

            super().save(*args, **kwargs)
            invoice = self.invoice
            paid = invoice.paid_amount
            total_amount = invoice.total_amount if invoice.total_amount is not None else Decimal("0")
            if paid <= Decimal("0"):
                invoice.status = 'unpaid'
            elif paid < total_amount:
                invoice.status = 'partially_paid'
            else:
                invoice.status = 'paid'
            # save status only (invoice is immutable for other fields)
            Invoice.objects.filter(pk=invoice.pk).update(status=invoice.status)

            # Push + realtime event if status changed
            try:
                if prev_status and prev_status != invoice.status:
                    from kanban.ws import send_to_client_and_user
                    from core.notifications import notify_invoice_event

                    client_id = getattr(invoice, "client_id", None)
                    if client_id:
                        send_to_client_and_user(
                            client_id,
                            "invoice_status_changed",
                            {
                                "invoice_id": invoice.pk,
                                "from_status": prev_status,
                                "to_status": invoice.status,
                            },
                        )

                    notify_invoice_event(
                        invoice=invoice,
                        title="Invoice status updated",
                        body=f"Invoice {invoice.invoice_id or invoice.pk} status changed to {invoice.status}",
                        data={
                            "event": "invoice_status_changed",
                            "invoice_id": invoice.pk,
                            "from_status": prev_status,
                            "to_status": invoice.status,
                        },
                        actor_user_id=getattr(self, "received_by_id", None),
                    )
            except Exception:
                pass
