"use client";

import { memo, type CSSProperties } from "react";

type SentencePickerProps = {
  sentences: string[];
  activeIndex: number;
  onSelect: (index: number) => void;
};

/**
 * Sentence chips. On small screens the rail scrolls sideways with snapping so
 * every sentence stays reachable with a thumb.
 */
function SentencePicker({ sentences, activeIndex, onSelect }: SentencePickerProps) {
  return (
    <div className="typing-sentence-block">
      <div className="typing-section-head">
        <p className="typing-section-title">Pick a sentence</p>
        <p className="typing-section-hint">
          Sentence {activeIndex + 1} of {sentences.length}
        </p>
      </div>

      <div className="typing-sentence-rail" role="group" aria-label="Choose a sentence">
        {sentences.map((sentence, index) => {
          const isActive = activeIndex === index;
          return (
            <button
              key={sentence}
              type="button"
              className="typing-sentence-button"
              aria-pressed={isActive}
              onClick={() => onSelect(index)}
              style={{ "--chip-delay": `${index * 55}ms` } as CSSProperties}
            >
              <span className="typing-sentence-button__number" aria-hidden="true">
                {index + 1}
              </span>
              <span className="typing-sentence-button__text">{sentence}</span>
              <span className="typing-sentence-button__check" aria-hidden="true">
                ✓
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default memo(SentencePicker);
