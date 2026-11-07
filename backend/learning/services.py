from datetime import timedelta
from uuid import UUID

from django.db import transaction
from django.db.models import Sum
from django.utils import timezone
from zoneinfo import ZoneInfo

from accounts.models import ChildProfile
from .activity_registry import is_supported_english_activity, is_supported_typing_activity
from .models import (
    Achievement,
    ClientSessionClaim,
    ChildAchievement,
    DailyStreak,
    GameSession,
    LearningProgress,
    LearningSession,
    XPTransaction,
)


GAME_LEVEL_XP = 25
ENGLISH_ACTIVITY_XP = 10
TYPING_XP_PER_WORD = 10
TYPING_XP_PER_ROUND = 30
TYPING_STARS_PER_ROUND = 3
MAX_TYPING_WORDS = 80
MAX_TYPING_ROUNDS = 20
MAX_SESSION_SCORE = 500
MIN_TYPING_MS_PER_WORD = 100
MIN_TYPING_MS_PER_ROUND = 500


def child_local_date(child, at=None):
    at = at or timezone.now()
    try:
        zone = ZoneInfo(child.timezone)
    except (KeyError, ValueError):
        zone = ZoneInfo("UTC")
    return timezone.localtime(at, zone).date()


def claim_client_session(child, client_session_id, activity_type, activity_key):
    if not isinstance(client_session_id, UUID):
        raise ValueError("Client session identifiers must be UUID values.")
    claim, created = ClientSessionClaim.objects.get_or_create(
        client_session_id=client_session_id,
        defaults={"child": child, "activity_type": activity_type, "activity_key": activity_key},
    )
    if not created and (
        claim.child_id != child.pk
        or claim.activity_type != activity_type
        or claim.activity_key != activity_key
    ):
        raise ValueError("This request identifier was already used for another child or activity.")
    return claim, created


def get_xp_balance(child):
    return child.reward_transactions.aggregate(total=Sum("amount"))["total"] or 0


def get_star_balance(child):
    return child.reward_transactions.aggregate(total=Sum("stars"))["total"] or 0


def update_streak(child, activity_at=None):
    """Serialize streak updates and ignore delayed events using their UTC instant."""
    activity_at = activity_at or timezone.now()
    if timezone.is_naive(activity_at):
        raise ValueError("Streak activity timestamps must be timezone-aware.")
    with transaction.atomic():
        locked_child = ChildProfile.objects.select_for_update().get(pk=child.pk)
        activity_date = child_local_date(locked_child, activity_at)
        streak, _ = DailyStreak.objects.get_or_create(child=locked_child)
        last_at = streak.last_activity_at
        if last_at is not None and activity_at <= last_at:
            return streak, False
        if (
            last_at is None
            and streak.last_activity_date is not None
            and activity_date < streak.last_activity_date
        ):
            return streak, False
        previous_date = (
            child_local_date(locked_child, last_at)
            if last_at is not None
            else streak.last_activity_date
        )
        if previous_date == activity_date:
            streak.last_activity_at = activity_at
            if streak.last_activity_date != activity_date:
                streak.last_activity_date = activity_date
                streak.save(update_fields=("last_activity_date", "last_activity_at", "updated_at"))
            else:
                streak.save(update_fields=("last_activity_at", "updated_at"))
            return streak, False
        if previous_date == activity_date - timedelta(days=1):
            streak.current_days += 1
        else:
            streak.current_days = 1
        streak.best_days = max(streak.best_days, streak.current_days)
        streak.last_activity_date = activity_date
        streak.last_activity_at = activity_at
        streak.save(update_fields=(
            "current_days", "best_days", "last_activity_date", "last_activity_at", "updated_at"
        ))
        return streak, True


def award_daily_bonus(child, activity_date, activity_key):
    XPTransaction.objects.get_or_create(
        child=child,
        source_key=f"daily-bonus:{activity_date.isoformat()}",
        defaults={
            "amount": 1,
            "stars": 1,
            "reason": XPTransaction.Reason.DAILY_BONUS,
            "metadata": {"activity_key": activity_key},
        },
    )


