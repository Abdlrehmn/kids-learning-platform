import uuid

from django.conf import settings
from django.db import models
from django.db.models import Q
from django.utils import timezone

from accounts.models import ChildProfile


class Game(models.Model):
    class Category(models.TextChoices):
        WORD = "word", "Word"
        MATH = "math", "Math"
        MEMORY = "memory", "Memory"
        PUZZLE = "puzzle", "Puzzle"
        LOGIC = "logic", "Logic"

    slug = models.SlugField(max_length=64, unique=True)
    title = models.CharField(max_length=120)
    category = models.CharField(max_length=16, choices=Category.choices)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveSmallIntegerField(default=0)
    content_version = models.PositiveSmallIntegerField(default=1)
    created_at = models.DateTimeField(default=timezone.now, editable=False)

    class Meta:
        ordering = ("sort_order", "title")
        indexes = [models.Index(fields=("category", "is_active"), name="game_category_active_idx")]

    def __str__(self):
        return self.title


class ClientSessionClaim(models.Model):
    """Globally reserves client request UUIDs across child and activity types."""

    class ActivityType(models.TextChoices):
        GAME = "game", "Game"
        ENGLISH = "english", "English"
        TYPING = "typing", "Typing"

    client_session_id = models.UUIDField(primary_key=True, editable=False)
    child = models.ForeignKey(ChildProfile, on_delete=models.CASCADE, related_name="session_claims")
    activity_type = models.CharField(max_length=12, choices=ActivityType.choices)
    activity_key = models.CharField(max_length=120)
    created_at = models.DateTimeField(default=timezone.now, editable=False)

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=Q(activity_type__in=["game", "english", "typing"]),
                name="client_session_type_supported",
            ),
        ]


class GameSession(models.Model):
    class Status(models.TextChoices):
        STARTED = "started", "Started"
        COMPLETED = "completed", "Completed"
        ABANDONED = "abandoned", "Abandoned"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    child = models.ForeignKey(ChildProfile, on_delete=models.CASCADE, related_name="game_sessions")
    game = models.ForeignKey(Game, on_delete=models.PROTECT, related_name="sessions")
    client_session_id = models.UUIDField()
    level = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.STARTED)
    score = models.PositiveIntegerField(default=0)
    rounds_completed = models.PositiveSmallIntegerField(default=0)
    xp_awarded = models.PositiveIntegerField(default=0)
    started_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(null=True, blank=True)
    metrics = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ("-started_at",)
        constraints = [
            models.UniqueConstraint(
                fields=("child", "client_session_id"),
                name="game_session_child_request_uniq",
            ),
            models.CheckConstraint(condition=Q(score__gte=0), name="game_session_score_nonnegative"),
        ]
        indexes = [
            models.Index(fields=("child", "-started_at"), name="game_session_child_date_idx"),
            models.Index(fields=("game", "status"), name="game_session_game_status_idx"),
        ]


