from urllib import request
from django.template.loader import render_to_string
from django.utils import timezone
from invoice.models import BusinessInfo

def _fmt_money(v):
    try:
        return f"{v:.2f}"
    except Exception:
        return v


def build_invoice_context(invoice, request=None):
    """Return a dict usable by the invoice template and for frontend preview.

    Exposes keys: `company`, `client`, `invoice`, `bank` and a rendered `html` can be produced
    with `render_invoice_html`.
    """
    # sender/company snapshot fields
    business = BusinessInfo.objects.first()
    logo_url = None
    if business and business.logo:
        raw_logo = str(business.logo)
        if raw_logo.startswith('http://') or raw_logo.startswith('https://'):
            logo_url = raw_logo
        elif request:
            logo_url = request.build_absolute_uri(raw_logo)

    company = {
        'name': business.name if business else '',
        'logo': logo_url,
        'address_line1': business.address if business else '',
        'address_line2': business.address_2 if business else '',
        'gstin': business.gstin if business else '',
        'phone': business.phone if business else '',
        'email': business.email if business else '',
    }

    # client details
    client = {
        'business_name': invoice.client.profile.company_name if getattr(invoice.client, 'profile', None) else invoice.client.get_full_name(),
        'address': invoice.client.profile.billing_address if getattr(invoice.client, 'profile', None) else '',
        'phone': invoice.client.profile.business_phone if getattr(invoice.client, 'profile', None) else invoice.client.phone,
        'gstin': invoice.client.profile.gstin if getattr(invoice.client, 'profile', None) else None,
    }

    # items
    items = []
    for it in invoice.items.all():
        # Build the display name as "<qty>x <service/description>"
        base_name = getattr(it.service, 'name', '') if it.service else (it.description or '')
        qty = it.quantity or 0
        display_name = f"{qty}x {base_name}" if qty else base_name

        items.append({
            'service_id': getattr(it.service, 'service_id', '') if it.service else '',
            'hsn_sac': getattr(it.service, 'hsn', '') if it.service else '',
            # quantity is now embedded into the name for display
            'name': display_name,
            'description': it.description or '',
            'unit_price': it.unit_price,
            'total': it.line_total,
        })

    total_amount = invoice.total_amount if invoice.total_amount is not None else 0
    gst_amount = invoice.gst_amount if invoice.gst_amount is not None else 0
    inv = {
        'number': invoice.invoice_id,
        'date': invoice.date.isoformat() if getattr(invoice, 'date', None) else '',
        'due_date': invoice.due_date.isoformat() if getattr(invoice, 'due_date', None) else '',
        'payment_mode': invoice.payment_mode.name if invoice.payment_mode else '',
        'payment_terms': invoice.payment_term.name if invoice.payment_term else '',
        'items': items,
        'subtotal': total_amount - gst_amount,
        'gst_percentage': invoice.gst_percentage,
        'gst_amount': gst_amount,
        'total_amount': total_amount,
        'paid_amount': invoice.paid_amount if hasattr(invoice, 'paid_amount') else 0,
        'pending_amount': invoice.pending_amount if hasattr(invoice, 'pending_amount') else 0,
    }

    bank = {
        'account_name': business.bank_account_name if business else '',
        'bank_name': business.bank_name if business else '',
        'account_number': business.bank_account_number if business else '',
        'ifsc': business.ifsc if business else '',
    }

    context = {
        'company': company,
        'client': client,
        'invoice': inv,
        'bank': bank,
    }

    return context


def render_invoice_html(invoice, request=None, template_name='invoice.html'):
    """Render invoice HTML using the given template and built context."""
    context = build_invoice_context(invoice, request=request)
    html = render_to_string(template_name, context)
    return html
