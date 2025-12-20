# Sender Info API

Base path: `/api/invoice/senderinfo/`

- `GET /api/invoice/senderinfo/` — returns the latest `BusinessInfo` record used to snapshot sender details onto invoices.

Response fields:
- `name`, `logo`, `address`, `phone`, `email`
- `bank_account_name`, `bank_account_number`, `bank_name`, `ifsc`

Note: This endpoint is read-only. Sender info is snapshot to invoices at creation time so later changes do not affect historical invoices.
