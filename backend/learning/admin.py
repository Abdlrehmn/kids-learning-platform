from django.contrib import admin

from .models import Achievement, ChildAchievement, DailyStreak, Game, GameSession, LearningProgress, LearningSession, XPTransaction


@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "category", "is_active", "sort_order")
    list_filter = ("category", "is_active")
    search_fields = ("title", "slug")


@admin.register(GameSession)
class GameSessionAdmin(admin.ModelAdmin):
    list_display = ("id", "child", "game", "status", "score", "xp_awarded", "started_at")
    list_filter = ("status", "game")
    readonly_fields = ("id", "child", "game", "client_session_id", "level", "score", "rounds_completed", "xp_awarded", "started_at", "completed_at", "metrics")


@admin.register(XPTransaction)
class XPTransactionAdmin(admin.ModelAdmin):
    list_display = ("child", "amount", "stars", "reason", "created_at")
    list_filter = ("reason",)
    readonly_fields = ("child", "amount", "stars", "reason", "source_key", "metadata", "created_at")


admin.site.register((LearningProgress, LearningSession, Achievement, ChildAchievement, DailyStreak))
