/**
 * Types and helpers for the Kids Rewards Center.
 *
 * Everything displayed there comes from `children/<id>/summary/`, which is
 * computed by the backend from the reward ledger, achievements, sessions and
 * the daily streak. The rewards page never invents its own numbers.
 */

import { api } from "./api";

export type RewardReason =
  | "game_level"
  | "english_completion"
  | "typing_completion"
  | "daily_bonus"
  | "adjustment";

export type RewardTransaction = {
  id: number;
  amount: number;
  stars: number;
  reason: RewardReason;
  created_at: string;
  metadata: Record<string, unknown> | null;
};

export type ChildAchievementInfo = {
  slug: string;
  title: string;
  description: string;
  earned_at: string;
  progress_at_award: number;
};

export type AchievementProgress = {
  slug: string;
  title: string;
  description: string;
  icon_id: string;
  criterion: string;
  threshold: number;
  earned_at: string | null;
  progress: number;
};

export type RewardSummary = {
  child_id: number;
  xp: number;
  stars: number;
  streak: { current_days: number; best_days: number; last_activity_date: string | null };
  achievements: ChildAchievementInfo[];
  learning_progress: {
    games_completed: number;
    activities_completed: number;
    english_completed: number;
    typing_completed: number;
  };
  achievement_progress: AchievementProgress[];
  recent_rewards: RewardTransaction[];
  recent_games: Array<Record<string, unknown>>;
  recent_learning: Array<Record<string, unknown>>;
};

/** Friendly titles for ledger entries, shown in Recent activity. */
export const REASON_LABELS: Record<RewardReason, string> = {
  game_level: "Finished a game level",
  english_completion: "Completed an English activity",
  typing_completion: "Completed a typing round",
  daily_bonus: "Daily learning bonus",
  adjustment: "Learning adjustment",
};

/** Prettify a game slug like "word-match" for the activity list. */
function prettyGameTitle(slug: unknown): string | null {
  if (typeof slug !== "string" || !slug.trim()) return null;
  const words = slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1));
  return words.length ? words.join(" ") : null;
}

/** Small friendly title for one ledger entry, enriched with its metadata. */
export function activityTitle(transaction: RewardTransaction): string {
  const reason = transaction.reason in REASON_LABELS ? transaction.reason : "adjustment";
  const game = prettyGameTitle(transaction.metadata?.game);
  if (reason === "game_level" && game) {
    const level = typeof transaction.metadata?.level === "number" ? transaction.metadata.level : null;
    return level ? `Beat level ${level} of ${game}` : `Finished a level of ${game}`;
  }
  return REASON_LABELS[reason];
}

/** Short relative-ish date for the activity list ("Today", "Yesterday", "3 Nov"). */
export function activityDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfThatDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const dayLength = 24 * 60 * 60 * 1000;
  const daysAgo = Math.round((startOfToday - startOfThatDay) / dayLength);
  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

/** Load the reward summary for the selected child, backend-checked. */
export function fetchRewardSummary(childId: number): Promise<RewardSummary> {
  return api<RewardSummary>(`children/${childId}/summary/`);
}
