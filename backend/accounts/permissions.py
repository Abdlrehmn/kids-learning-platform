from rest_framework.permissions import BasePermission


class IsVerifiedGuardian(BasePermission):
    message = "Verify the guardian email before managing child profiles."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "is_active", False)
            and hasattr(request.user, "parent_profile")
            and request.user.parent_profile.email_verified
        )
