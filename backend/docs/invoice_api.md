
# Invoice API Reference

Base path: `/api/invoice/`

This document lists the available invoice-related endpoints, their request bodies and example responses.

Summary of available endpoints
- `GET  /api/invoice/invoices/` — List invoices
- `GET  /api/invoice/invoices/{id}/` — Retrieve invoice details
- `POST /api/invoice/invoices/` — Create an invoice (see body below)
- `DELETE /api/invoice/invoices/{id}/` — Delete an invoice (irreversible)
- `GET  /api/invoice/invoices/{id}/preview/` — Get preview context + rendered HTML
- `GET  /api/invoice/invoices/{id}/generate_pdf/` — Download invoice PDF

Related endpoints (see their docs):
- `GET/POST/DELETE /api/invoice/payment-modes/` — payment mode CRUD
- `GET/POST/DELETE /api/invoice/payment-terms/` — payment term CRUD
- `GET/POST/DELETE /api/invoice/payments/` — record/list/delete payments
- `GET /api/invoice/senderinfo/` — read-only latest sender (business) info

Invoice representation (key fields returned)
- `invoice_id` — generated invoice number (format: CLIENTCODE + pk + MON + YY)
- `client` — minimal client info (id, name, email)
- `date`, `due_date`
- `items` — list of invoice line items (service id, service name, description, unit_price, quantity, line_total)
- `gst_percentage`, `gst_amount`, `total_amount`, `paid_amount`, `pending_amount`
- `status` — one of: `unpaid`, `partially_paid`, `paid`, `cancelled`
- `payment_mode`, `payment_term`, `authorized_by` (minimal)
- Sender snapshot fields: `sender_name`, `sender_bank_account_name`, `sender_bank_account_number`, `sender_bank_name`, `sender_ifsc`, etc.

Important behaviour notes
- Immutable: invoices are designed to be immutable after creation. Core fields such as client, totals, sender snapshot and `invoice_id` cannot be changed. Attempting to modify protected fields will result in a validation error.
- Items: Invoice items are stored as `InvoiceItem` records (unit_price + quantity). Item saves recalculate invoice totals and GST.
- Payments: Create `Payment` records to record receipts; payments update invoice `status` automatically (`partially_paid` / `paid`).

Examples

1) List invoices

Request
```
GET /api/invoice/invoices/
Authorization: Bearer <token>
```

Sample response (200)
```json
{
	"success": true,
	"invoices": [
		{
			"id": 1,
			"invoice_id": "st1DEC25",
			"client": {"id": 10, "first_name": "Alice", "last_name": "Smith", "email": "alice@acme.com"},
			"date": "2025-12-16",
			"due_date": "2026-01-15",
			"total_amount": "15000.00",
			"paid_amount": "5000.00",
			"pending_amount": "10000.00",
			"status": "partially_paid"
		}
	]
}
```

2) Retrieve invoice details

Request
```
GET /api/invoice/invoices/1/
Authorization: Bearer <token>
```

Sample response (200)
```json
{
	"id": 1,
	"invoice_id": "st1DEC25",
	"client": {"id": 10, "first_name": "Alice", "last_name": "Smith", "email": "alice@acme.com"},
	"date": "2025-12-16",
	"due_date": "2026-01-15",
	"items": [
		{"id": 5, "service": 3, "service_name": "Website Design", "description": "Basic site", "unit_price": "5000.00", "quantity": 1, "line_total": "5000.00"},
		{"id": 6, "service": 4, "service_name": "SEO", "description": "Monthly SEO", "unit_price": "10000.00", "quantity": 1, "line_total": "10000.00"}
	],
	"gst_percentage": "18.00",
	"gst_amount": "2700.00",
	"total_amount": "17700.00",
	"paid_amount": "5000.00",
	"pending_amount": "12700.00",
	"status": "partially_paid",
	"payment_mode": {"id": 1, "name": "Bank Transfer"},
	"payment_term": {"id": 1, "name": "Net 30", "days": 30},
	"authorized_by": {"id": 2, "first_name": "John", "last_name": "Doe"},
	"sender_name": "Tarviz Digimart",
	"sender_bank_account_number": "1234567890"
}
```

3) Create invoice

Endpoint
```
POST /api/invoice/invoices/
Authorization: Bearer <token>
Content-Type: application/json
```

Request body (JSON)
```json
{
	"client": 10,
	"due_date": "2026-01-15",
	"gst_percentage": "18.00",
	"payment_mode": 1,
	"payment_term": 1,
	"sender_name": "Tarviz Digimart",
	"sender_bank_account_name": "Tarviz Pvt Ltd",
	"sender_bank_account_number": "1234567890",
	"sender_bank_name": "Example Bank",
	"sender_ifsc": "EXAMP0001",
	"authorized_by": 2
}
```

Notes on creation
- `client` is the `CustomUser` id for the client (user with `type='client'`). The system will try to use the client profile `client_code` when generating the invoice number; if missing it will create and persist one.
- Items are created as separate `InvoiceItem` records (unit_price, quantity). Depending on your front-end flow you can either create the invoice first and then create items via the admin/API, or add an endpoint to accept nested items (not implemented here).

Sample response (201)
```json
{
	"success": true,
	"invoice": {
		"id": 12,
		"invoice_id": "st12DEC25",
		"client": {"id": 10, "first_name": "Alice"},
		"date": "2025-12-16",
		"due_date": "2026-01-15",
		"total_amount": null,
		"status": "unpaid"
	}
}
```

4) Delete invoice

Request
```
DELETE /api/invoice/invoices/12/
Authorization: Bearer <token>
```

Response: `204 No Content` on success

5) Preview invoice (for frontend)

Request
```
GET /api/invoice/invoices/12/preview/
Authorization: Bearer <token>
```

Response (200)
```json
{
	"success": true,
	"context": { /* JSON context matching `templates/invoice.html` keys: company, client, invoice, bank */ },
	"html": "<html>...rendered invoice...</html>"
}
```

6) Download PDF

Request
```
GET /api/invoice/invoices/12/generate_pdf/
Authorization: Bearer <token>
```

Response: `application/pdf` attachment

Security and permissions
- Endpoints require authentication. For create/update/delete operations restrict access to authorized staff/users. Consider adding `IsAdminUser` for destructive operations.

Implementation notes
- Totals and GST are computed from `InvoiceItem` line items. When items are added/updated, the invoice totals and `gst_amount` are recalculated.
- Payments are recorded via `/api/invoice/payments/` and will update the invoice `status` automatically.
- The invoice template used for PDF/preview expects the context keys described in the preview response; use the `preview` endpoint to get a ready-to-use HTML and JSON context for frontend rendering.

If you want, I can add example cURL commands for items and payments, or implement nested invoice+items creation in a single API call.



http://prod.tarvizdigimart.com:8000/api/invoice/invoices/

{
"client": 3,
"payment_mode": 1,
"payment_term": 1,
"gst_percentage": 0,
"items": [
{
"service": 1,
"description": "Service #1",
"unit_price": "5000.00",
"quantity": 3
}
]}


Record a payment (API):

Endpoint: POST /api/invoice/payments/
Sample JSON:
{
"invoice": 12,
"amount": "5000.00",
"payment_mode": 1,
"reference": "TXN12345"
}