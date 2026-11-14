from django.conf import settings
from django.contrib.auth import get_user_model, login, logout, update_session_auth_hash
from django.contrib.auth.tokens import default_token_generator
from django.core import signing
from django.core.mail import send_mail
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from rest_framework import generics, permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView

from .models import ChildProfile, ParentProfile
from .permissions import IsVerifiedGuardian
from .serializers import (
    ChangePasswordSerializer, ChildProfileSerializer, CurrentUserSerializer,
    LoginSerializer, RegistrationSerializer,
)

User = get_user_model()
VERIFICATION_SALT = "kiddoworld.guardian-email-verification.v1"
VERIFICATION_MAX_AGE = 60 * 60 * 24


@ensure_csrf_cookie
def csrf_token(request):
    return JsonResponse({"csrfToken": get_token(request)})


class AuthThrottle(AnonRateThrottle):
    scope = "auth"


@method_decorator(csrf_protect, name="dispatch")
class RegisterView(APIView):
    permission_classes = (permissions.AllowAny,)
    throttle_classes = (AuthThrottle,)

    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token = signing.dumps({"user_id": user.pk}, salt=VERIFICATION_SALT)
        verify_url = f"{settings.FRONTEND_BASE_URL}/verify-email#token={token}"
        send_mail(
            "Verify your KiddoWorld guardian account",
            f"Open this link to verify your email: {verify_url}",
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        return Response(
            {"detail": "Check your email for a verification link."},
            status=status.HTTP_201_CREATED,
        )


class VerifyEmailView(APIView):
    permission_classes = (permissions.AllowAny,)
    throttle_classes = (AuthThrottle,)

    def post(self, request):
        token = request.data.get("token")
        if not isinstance(token, str) or not token:
            raise ValidationError({"token": "A verification token is required."})
        try:
            payload = signing.loads(token, salt=VERIFICATION_SALT, max_age=VERIFICATION_MAX_AGE)
            user = User.objects.get(pk=payload["user_id"], is_active=False)
        except (signing.BadSignature, signing.SignatureExpired, User.DoesNotExist, KeyError, TypeError):
            raise ValidationError({"token": "This verification link is invalid or expired."})
        parent_profile, _ = ParentProfile.objects.get_or_create(
            user=user,
            defaults={"guardian_attested_at": user.date_joined},
        )
        from django.utils import timezone

        parent_profile.email_verified_at = timezone.now()
        parent_profile.save(update_fields=("email_verified_at", "updated_at"))
        user.is_active = True
        user.save(update_fields=("is_active",))
        return Response({"detail": "Email verified. You can now sign in."})


@method_decorator(csrf_protect, name="dispatch")
class VerificationResendView(APIView):
    permission_classes = (permissions.AllowAny,)
    throttle_classes = (AuthThrottle,)

    def post(self, request):
        email = request.data.get("email", "")
        if isinstance(email, str):
            user = User.objects.filter(email__iexact=email.strip(), is_active=False).first()
            if user:
                token = signing.dumps({"user_id": user.pk}, salt=VERIFICATION_SALT)
                verify_url = f"{settings.FRONTEND_BASE_URL}/verify-email#token={token}"
                send_mail(
                    "Verify your KiddoWorld guardian account",
                    f"Open this link to verify your email: {verify_url}",
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=False,
                )
        return Response({"detail": "If an unverified account uses that email, a verification link has been sent."})


@method_decorator(csrf_protect, name="dispatch")
class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)
    throttle_classes = (AuthThrottle,)

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        login(request, user)
        return Response(
            {"user": CurrentUserSerializer(user).data, "csrfToken": get_token(request)}
        )


