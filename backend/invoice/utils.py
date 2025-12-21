from django.template.loader import render_to_string
from django.utils import timezone

def _fmt_money(v):
    try:
        return f"{v:.2f}"
    except Exception:
        return v


def build_invoice_context(invoice):
    """Return a dict usable by the invoice template and for frontend preview.

    Exposes keys: `company`, `client`, `invoice`, `bank` and a rendered `html` can be produced
    with `render_invoice_html`.
    """
    # sender/company snapshot fields
    company = {
        'name': invoice.sender_name or '',
        'logo': invoice.sender_logo or '',
        'address_line1': (invoice.sender_name or ''),
        'address_line2': (invoice.sender_address or ''),
        'phone': invoice.sender_phone or '',
        'email': invoice.sender_email or '',
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
        items.append({
            'service_id': getattr(it.service, 'service_id', '') if it.service else '',
            'hsn': getattr(it.service, 'hsn', '') if it.service else '',
            'quantity': it.quantity,
            'name': getattr(it.service, 'name', '') if it.service else (it.description or ''),
            'description': it.description or '',
            'total': _fmt_money(it.line_total),
        })

    inv = {
        'number': invoice.invoice_id,
        'date': invoice.date.isoformat() if getattr(invoice, 'date', None) else '',
        'due_date': invoice.due_date.isoformat() if getattr(invoice, 'due_date', None) else '',
        'payment_mode': invoice.payment_mode.name if invoice.payment_mode else '',
        'payment_terms': invoice.payment_term.name if invoice.payment_term else '',
        'items': items,
        'total_amount': _fmt_money(invoice.total_amount) if invoice.total_amount is not None else None,
        'paid_amount': _fmt_money(invoice.paid_amount) if hasattr(invoice, 'paid_amount') else '0.00',
        'pending_amount': _fmt_money(invoice.pending_amount) if hasattr(invoice, 'pending_amount') else '0.00',
    }

    bank = {
        'account_name': invoice.sender_bank_account_name or '',
        'bank_name': invoice.sender_bank_name or '',
        'account_number': invoice.sender_bank_account_number or '',
        'ifsc': invoice.sender_ifsc or '',
    }

    context = {
        'company': company,
        'client': client,
        'invoice': inv,
        'bank': bank,
    }

    return context


def render_invoice_html(invoice):
    """Render invoice HTML using `templates/invoice.html` and built context."""
    context = build_invoice_context(invoice)
    # render template
    html = render_to_string('invoice.html', context)
    return html, context
