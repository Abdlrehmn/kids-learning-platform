"use client";

import { memo } from "react";
import { formatTime, type PracticeMode } from "./practiceContent";
import { useTypingMetrics, type TypingMetricsInput } from "./useTypingSession";

type CompletionPanelProps = TypingMetricsInput & {
  prompt: string;
  mode: PracticeMode;
  stars: number;
  xp: number;
  words: number;
  rounds: number;
  onRetry: () => void;
  onNext: () => void;
};

/**
 * The "you finished it" panel. It shows the same measured numbers as before
 * plus the rewards that were actually earned in this round.
 */
function CompletionPanel({
  prompt,
  mode,
  stars,
  xp,
  words,
  rounds,
  attemptCount,
  correctCharacters,
  startTime,
  completedAt,
  onRetry,
  onNext,
}: CompletionPanelProps) {
  const { elapsedSeconds, wordsPerMinute, accuracy } = useTypingMetrics({
    startTime,
    completedAt,
    attemptCount,
    correctCharacters,
  });

  return (
    <div role="status" aria-live="polite" className="typing-complete-panel">
      <div className="typing-complete-panel__head">
        <p className="typing-complete-panel__kicker">Practice complete</p>
        <h2 className="typing-complete-panel__title">
          Brilliant typing!
          <span className="typing-complete-star" aria-hidden="true">
            ⭐
          </span>
        </h2>
        <p className="typing-complete-panel__finished">
          You finished: <span className="typing-complete-panel__prompt">{prompt}</span>
        </p>
      </div>

      <div className="typing-complete-panel__grid">
        <div className="typing-complete-panel__tile">
          <p>Typing speed</p>
          <strong>
            {wordsPerMinute} <span>WPM</span>
          </strong>
          <small>All characters typed ÷ 5 ÷ elapsed minutes</small>
        </div>
        <div className="typing-complete-panel__tile">
          <p>Accuracy</p>
          <strong>
            {accuracy}%<span> correct</span>
          </strong>
          <small>Correct characters compared with all keys typed</small>
        </div>
      </div>

      <div className="typing-complete-panel__rewards">
        <span className="typing-complete-panel__reward">
          <b aria-hidden="true">★</b> {stars} stars
        </span>
        <span className="typing-complete-panel__reward">
          <b aria-hidden="true">✦</b> {xp} XP
        </span>
        <span className="typing-complete-panel__reward">
          <b aria-hidden="true">✔</b> {words} words
        </span>
        <span className="typing-complete-panel__reward">
          <b aria-hidden="true">🏁</b> {rounds} rounds
        </span>
      </div>

      <p className="typing-complete-panel__meta">
        Time: {formatTime(elapsedSeconds)} · Keys typed: {attemptCount}
      </p>

      <div className="typing-complete-panel__actions">
        <button type="button" onClick={onRetry} className="typing-complete-panel__button typing-complete-panel__button--primary">
          Try again
        </button>
        <button type="button" onClick={onNext} className="typing-complete-panel__button">
          {mode === "sentences" ? "Choose another sentence" : "Next practice"} →
        </button>
      </div>
    </div>
  );
}

export default memo(CompletionPanel);
