"use client";

import { ChildAvatar } from "@/components/family/ChildAvatarMap";
import type { ChildProfile } from "@/lib/api";
import { ageBandLabel, childLevel } from "@/lib/family";
import type { RewardSummary } from "@/lib/rewards";

type ChildCardProps = {
  child: ChildProfile;
  summary: RewardSummary | null;
  isCurrent: boolean;
  onView: () => void;
  onEdit: () => void;
  onSwitch: () => void;
  onRemove: () => void;
};

/** One child's profile card. Numbers come from that child's reward ledger. */
export default function ChildCard({ child, summary, isCurrent, onView, onEdit, onSwitch, onRemove }: ChildCardProps) {
  const xp = summary?.xp ?? null;
  const stars = summary?.stars ?? null;
  const streak = summary?.streak.current_days ?? null;
  const level = xp === null ? null : childLevel(xp);

  return (
    <article className={`family-child-card family-enter${isCurrent ? " is-current" : ""}`} aria-label={`${child.nickname}'s profile`}>
      <div className="family-child-card__top">
        <ChildAvatar avatarId={child.avatar_id} />
        <div className="family-child-card__name">
          <h3>{child.nickname}</h3>
          <small>{ageBandLabel(child.age_band)}</small>
        </div>
        {level && (
          <span className="family-child-card__level" aria-label={`Level ${level.level}`}>
            <span aria-hidden="true">⚑</span> Lv {level.level}
          </span>
        )}
      </div>

      <div className="family-child-stats">
        <span><b>{xp === null ? "—" : xp}</b>XP</span>
        <span><b>{stars === null ? "—" : stars}</b>Stars</span>
        <span><b>{streak === null ? "—" : streak}</b>Day streak</span>
      </div>

      {level && (
        <div>
          <div
            className="family-child-bar"
            role="progressbar"
            aria-label={`${child.nickname} level progress`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(level.progress * 100)}
          >
            <i style={{ width: `${Math.max(4, Math.round(level.progress * 100))}%` }} />
          </div>
          <p className="family-child-bar-text">
            {level.maxed
              ? "Top level reached!"
              : `${level.xpIntoLevel} of ${level.xpForNextLevel} XP into Level ${level.level}`}
          </p>
        </div>
      )}

      <div className="family-child-actions">
        <button type="button" className="family-mini-btn" onClick={onView} aria-pressed={isCurrent}>
          <span aria-hidden="true">✦</span> {isCurrent ? "Showing progress" : "View progress"}
        </button>
        <button type="button" className="family-mini-btn" onClick={onEdit}>
          <span aria-hidden="true">✎</span> Edit profile
        </button>
        <button type="button" className="family-mini-btn" onClick={onSwitch} disabled={isCurrent}>
          <span aria-hidden="true">⇄</span> {isCurrent ? "Playing now" : "Switch profile"}
        </button>
        <button type="button" className="family-mini-btn family-mini-btn--danger" onClick={onRemove}>
          <span aria-hidden="true">✕</span> Remove
        </button>
      </div>
    </article>
  );
}
