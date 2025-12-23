# permissions.py
from rest_framework.permissions import BasePermission


class IsEditorOrSuperAdmin(BasePermission):
    """Allows access only to users with customuser.type in {'editor', 'superadmin'}."""

    allowed_types = {"editor", "superadmin"}

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "type", "") in self.allowed_types
        )


# Backwards-compatible alias (existing imports may reference IsSuperAdmin)
IsSuperAdmin = IsEditorOrSuperAdmin
