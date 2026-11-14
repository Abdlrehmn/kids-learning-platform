"use client";

import type { ReactNode } from "react";

/**
 * Daily challenges — UI sketch only.
 *
 * KiddoWorld does not yet track per-day goals in the backend, so nothing
 * here is awarded and every progress bar starts empty. The panel is clearly
 * marked "Coming soon" so children and parents can tell it is not live yet.
 */

const CHALLENGES = [
  {
    id: "english",
    title: "Complete one English activity",
    reward: "+10 XP",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 19h13a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Zm0-3h13" />
        <path d="m9.5 8.5 2 7 1.6-4.4 1.6 4.4 2-7" />
      </svg>
    ),
  } satisfies Challenge,
  {
    id: "game",
    title: "Play one learning game level",
    reward: "+25 XP",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 6h6a5.5 5.5 0 0 1 5.4 4.4l.8 4.2a3 3 0 0 1-4.8 2.9L14 15.9a7 7 0 0 0-4 0l-2.4 1.6a3 3 0 0 1-4.8-2.9l.8-4.2A5.5 5.5 0 0 1 9 6Z" />
        <path d="M8.5 10.5v2.5M7.2 11.7h2.6M15.5 11h.1M17.5 13h.1" />
      </svg>
    ),
  } satisfies Challenge,
  {
    id: "typing",
    title: "Complete one typing round",
    reward: "+30 XP",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="5" width="18" height="13" rx="2.5" />
        <path d="M6 9h2m3 0h2m3 0h2M6 12.5h2m3 0h2m3 0h2m-11 3.5h11" />
      </svg>
    ),
  } satisfies Challenge,
] as const;

type Challenge = {
  id: string;
  title: string;
  reward: string;
  icon: ReactNode;
};

export default function DailyChallenges() {
  return (
    <section className="rewards-panel" aria-labelledby="rewards-challenges-title">
      <div className="rewards-section-head" style={{ marginBottom: 4 }}>
        <div>
          <h2 id="rewards-challenges-title" className="rewards-section-title">Today&apos;s challenges</h2>
        </div>
        <span className="rewards-soon-pill">✦ Coming soon</span>
      </div>

      {CHALLENGES.map((challenge) => (
        <div key={challenge.id} className="rewards-challenge">
          <span className="rewards-challenge__icon" aria-hidden="true">{challenge.icon}</span>
          <div className="rewards-challenge__copy">
            <p className="rewards-challenge__title">{challenge.title}</p>
            <div className="rewards-challenge__track">
              <span className="rewards-challenge__bar" aria-hidden="true"><i style={{ width: 0 }} /></span>
              <small>unlocks soon</small>
            </div>
          </div>
          <span className="rewards-challenge__reward" aria-label="planned reward">{challenge.reward}</span>
        </div>
      ))}

      <p className="rewards-note">
        The challenge shelf is being built. When it arrives, each goal will be <strong>tracked by
        KiddoWorld</strong> and stars or XP will be added only after a real activity finishes — now
        shown just as a preview with zero rewards.
      </p>
    </section>
  );
}
