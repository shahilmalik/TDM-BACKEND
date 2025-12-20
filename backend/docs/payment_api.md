# Payment Modes & Terms API

Base path: `/api/invoice/`

Payment Modes endpoints:

- `GET /api/invoice/payment-modes/` — list payment modes
- `POST /api/invoice/payment-modes/` — create a payment mode
- `DELETE /api/invoice/payment-modes/{id}/` — delete a payment mode

Request body (create):
```json
{ "name": "Bank Transfer" }
```

Payment Terms endpoints:

- `GET /api/invoice/payment-terms/` — list payment terms
- `POST /api/invoice/payment-terms/` — create a payment term
- `DELETE /api/invoice/payment-terms/{id}/` — delete a payment term

Request body (create):
```json
{ "name": "Net 30", "days": 30 }
```

Payments:
- `GET /api/invoice/payments/` — list payments
- `POST /api/invoice/payments/` — create a payment (affects invoice status)
- `DELETE /api/invoice/payments/{id}/` — delete a payment

Create payment example:
```json
{
  "invoice": 12,
  "amount": "5000.00",
  "payment_mode": 1,
  "reference": "TXN12345"
}
```
