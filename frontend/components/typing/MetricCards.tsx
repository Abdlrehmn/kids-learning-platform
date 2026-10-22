"use client";

import { memo } from "react";
import { formatTime } from "./practiceContent";
import { useTypingMetrics, type TypingMetricsInput } from "./useTypingSession";

type MetricCardsProps = TypingMetricsInput;

const RING_RADIUS = 42;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

type MetricCardProps = {
  title: string;
  hint: string;
  value: string;
  unit?: string;
  ratio: number;
  tone: "speed" | "accuracy" | "time";
  /** Changes only when the value really changes, so the pulse stays calm. */
  pulseKey: string | number;
  empty: boolean;
};

function MetricCard({ title, hint, value, unit, ratio, tone, pulseKey, empty }: MetricCardProps) {
  const safeRatio = Math.max(0, Math.min(1, ratio));
  const arcLength = RING_CIRCUMFERENCE * safeRatio;

  return (
    <div className={`typing-metric-card typing-metric-card--${tone}${empty ? " is-empty" : ""}`}>
      <div className="typing-metric-ring">
        <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
          <circle className="typing-metric-ring__track" cx="50" cy="50" r={RING_RADIUS} />
          <circle
            className="typing-metric-ring__value"
            cx="50"
            cy="50"
            r={RING_RADIUS}
            strokeDasharray={`${arcLength} ${RING_CIRCUMFERENCE}`}
          />
        </svg>
        <span className="typing-metric-ring__readout">
          <span key={pulseKey} className="typing-metric-ring__number">
            {value}
          </span>
          {unit && !empty && <span className="typing-metric-ring__unit">{unit}</span>}
        </span>
      </div>
      <p className="typing-metric-card__title">{title}</p>
      <p className="typing-metric-card__hint">{hint}</p>
    </div>
  );
}

/**
 * Live speed, accuracy and time.
 *
 * The numbers are the real measured values; only the gauge arcs and the small
 * pulse react visually, so nothing on screen is ever made up.
 */
function MetricCards({ startTime, completedAt, attemptCount, correctCharacters }: MetricCardsProps) {
  const { elapsedSeconds, wordsPerMinute, accuracy } = useTypingMetrics({
    startTime,
    completedAt,
    attemptCount,
    correctCharacters,
  });

  const isEmpty = startTime === null;

  return (
    <div className="typing-metrics">
      <MetricCard
        title="Live speed"
        hint="all keys ÷ 5 ÷ minutes"
        value={isEmpty ? "—" : `${wordsPerMinute}`}
        unit="WPM"
        ratio={isEmpty ? 0 : wordsPerMinute / 120}
        tone="speed"
        pulseKey={Math.round(wordsPerMinute / 5) * 5}
        empty={isEmpty}
      />
      <MetricCard
        title="Live accuracy"
        hint="correct keys ÷ all keys"
        value={isEmpty ? "—" : `${accuracy}%`}
        ratio={isEmpty ? 0 : accuracy / 100}
        tone="accuracy"
        pulseKey={accuracy}
        empty={isEmpty}
      />
      <MetricCard
        title="Time"
        hint="starts with your first key"
        value={isEmpty ? "Ready" : formatTime(elapsedSeconds)}
        ratio={isEmpty ? 0 : Math.min(1, elapsedSeconds / 60)}
        tone="time"
        pulseKey={Math.floor(elapsedSeconds)}
        empty={isEmpty}
      />
    </div>
  );
}

export default memo(MetricCards);
