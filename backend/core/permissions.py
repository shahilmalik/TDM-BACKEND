from rest_framework.permissions import BasePermission

class IsOwnerOrAdmin(BasePermission):
    """Allow owner or admin-level users."""
    def has_object_permission(self, request, view, obj):
        return request.user == obj.user or request.user.type in ["manager", "superadmin"]

