# Services API

## List Services

GET /api/services/

Success response (200):

```json
[
  {
    "id": 1,
    "service_id": "SVC001",
    "name": "Social Media Management",
    "hsn": "9984",
    "category": {
      "id": 3,
      "name": "Social Media",
      "slug": "social-media"
    },
    "price": "15000.00",
    "is_active": true
  }
]
```

## Create Service

POST /api/services/

Request body (JSON):

```json
{
  "service_id": "SVC002",
  "name": "Website Design",
  "description": "Basic website package",
  "price": "5000.00",
  "category": 2,
  "hsn": "9983",
  "is_active": true
}
```

Success response (201):

```json
{
  "id": 2,
  "service_id": "SVC002",
  "name": "Website Design"
}
```

## Categories (CRUD)

The categories endpoint is available at `GET/POST/PUT/DELETE /api/categories/`.

Example create category:

POST /api/categories/

```json
{
  "name": "Social Media",
  "slug": "social-media"
}
```

Success (201):

```json
{
  "id": 3,
  "name": "Social Media",
  "slug": "social-media"
}
```

Notes
- `hsn` is now present on Service objects and included in list/detail serializers.
- `category` is a separate model; when creating or updating a service send the category id. For read endpoints the category object is returned.
- Remember to run migrations after these model changes:

```bash
python3 manage.py makemigrations core
python3 manage.py migrate
```

## Update Service

PUT /api/services/{id}/  (or PATCH /api/services/{id}/)

Request body (JSON) for PUT (full replace):

```json
{
  "service_id": "SVC002",
  "name": "Website Design - Updated",
  "description": "Updated description",
  "price": "6000.00",
  "category": 2,
  "hsn": "9983",
  "is_active": true
}
```

Example PATCH (partial update):

```json
{
  "price": "5500.00"
}
```

Success response (200):

```json
{
  "id": 2,
  "service_id": "SVC002",
  "name": "Website Design - Updated",
  "hsn": "9983"
}
```

## Delete Service

DELETE /api/services/{id}/

Success response (204 No Content)

---

## Update Category

PUT /api/categories/{id}/  (or PATCH /api/categories/{id}/)

Request body (JSON) for PUT:

```json
{
  "name": "Social Media Updated",
  "slug": "social-media-updated"
}
```

PATCH example (partial):

```json
{
  "name": "Social Media"
}
```

Success response (200):

```json
{
  "id": 3,
  "name": "Social Media Updated",
  "slug": "social-media-updated"
}
```

## Delete Category

DELETE /api/categories/{id}/

Success response (204 No Content)

Notes:
- These endpoints are provided by Django REST Framework `ModelViewSet` for `Service` and `ServiceCategory` and support GET/POST/PUT/PATCH/DELETE.
- Add appropriate permissions for production (e.g., admin-only for create/update/delete).
