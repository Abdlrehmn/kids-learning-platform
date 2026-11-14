"use client";

import type { ReactNode } from "react";

export type RewardStat = {
  key: "xp" | "stars" | "level" | "streak";
  value: string;
  suffix?: string;
  label: string;
  extra: string;
};

function StatIcon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

export const REWARD_STAT_ICONS: Record<RewardStat["key"], ReactNode> = {
  xp: (
    <StatIcon>
      <path d="M12 3v5m0 8v5m9-9h-5m-8 0H3m14.8-6.8-3 3m-6.6 6.6-3 3m12.6 0-3-3M8.2 8.2l-3-3" />
      <circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none" />
    </StatIcon>
  ),
  stars: (
    <StatIcon>
      <path d="m12 3.5 2.5 5.1 5.6.8-4 4.1 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4-4.1 5.6-.8Z" fill="currentColor" stroke="none" />
    </StatIcon>
  ),
  level: (
    <StatIcon>
      <path d="M8 21V4.8C8 3.8 8.8 3 9.8 3H18v7H9.2" />
      <path d="M5.5 21h5" />
    </StatIcon>
  ),
  streak: (
    <StatIcon>
      <path d="M12 2.5c1.5 3.5-1 5-1 7a2.5 2.5 0 0 0 5 .2c1.8 1.6 3 3.7 3 5.8a7 7 0 0 1-14 0c0-2.6 1.3-4.7 3.5-6.2C10 8.4 10.2 5.5 12 2.5Z" />
      <path d="M12 18.5a2 2 0 0 0 2-2c0-1.4-2-3-2-3s-2 1.6-2 3a2 2 0 0 0 2 2Z" fill="currentColor" stroke="none" />
    </StatIcon>
  ),
};

/** The four reward summary tiles. Values come straight from the backend. */
export default function RewardsSummary({ stats }: { stats: RewardStat[] }) {
  return (
    <div className="rewards-stats">
      {stats.map((stat, index) => (
        <article key={stat.key} className={`rewards-stat-card rewards-stat-card--${stat.key} rewards-enter`} style={{ animationDelay: `${index * 70}ms` }}>
          <span className="rewards-stat-icon" aria-hidden="true">{REWARD_STAT_ICONS[stat.key]}</span>
          <p className="rewards-stat-value">
            {stat.value}
            {stat.suffix && <small>{stat.suffix}</small>}
          </p>
          <p className="rewards-stat-label">
            <span className="rewards-stat-name">{stat.label}</span>
            <span className="rewards-stat-extra">{stat.extra}</span>
          </p>
        </article>
      ))}
    </div>
  );
}
