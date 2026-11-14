/**
 * Family dashboard helpers.
 *
 * Everything shown on the Family page comes from the Django REST APIs
 * (`auth/me/`, `auth/children/`, `children/<id>/summary/`). Helpers only
 * rearrange real backend data into friendly views.
 */

import type { ChildProfile } from "./api";
import { rewardLevelInfo } from "./rewardLevels";
import { REASON_LABELS, type RewardSummary, type RewardTransaction } from "./rewards";

/** Avatars the backend accepts for `avatar_id` (see ChildProfileSerializer). */
export const AVATARS = {
  default: { label: "Star", glyph: "✦" },
  fox: { label: "Fox", glyph: "🦊" },
  bear: { label: "Bear", glyph: "🐻" },
  owl: { label: "Owl", glyph: "🦉" },
  cat: { label: "Cat", glyph: "🐱" },
  rabbit: { label: "Rabbit", glyph: "🐰" },
  turtle: { label: "Turtle", glyph: "🐢" },
} as const;

export type AvatarId = keyof typeof AVATARS;

export function avatarOf(avatarId: string): { label: string; glyph: string } {
  if (
    avatarId &&
    Object.prototype.hasOwnProperty.call(AVATARS, avatarId)
  ) {
    return AVATARS[avatarId as AvatarId];
  }
  return AVATARS.default;
}

/** Pastel tile colors shared by all avatar spots. */
export const AVATAR_TILES = ["#fff4e5", "#e8f6f1", "#eaf3ff", "#fdeff0", "#f3eefc", "#eefaf0", "#fff9db"] as const;

/** Age groups supported by the backend `age_band` field. */
export const AGE_BANDS = [
  { id: "4-6", label: "4–6", hint: "Little explorers" },
  { id: "7-9", label: "7–9", hint: "Curious readers" },
  { id: "10-12", label: "10–12", hint: "Young pros" },
] as const;

export function ageBandLabel(ageBand: string): string {
  const match = AGE_BANDS.find((band) => band.id === ageBand);
  return match ? `${match.label} years` : "Age not set";
}

/** Guardian display name: a friendly first name or the email prefix. */
export function guardianName(email: string, firstName: string): string {
  if (firstName.trim()) return firstName.trim();
  const local = email.split("@")[0];
  return local ? `${local}` : "Guardian";
}

export type FamilyTimelineEntry = {
  key: string;
  date: string;
  child: string;
  title: string;
  kind: "game_level" | "english_completion" | "typing_completion" | "daily_bonus" | "achievement" | "adjustment";
  xp: number;
  stars: number;
};

function prettyName(slug: string): string {
  const words = slug.split("-").filter(Boolean);
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ") || slug;
}

function timelineRowFromTransaction(
  childName: string,
  transaction: RewardTransaction,
): FamilyTimelineEntry | null {
  const reason = transaction.reason in REASON_LABELS ? transaction.reason : "adjustment";
  let title: string;
  if (reason === "game_level") {
    const game = typeof transaction.metadata?.game === "string" ? transaction.metadata.game : null;
    const level = typeof transaction.metadata?.level === "number" ? transaction.metadata.level : null;
    title = game
      ? level
        ? `${childName} beat level ${level} of ${prettyName(game)}`
        : `${childName} finished a level of ${prettyName(game)}`
      : `${childName} ${REASON_LABELS[reason].toLowerCase()}`;
  } else {
    title = `${childName} ${REASON_LABELS[reason].toLowerCase()}`;
  }
  return {
    key: `tx-${transaction.id}`,
    date: transaction.created_at,
    child: childName,
    title,
    kind: reason as FamilyTimelineEntry["kind"],
    xp: transaction.amount,
    stars: transaction.stars,
  };
}

function timelineRowFromAchievement(
  childName: string,
  entry: ChildAchievementLike,
): FamilyTimelineEntry | null {
  return {
    key: `ach-${entry.slug}-${entry.earned_at}`,
    date: entry.earned_at,
    child: childName,
    title: `${childName} unlocked the "${entry.title}" badge`,
    kind: "achievement",
    xp: 0,
    stars: 0,
  };
}

type ChildAchievementLike = {
  slug: string;
  title: string;
  earned_at: string;
};

/** Merge each child's real ledger entries + earned badges into one timeline. */
export function familyTimeline(
  children: ChildProfile[],
  summaries: Record<string, RewardSummary | null>,
  limit = 12,
): FamilyTimelineEntry[] {
  const rows: FamilyTimelineEntry[] = [];
  for (const child of children) {
    const summary = summaries[String(child.id)];
    if (!summary) continue;
    for (const transaction of summary.recent_rewards) {
      const row = timelineRowFromTransaction(child.nickname, transaction);
      if (row) rows.push(row);
    }
    for (const earned of summary.achievements) {
      if (!earned.earned_at) continue;
      rows.push(timelineRowFromAchievement(child.nickname, earned) as FamilyTimelineEntry);
    }
  }
  rows.sort((left, right) => Date.parse(right.date) - Date.parse(left.date));
  return rows.slice(0, limit);
}

/** Level view for a child from their real XP balance. */
export function childLevel(xp: number) {
  return rewardLevelInfo(xp);
}

export function sortChildrenForDashboard(children: ChildProfile[]): ChildProfile[] {
  return [...children].sort((left, right) => left.id - right.id);
}
