from __future__ import annotations

import json
from typing import Any

from channels.generic.websocket import AsyncJsonWebsocketConsumer


class EventsConsumer(AsyncJsonWebsocketConsumer):
    """Single websocket consumer for realtime app events.

    Groups:
    - user_<id>
    - client_<id> (optional via query param)

    Query params:
    - token=<jwt access token> (required)
    - client_id=<id> (optional)

    Events pushed by the server are of the form:
    {"event": "comment_added"|"content_item_status_changed"|"content_item_updated"|"invoice_item_recorded", "data": {...}}
    """

    async def connect(self):
        user = self.scope.get("user")
        if not user or getattr(user, "is_anonymous", True):
            await self.close(code=4401)
            return

        self.user = user
        await self.accept()

        self.user_group = f"user_{user.id}"
        await self.channel_layer.group_add(self.user_group, self.channel_name)

        # Optional client scoping.
        try:
            qs = self.scope.get("query_string", b"").decode("utf-8")
            params = {k: v for k, v in (p.split("=", 1) for p in qs.split("&") if "=" in p)}
            client_id = params.get("client_id")
        except Exception:
            client_id = None

        self.client_group = None
        if client_id:
            self.client_group = f"client_{client_id}"
            await self.channel_layer.group_add(self.client_group, self.channel_name)

    async def disconnect(self, code):
        try:
            user_group = getattr(self, "user_group", None)
            if user_group:
                await self.channel_layer.group_discard(user_group, self.channel_name)

            client_group = getattr(self, "client_group", None)
            if client_group:
                await self.channel_layer.group_discard(client_group, self.channel_name)
        except Exception:
            pass

    async def receive(self, text_data=None, bytes_data=None):
        # No client->server commands for now.
        return

    async def push_event(self, event: dict[str, Any]):
        payload = event.get("payload") or {}
        await self.send_json(payload)
