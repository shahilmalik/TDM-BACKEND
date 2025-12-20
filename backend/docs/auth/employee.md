# Employee API

Base endpoint: `/employee/`

Supported operations:
- `GET /employee/` — list employees
- `POST /employee/` — create an employee
- `GET /employee/{id}/` — retrieve employee
- `PUT /employee/{id}/` — replace employee
- `PATCH /employee/{id}/` — partial update
- `DELETE /employee/{id}/` — delete employee

Request body for create (JSON):

```json
{
  "salutation": "Mr",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone": "9876543210",
  "country_code": "+91",
  "type": "manager"
}
```

Notes:
- The `type` field should be one of the allowed non-client types (e.g., `manager`, `designer`, `content_writer`, `superadmin`).
- Created employees have no usable password by default; set their password via admin or a password-reset flow.

Success responses:
- Create (201):

```json
{
  "id": 2,
  "salutation": "Mr",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone": "9876543210",
  "country_code": "+91",
  "type": "manager"
}
```

- List (200): array of employee objects (same shape above)

Permissions:
- For production, restrict create/update/delete to admin users. The viewset currently exposes CRUD to authenticated users; add `permission_classes` as needed.
