"use client";

import { memo, type CSSProperties } from "react";
import { REWARD_RULES } from "./practiceContent";

type RewardShelfProps = {
  stars: number;
  xp: number;
  words: number;
  rounds: number;
  unit: string;
};

const MAX_VISIBLE_STARS = 12;

/**
 * The trophy shelf.
 *
 * Every number here is counted from real typing: one star per word that was
 * typed perfectly, a bonus for every finished round, and XP from the same two
 * events. The rule is written under the shelf so nothing looks invented.
 */
function RewardShelf({ stars, xp, words, rounds, unit }: RewardShelfProps) {
  const visibleStars = Math.min(stars, MAX_VISIBLE_STARS);
  const extraStars = stars - visibleStars;

  return (
    <section className="typing-rewards" aria-label="Your rewards">
      <div className="typing-rewards__head">
        <h2 className="typing-rewards__title">
          <span aria-hidden="true">🏆</span> Your trophy shelf
        </h2>
        <span className="typing-rewards__xp" key={xp}>
          {xp} XP
        </span>
      </div>

      <div className="typing-reward-stars" aria-hidden="true">
        {Array.from({ length: visibleStars }, (_, index) => (
          <span key={index} className="typing-reward-star" style={{ "--star-delay": `${index * 70}ms` } as CSSProperties}>
            ★
          </span>
        ))}
        {visibleStars === 0 && <span className="typing-reward-star typing-reward-star--empty">☆</span>}
        {extraStars > 0 && <span className="typing-reward-star typing-reward-star--more">+{extraStars}</span>}
      </div>

      <dl className="typing-reward-stats">
        <div>
          <dt>Stars</dt>
          <dd>{stars}</dd>
        </div>
        <div>
          <dt>Words finished</dt>
          <dd>{words}</dd>
        </div>
        <div>
          <dt>Rounds finished</dt>
          <dd>{rounds}</dd>
        </div>
      </dl>

      <p className="typing-rewards__note">
        {stars === 0
          ? `Finish a ${unit} perfectly to win your first star.`
          : `1 star per ${unit} you finish + ${REWARD_RULES.starsPerRound} for every finished round. XP = ${REWARD_RULES.xpPerWord} per ${unit}, ${REWARD_RULES.xpPerRound} per round.`}
      </p>
    </section>
  );
}

export default memo(RewardShelf);
