# Client Signup (Initiate)

POST /signup/client/initiate/

Request body (JSON):

```json
{
  "company_name": "ACME Corp",
  "billing_address": "123 Main St",
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
    "country_code": "+91",
    "password": "S3cureP@ssw0rd"
  }
}
```

Success response (200):

```json
{
  "detail": "OTP sent to contact email"
}
```

Notes:
- The payload (including password) is cached temporarily until verification. For production, avoid storing plaintext passwords in cache — instead collect password at verify step or use secure, encrypted storage.
- Use the `POST /signup/client/verify/` endpoint to complete signup with the OTP.


## Resend OTP

POST /signup/client/resend/

Request body (JSON):

```json
{
  "contact_email": "alice.smith@acme.com"
}
```

Success response (200):

```json
{
  "detail": "OTP resent to contact email"
}
```

Errors:
- 400: missing or invalid email
- 429: too many requests (rate limit)
- 500: server error

Notes:
- Implement rate-limiting on resend endpoints to prevent abuse.
- The resend endpoint will generate a new OTP and update the cached entry TTL.
