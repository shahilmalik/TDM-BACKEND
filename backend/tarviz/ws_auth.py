from __future__ import annotations

from urllib.parse import parse_qs

class QueryStringJWTAuthMiddleware:
    """Authenticate Channels websocket connections using a SimpleJWT access token.

    Browser WebSocket clients can't set custom Authorization headers easily, so we accept:
    - ws://host/ws/events/?token=<accessToken>

    On success, sets scope['user'].
    """

    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        from django.contrib.auth.models import AnonymousUser

        scope["user"] = AnonymousUser()

        try:
            query_string = scope.get("query_string", b"").decode("utf-8")
            params = parse_qs(query_string)
            token = (params.get("token") or [None])[0]
            if token:
                from rest_framework_simplejwt.tokens import AccessToken

                access = AccessToken(token)
                user_id = access.get("user_id")
                if user_id is not None:
                    from django.contrib.auth import get_user_model

                    User = get_user_model()
                    user = await User.objects.aget(pk=user_id)
                    scope["user"] = user
        except Exception:
            # leave as AnonymousUser
            pass

        return await self.inner(scope, receive, send)


def QueryStringJWTAuthMiddlewareStack(inner):
    return QueryStringJWTAuthMiddleware(inner)
