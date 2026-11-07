from django.urls import path

from .views import (
    ChildDetailView,
    ChildListCreateView,
    CurrentUserView,
    DeleteAccountView,
    LoginView,
    LogoutView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    RegisterView,
    VerifyEmailView,
    VerificationResendView,
    csrf_token,
)

urlpatterns = [
    path("csrf/", csrf_token, name="csrf-token"),
    path("register/", RegisterView.as_view(), name="register"),
    path("verify-email/", VerifyEmailView.as_view(), name="verify-email"),
    path("verification-resend/", VerificationResendView.as_view(), name="verification-resend"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("password-reset/", PasswordResetRequestView.as_view(), name="password-reset"),
    path("password-reset/confirm/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    path("me/", CurrentUserView.as_view(), name="current-user"),
    path("me/delete/", DeleteAccountView.as_view(), name="delete-account"),
    path("children/", ChildListCreateView.as_view(), name="child-list"),
    path("children/<int:pk>/", ChildDetailView.as_view(), name="child-detail"),
]