def evaluate_achievements(child):
    progress_count = LearningProgress.objects.filter(child=child, is_completed=True).count()
    game_count = GameSession.objects.filter(child=child, status=GameSession.Status.COMPLETED).count()
    totals = {
        "activities_completed": progress_count,
        "games_completed": game_count,
        "xp_earned": max(0, get_xp_balance(child)),
    }
    earned = []
    for achievement in Achievement.objects.filter(is_active=True):
        if achievement.criterion not in Achievement.Criterion.values:
            continue
        progress_value = totals.get(achievement.criterion)
        if progress_value is None or progress_value < achievement.threshold:
            continue
        _, created = ChildAchievement.objects.get_or_create(
            child=child,
            achievement=achievement,
            defaults={"progress_at_award": progress_value},
        )
        if created:
            earned.append(achievement.slug)
    return earned


def complete_game_session(session, *, score, rounds_completed):
    """Complete one game level once and create its XP ledger entry atomically."""
    if rounds_completed != 5:
        raise ValueError("A game level requires five completed rounds.")
    if score < 0 or score > MAX_SESSION_SCORE:
        raise ValueError("Score is outside the allowed range.")
    with transaction.atomic():
        locked_child = ChildProfile.objects.select_for_update().get(pk=session.child_id)
        locked = GameSession.objects.select_for_update().select_related("child").get(pk=session.pk)
        if locked.status == GameSession.Status.COMPLETED:
            ledger = XPTransaction.objects.filter(
                child=locked.child, source_key=f"game-session:{locked.pk}"
            ).first()
            if (
                locked.xp_awarded != GAME_LEVEL_XP
                or ledger is None
                or ledger.amount != locked.xp_awarded
                or ledger.reason != XPTransaction.Reason.GAME_LEVEL
            ):
                raise ValueError("Completed game reward ledger is inconsistent.")
            return locked, False
        if locked.status != GameSession.Status.STARTED:
            raise ValueError("Only a started game session can be completed.")
        game = type(locked.game).objects.select_for_update().get(pk=locked.game_id)
        if not game.is_active:
            raise ValueError("This game is no longer active.")
        claim_client_session(
            locked_child, locked.client_session_id, ClientSessionClaim.ActivityType.GAME,
            f"{game.slug}:{locked.level}",
        )
        locked.status = GameSession.Status.COMPLETED
        locked.score = score
        locked.rounds_completed = rounds_completed
        locked.completed_at = timezone.now()
        locked.xp_awarded = GAME_LEVEL_XP
        locked.metrics = {"rounds_completed": rounds_completed}
        locked.save(
            update_fields=(
                "status", "score", "rounds_completed", "completed_at", "xp_awarded", "metrics"
            )
        )
        XPTransaction.objects.get_or_create(
            child=locked.child,
            source_key=f"game-session:{locked.pk}",
            defaults={
                "amount": GAME_LEVEL_XP,
                "reason": XPTransaction.Reason.GAME_LEVEL,
                "metadata": {"game": game.slug, "score": score, "level": locked.level},
            },
        )
        ledger = XPTransaction.objects.get(child=locked.child, source_key=f"game-session:{locked.pk}")
        if ledger.amount != locked.xp_awarded or ledger.reason != XPTransaction.Reason.GAME_LEVEL:
            raise ValueError("Game XP does not match the ledger entry.")
        streak, new_day = update_streak(locked.child, locked.completed_at)
        if new_day:
            award_daily_bonus(locked.child, streak.last_activity_date, game.slug)
        evaluate_achievements(locked.child)
        return locked, True


def complete_english_activity(child, *, activity_key, client_session_id):
    """Award one base star/XP per unique activity and a daily star once per day."""
    if not is_supported_english_activity(activity_key):
        raise ValueError("This English activity is not in the supported activity catalog.")
    now = timezone.now()
    with transaction.atomic():
        child = ChildProfile.objects.select_for_update().get(pk=child.pk)
        claim_client_session(child, client_session_id, ClientSessionClaim.ActivityType.ENGLISH, activity_key)
        event, created_event = LearningSession.objects.get_or_create(
            child=child,
            client_session_id=client_session_id,
            defaults={
                "activity_type": LearningProgress.ActivityType.ENGLISH,
                "activity_key": activity_key,
                "started_at": now,
                "completed_at": now,
            },
        )
        if not created_event:
            if event.activity_type != LearningProgress.ActivityType.ENGLISH or event.activity_key != activity_key:
                raise ValueError("This request identifier was already used for another activity.")
            return event, False
        progress, _ = LearningProgress.objects.select_for_update().get_or_create(
            child=child,
            activity_type=LearningProgress.ActivityType.ENGLISH,
            activity_key=activity_key,
        )
        first_completion = not progress.is_completed
        progress.is_completed = True
        progress.completion_count += 1
        progress.last_completed_at = now
        progress.save(
            update_fields=("is_completed", "completion_count", "last_completed_at", "updated_at")
        )
        event.stars_awarded = 1
        event.xp_awarded = ENGLISH_ACTIVITY_XP if first_completion else 0
        event.save(update_fields=("stars_awarded", "xp_awarded"))
        if first_completion:
            XPTransaction.objects.create(
                child=child,
                amount=ENGLISH_ACTIVITY_XP,
                stars=1,
                reason=XPTransaction.Reason.ENGLISH_COMPLETION,
                source_key=f"english-activity:{activity_key}",
            )
        else:
            event.stars_awarded = 0
            event.save(update_fields=("stars_awarded",))
        streak, new_day = update_streak(child, now)
        if new_day:
            award_daily_bonus(child, streak.last_activity_date, activity_key)
        evaluate_achievements(child)
        event.refresh_from_db()
        return event, True


