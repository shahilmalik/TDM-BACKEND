from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Iterable

import requests
from django.conf import settings

from core.models import DeviceToken


FCM_LEGACY_ENDPOINT = "https://fcm.googleapis.com/fcm/send"


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

    Uses the legacy HTTP API with the server key stored in settings.FCM_API_KEY.
    """
    api_key = _get_fcm_api_key()
    if not api_key:
        return
    if not tokens:
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
            requests.post(FCM_LEGACY_ENDPOINT, json=payload, headers=headers, timeout=5)
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
