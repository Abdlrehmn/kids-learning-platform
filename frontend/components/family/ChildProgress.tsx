"use client";

import { childLevel, ageBandLabel } from "@/lib/family";
import { activityDate } from "@/lib/rewards";
import { ChildAvatar } from "@/components/family/ChildAvatarMap";
import type { ChildProfile } from "@/lib/api";
import type { RewardSummary } from "@/lib/rewards";

type ChildProgressProps = {
  child: ChildProfile;
  summary: RewardSummary | null;
};

/**
 * Parent-friendly progress overview for one child. Every number comes from
 * that child's `children/<id>/summary/` payload — nothing is invented here.
 */
export default function ChildProgress({ child, summary }: ChildProgressProps) {
  if (!summary) {
    return (
      <p className="family-empty">
        <strong>Progress for {child.nickname} can&apos;t load right now.</strong>
        The dashboard couldn&apos;t read this child&apos;s reward ledger. Try again soon.
      </p>
    );
  }

  const level = childLevel(summary.xp);
  const { english_completed: english, typing_completed: typing, games_completed: games } = summary.learning_progress;
  const earned = summary.achievement_progress.filter((badge) => badge.earned_at);
  const quiet = summary.xp === 0 && english === 0 && typing === 0 && games === 0;

  const badgeHints: Record<string, string> = {
    "first-game": "First game win",
    "five-games": "5 game levels",
    "first-activity": "First activity",
    "ten-activities": "10 activities",
    "hundred-xp": "100 XP milestone",
  };

  return (
    <div>
      <div className="family-progress-head">
        <ChildAvatar avatarId={child.avatar_id} size={46} />
        <div>
          <h3>{child.nickname}&apos;s learning journey</h3>
          <small>
            {ageBandLabel(child.age_band)}
            {summary.streak.last_activity_date ? ` · last activity ${activityDate(summary.streak.last_activity_date)}` : " · no activities yet"}
          </small>
        </div>
      </div>

      <div className="family-progress-grid">
        <article className="family-progress-tile family-progress-tile--xp">
          <small>Total XP</small>
          <b>{summary.xp}</b>
          <em>Level {level.level} of 40{level.maxed ? " · top reached" : ` · ${level.xpForNextLevel - level.xpIntoLevel} XP to level ${level.level + 1}`}</em>
        </article>
        <article className="family-progress-tile family-progress-tile--english">
          <small>English activities</small>
          <b>{english}</b>
          <em>Word quests and reading games</em>
        </article>
        <article className="family-progress-tile family-progress-tile--typing">
          <small>Typing rounds</small>
          <b>{typing}</b>
          <em>Keyboard adventures finished</em>
        </article>
        <article className="family-progress-tile family-progress-tile--games">
          <small>Game levels</small>
          <b>{games}</b>
          <em>Playful practice levels won</em>
        </article>
      </div>

      <div className="family-progress-side">
        <span className="family-progress-chip">★ {summary.stars} stars collected</span>
        <span className="family-progress-chip family-progress-chip--blue">🔥 {summary.streak.current_days}-day streak · best {summary.streak.best_days}</span>
        {level.maxed && <span className="family-progress-chip family-progress-chip--gold">🏁 Level {level.level} mastered</span>}
      </div>

      <div className="family-progress-badges">
        <h4>Recent badges</h4>
        {quiet ? (
          <p className="family-empty">
            <strong>The journey starts with the first activity.</strong>
            English adventures, typing rounds and games each add XP here once they happen.
          </p>
        ) : earned.length === 0 ? (
          <p className="family-empty">
            <strong>Badges are waiting to be earned.</strong>
            Playing games, finishing activities and collecting XP unlock them automatically.
          </p>
        ) : (
          <ul className="family-badge-row">
            {earned.slice(-3).reverse().map((badge) => (
              <li key={badge.slug} className="family-badge-chip">
                <span aria-hidden="true">🏅</span>
                <span>{badge.title}</span>
                <small>{badgeHints[badge.slug] ?? `${badge.threshold} to unlock`}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
