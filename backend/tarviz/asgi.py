"""
ASGI config for tarviz project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tarviz.settings')

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

from tarviz.routing import websocket_urlpatterns
from tarviz.ws_auth import QueryStringJWTAuthMiddlewareStack

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter(
	{
		"http": django_asgi_app,
		"websocket": QueryStringJWTAuthMiddlewareStack(URLRouter(websocket_urlpatterns)),
	}
)
