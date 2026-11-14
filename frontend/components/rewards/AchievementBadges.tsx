"use client";

import type { AchievementProgress } from "@/lib/rewards";

/** Small medal icons drawn to match the seeded icon ids. */
function BadgeIcon({ iconId }: { iconId: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (iconId) {
    case "trophy":
      return (
        <svg {...common}>
          <path d="M8 4h8v6a4 4 0 0 1-8 0Zm-2.5 0H3v2a3 3 0 0 0 3 3m14.5-5H19v2a3 3 0 0 1-3 3m-2 3v4m-4 0h8m-10 3h12" />
        </svg>
      );
    case "game":
      return (
        <svg {...common}>
          <path d="M9 6h6a5.5 5.5 0 0 1 5.4 4.4l.8 4.2a3 3 0 0 1-4.8 2.9L14 15.9a7 7 0 0 0-4 0l-2.4 1.6a3 3 0 0 1-4.8-2.9l.8-4.2A5.5 5.5 0 0 1 9 6Z" />
          <path d="M8.5 10.5v2.5M7.2 11.7h2.6M15.5 11h.1M17.5 13h.1" />
        </svg>
      );
    case "star":
      return (
        <svg {...common}>
          <path d="m12 3.5 2.5 5.1 5.6.8-4 4.1 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4-4.1 5.6-.8Z" fill="currentColor" stroke="none" />
        </svg>
      );
    case "lightbulb":
      return (
        <svg {...common}>
          <path d="M9 18h6m-5 3h4M12 3a6 6 0 0 1 3.6 10.8c-.6.5-1 1.2-1 2V16H9.5v-.2c0-.8-.4-1.5-1-2A6 6 0 0 1 12 3Z" />
        </svg>
      );
    case "sparkle":
      return (
        <svg {...common}>
          <path d="M12 4c1.7 4.2 3.8 6.3 8 8-4.2 1.7-6.3 3.8-8 8-1.7-4.2-3.8-6.3-8-8 4.2-1.7 6.3-3.8 8-8Z" fill="currentColor" stroke="none" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="9" r="5.5" />
          <path d="m9.5 13.8-1.8 6 4.3-2.4 4.3 2.4-1.8-6" />
        </svg>
      );
  }
}

function progressLabel(entry: AchievementProgress): string {
  if (entry.earned_at) return "Earned!";
  return `${Math.min(entry.progress, entry.threshold)} of ${entry.threshold}`;
}

/**
 * The badge collection. The catalog, thresholds and each child's earned
 * badges come from the backend summary — nothing here is claimed locally.
 */
export default function AchievementBadges({ entries }: { entries: AchievementProgress[] }) {
  const unlocked = entries.filter((entry) => entry.earned_at).length;

  return (
    <section className="rewards-section" aria-labelledby="rewards-badges-title">
      <div className="rewards-section-head">
        <div>
          <h2 id="rewards-badges-title" className="rewards-section-title">Badge collection</h2>
          <p className="rewards-section-hint">Finish games, activities and typing rounds to earn medals.</p>
        </div>
        <span className="rewards-section-side">{unlocked} of {entries.length} earned</span>
      </div>

      {entries.length === 0 ? (
        <p className="rewards-empty">Badges will appear here as soon as the catalog is ready.</p>
      ) : (
        <div className="rewards-badge-grid">
          {entries.map((entry) => {
            const earned = Boolean(entry.earned_at);
            const ratio = Math.max(0, Math.min(1, entry.threshold > 0 ? entry.progress / entry.threshold : 0));
            return (
              <article
                key={entry.slug}
                className={`rewards-badge${earned ? "" : " rewards-badge--locked"}`}
                aria-label={`${entry.title}${earned ? ", earned" : `, locked, ${progressLabel(entry)}`}`}
              >
                <span className="rewards-badge__medal" aria-hidden="true">
                  <svg className="rewards-badge__ring" viewBox="0 0 42 42" style={earned ? undefined : { display: "none" }}>
                    <circle cx="21" cy="21" r="18" fill="none" stroke="#ffe9ae" strokeWidth="2" />
                  </svg>
                  <BadgeIcon iconId={entry.icon_id} />
                </span>
                <h3 className="rewards-badge__title">{entry.title}</h3>
                <p className="rewards-badge__desc">{entry.description}</p>
                {!earned && entry.threshold > 1 && (
                  <span className="rewards-badge__bar" aria-hidden="true">
                    <i style={{ width: `${Math.round(ratio * 100)}%` }} />
                  </span>
                )}
                <span className="rewards-badge__state">{earned ? "★ Earned!" : `🔒 ${progressLabel(entry)}`}</span>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
