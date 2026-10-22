"use client";

import { memo } from "react";
import { MODE_OPTIONS, PRACTICE_TEXT, type PracticeMode } from "./practiceContent";

type ModeSelectorProps = {
  mode: PracticeMode;
  onSelect: (mode: PracticeMode) => void;
};

function ModeIcon({ id }: { id: PracticeMode }) {
  if (id === "letters") {
    return (
      <svg className="typing-mode-card__icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <rect x="3.5" y="5.5" width="25" height="21" rx="6" fill="currentColor" opacity=".18" />
        <text x="16" y="21" textAnchor="middle" fontSize="13" fontWeight="900" fill="currentColor" fontFamily="var(--font-geist-sans), sans-serif">
          Aa
        </text>
      </svg>
    );
  }

  if (id === "words") {
    return (
      <svg className="typing-mode-card__icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <path d="M4 9.5A4.5 4.5 0 0 1 8.5 5h11A4.5 4.5 0 0 1 24 9.5v5A4.5 4.5 0 0 1 19.5 19H13l-5.5 4.2V19h0A4.5 4.5 0 0 1 4 14.5Z" fill="currentColor" opacity=".18" />
        <circle cx="11" cy="12" r="1.7" fill="currentColor" />
        <circle cx="16" cy="12" r="1.7" fill="currentColor" />
        <circle cx="21" cy="12" r="1.7" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg className="typing-mode-card__icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect x="7" y="3.5" width="18" height="25" rx="5" fill="currentColor" opacity=".18" />
      <path d="M12 11h8M12 16h8M12 21h5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Big, tappable mode cards. The active card lifts and glows, the others stay
 * quiet, and switching modes cross-fades the practice area underneath.
 */
function ModeSelector({ mode, onSelect }: ModeSelectorProps) {
  return (
    <div className="typing-mode-grid" role="group" aria-label="Practice type">
      {MODE_OPTIONS.map((option) => {
        const isActive = mode === option.id;
        return (
          <button
            key={option.id}
            type="button"
            className="typing-mode-card"
            aria-pressed={isActive}
            onClick={() => onSelect(option.id)}
          >
            <span className="typing-mode-card__badge" aria-hidden="true">
              <ModeIcon id={option.id} />
            </span>
            <span className="typing-mode-card__copy">
              <span className="typing-mode-card__label">{option.label}</span>
              <span className="typing-mode-card__blurb">{option.blurb}</span>
              <span className="typing-mode-card__count">
                {PRACTICE_TEXT[option.id].length} {option.id === "sentences" ? "sentences" : "drills"}
              </span>
            </span>
            <span className="typing-mode-card__check" aria-hidden="true">
              ✓
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default memo(ModeSelector);
