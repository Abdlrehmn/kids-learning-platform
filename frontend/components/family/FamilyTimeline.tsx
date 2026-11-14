"use client";

import { type FamilyTimelineEntry, familyTimeline } from "@/lib/family";
import type { ChildProfile } from "@/lib/api";
import { activityDate, type RewardSummary } from "@/lib/rewards";

type FamilyTimelineProps = {
  roster: ChildProfile[];
  summaries: Record<string, RewardSummary | null>;
};

/** Simple recent-activity timeline merged from each child's real ledger. */
export default function FamilyTimeline({ roster, summaries }: FamilyTimelineProps) {
  const entries = familyTimeline(roster, summaries, 10);

  if (entries.length === 0) {
    return (
      <p className="family-empty">
        <strong>No family activity yet.</strong>
        When your children finish games, English adventures or typing rounds, the latest moments appear here.
      </p>
    );
  }

  const icons: Record<FamilyTimelineEntry["kind"], string> = {
    game_level: "🎮",
    english_completion: "📖",
    typing_completion: "⌨️",
    daily_bonus: "☀️",
    achievement: "🏅",
    adjustment: "✦",
  };

  return (
    <ol className="family-timeline">
      {entries.map((entry) => (
        <li key={entry.key} className={`family-timeline-entry family-timeline-entry--${entry.kind}`}>
          <span aria-hidden="true" style={{ fontSize: 18 }}>{icons[entry.kind]}</span>
          <div className="family-timeline-entry__copy">
            <p className="family-timeline-entry__title">{entry.title}</p>
            <p className="family-timeline-entry__date">{activityDate(entry.date)}</p>
          </div>
          <div className="family-timeline-entry__gains">
            {entry.kind === "achievement" ? (
              <span className="family-gain family-gain--badge">Badge unlocked</span>
            ) : (
              <>
                {entry.xp !== 0 && <span className="family-gain family-gain--xp">+{entry.xp} XP</span>}
                {entry.stars !== 0 && <span className="family-gain family-gain--stars">+{entry.stars} ★</span>}
              </>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