def complete_typing_activity(
    child,
    *,
    activity_key,
    client_session_id,
    correct_words,
    completed_rounds,
    elapsed_ms,
):
    """Record only validated aggregate typing metrics; raw typed text is not stored."""
    if not is_supported_typing_activity(activity_key):
        raise ValueError("This Typing activity is not in the supported activity catalog.")
    if not 0 <= correct_words <= MAX_TYPING_WORDS:
        raise ValueError("Correct word count is outside the allowed range.")
    if not 0 <= completed_rounds <= MAX_TYPING_ROUNDS:
        raise ValueError("Completed round count is outside the allowed range.")
    if not 0 <= elapsed_ms <= 60 * 60 * 1000:
        raise ValueError("Elapsed time is outside the allowed range.")
    if correct_words == 0 and completed_rounds == 0:
        raise ValueError("At least one completed word or round is required.")
    minimum_elapsed = correct_words * MIN_TYPING_MS_PER_WORD + completed_rounds * MIN_TYPING_MS_PER_ROUND
    if elapsed_ms < minimum_elapsed:
        raise ValueError("Elapsed time is too short for the submitted typing totals.")
    xp = correct_words * TYPING_XP_PER_WORD + completed_rounds * TYPING_XP_PER_ROUND
    stars = correct_words + completed_rounds * TYPING_STARS_PER_ROUND
    now = timezone.now()
    with transaction.atomic():
        child = ChildProfile.objects.select_for_update().get(pk=child.pk)
        claim_client_session(child, client_session_id, ClientSessionClaim.ActivityType.TYPING, activity_key)
        event, created = LearningSession.objects.get_or_create(
            child=child,
            client_session_id=client_session_id,
            defaults={
                "activity_type": LearningProgress.ActivityType.TYPING,
                "activity_key": activity_key,
                "started_at": now - timedelta(milliseconds=elapsed_ms),
                "completed_at": now,
                "score": min(correct_words * 10, MAX_SESSION_SCORE),
                "xp_awarded": xp,
                "stars_awarded": min(stars, 32767),
                "metrics": {
                    "correct_words": correct_words,
                    "completed_rounds": completed_rounds,
                    "elapsed_ms": elapsed_ms,
                },
            },
        )
        if not created:
            if event.activity_type != LearningProgress.ActivityType.TYPING or event.activity_key != activity_key:
                raise ValueError("This request identifier was already used for another activity.")
            return event, False
        progress, _ = LearningProgress.objects.select_for_update().get_or_create(
            child=child,
            activity_type=LearningProgress.ActivityType.TYPING,
            activity_key=activity_key,
        )
        progress.is_completed = True
        progress.completion_count += 1
        progress.last_completed_at = now
        progress.best_score = max(progress.best_score or 0, event.score)
        progress.summary = {
            "best_score": progress.best_score,
            "completion_count": progress.completion_count,
        }
        progress.save(
            update_fields=(
                "is_completed", "completion_count", "last_completed_at", "best_score", "summary", "updated_at"
            )
        )
        XPTransaction.objects.create(
            child=child,
            amount=xp,
            stars=event.stars_awarded,
            reason=XPTransaction.Reason.TYPING_COMPLETION,
            source_key=f"typing-session:{event.client_session_id}",
            metadata={"activity_key": activity_key, **event.metrics},
        )
        streak, new_day = update_streak(child, now)
        if new_day:
            award_daily_bonus(child, streak.last_activity_date, activity_key)
        evaluate_achievements(child)
        return event, True
