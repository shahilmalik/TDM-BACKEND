import requests
import time
from django.core.cache import cache
from django.conf import settings
from rest_framework import status

META_GRAPH_API_BASE = "https://graph.facebook.com/v24.0"

class MetaGraphAPIError(Exception):
    pass


def meta_graph_api_request(endpoint, access_token, params=None, method="GET", max_retries=3):
    url = f"{META_GRAPH_API_BASE}{endpoint}"
    headers = {"Authorization": f"Bearer {access_token}"}
    params = params or {}
    for attempt in range(max_retries):
        resp = requests.request(method, url, headers=headers, params=params)
        if resp.status_code == 200:
            return resp.json()
        elif resp.status_code == 401:
            raise MetaGraphAPIError("Token expired or invalid")
        elif resp.status_code == 429:
            # Rate limit, exponential backoff
            time.sleep(2 ** attempt)
            continue
        else:
            raise MetaGraphAPIError(f"Meta API error: {resp.status_code} {resp.text}")
    raise MetaGraphAPIError("Meta API rate limit exceeded after retries")


def cache_instagram_grid(ig_account_id, data, timeout=300):
    cache.set(f"ig_grid_{ig_account_id}", data, timeout)

def get_cached_instagram_grid(ig_account_id):
    return cache.get(f"ig_grid_{ig_account_id}")
