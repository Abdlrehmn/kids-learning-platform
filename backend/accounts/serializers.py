from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError, transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework import serializers

from .models import ChildProfile, ParentProfile

User = get_user_model()


class RegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=254)
    password = serializers.CharField(write_only=True, trim_whitespace=False, max_length=128)
    guardian_confirmed = serializers.BooleanField()

    def validate_email(self, value):
        normalized = value.strip().casefold()
        if User.objects.filter(Q(username=normalized) | Q(email__iexact=normalized)).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return normalized

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages)) from exc
        return value

    def validate_guardian_confirmed(self, value):
        if not value:
            raise serializers.ValidationError("A parent or guardian must create this account.")
        return value

    def create(self, validated_data):
        email = validated_data["email"]
        try:
            with transaction.atomic():
                user = User.objects.create_user(
                    username=email,
                    email=email,
                    password=validated_data["password"],
                    is_active=False,
                )
                ParentProfile.objects.create(user=user, guardian_attested_at=timezone.now())
        except IntegrityError as exc:
            raise serializers.ValidationError({"email": "An account with this email already exists."}) from exc
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=254)
    password = serializers.CharField(write_only=True, trim_whitespace=False, max_length=128)

    def validate(self, attrs):
        email = attrs["email"].strip().casefold()
        user = authenticate(
            request=self.context.get("request"),
            username=email,
            password=attrs["password"],
        )
        if user is None:
            raise serializers.ValidationError({"detail": "Email or password is incorrect."})
        if not user.is_active:
            raise serializers.ValidationError({"detail": "Verify the guardian email before signing in."})
        attrs["user"] = user
        return attrs


class ChildProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChildProfile
        fields = ("id", "nickname", "avatar_id", "age_band", "timezone", "is_active", "created_at")
        read_only_fields = ("id", "created_at")

    def validate_nickname(self, value):
        normalized = value.strip()
        if not normalized:
            raise serializers.ValidationError("Add a nickname for this profile.")
        return normalized

    def validate_avatar_id(self, value):
        if value not in {"default", "fox", "bear", "owl", "cat", "rabbit", "turtle"}:
            raise serializers.ValidationError("Choose an available avatar.")
        return value

    def validate_timezone(self, value):
        from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

        try:
            ZoneInfo(value)
        except (ZoneInfoNotFoundError, ValueError) as exc:
            raise serializers.ValidationError("Use a valid IANA time zone.") from exc
        return value


class CurrentUserSerializer(serializers.ModelSerializer):
    email_verified = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "email", "first_name", "email_verified")

    def get_email_verified(self, obj):
        return bool(hasattr(obj, "parent_profile") and obj.parent_profile.email_verified)
