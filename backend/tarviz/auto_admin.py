"""Auto-register any concrete models that are not already registered with admin.

This module is imported from `tarviz.__init__` so it runs when Django starts.
It registers concrete, non-proxy models with the default ModelAdmin if they are not
already present in the admin registry.
"""
from django.contrib import admin
from django.apps import apps


def autodiscover_and_register():
    for model in apps.get_models():
        opts = getattr(model, '_meta', None)
        if not opts:
            continue
        if getattr(opts, 'abstract', False) or getattr(opts, 'proxy', False):
            continue
        if model in admin.site._registry:
            continue
        try:
            admin.site.register(model)
        except admin.sites.AlreadyRegistered:
            continue
        except Exception:
            # Some models may require custom ModelAdmin classes; skip them silently.
            continue


# Run at import time
autodiscover_and_register()