class LearningProgress(models.Model):
    class ActivityType(models.TextChoices):
        ENGLISH = "english", "English"
        TYPING = "typing", "Typing"

    child = models.ForeignKey(ChildProfile, on_delete=models.CASCADE, related_name="learning_progress")
    activity_type = models.CharField(max_length=16, choices=ActivityType.choices)
    activity_key = models.CharField(max_length=120)
    is_completed = models.BooleanField(default=False)
    completion_count = models.PositiveIntegerField(default=0)
    best_score = models.PositiveIntegerField(null=True, blank=True)
    last_completed_at = models.DateTimeField(null=True, blank=True)
    summary = models.JSONField(default=dict, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("activity_type", "activity_key")
        constraints = [
            models.UniqueConstraint(
                fields=("child", "activity_type", "activity_key"),
                name="learning_progress_child_activity_uniq",
            ),
        ]
        indexes = [
            models.Index(fields=("child", "activity_type", "is_completed"), name="learning_progress_lookup_idx"),
        ]


class LearningSession(models.Model):
    """A bounded, idempotent record for English and Typing completion events."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    child = models.ForeignKey(ChildProfile, on_delete=models.CASCADE, related_name="learning_sessions")
    activity_type = models.CharField(max_length=16, choices=LearningProgress.ActivityType.choices)
    activity_key = models.CharField(max_length=120)
    client_session_id = models.UUIDField()
    started_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(null=True, blank=True)
    score = models.PositiveIntegerField(default=0)
    xp_awarded = models.PositiveIntegerField(default=0)
    stars_awarded = models.PositiveSmallIntegerField(default=0)
    metrics = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ("-started_at",)
        constraints = [
            models.UniqueConstraint(
                fields=("child", "client_session_id"),
                name="learning_session_child_request_uniq",
            ),
        ]
        indexes = [
            models.Index(fields=("child", "-started_at"), name="learn_sess_child_date_idx"),
            models.Index(fields=("activity_type", "activity_key"), name="learning_session_activity_idx"),
        ]


class XPTransaction(models.Model):
    class Reason(models.TextChoices):
        GAME_LEVEL = "game_level", "Game level"
        ENGLISH_COMPLETION = "english_completion", "English completion"
        TYPING_COMPLETION = "typing_completion", "Typing completion"
        DAILY_BONUS = "daily_bonus", "Daily bonus"
        ADJUSTMENT = "adjustment", "Administrative adjustment"

    child = models.ForeignKey(ChildProfile, on_delete=models.CASCADE, related_name="reward_transactions")
    amount = models.IntegerField()
    stars = models.SmallIntegerField(default=0)
    reason = models.CharField(max_length=32, choices=Reason.choices)
    source_key = models.CharField(max_length=160)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(default=timezone.now, editable=False)

    class Meta:
        ordering = ("-created_at", "-id")
        constraints = [
            models.UniqueConstraint(fields=("child", "source_key"), name="xp_child_source_uniq"),
            models.CheckConstraint(condition=~Q(amount=0), name="xp_amount_nonzero"),
            models.CheckConstraint(condition=Q(stars__gte=0), name="xp_stars_nonnegative"),
        ]
        indexes = [models.Index(fields=("child", "-created_at"), name="xp_child_date_idx")]


class Achievement(models.Model):
    class Criterion(models.TextChoices):
        GAMES_COMPLETED = "games_completed", "Games completed"
        ACTIVITIES_COMPLETED = "activities_completed", "Activities completed"
        XP_EARNED = "xp_earned", "XP earned"

    slug = models.SlugField(max_length=64, unique=True)
    title = models.CharField(max_length=100)
    description = models.CharField(max_length=240)
    icon_id = models.CharField(max_length=32, default="star")
    criterion = models.CharField(max_length=32, choices=Criterion.choices)
    threshold = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=Q(criterion__in=("games_completed", "activities_completed", "xp_earned")),
                name="achievement_criterion_supported",
            ),
        ]

    def __str__(self):
        return self.title


class ChildAchievement(models.Model):
    child = models.ForeignKey(ChildProfile, on_delete=models.CASCADE, related_name="achievements")
    achievement = models.ForeignKey(Achievement, on_delete=models.PROTECT, related_name="earned_by")
    earned_at = models.DateTimeField(default=timezone.now, editable=False)
    progress_at_award = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("-earned_at",)
        constraints = [
            models.UniqueConstraint(fields=("child", "achievement"), name="child_achievement_uniq"),
        ]
        indexes = [models.Index(fields=("child", "-earned_at"), name="achievement_child_date_idx")]


class DailyStreak(models.Model):
    child = models.OneToOneField(ChildProfile, on_delete=models.CASCADE, related_name="daily_streak")
    current_days = models.PositiveIntegerField(default=0)
    best_days = models.PositiveIntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)
    last_activity_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.child}: {self.current_days} days"
