# Verify (OTP)

POST /signup/client/verify/

Request body (JSON):

```json
{
  "contact_email": "alice.smith@acme.com",
  "otp": "123456"
}
```

Success response (201):

```json
{
  "id": 17,
  "company_name": "ACME Corp"
}
```

Errors:
- 400: missing fields or invalid OTP
- 404: no pending signup found or OTP expired
- 500: failed to create client profile
