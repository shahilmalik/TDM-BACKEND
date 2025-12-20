# Client API (CRUD)

Base endpoint: `/clients/`

This endpoint allows creating clients (without setting a password) and managing their business information. Every client must have a `ClientProfile` (business info) attached.

Supported operations
- `GET /clients/` — list clients (with business info)
- `POST /clients/` — create a client (no password accepted)
- `GET /clients/{id}/` — retrieve client + business info
- `PUT /clients/{id}/` — replace client + business info
- `PATCH /clients/{id}/` — partial update
- `DELETE /clients/{id}/` — delete client and profile

Create request body (JSON) — required business info included:

```json
{
  "company_name": "ACME Corp",
  "billing_address": "123 Main St, Springfield",
  "gstin": "29ABCDE1234F2Z5",
  "business_email": "billing@acme.com",
  "business_phone": "0123456789",
  "business_phone_country_code": "+91",
  "whatsapp_updates": true,
  "contact_person": {
    "salutation": "Ms",
    "first_name": "Alice",
    "last_name": "Smith",
    "email": "alice.smith@acme.com",
    "phone": "9876543210",
    "country_code": "+91"
  }
}
```

Success response (201):

```json
{
  "id": 17,
  "company_name": "ACME Corp",
  "contact_person": {
    "id": 42,
    "first_name": "Alice",
    "last_name": "Smith",
    "email": "alice.smith@acme.com",
    "phone": "9876543210"
  }
}
```

Retrieve (GET /clients/{id}/) response (200):

```json
{
  "id": 17,
  "user": {
    "id": 42,
    "first_name": "Alice",
    "last_name": "Smith",
    "email": "alice.smith@acme.com",
    "phone": "9876543210",
    "type": "client"
  },
  "company_name": "ACME Corp",
  "billing_address": "123 Main St, Springfield",
  "gstin": "29ABCDE1234F2Z5",
  "business_email": "billing@acme.com",
  "business_phone": "0123456789",
  "business_phone_country_code": "+91",
  "whatsapp_updates": true
}
```

Update (PUT /clients/{id}/) example (full replace):

```json
{
  "company_name": "ACME Corp Updated",
  "billing_address": "456 New Rd",
  "gstin": "29ABCDE1234F2Z5",
  "business_email": "billing@acme.com",
  "business_phone": "0987654321",
  "business_phone_country_code": "+91",
  "whatsapp_updates": false,
  "contact_person": {
    "salutation": "Mr",
    "first_name": "Bob",
    "last_name": "Jones",
    "email": "bob.jones@acme.com",
    "phone": "9998887777",
    "country_code": "+91"
  }
}
```

Success response (200): updated client resource.

Delete (DELETE /clients/{id}/)
- Success response: `204 No Content`.
- Deleting a client should remove the `ClientProfile` and either delete or unlink the `contact_person` depending on business rules.

Permissions and validation
- Require admin or authorized users for create/update/delete in production. Read/list endpoints may be exposed to authenticated clients depending on your access model.
- The endpoint enforces that a client always has business info (server will reject creates/updates missing required business fields).

Implementation notes
- If your current code uses OTP flows (`/signup/client/initiate/` + verify), this direct-create API is an alternative that bypasses OTP (creates clients without password). Ensure you handle email uniqueness and onboarding communications.
- To allow clients to set a password later, support a password-reset flow (OTP) or add a secure `set-password` endpoint.

Example curl (create):

```bash
curl -X POST https://api.example.com/clients/ \
  -H "Content-Type: application/json" \
  -d '{"company_name":"ACME Corp","contact_person":{"first_name":"Alice","last_name":"Smith","email":"alice.smith@acme.com"}}'
```
