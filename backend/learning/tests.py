import uuid
from datetime import datetime, timezone as datetime_timezone
from threading import Barrier, Thread
from queue import Queue
from unittest import skipUnless
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.db import IntegrityError, close_old_connections, connection, transaction
from django.db.models import Sum
from django.test import TestCase, TransactionTestCase
from django.utils import timezone
from rest_framework.test import APIClient

from accounts.models import ChildProfile, ParentProfile
from .activity_registry import is_supported_english_activity, is_supported_typing_activity
from .models import Achievement, ClientSessionClaim, DailyStreak, Game, GameSession, LearningProgress, LearningSession, XPTransaction
from .services import complete_english_activity, complete_typing_activity, update_streak


class LearningAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            username="guardian@example.com", email="guardian@example.com", password="StrongPass!9382"
        )
        ParentProfile.objects.create(user=self.user, guardian_attested_at=self.user.date_joined, email_verified_at=self.user.date_joined)
        self.child = ChildProfile.objects.create(guardian=self.user, nickname="Milo")
        self.other_user = get_user_model().objects.create_user(
            username="other@example.com", email="other@example.com", password="StrongPass!9382"
        )
        ParentProfile.objects.create(user=self.other_user, guardian_attested_at=self.other_user.date_joined, email_verified_at=self.other_user.date_joined)
        self.other_child = ChildProfile.objects.create(guardian=self.other_user, nickname="Milo")
        self.client.force_authenticate(self.user)

    def test_catalog_is_seeded_and_public(self):
        client = APIClient()
        response = client.get("/api/v1/games/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 46)

    def test_guardian_cannot_read_another_guardians_child(self):
        response = self.client.get(f"/api/v1/children/{self.other_child.pk}/summary/")
        self.assertEqual(response.status_code, 404)

    def test_unverified_guardian_cannot_access_child_features(self):
        unverified = get_user_model().objects.create_user(username="unverified@example.com", password="StrongPass!9382")
        ParentProfile.objects.create(user=unverified, guardian_attested_at=unverified.date_joined)
        client = APIClient()
        client.force_authenticate(unverified)
        response = client.get(f"/api/v1/children/{self.child.pk}/summary/")
        self.assertEqual(response.status_code, 403)

    def test_guardian_cannot_complete_another_guardians_game_session(self):
        game = Game.objects.get(slug="word-match")
        session = GameSession.objects.create(child=self.other_child, game=game, client_session_id=uuid.uuid4())
        response = self.client.post(
            f"/api/v1/game-sessions/{session.pk}/complete/",
            {"score": 100, "rounds_completed": 5}, format="json",
        )
        self.assertEqual(response.status_code, 404)

    def test_game_completion_awards_once_even_when_retried(self):
        game = Game.objects.get(slug="word-match")
        session = GameSession.objects.create(child=self.child, game=game, client_session_id=uuid.uuid4())
        payload = {"score": 450, "rounds_completed": 5}
        first = self.client.post(f"/api/v1/game-sessions/{session.pk}/complete/", payload, format="json")
        second = self.client.post(f"/api/v1/game-sessions/{session.pk}/complete/", payload, format="json")
        self.assertEqual(first.status_code, 200)
        self.assertTrue(first.data["created"])
        self.assertFalse(second.data["created"])
        self.assertEqual(XPTransaction.objects.filter(child=self.child, reason="game_level").count(), 1)

    def test_game_session_start_is_idempotent_and_rejects_identifier_reuse(self):
        request_id = uuid.uuid4()
        url = "/api/v1/game-sessions/"
        payload = {"child_id": self.child.pk, "game": "word-match", "client_session_id": str(request_id), "level": 1}
        first = self.client.post(url, payload, format="json")
        retry = self.client.post(url, payload, format="json")
        self.assertEqual(first.status_code, 201)
        self.assertEqual(retry.status_code, 200)
        payload["game"] = "spelling-bee"
        conflict = self.client.post(url, payload, format="json")
        self.assertEqual(conflict.status_code, 400)

    def test_abandoned_game_session_cannot_be_completed(self):
        game = Game.objects.get(slug="word-match")
        session = GameSession.objects.create(
            child=self.child, game=game, client_session_id=uuid.uuid4(), status=GameSession.Status.ABANDONED,
        )
        response = self.client.post(
            f"/api/v1/game-sessions/{session.pk}/complete/",
            {"score": 100, "rounds_completed": 5}, format="json",
        )
        self.assertEqual(response.status_code, 400)
        session.refresh_from_db()
        self.assertEqual(session.status, GameSession.Status.ABANDONED)
        self.assertFalse(XPTransaction.objects.filter(child=self.child).exists())

    def test_inactive_game_cannot_award_xp(self):
        game = Game.objects.get(slug="word-match")
        session = GameSession.objects.create(child=self.child, game=game, client_session_id=uuid.uuid4())
        game.is_active = False
        game.save(update_fields=("is_active",))
        response = self.client.post(
            f"/api/v1/game-sessions/{session.pk}/complete/",
            {"score": 100, "rounds_completed": 5}, format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertFalse(XPTransaction.objects.filter(child=self.child).exists())

    def test_english_activity_duplicate_request_does_not_duplicate_rewards(self):
        payload = {"child_id": self.child.pk, "activity_key": "story-lantern", "client_session_id": str(uuid.uuid4())}
        first = self.client.post("/api/v1/learning/english/complete/", payload, format="json")
        retry = self.client.post("/api/v1/learning/english/complete/", payload, format="json")
        self.assertTrue(first.data["created"])
        self.assertFalse(retry.data["created"])
        self.assertEqual(XPTransaction.objects.filter(child=self.child).count(), 2)  # base XP + daily bonus

    def test_english_repeats_do_not_repeat_base_reward_or_daily_bonus(self):
        fixed_now = datetime(2025, 3, 8, 23, 45, tzinfo=datetime_timezone.utc)
        with patch("learning.services.timezone.now", return_value=fixed_now):
            first, created = complete_english_activity(
                self.child, activity_key="story-lantern", client_session_id=uuid.uuid4(),
            )
            second, second_created = complete_english_activity(
                self.child, activity_key="story-lantern", client_session_id=uuid.uuid4(),
            )
        self.assertTrue(created)
        self.assertTrue(second_created)
        self.assertEqual((first.xp_awarded, first.stars_awarded), (10, 1))
        self.assertEqual((second.xp_awarded, second.stars_awarded), (0, 0))
        self.assertEqual(XPTransaction.objects.filter(child=self.child, reason=XPTransaction.Reason.ENGLISH_COMPLETION).count(), 1)
        self.assertEqual(XPTransaction.objects.filter(child=self.child, reason=XPTransaction.Reason.DAILY_BONUS).count(), 1)

    def test_typing_completion_is_idempotent_and_uses_server_reward_formula(self):
        request_id = uuid.uuid4()
        payload = {
            "child_id": self.child.pk, "activity_key": "letters-0", "client_session_id": str(request_id),
            "correct_words": 2, "completed_rounds": 1, "elapsed_ms": 1000,
        }
        first = self.client.post("/api/v1/learning/typing/complete/", payload, format="json")
        retry = self.client.post("/api/v1/learning/typing/complete/", payload, format="json")
        self.assertEqual(first.status_code, 200)
        self.assertTrue(first.data["created"])
        self.assertFalse(retry.data["created"])
        event = LearningSession.objects.get(child=self.child, client_session_id=request_id)
        ledger = XPTransaction.objects.get(child=self.child, source_key=f"typing-session:{request_id}")
        self.assertEqual(event.xp_awarded, ledger.amount)
        self.assertEqual(event.stars_awarded, ledger.stars)
        self.assertEqual(ledger.amount, 50)

    def test_session_uuid_cannot_be_reused_across_child_or_activity(self):
        second_child = ChildProfile.objects.create(guardian=self.user, nickname="Nina")
        request_id = str(uuid.uuid4())
        game_request = {
            "child_id": self.child.pk, "game": "word-match", "client_session_id": request_id, "level": 1,
        }
        self.assertEqual(self.client.post("/api/v1/game-sessions/", game_request, format="json").status_code, 201)
        game_request["child_id"] = second_child.pk
        self.assertEqual(self.client.post("/api/v1/game-sessions/", game_request, format="json").status_code, 400)
        english_request = {
            "child_id": second_child.pk, "activity_key": "story-lantern", "client_session_id": str(uuid.uuid4()),
        }
        self.assertEqual(self.client.post("/api/v1/learning/english/complete/", english_request, format="json").status_code, 200)
        english_request["activity_key"] = "grammar-nouns"
        self.assertEqual(self.client.post("/api/v1/learning/english/complete/", english_request, format="json").status_code, 400)

    def test_activity_identifiers_must_exist_in_supported_catalog(self):
        self.assertTrue(is_supported_english_activity("story-lantern"))
        self.assertTrue(is_supported_english_activity("listening-listen-word-cat"))
        self.assertFalse(is_supported_english_activity("made-up-activity"))
        self.assertTrue(is_supported_typing_activity("sentences-4"))
        self.assertFalse(is_supported_typing_activity("sentences-5"))
        response = self.client.post("/api/v1/learning/english/complete/", {
            "child_id": self.child.pk, "activity_key": "made-up-activity", "client_session_id": str(uuid.uuid4()),
        }, format="json")
        self.assertEqual(response.status_code, 400)
        typing_response = self.client.post("/api/v1/learning/typing/complete/", {
            "child_id": self.child.pk, "activity_key": "letters-300", "client_session_id": str(uuid.uuid4()),
            "correct_words": 1, "completed_rounds": 0, "elapsed_ms": 1000,
        }, format="json")
        self.assertEqual(typing_response.status_code, 400)

    def test_registry_covers_the_generated_vocabulary_activity_ids(self):
        # Generated listening/speaking IDs come from the first 100 deduplicated
        # vocabulary word cards; regenerate the pool check when englishContent grows.
        generated = ["red", "pizza", "cereal", "mother", "notebook", "bird", "cat"]
        for word in generated:
            self.assertTrue(is_supported_english_activity(f"listening-listen-word-{word}"), word)
        for word in ["bird", "cat", "red", "cereal"]:
            self.assertTrue(is_supported_english_activity(f"speaking-speak-word-{word}"), word)
        # The frontend pool truncates at 100 listening and 50 speaking prompts.
        self.assertFalse(is_supported_english_activity("listening-listen-word-flower"))
        self.assertFalse(is_supported_english_activity("speaking-speak-word-sandwich"))
        self.assertFalse(is_supported_english_activity("story-story-54"))
        response = self.client.post("/api/v1/learning/english/complete/", {
            "child_id": self.child.pk,
            "activity_key": "listening-listen-word-red",
            "client_session_id": str(uuid.uuid4()),
        }, format="json")
        self.assertEqual(response.status_code, 200)

    def test_typing_rejects_implausibly_fast_metrics(self):
        response = self.client.post("/api/v1/learning/typing/complete/", {
            "child_id": self.child.pk, "activity_key": "letters-0", "client_session_id": str(uuid.uuid4()),
            "correct_words": 5, "completed_rounds": 1, "elapsed_ms": 200,
        }, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertFalse(LearningSession.objects.filter(child=self.child).exists())

    def test_streak_ignores_out_of_order_events_and_resets_after_a_missed_day(self):
        day_one = datetime(2025, 4, 10, 12, tzinfo=datetime_timezone.utc)
        day_two = datetime(2025, 4, 11, 12, tzinfo=datetime_timezone.utc)
        day_four = datetime(2025, 4, 13, 12, tzinfo=datetime_timezone.utc)
        delayed = datetime(2025, 4, 12, 12, tzinfo=datetime_timezone.utc)
        update_streak(self.child, day_one)
        streak, new_day = update_streak(self.child, day_two)
        self.assertTrue(new_day)
        self.assertEqual(streak.current_days, 2)
        streak, new_day = update_streak(self.child, day_four)
        self.assertTrue(new_day)
        self.assertEqual(streak.current_days, 1)
        streak, new_day = update_streak(self.child, delayed)
        self.assertFalse(new_day)
        self.assertEqual(streak.current_days, 1)
        self.assertEqual(streak.last_activity_at, day_four)

    def test_streak_respects_local_midnight_dst_and_timezone_changes(self):
        self.child.timezone = "America/Los_Angeles"
        self.child.save(update_fields=("timezone",))
        before_dst = datetime(2025, 3, 8, 10, 30, tzinfo=datetime_timezone.utc)
        after_dst = datetime(2025, 3, 9, 10, 30, tzinfo=datetime_timezone.utc)
        update_streak(self.child, before_dst)
        streak, new_day = update_streak(self.child, after_dst)
        self.assertTrue(new_day)
        self.assertEqual(streak.current_days, 2)
        self.child.timezone = "Asia/Tokyo"
        self.child.save(update_fields=("timezone",))
        next_local_day = datetime(2025, 3, 9, 15, 30, tzinfo=datetime_timezone.utc)
        streak, new_day = update_streak(self.child, next_local_day)
        self.assertTrue(new_day)
        self.assertEqual(streak.current_days, 3)

    def test_daily_bonus_is_unique_for_local_calendar_day(self):
        fixed_now = datetime(2025, 4, 1, 12, tzinfo=datetime_timezone.utc)
        with patch("learning.services.timezone.now", return_value=fixed_now):
            complete_english_activity(self.child, activity_key="story-lantern", client_session_id=uuid.uuid4())
            complete_english_activity(self.child, activity_key="grammar-nouns", client_session_id=uuid.uuid4())
        self.assertEqual(XPTransaction.objects.filter(child=self.child, reason=XPTransaction.Reason.DAILY_BONUS).count(), 1)
        self.assertEqual(DailyStreak.objects.get(child=self.child).current_days, 1)

    def test_achievement_criteria_are_limited_to_supported_values(self):
        for invalid in ("client_claimed", "children_completed"):
            with self.assertRaises(IntegrityError):
                with transaction.atomic():
                    Achievement.objects.create(slug=f"invalid-{invalid}", title="Invalid", description="Invalid", criterion=invalid)

    def test_level_complete_endpoint_awards_once_without_pre_start(self):
        request_id = str(uuid.uuid4())
        payload = {
            "child_id": self.child.pk, "game": "word-match", "client_session_id": request_id,
            "level": 2, "score": 300, "rounds_completed": 5,
        }
        first = self.client.post("/api/v1/game-sessions/complete/", payload, format="json")
        retry = self.client.post("/api/v1/game-sessions/complete/", payload, format="json")
        self.assertEqual(first.status_code, 200)
        self.assertTrue(first.data["created"])
        self.assertFalse(retry.data["created"])
        self.assertEqual(first.data["xp_balance"], retry.data["xp_balance"])
        self.assertEqual(XPTransaction.objects.filter(child=self.child, reason="game_level").count(), 1)

    def test_level_complete_rejects_reused_identifier_for_another_level(self):
        request_id = str(uuid.uuid4())
        payload = {
            "child_id": self.child.pk, "game": "word-match", "client_session_id": request_id,
            "level": 1, "score": 300, "rounds_completed": 5,
        }
        self.assertEqual(self.client.post("/api/v1/game-sessions/complete/", payload, format="json").status_code, 200)
        payload.update(level=3, score=100)
        response = self.client.post("/api/v1/game-sessions/complete/", payload, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(XPTransaction.objects.filter(child=self.child, reason="game_level").count(), 1)

    def test_game_completion_rejects_out_of_range_score_and_rounds(self):
        game = Game.objects.get(slug="word-match")
        session = GameSession.objects.create(child=self.child, game=game, client_session_id=uuid.uuid4())
        invalid_payloads = (
            {"score": 700, "rounds_completed": 5},
            {"score": 100, "rounds_completed": 4},
            {"score": 100, "rounds_completed": 6},
            {"score": -1, "rounds_completed": 5},
        )
        for payload in invalid_payloads:
            response = self.client.post(f"/api/v1/game-sessions/{session.pk}/complete/", payload, format="json")
            self.assertEqual(response.status_code, 400, payload)
        session.refresh_from_db()
        self.assertEqual(session.status, GameSession.Status.STARTED)
        self.assertFalse(XPTransaction.objects.filter(child=self.child).exists())

    def test_reward_ledger_matches_session_and_bonus_records(self):
        fixed_now = datetime(2025, 6, 1, 12, tzinfo=datetime_timezone.utc)
        with patch("learning.services.timezone.now", return_value=fixed_now):
            request_id = str(uuid.uuid4())
            self.assertEqual(self.client.post("/api/v1/game-sessions/complete/", {
                "child_id": self.child.pk, "game": "word-match", "client_session_id": request_id,
                "level": 1, "score": 250, "rounds_completed": 5,
            }, format="json").status_code, 200)
            self.assertEqual(self.client.post("/api/v1/learning/english/complete/", {
                "child_id": self.child.pk, "activity_key": "story-lantern", "client_session_id": str(uuid.uuid4()),
            }, format="json").status_code, 200)
            self.assertEqual(self.client.post("/api/v1/learning/typing/complete/", {
                "child_id": self.child.pk, "activity_key": "letters-0", "client_session_id": str(uuid.uuid4()),
                "correct_words": 2, "completed_rounds": 1, "elapsed_ms": 1000,
            }, format="json").status_code, 200)
        game_session = GameSession.objects.get(child=self.child)
        english_event = LearningSession.objects.get(child=self.child, activity_type="english")
        typing_event = LearningSession.objects.get(child=self.child, activity_type="typing")
        game_ledger = XPTransaction.objects.get(child=self.child, source_key=f"game-session:{game_session.pk}")
        english_ledger = XPTransaction.objects.get(child=self.child, source_key="english-activity:story-lantern")
        typing_ledger = XPTransaction.objects.get(child=self.child, source_key=f"typing-session:{typing_event.client_session_id}")
        self.assertEqual((game_ledger.amount, game_session.xp_awarded), (25, 25))
        self.assertEqual((english_ledger.amount, english_ledger.stars, english_event.xp_awarded, english_event.stars_awarded), (10, 1, 10, 1))
        self.assertEqual((typing_ledger.amount, typing_ledger.stars, typing_event.xp_awarded, typing_event.stars_awarded), (50, 5, 50, 5))
        bonus_ledger = XPTransaction.objects.get(
            child=self.child,
            source_key=f"daily-bonus:{streak_date}",
        ) if (streak_date := DailyStreak.objects.get(child=self.child).last_activity_date) else self.fail("missing streak")
        self.assertEqual((bonus_ledger.amount, bonus_ledger.stars), (1, 1))
        ledgers = XPTransaction.objects.filter(child=self.child)
        self.assertEqual(ledgers.count(), 4)
        self.assertEqual(ledgers.aggregate(total=Sum("amount"))["total"], 86)
        self.assertEqual(ledgers.aggregate(total=Sum("stars"))["total"], 7)

    def test_auth_throttle_uses_configured_auth_scope(self):
        cache.clear()
        client = APIClient()
        for _ in range(10):
            self.assertEqual(client.post("/api/v1/auth/verification-resend/", {"email": "nobody@example.com"}, format="json").status_code, 200)
        limited = client.post("/api/v1/auth/verification-resend/", {"email": "nobody@example.com"}, format="json")
        self.assertEqual(limited.status_code, 429)


@skipUnless(connection.features.has_select_for_update, "Requires a database with SELECT FOR UPDATE support.")
class StreakConcurrencyTests(TransactionTestCase):
    def test_concurrent_same_day_streak_updates_are_serialized(self):
        user = get_user_model().objects.create_user(username="concurrency@example.com", password="StrongPass!9382")
        child = ChildProfile.objects.create(guardian=user, nickname="Concurrent")
        fixed_now = datetime(2025, 5, 1, 12, tzinfo=datetime_timezone.utc)
        gate = Barrier(2)
        errors = Queue()

        def worker():
            close_old_connections()
            try:
                gate.wait(timeout=5)
                update_streak(ChildProfile.objects.get(pk=child.pk), fixed_now)
            except Exception as exc:  # forwarded to the test thread
                errors.put(exc)
            finally:
                close_old_connections()

        threads = [Thread(target=worker) for _ in range(2)]
        for thread in threads:
            thread.start()
        for thread in threads:
            thread.join(timeout=10)
        self.assertTrue(errors.empty(), list(errors.queue))
        streak = DailyStreak.objects.get(child=child)
        self.assertEqual((streak.current_days, streak.best_days), (1, 1))
