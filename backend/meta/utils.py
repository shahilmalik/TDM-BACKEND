import requests
import time
from django.core.cache import cache
from django.conf import settings
from rest_framework import status

META_GRAPH_API_BASE = "https://graph.facebook.com/v24.0"

class MetaGraphAPIError(Exception):
    def __init__(self, message, status_code=None, response_text=None):
        super().__init__(message)
        self.status_code = status_code
        self.response_text = response_text


def meta_graph_api_request(endpoint, access_token, params=None, method="GET", max_retries=3):
    url = f"{META_GRAPH_API_BASE}{endpoint}"
    headers = {"Authorization": f"Bearer {access_token}"}
    params = params or {}
    for attempt in range(max_retries):
        resp = requests.request(method, url, headers=headers, params=params)
        if resp.status_code == 200:
            return resp.json()
        elif resp.status_code == 401:
            raise MetaGraphAPIError(
                "Token expired or invalid",
                status_code=resp.status_code,
                response_text=resp.text,
            )
        elif resp.status_code == 429:
            # Rate limit, exponential backoff
            time.sleep(2 ** attempt)
            continue
        else:
            # Facebook/Meta Graph often returns invalid/expired tokens as HTTP 400
            # with error.code == 190 (OAuthException). Normalize those to auth failure.
            try:
                payload = resp.json()
                err = (payload or {}).get("error") or {}
                if err.get("code") == 190:
                    raise MetaGraphAPIError(
                        "Token expired or invalid",
                        status_code=401,
                        response_text=resp.text,
                    )
            except Exception:
                # Ignore JSON parsing errors and fall back to generic error.
                pass
            raise MetaGraphAPIError(
                f"Meta API error: {resp.status_code} {resp.text}",
                status_code=resp.status_code,
                response_text=resp.text,
            )
    raise MetaGraphAPIError("Meta API rate limit exceeded after retries", status_code=429)


def cache_instagram_grid(ig_account_id, data, timeout=300):
    cache.set(f"ig_grid_{ig_account_id}", data, timeout)

def get_cached_instagram_grid(ig_account_id):
    return cache.get(f"ig_grid_{ig_account_id}")
