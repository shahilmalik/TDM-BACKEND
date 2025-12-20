# Sign In

POST /api/auth/signin/

Request body (JSON):

```json
{
  "email": "user@example.com",
  "password": "S3cureP@ssw0rd"
}
```

Success response (200):

```json
{
  "token": "<jwt-or-session-token>",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "type": "client"
  }
}
```

Errors:
- 400: invalid credentials or missing fields
- 500: server error
