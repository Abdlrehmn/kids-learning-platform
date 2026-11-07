from django.db import transaction
from django.db.models import Sum
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from accounts.models import ChildProfile
from accounts.permissions import IsVerifiedGuardian
from .models import ClientSessionClaim, Game, GameSession, LearningSession, XPTransaction
from .serializers import (
    AchievementSerializer, DailyStreakSerializer, GameCompleteSerializer,
    GameLevelCompleteSerializer, GameSerializer, GameSessionSerializer, GameStartSerializer,
    LearningCompleteSerializer, LearningSessionSerializer,
    RewardTransactionSerializer, TypingCompleteSerializer,
)
from .services import claim_client_session, complete_english_activity, complete_game_session, complete_typing_activity


def owned_child(request, child_id):
    return get_object_or_404(ChildProfile, pk=child_id, guardian=request.user, is_active=True)


class CompletionThrottle(ScopedRateThrottle):
    scope = "completion"


class TypingThrottle(ScopedRateThrottle):
    scope = "typing"


class GameCatalogView(generics.ListAPIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()
    serializer_class = GameSerializer
    queryset = Game.objects.filter(is_active=True)


class GameSessionStartView(APIView):
    permission_classes = (permissions.IsAuthenticated, IsVerifiedGuardian)
    throttle_classes = (CompletionThrottle,)

    def post(self, request):
        serializer = GameStartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        child = owned_child(request, data["child_id"])
        game = get_object_or_404(Game, slug=data["game"], is_active=True)
        try:
            with transaction.atomic():
                claim_client_session(
                    child, data["client_session_id"], ClientSessionClaim.ActivityType.GAME,
                    f"{game.slug}:{data['level']}",
                )
                session, created = GameSession.objects.get_or_create(
                    child=child, client_session_id=data["client_session_id"],
                    defaults={"game": game, "level": data["level"]},
                )
                if not created and (session.game_id != game.id or session.level != data["level"]):
                    raise ValueError("This request identifier was already used for a different game level.")
        except ValueError as exc:
            raise ValidationError({"client_session_id": str(exc)}) from exc
        return Response(GameSessionSerializer(session).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class GameSessionCompleteView(APIView):
    permission_classes = (permissions.IsAuthenticated, IsVerifiedGuardian)
    throttle_classes = (CompletionThrottle,)

    def post(self, request, session_id):
        data = GameCompleteSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        session = get_object_or_404(GameSession.objects.select_related("child", "game"), pk=session_id, child__guardian=request.user, child__is_active=True)
        try:
            session, created = complete_game_session(session, **data.validated_data)
        except ValueError as exc:
            raise ValidationError({"detail": str(exc)}) from exc
        return Response({"session": GameSessionSerializer(session).data, "created": created, "xp_balance": session.child.reward_transactions.aggregate(total=Sum("amount"))["total"] or 0})


class GameLevelCompleteView(APIView):
    """Idempotent complete-level endpoint for clients that submit on completion."""
    permission_classes = (permissions.IsAuthenticated, IsVerifiedGuardian)
    throttle_classes = (CompletionThrottle,)

    def post(self, request):
        data = GameLevelCompleteSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        values = data.validated_data
        child = owned_child(request, values.pop("child_id"))
        game_slug = values.pop("game")
        score = values.pop("score")
        rounds_completed = values.pop("rounds_completed")
        game = get_object_or_404(Game, slug=game_slug, is_active=True)
        with transaction.atomic():
            try:
                claim_client_session(
                    child, values["client_session_id"], ClientSessionClaim.ActivityType.GAME,
                    f"{game.slug}:{values['level']}",
                )
            except ValueError as exc:
                raise ValidationError({"client_session_id": str(exc)}) from exc
            session, created = GameSession.objects.get_or_create(
                child=child,
                client_session_id=values["client_session_id"],
                defaults={"game": game, "level": values["level"]},
            )
            if session.game_id != game.pk or session.level != values["level"]:
                raise ValidationError({"client_session_id": "This request identifier was already used for a different game level."})
            try:
                session, awarded = complete_game_session(session, score=score, rounds_completed=rounds_completed)
            except ValueError as exc:
                raise ValidationError({"detail": str(exc)}) from exc
        return Response({
            "session": GameSessionSerializer(session).data,
            "created": awarded,
            "xp_balance": child.reward_transactions.aggregate(total=Sum("amount"))["total"] or 0,
        })


class LearningCompleteView(APIView):
    permission_classes = (permissions.IsAuthenticated, IsVerifiedGuardian)
    throttle_classes = (CompletionThrottle,)

    def post(self, request):
        data = LearningCompleteSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        values = data.validated_data
        child = owned_child(request, values.pop("child_id"))
        try:
            event, created = complete_english_activity(child, **values)
        except ValueError as exc:
            raise ValidationError({"detail": str(exc)}) from exc
        return Response({"session": LearningSessionSerializer(event).data, "created": created})


class TypingCompleteView(APIView):
    permission_classes = (permissions.IsAuthenticated, IsVerifiedGuardian)
    throttle_classes = (TypingThrottle,)

    def post(self, request):
        data = TypingCompleteSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        values = data.validated_data
        child = owned_child(request, values.pop("child_id"))
        try:
            event, created = complete_typing_activity(child, **values)
        except ValueError as exc:
            raise ValidationError({"detail": str(exc)}) from exc
        return Response({"session": LearningSessionSerializer(event).data, "created": created})


class ChildSummaryView(APIView):
    permission_classes = (permissions.IsAuthenticated, IsVerifiedGuardian)

    def get(self, request, child_id):
        child = owned_child(request, child_id)
        transactions = XPTransaction.objects.filter(child=child)
        streak = getattr(child, "daily_streak", None)
        return Response({
            "child_id": child.pk,
            "xp": transactions.aggregate(total=Sum("amount"))["total"] or 0,
            "stars": transactions.aggregate(total=Sum("stars"))["total"] or 0,
            "streak": DailyStreakSerializer(streak).data if streak else {"current_days": 0, "best_days": 0, "last_activity_date": None},
            "achievements": AchievementSerializer(child.achievements.select_related("achievement"), many=True).data,
            "recent_rewards": RewardTransactionSerializer(transactions[:50], many=True).data,
            "recent_games": GameSessionSerializer(child.game_sessions.select_related("game")[:20], many=True).data,
            "recent_learning": LearningSessionSerializer(child.learning_sessions[:20], many=True).data,
        })


class ChildRewardsView(generics.ListAPIView):
    permission_classes = (permissions.IsAuthenticated, IsVerifiedGuardian)
    serializer_class = RewardTransactionSerializer

    def get_queryset(self):
        child = owned_child(self.request, self.kwargs["child_id"])
        return XPTransaction.objects.filter(child=child)
