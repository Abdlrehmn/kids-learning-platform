import re
import os
import subprocess
import sys
from pathlib import Path

from django.contrib.auth import get_user_model
from django.core import mail
from django.test import SimpleTestCase, TestCase
from rest_framework.test import APIClient

from .models import ChildProfile, ParentProfile


class AccountAPITests(TestCase):
    def test_guardian_registration_verification_and_sign_in(self):
        client = APIClient()
        response = client.post("/api/v1/auth/register/", {
            "email": "guardian@example.com",
            "password": "BrightPassword!2948",
            "guardian_confirmed": True,
        }, format="json")
        self.assertEqual(response.status_code, 201)
        user = get_user_model().objects.get(email="guardian@example.com")
        self.assertFalse(user.is_active)
        self.assertTrue(user.has_usable_password())
        token = re.search(r"token=(\S+)", mail.outbox[0].body).group(1)
        verified = client.post("/api/v1/auth/verify-email/", {"token": token}, format="json")
        self.assertEqual(verified.status_code, 200)
        user.refresh_from_db()
        self.assertTrue(user.is_active)
        self.assertTrue(user.parent_profile.email_verified)
        login_response = client.post("/api/v1/auth/login/", {
            "email": "guardian@example.com", "password": "BrightPassword!2948",
        }, format="json")
        self.assertEqual(login_response.status_code, 200)

    def test_unsafe_session_auth_requires_csrf(self):
        user = get_user_model().objects.create_user(username="csrf@example.com", email="csrf@example.com", password="SafePass!12345")
        ParentProfile.objects.create(user=user, guardian_attested_at=user.date_joined, email_verified_at=user.date_joined)
        client = APIClient(enforce_csrf_checks=True)
        csrf_response = client.get("/api/v1/auth/csrf/")
        token = csrf_response.json()["csrfToken"]
        response = client.post("/api/v1/auth/login/", {
            "email": user.email, "password": "SafePass!12345",
        }, format="json", HTTP_X_CSRFTOKEN=token)
        self.assertEqual(response.status_code, 200)
        child_response = client.post("/api/v1/auth/children/", {
            "nickname": "Ari", "avatar_id": "default", "age_band": "7-9", "timezone": "UTC",
        }, format="json")
        self.assertEqual(child_response.status_code, 403)
        child_response = client.post("/api/v1/auth/children/", {
            "nickname": "Ari", "avatar_id": "default", "age_band": "7-9", "timezone": "UTC",
        }, format="json", HTTP_X_CSRFTOKEN=client.cookies["csrftoken"].value)
        self.assertEqual(child_response.status_code, 201)
        self.assertTrue(ChildProfile.objects.filter(guardian=user, nickname="Ari").exists())

    def test_guardian_can_delete_their_account_after_password_confirmation(self):
        user = get_user_model().objects.create_user(username="erase@example.com", email="erase@example.com", password="ErasePass!12345")
        ParentProfile.objects.create(user=user, guardian_attested_at=user.date_joined, email_verified_at=user.date_joined)
        ChildProfile.objects.create(guardian=user, nickname="Learner")
        client = APIClient()
        client.force_authenticate(user)
        response = client.delete("/api/v1/auth/me/delete/", {
            "password": "ErasePass!12345", "confirm_email": user.email,
        }, format="json")
        self.assertEqual(response.status_code, 204)
        self.assertFalse(get_user_model().objects.filter(pk=user.pk).exists())
        self.assertFalse(ChildProfile.objects.filter(guardian_id=user.pk).exists())


class ProductionSettingsTests(SimpleTestCase):
    backend_dir = Path(__file__).resolve().parents[1]

    @staticmethod
    def production_environment(**overrides):
        env = os.environ.copy()
        for key in (
            "DJANGO_DEBUG", "DJANGO_ENVIRONMENT", "DJANGO_SECRET_KEY", "DJANGO_ALLOWED_HOSTS",
            "DATABASE_URL", "REDIS_URL", "FRONTEND_BASE_URL", "CORS_ALLOWED_ORIGINS",
            "CSRF_TRUSTED_ORIGINS", "EMAIL_HOST", "EMAIL_HOST_USER", "EMAIL_HOST_PASSWORD",
            "DEFAULT_FROM_EMAIL", "DJANGO_EMAIL_BACKEND",
        ):
            env.pop(key, None)
        env.update({
            "DJANGO_DEBUG": "false",
            "DJANGO_ENVIRONMENT": "production",
            "DJANGO_SECRET_KEY": "test-production-secret-key-long-enough",
            "DJANGO_ALLOWED_HOSTS": "api.example.test",
            "DATABASE_URL": "postgresql://kiddo:password@db.example.test:5432/kiddoworld?sslmode=verify-full",
            "REDIS_URL": "rediss://cache.example.test:6380/0",
            "FRONTEND_BASE_URL": "https://www.example.test",
            "CORS_ALLOWED_ORIGINS": "https://www.example.test",
            "CSRF_TRUSTED_ORIGINS": "https://www.example.test",
            "EMAIL_HOST": "smtp.example.test",
            "EMAIL_HOST_USER": "kiddo",
            "EMAIL_HOST_PASSWORD": "mail-secret",
            "DEFAULT_FROM_EMAIL": "KiddoWorld <no-reply@example.test>",
            "PYTHONDONTWRITEBYTECODE": "1",
        })
        env.update(overrides)
        return env

    def import_settings(self, **overrides):
        return subprocess.run(
            [sys.executable, "-c", "import config.settings"],
            cwd=self.backend_dir,
            env=self.production_environment(**overrides),
            capture_output=True,
            text=True,
            timeout=15,
        )

    def test_production_settings_accept_valid_deployment_configuration(self):
        result = self.import_settings()
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_production_rejects_debug_mode(self):
        result = self.import_settings(DJANGO_DEBUG="true")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("cannot be enabled", result.stderr)

    def test_production_rejects_sqlite_and_malformed_database_urls(self):
        sqlite = self.import_settings(DATABASE_URL="sqlite:///production.sqlite3")
        malformed = self.import_settings(DATABASE_URL="postgresql://kiddo@/missing-host")
        self.assertIn("must use PostgreSQL", sqlite.stderr)
        self.assertIn("must include a username, host, and database name", malformed.stderr)

    def test_production_requires_shared_cache_and_exact_https_origins(self):
        no_cache = self.import_settings(REDIS_URL="")
        wildcard_origin = self.import_settings(CORS_ALLOWED_ORIGINS="https://*.example.test")
        self.assertIn("REDIS_URL is required", no_cache.stderr)
        self.assertIn("exact HTTPS origins", wildcard_origin.stderr)
