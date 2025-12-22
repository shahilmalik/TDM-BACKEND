from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Iterable

import requests
import logging
import os
from django.conf import settings

from core.models import DeviceToken

FCM_LEGACY_ENDPOINT = "https://fcm.googleapis.com/fcm/send"


def _normalize_fcm_data(data: dict[str, Any] | None) -> dict[str, str]:
    """FCM requires all `message.data` values to be strings.

    We coerce primitives to `str`, JSON-encode dict/list, and drop None values.
    """

    if not data:
        return {}

    normalized: dict[str, str] = {}
    for k, v in data.items():
        if v is None:
            continue
        key = str(k)
        if isinstance(v, str):
            normalized[key] = v
        elif isinstance(v, (int, float, bool)):
            normalized[key] = str(v)
        elif isinstance(v, (dict, list, tuple)):
            try:
                import json

                normalized[key] = json.dumps(v, ensure_ascii=False)
            except Exception:
                normalized[key] = str(v)
        else:
            normalized[key] = str(v)
    return normalized


def _get_fcm_project_id() -> str | None:
    pid = (
        os.getenv("FCM_PROJECT_ID")
        or getattr(settings, "FCM_PROJECT_ID", None)
        or os.getenv("FIREBASE_PROJECT_ID")
        or getattr(settings, "FIREBASE_PROJECT_ID", None)
    )
    if not pid:
        return None
    p = str(pid).strip()
    return p or None


def _get_service_account_file() -> str | None:
    # Prefer an explicit env var; fall back to standard Google env var.
    p = os.getenv("FCM_SERVICE_ACCOUNT_FILE") or os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if not p:
        return None
    pp = str(p).strip().strip('"').strip("'")
    return pp or None


def _get_fcm_v1_access_token() -> str | None:
    """Get OAuth2 access token for Firebase Cloud Messaging HTTP v1."""
    try:
        from google.oauth2 import service_account
        from google.auth.transport.requests import Request
    except Exception:
        return None

    sa_file = _get_service_account_file()
    if not sa_file:
        return None

    try:
        creds = service_account.Credentials.from_service_account_file(
            sa_file,
            scopes=["https://www.googleapis.com/auth/firebase.messaging"],
        )
        creds.refresh(Request())
        return str(creds.token) if getattr(creds, "token", None) else None
    except Exception:
        logging.exception("FCM v1: failed to load/refresh service account credentials")
        return None


def _send_fcm_v1_to_token(*, token: str, message: "FcmMessage") -> None:
    project_id = _get_fcm_project_id()
    if not project_id:
        logging.warning("FCM v1: missing FCM_PROJECT_ID; skipping push")
        return

    access_token = _get_fcm_v1_access_token()
    if not access_token:
        logging.warning(
            "FCM v1: missing service account credentials; set FCM_SERVICE_ACCOUNT_FILE (or GOOGLE_APPLICATION_CREDENTIALS)"
        )
        return

    url = f"https://fcm.googleapis.com/v1/projects/{project_id}/messages:send"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json; charset=UTF-8",
    }
    payload = {
        "message": {
            "token": token,
            "notification": {"title": message.title, "body": message.body},
            "data": _normalize_fcm_data(message.data),
            # webpush settings can be added later if needed
        }
    }
    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=8)
        if not resp.ok:
            logging.warning(
                "FCM v1: send failed status=%s body=%s",
                resp.status_code,
                (resp.text or "")[:800],
            )
    except Exception:
        logging.exception("FCM v1: send exception")


@dataclass(frozen=True)
class FcmMessage:
    title: str
    body: str
    data: dict[str, Any]


def _get_fcm_api_key() -> str | None:
    key = getattr(settings, "FCM_API_KEY", None)
    if not key:
        return None
    k = str(key).strip()
    return k or None


def _chunked(seq: list[str], size: int) -> Iterable[list[str]]:
    for i in range(0, len(seq), size):
        yield seq[i : i + size]


def send_fcm_to_tokens(tokens: list[str], message: FcmMessage) -> None:
    """Send an FCM notification to a list of registration tokens.

    Prefer FCM HTTP v1 (service account). Falls back to legacy key-based API if configured.
    """
    if not tokens:
        logging.info("FCM: no device tokens to notify")
        return

    # Prefer HTTP v1 if service account + project id are configured.
    if _get_fcm_project_id() and _get_service_account_file():
        for t in tokens:
            _send_fcm_v1_to_token(token=t, message=message)
        return

    # Legacy fallback.
    api_key = _get_fcm_api_key()
    if not api_key:
        logging.warning(
            "FCM: no v1 credentials and settings.FCM_API_KEY missing; skipping push"
        )
        return

    headers = {
        "Authorization": f"key={api_key}",
        "Content-Type": "application/json",
    }

    # Legacy API supports up to 1000 tokens per request via registration_ids
    for batch in _chunked(tokens, 1000):
        payload = {
            "registration_ids": batch,
            "notification": {
                "title": message.title,
                "body": message.body,
            },
            "data": message.data or {},
            "priority": "high",
        }
        try:
            resp = requests.post(
                FCM_LEGACY_ENDPOINT,
                json=payload,
                headers=headers,
                timeout=5,
            )
            if not resp.ok:
                logging.warning(
                    "FCM: send failed status=%s body=%s",
                    resp.status_code,
                    (resp.text or "")[:500],
                )
                continue
            try:
                body = resp.json()
                failure = body.get("failure")
                if failure:
                    logging.warning("FCM: send returned failure=%s body=%s", failure, body)
            except Exception:
                # Response is sometimes not JSON.
                pass
        except Exception:
            # Do not break core flows if push fails.
            pass


def notify_users(
    *,
    user_ids: Iterable[int | None],
    message: FcmMessage,
    exclude_user_id: int | None = None,
) -> None:
    ids = [int(uid) for uid in user_ids if uid is not None]
    if exclude_user_id is not None:
        ids = [uid for uid in ids if uid != int(exclude_user_id)]
    if not ids:
        return

    qs = DeviceToken.objects.filter(user_id__in=ids, archived=False)
    tokens = list(qs.values_list("token", flat=True))
    send_fcm_to_tokens(tokens, message)


def notify_content_item_event(
    *,
    content_item: Any,
    title: str,
    body: str,
    data: dict[str, Any],
    actor_user_id: int | None = None,
) -> None:
    # By default: notify the client owner and the assigned staff user (if any).
    client_id = getattr(content_item, "client_id", None)
    assigned_to_id = getattr(content_item, "assigned_to_id", None)
    notify_users(
        user_ids=[client_id, assigned_to_id],
        exclude_user_id=actor_user_id,
        message=FcmMessage(title=title, body=body, data=data),
    )


def notify_invoice_event(
    *,
    invoice: Any,
    title: str,
    body: str,
    data: dict[str, Any],
    actor_user_id: int | None = None,
) -> None:
    client_id = getattr(invoice, "client_id", None)
    authorized_by_id = getattr(invoice, "authorized_by_id", None)
    notify_users(
        user_ids=[client_id, authorized_by_id],
        exclude_user_id=actor_user_id,
        message=FcmMessage(title=title, body=body, data=data),
    )
