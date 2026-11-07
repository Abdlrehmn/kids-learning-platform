from django.conf import settings
from django.db import models
from django.utils import timezone as django_timezone


class ParentProfile(models.Model):
    """Guardian-owned account metadata. Child identities are never login accounts."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="parent_profile",
    )
    guardian_attested_at = models.DateTimeField()
    email_verified_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=django_timezone.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def email_verified(self):
        return self.email_verified_at is not None

    def __str__(self):
        return f"Guardian account {self.user_id}"


class ChildProfile(models.Model):
    class AgeBand(models.TextChoices):
        PRESCHOOL = "4-6", "4–6"
        PRIMARY = "7-9", "7–9"
        UPPER_PRIMARY = "10-12", "10–12"

    guardian = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="child_profiles",
    )
    nickname = models.CharField(max_length=32)
    avatar_id = models.CharField(max_length=32, default="default")
    age_band = models.CharField(max_length=5, choices=AgeBand.choices, blank=True)
    timezone = models.CharField(max_length=64, default="UTC")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=django_timezone.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("created_at", "id")
        constraints = [
            models.UniqueConstraint(
                models.F("guardian"),
                models.functions.Lower("nickname"),
                name="accounts_child_guardian_nickname_ci_uniq",
            ),
        ]
        indexes = [
            models.Index(fields=("guardian", "is_active"), name="child_guardian_active_idx"),
        ]

    def __str__(self):
        return self.nickname
