from rest_framework import serializers

from .activity_registry import is_supported_english_activity, is_supported_typing_activity
from .models import Game, GameSession, LearningSession, XPTransaction, ChildAchievement, DailyStreak


class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ("slug", "title", "category", "sort_order", "content_version")


class GameStartSerializer(serializers.Serializer):
    child_id = serializers.IntegerField(min_value=1)
    game = serializers.SlugField(max_length=64)
    client_session_id = serializers.UUIDField()
    level = serializers.IntegerField(min_value=1, max_value=1000, default=1)


class GameCompleteSerializer(serializers.Serializer):
    score = serializers.IntegerField(min_value=0, max_value=500)
    rounds_completed = serializers.IntegerField(min_value=5, max_value=5)


class GameLevelCompleteSerializer(GameStartSerializer):
    score = serializers.IntegerField(min_value=0, max_value=500)
    rounds_completed = serializers.IntegerField(min_value=5, max_value=5)


class LearningCompleteSerializer(serializers.Serializer):
    child_id = serializers.IntegerField(min_value=1)
    activity_key = serializers.RegexField(r"^[a-zA-Z0-9._:-]{1,120}$")
    client_session_id = serializers.UUIDField()

    def validate_activity_key(self, value):
        if not is_supported_english_activity(value):
            raise serializers.ValidationError("Choose an activity from the English World catalog.")
        return value


class TypingCompleteSerializer(LearningCompleteSerializer):
    correct_words = serializers.IntegerField(min_value=0, max_value=80)
    completed_rounds = serializers.IntegerField(min_value=0, max_value=20)
    elapsed_ms = serializers.IntegerField(min_value=0, max_value=3600000)

    def validate_activity_key(self, value):
        if not is_supported_typing_activity(value):
            raise serializers.ValidationError("Choose a valid Typing Academy prompt.")
        return value


class RewardTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = XPTransaction
        fields = ("id", "amount", "stars", "reason", "created_at", "metadata")


class AchievementSerializer(serializers.ModelSerializer):
    slug = serializers.CharField(source="achievement.slug")
    title = serializers.CharField(source="achievement.title")
    description = serializers.CharField(source="achievement.description")

    class Meta:
        model = ChildAchievement
        fields = ("slug", "title", "description", "earned_at", "progress_at_award")


class AchievementProgressSerializer(serializers.Serializer):
    """An entry of the achievement catalog plus the child's real progress."""

    slug = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField()
    icon_id = serializers.CharField()
    criterion = serializers.CharField()
    threshold = serializers.IntegerField()
    earned_at = serializers.DateTimeField(allow_null=True)
    progress = serializers.IntegerField()


class LearningSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningSession
        fields = ("id", "activity_type", "activity_key", "started_at", "completed_at", "score", "xp_awarded", "stars_awarded")


class GameSessionSerializer(serializers.ModelSerializer):
    game = serializers.SlugField(source="game.slug")

    class Meta:
        model = GameSession
        fields = ("id", "game", "level", "status", "score", "rounds_completed", "xp_awarded", "started_at", "completed_at")


class DailyStreakSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyStreak
        fields = ("current_days", "best_days", "last_activity_date")
