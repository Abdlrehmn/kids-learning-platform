"use client";

import { rewardLevelInfo } from "@/lib/rewardLevels";

type LevelProgressProps = {
  totalXp: number;
};

/** encouragements keyed by how full the current level band is */
function cheerMessage(info: ReturnType<typeof rewardLevelInfo>): string {
  if (info.maxed) return "Incredible! You reached the top level. Keep shining!";
  if (info.progress === 0) return `Level ${info.level + 1} is waiting — every activity counts!`;
  if (info.progress < 0.5) return `Great start! Level ${info.level + 1} is on its way!`;
  if (info.progress < 0.9) return `Amazing! You're getting closer to Level ${info.level + 1}!`;
  return `So close! Level ${info.level + 1} is just around the corner!`;
}

/**
 * Level progress card. The level thresholds are the documented XP path in
 * `lib/rewardLevels.ts`; XP comes from the backend ledger.
 */
export default function LevelProgress({ totalXp }: LevelProgressProps) {
  const info = rewardLevelInfo(totalXp);
  const percent = Math.round(info.progress * 100);

  return (
    <section className="rewards-panel" aria-labelledby="rewards-level-title">
      <div className="rewards-level-grid">
        <span className="rewards-level-mark" aria-hidden="true">
          <b>{info.level}</b>
          <span>LEVEL</span>
        </span>
        <div>
          <h2 id="rewards-level-title" className="rewards-section-title">Level progress</h2>
          <p className="rewards-level-numbers">
            <strong>{info.totalXp} XP</strong>
            <span>·</span>
            {info.maxed ? (
              <span>top level reached</span>
            ) : (
              <span>
                next level at <strong>{info.totalXpForNextLevel} XP</strong>
              </span>
            )}
          </p>
          <p className="rewards-level-cheer" role="status">{cheerMessage(info)}</p>
          <div
            className="rewards-level-bar"
            role="progressbar"
            aria-labelledby="rewards-level-title"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
          >
            <span className="rewards-level-bar__fill" style={{ width: `${Math.max(4, percent)}%` }} />
          </div>
          <p className="rewards-level-bar__label">
            {info.maxed
              ? "You finished the whole level path — wow!"
              : `${info.xpIntoLevel} of ${info.xpForNextLevel} XP into Level ${info.level}`}
          </p>
        </div>
      </div>
    </section>
  );
}
