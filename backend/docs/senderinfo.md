# Sender Info API

Base path: `/api/invoice/senderinfo/`

- `GET /api/invoice/senderinfo/` — returns the latest `BusinessInfo` record used to snapshot sender details onto invoices.
- `PUT /api/invoice/senderinfo/` — updates the `BusinessInfo` record (full update).
- `PATCH /api/invoice/senderinfo/` — partially updates the `BusinessInfo` record.

Response fields:
- `name`, `logo`, `address`, `phone`, `email`, `secondary_email`
- `gstin` — GST Identification Number
- `bank_account_name`, `bank_account_number`, `bank_name`, `ifsc`

Note: This endpoint manages sender info which is snapshot to invoices at creation time so later changes do not affect historical invoices.
