from django.contrib import admin

from invoice.models import (
    Invoice,
    InvoiceItem,
    Payment,
    PaymentMode,
    PaymentTerm,
    BusinessInfo,
)


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "invoice_id",
        "client",
        "date",
        "start_date",
        "total_amount",
        "status",
    )
    search_fields = (
        "invoice_id",
        "client__email",
        "status",
    )


@admin.register(InvoiceItem)
class InvoiceItemAdmin(admin.ModelAdmin):
    list_display = ("id", "invoice", "service", "unit_price", "quantity")
    search_fields = ("invoice__invoice_id", "service__name")


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("id", "invoice", "amount", "payment_mode", "paid_at", "received_by")
    search_fields = ("invoice__invoice_id", "reference")


@admin.register(PaymentMode)
class PaymentModeAdmin(admin.ModelAdmin):
    list_display = ("id", "name")


@admin.register(PaymentTerm)
class PaymentTermAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "days")


@admin.register(BusinessInfo)
class BusinessInfoAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "email", "phone", "secondary_email")
    search_fields = ("name", "email", "phone")
