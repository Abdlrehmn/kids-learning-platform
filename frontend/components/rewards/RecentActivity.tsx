"use client";

import { activityDate, activityTitle, type RewardTransaction } from "@/lib/rewards";

function RowIcon({ reason }: { reason: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (reason) {
    case "game_level":
      return (
        <svg {...common}>
          <path d="M9 6h6a5.5 5.5 0 0 1 5.4 4.4l.8 4.2a3 3 0 0 1-4.8 2.9L14 15.9a7 7 0 0 0-4 0l-2.4 1.6a3 3 0 0 1-4.8-2.9l.8-4.2A5.5 5.5 0 0 1 9 6Z" />
        </svg>
      );
    case "english_completion":
      return (
        <svg {...common}>
          <path d="M6 19h13a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Zm0-3h13" />
        </svg>
      );
    case "typing_completion":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="13" rx="2.5" />
          <path d="M6 9h2m3 0h2m3 0h2M6 12.5h2m3 0h2m3 0h2m-11 3.5h11" />
        </svg>
      );
    case "daily_bonus":
      return (
        <svg {...common}>
          <path d="M12 3.5 13.7 7l3.8.6-2.7 2.7.6 3.8L12 12.3l-3.4 1.8.6-3.8L6.5 7.6 10.3 7Z" />
          <path d="M12 17v3.5m-4 0h8" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l2.5 2.5" />
        </svg>
      );
  }
}

/**
 * The child's latest ledger entries. These are real XPTransaction records —
 * the same ledger the balances are summed from.
 */
export default function RecentActivity({ transactions }: { transactions: RewardTransaction[] }) {
  if (transactions.length === 0) {
    return (
      <div className="rewards-empty">
        <strong>The reward story starts with the first step!</strong>
        Finish a typing round, an English activity or a game level and the
        trail of XP and stars will appear right here.
      </div>
    );
  }

  return (
    <ul className="rewards-activity-list">
      {transactions.slice(0, 12).map((transaction, index) => (
        <li
          key={transaction.id}
          className={`rewards-activity rewards-activity--${transaction.reason} rewards-enter`}
          style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
        >
          <span className="rewards-activity__dot" aria-hidden="true"><RowIcon reason={transaction.reason} /></span>
          <div className="rewards-activity__copy">
            <p className="rewards-activity__title">{activityTitle(transaction)}</p>
            <p className="rewards-activity__date">{activityDate(transaction.created_at)}</p>
          </div>
          <div className="rewards-activity__gains">
            {transaction.amount !== 0 && (
              <span className="rewards-activity__gain rewards-activity__gain--xp">
                {transaction.amount > 0 ? "+" : ""}{transaction.amount} XP
              </span>
            )}
            {transaction.stars > 0 && (
              <span className="rewards-activity__gain rewards-activity__gain--stars">
                <span aria-hidden="true">★</span> {transaction.stars}
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
