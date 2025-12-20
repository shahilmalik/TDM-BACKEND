# Reset Password (OTP)

POST /auth/reset/initiate/

Request body (JSON):

```json
{
  "email": "user@example.com"
}
```

Success response (200):

```json
{
  "detail": "OTP sent to email"
}
```

Then verify/reset:

POST /auth/reset/verify/

Request body (JSON):

```json
{
  "email": "user@example.com",
  "otp": "123456",
  "new_password": "N3wP@ssw0rd"
}
```

Success response (200):

```json
{
  "detail": "Password reset successful"
}
```

Notes:
- Implementations must avoid storing plaintext passwords in caches. Prefer sending reset OTPs and setting the password only after OTP verification.


## Resend OTP

POST /auth/reset/resend/

Request body (JSON):

```json
{
  "email": "user@example.com"
}
```

Success response (200):

```json
{
  "detail": "OTP resent to email"
}
```

Errors:
- 400: missing or invalid email
- 404: user with email not found
- 429: too many requests (rate limit)
- 500: server error

Notes:
- Use rate-limiting to prevent abuse.
- Resend will generate a fresh OTP and reset the cached TTL for verification.