@method_decorator(csrf_protect, name="dispatch")
class LogoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class CurrentUserView(APIView):
    permission_classes = (permissions.IsAuthenticated, IsVerifiedGuardian)

    def get(self, request):
        return Response(
            {
                "user": CurrentUserSerializer(request.user).data,
                "children": ChildProfileSerializer(
                    request.user.child_profiles.filter(is_active=True), many=True
                ).data,
            }
        )

    def patch(self, request):
        """Update guardian display name; other user fields stay untouched."""
        name = request.data.get("first_name", "")
        if not isinstance(name, str):
            raise ValidationError({"first_name": "A name is expected as text."})
        name = name.strip()
        if len(name) > 60:
            raise ValidationError({"first_name": "Keep the name under 60 characters."})
        request.user.first_name = name
        request.user.save(update_fields=("first_name",))
        return self.get(request)


class ChangePasswordView(APIView):
    permission_classes = (permissions.IsAuthenticated, IsVerifiedGuardian)

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        update_session_auth_hash(request, user)
        return Response({"detail": "Password updated for this account."})


@method_decorator(csrf_protect, name="dispatch")
class DeleteAccountView(APIView):
    permission_classes = (permissions.IsAuthenticated, IsVerifiedGuardian)

    def delete(self, request):
        password = request.data.get("password", "")
        confirmation = request.data.get("confirm_email", "")
        if not isinstance(password, str) or not request.user.check_password(password):
            raise ValidationError({"password": "The password is incorrect."})
        if not isinstance(confirmation, str) or confirmation.strip().casefold() != request.user.email.casefold():
            raise ValidationError({"confirm_email": "Enter the account email to confirm deletion."})
        user = request.user
        logout(request)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ChildListCreateView(generics.ListCreateAPIView):
    serializer_class = ChildProfileSerializer
    permission_classes = (permissions.IsAuthenticated, IsVerifiedGuardian)

    def get_queryset(self):
        return ChildProfile.objects.filter(guardian=self.request.user, is_active=True)

    def perform_create(self, serializer):
        serializer.save(guardian=self.request.user)


class ChildDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ChildProfileSerializer
    permission_classes = (permissions.IsAuthenticated, IsVerifiedGuardian)
    http_method_names = ("get", "patch", "delete", "head", "options")

    def get_queryset(self):
        return ChildProfile.objects.filter(guardian=self.request.user, is_active=True)

    def perform_destroy(self, instance):
        # Deleting a child profile cascades its progress and reward history.
        instance.delete()


@method_decorator(csrf_protect, name="dispatch")
class PasswordResetRequestView(APIView):
    permission_classes = (permissions.AllowAny,)
    throttle_classes = (AuthThrottle,)

    def post(self, request):
        email = request.data.get("email", "")
        if not isinstance(email, str):
            raise ValidationError({"email": "Enter a valid email address."})
        user = User.objects.filter(email__iexact=email.strip(), is_active=True).first()
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_url = f"{settings.FRONTEND_BASE_URL}/reset-password#uid={uid}&token={token}"
            send_mail(
                "Reset your KiddoWorld password",
                f"Open this link to choose a new password: {reset_url}",
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
        # Do not disclose whether an address belongs to an account.
        return Response({"detail": "If an active account uses that email, a reset link has been sent."})


@method_decorator(csrf_protect, name="dispatch")
class PasswordResetConfirmView(APIView):
    permission_classes = (permissions.AllowAny,)
    throttle_classes = (AuthThrottle,)

    def post(self, request):
        uid = request.data.get("uid")
        token = request.data.get("token")
        password = request.data.get("password")
        if not all(isinstance(value, str) and value for value in (uid, token, password)):
            raise ValidationError({"detail": "A reset link and new password are required."})
        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id, is_active=True)
        except (ValueError, TypeError, User.DoesNotExist):
            raise ValidationError({"detail": "This reset link is invalid or expired."})
        if not default_token_generator.check_token(user, token):
            raise ValidationError({"detail": "This reset link is invalid or expired."})
        from django.contrib.auth.password_validation import validate_password
        from django.core.exceptions import ValidationError as DjangoValidationError

        try:
            validate_password(password, user=user)
        except DjangoValidationError as exc:
            raise ValidationError({"password": list(exc.messages)}) from exc
        user.set_password(password)
        user.save(update_fields=("password",))
        return Response({"detail": "Password updated. Sign in with your new password."})
