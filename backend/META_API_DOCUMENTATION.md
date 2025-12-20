# Meta Module API Documentation

## Testing Prerequisites

### 1. Create Meta Access Tokens in Django Shell

```bash
python manage.py shell
```

```python
from meta.models import MetaAccessToken
from datetime import datetime, timedelta

# Create a test access token
token = MetaAccessToken.objects.create(
    account_label="My Facebook Account",
    access_token="YOUR_ACTUAL_META_ACCESS_TOKEN_HERE",  # Get from Meta App Dashboard
    expires_at=datetime.now() + timedelta(days=60),
    status="active"
)
print(f"Token ID: {token.id}")
```

**How to get a Meta Access Token:**
1. Go to https://developers.facebook.com/
2. Create an App (if you don't have one)
3. Generate a User Access Token from the Facebook Graph API Explorer
4. Copy the token and use it above

---

## API Endpoints Documentation

### 1. **Verify User Account**
**Purpose:** Validate a new access token and return user info for visual confirmation before saving.

**Endpoint:** `POST /api/meta/verify-user/`

**Request Body:**
```json
{
    "access_token": "your_meta_access_token_here",
    "account_label": "My Facebook Account"
}
```

**Success Response (200):**
```json
{
    "user_id": "123456789",
    "user_name": "John Doe",
    "profile_picture": "https://platform-lookaside.fbsbx.com/platform/profilepic/..."
}
```

**Error Response (400):**
```json
{
    "detail": "Token expired or invalid"
}
```

---

### 2. **Fetch Linked Pages**
**Purpose:** Aggregate all Facebook Pages accessible from all stored active tokens. Used to populate dropdown for admin to select pages.

**Endpoint:** `GET /api/meta/pages/`

**Request:**
- No request body required
- No URL parameters required

**Success Response (200):**
```json
{
    "pages": [
        {
            "account_label": "My Facebook Account",
            "token_id": 1,
            "fb_page_id": "104567890123",
            "fb_page_name": "My Business Page",
            "fb_page_picture": "https://platform-lookaside.fbsbx.com/platform/profilepic/...",
            "page_access_token": null,
            "ig_account_id": "17841405822348523"
        },
        {
            "account_label": "My Facebook Account",
            "token_id": 1,
            "fb_page_id": "987654321098",
            "fb_page_name": "Another Page",
            "fb_page_picture": "https://platform-lookaside.fbsbx.com/platform/profilepic/...",
            "page_access_token": null,
            "ig_account_id": null
        }
    ]
}
```

**Error Handling:**
- Expired/invalid tokens are marked as inactive and excluded from response
- Pages are still returned for valid tokens

---

### 3. **Client ↔ Page Sync**
**Purpose:** Map a client (from your system) to a specific Facebook Page. Stores the page access token securely for future API calls.

**Endpoint:** `POST /api/meta/sync/`

**Request Body:**
```json
{
    "client_id": "client_123",
    "fb_page_id": "104567890123",
    "ig_account_id": null,
    "token_id": 1
}
```

**Parameters:**
- `client_id`: Your internal client identifier (string)
- `fb_page_id`: Facebook Page ID (from Fetch Linked Pages response)
- `ig_account_id`: (optional) Instagram Business Account ID
- `token_id`: ID of the MetaAccessToken to use

**Success Response (200):**
```json
{
    "success": true,
    "created": true
}
```

**Error Response (400):**
```json
{
    "detail": "Token not found or inactive"
}
```

**Notes:**
- This endpoint automatically fetches and stores the page access token (encrypted)
- If Instagram account exists on the page, it's auto-detected
- Updates existing mapping if client_id + fb_page_id already exists

---

### 4. **Instagram Profile Data**
**Purpose:** Fetch Instagram profile metrics and media grid for a mapped client. Results are cached for 5 minutes.

**Endpoint:** `GET /api/meta/instagram/<client_id>/`

**Request:**
```
GET /api/meta/instagram/client_123/
```

**Success Response (200):**
```json
{
    "profile": {
        "followers_count": 5432,
        "follows_count": 234,
        "media_count": 87,
        "username": "mybusinessaccount",
        "profile_picture_url": "https://instagram.com/..."
    },
    "media": [
        {
            "id": "17999999999999999",
            "caption": "Check out our new product!",
            "media_url": "https://instagram.com/...",
            "media_type": "IMAGE",
            "thumbnail_url": null,
            "timestamp": "2025-12-18T10:30:00+0000",
            "permalink": "https://instagram.com/p/ABC123/"
        },
        {
            "id": "17888888888888888",
            "caption": "Behind the scenes video",
            "media_url": "https://instagram.com/...",
            "media_type": "VIDEO",
            "thumbnail_url": "https://instagram.com/...",
            "timestamp": "2025-12-17T15:45:00+0000",
            "permalink": "https://instagram.com/p/XYZ789/"
        }
    ]
}
```

**Error Response (404):**
```json
{
    "detail": "Mapping not found"
}
```

**Error Response (200) - No Instagram Account:**
```json
{
    "detail": "No Instagram account linked"
}
```

**Caching:**
- Results cached for 300 seconds (5 minutes)
- Cache key: `ig_grid_{ig_account_id}`

---

### 5. **Instagram Post Detail**
**Purpose:** Fetch detailed metrics for a specific Instagram post.

**Endpoint:** `GET /api/meta/post/<post_id>/`

**Request:**
```
GET /api/meta/post/17999999999999999/
```

**Success Response (200):**
```json
{
    "id": "17999999999999999",
    "caption": "Check out our new product! Amazing features included.",
    "media_url": "https://instagram.com/...",
    "media_type": "IMAGE",
    "thumbnail_url": null,
    "timestamp": "2025-12-18T10:30:00+0000",
    "permalink": "https://instagram.com/p/ABC123/",
    "like_count": 234,
    "comments_count": 45
}
```

**Error Response (404):**
```json
{
    "detail": "Post not found or not mapped"
}
```

**Error Response (400):**
```json
{
    "detail": "Token expired or invalid"
}
```

---

## Testing Workflow

### Step 1: Create Access Token
```bash
python manage.py shell
```
```python
from meta.models import MetaAccessToken
from datetime import datetime, timedelta

token = MetaAccessToken.objects.create(
    account_label="Test Account",
    access_token="your_token_here",
    expires_at=datetime.now() + timedelta(days=60),
    status="active"
)
```

### Step 2: Verify Token
```bash
curl -X POST http://localhost:8000/api/meta/verify-user/ \
  -H "Content-Type: application/json" \
  -d '{
    "access_token": "your_token_here",
    "account_label": "Test Account"
  }'
```

### Step 3: Fetch Available Pages
```bash
curl -X GET http://localhost:8000/api/meta/pages/
```

### Step 4: Map Client to Page
Copy a `fb_page_id` from Step 3 response
```bash
curl -X POST http://localhost:8000/api/meta/sync/ \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "client_001",
    "fb_page_id": "104567890123",
    "ig_account_id": null,
    "token_id": 1
  }'
```

### Step 5: Fetch Instagram Profile
```bash
curl -X GET http://localhost:8000/api/meta/instagram/client_001/
```

### Step 6: Fetch Post Details
Copy a `post_id` from Step 5 media array
```bash
curl -X GET http://localhost:8000/api/meta/post/17999999999999999/
```

---

## Database Models

### MetaAccessToken
```python
{
    "id": 1,
    "account_label": "My Facebook Account",
    "access_token": "[encrypted]",
    "expires_at": "2025-02-17T10:00:00Z",
    "status": "active|expired|invalid",
    "created_at": "2025-12-18T10:00:00Z",
    "updated_at": "2025-12-18T10:00:00Z"
}
```

### ClientPageMapping
```python
{
    "id": 1,
    "client_id": "client_001",
    "fb_page_id": "104567890123",
    "ig_account_id": "17841405822348523",
    "page_access_token": "[encrypted]",
    "created_at": "2025-12-18T10:00:00Z",
    "updated_at": "2025-12-18T10:00:00Z"
}
```

---

## Error Handling

| Error | Status | Cause | Action |
|-------|--------|-------|--------|
| Token expired | 400 | Access token no longer valid | Mark token as `invalid` in DB |
| Token not found | 400 | `token_id` doesn't exist | Create new token via Verify API |
| Mapping not found | 404 | `client_id` has no mapping | Create mapping via Sync API |
| No Instagram account | 200 | Page has no linked IG account | Soft fail, only FB page available |
| Rate limit (429) | Retry | Meta API rate limit hit | Exponential backoff (2^attempt seconds) |

---

## Security Notes

- ✅ All access tokens are encrypted at rest using Fernet
- ✅ Tokens never exposed to frontend
- ✅ Backend only interacts with Meta Graph API
- ✅ Page access tokens stored securely per client mapping
- ✅ Rate limiting handled with exponential backoff
