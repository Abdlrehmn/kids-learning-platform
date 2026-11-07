from django.urls import path

from .views import (
    ChildRewardsView, ChildSummaryView, GameCatalogView,
    GameLevelCompleteView, GameSessionCompleteView, GameSessionStartView,
    LearningCompleteView, TypingCompleteView,
)

urlpatterns = [
    path("games/", GameCatalogView.as_view(), name="game-catalog"),
    path("game-sessions/", GameSessionStartView.as_view(), name="game-session-start"),
    path("game-sessions/complete/", GameLevelCompleteView.as_view(), name="game-level-complete"),
    path("game-sessions/<uuid:session_id>/complete/", GameSessionCompleteView.as_view(), name="game-session-complete"),
    path("learning/english/complete/", LearningCompleteView.as_view(), name="english-complete"),
    path("learning/typing/complete/", TypingCompleteView.as_view(), name="typing-complete"),
    path("children/<int:child_id>/summary/", ChildSummaryView.as_view(), name="child-summary"),
    path("children/<int:child_id>/rewards/", ChildRewardsView.as_view(), name="child-rewards"),
]
