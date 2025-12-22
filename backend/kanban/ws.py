from __future__ import annotations

from typing import Any, Dict, Optional

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


def _group_send(group: str, payload: Dict[str, Any]) -> None:
    channel_layer = get_channel_layer()
    if not channel_layer:
        return
    async_to_sync(channel_layer.group_send)(
        group,
        {
            "type": "push_event",
            "payload": payload,
        },
    )


def send_to_client(client_id: str | int, event: str, data: Dict[str, Any]) -> None:
    _group_send(
        f"client_{client_id}",
        {
            "event": event,
            "data": data,
        },
    )


def send_to_client_and_user(client_id: str | int, event: str, data: Dict[str, Any]) -> None:
    """Broadcast to both client_<id> group and the client user's user_<id> group.

    This makes realtime updates robust even when the frontend websocket connection
    doesn't (or can't) join the client_<id> group reliably.
    """
    send_to_client(client_id, event, data)
    send_to_user(client_id, event, data)


def send_to_user(user_id: str | int, event: str, data: Dict[str, Any]) -> None:
    _group_send(
        f"user_{user_id}",
        {
            "event": event,
            "data": data,
        },
    )
