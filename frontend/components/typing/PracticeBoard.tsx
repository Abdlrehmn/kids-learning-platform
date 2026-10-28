"use client";

import { memo, type ChangeEvent } from "react";
import type { PromptSegment } from "./practiceContent";

type PracticeBoardProps = {
  prompt: string;
  promptCharacters: string[];
  typedCharacters: string[];
  segments: PromptSegment[];
  completedWordFlags: boolean[];
  wordMistakeFlags: boolean[];
  correctCharacters: number;
  incorrectCharacters: number;
  remainingCharacters: number;
  progressPercent: number;
  hasMistypedCharacter: boolean;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
};

/**
 * The typing workspace: the prompt with per-character and per-word feedback,
 * the progress track, and the textarea the child types into.
 *
 * Every visual state is derived from the real typed value, never from a guess.
 */
function PracticeBoard({
  prompt,
  promptCharacters,
  typedCharacters,
  segments,
  completedWordFlags,
  wordMistakeFlags,
  correctCharacters,
  incorrectCharacters,
  remainingCharacters,
  progressPercent,
  hasMistypedCharacter,
  onChange,
}: PracticeBoardProps) {
  const renderCharacter = (index: number) => {
    const character = promptCharacters[index];
    const typedCharacter = typedCharacters[index];
    const isCurrentCharacter = typedCharacter === undefined && index === typedCharacters.length;
    const isCorrect = typedCharacter !== undefined && typedCharacter === character;
    const isWrong = typedCharacter !== undefined && typedCharacter !== character;

    const characterClasses = [
      "typing-char",
      isCurrentCharacter ? "typing-char--current" : "",
      isCorrect ? "typing-char--correct" : "",
      isWrong ? "typing-char--wrong" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <span key={index} aria-hidden="true" className={characterClasses}>
        {character === " " ? "\u00a0" : character}
      </span>
    );
  };

  return (
    <>
      <div className="typing-prompt-box">
        <div className="typing-prompt-head">
          <p className="typing-prompt-title">
            <span className="typing-prompt-title__icon" aria-hidden="true">
              ⌨
            </span>
            Type this
          </p>
          <span className="typing-progress-label">{progressPercent}% done</span>
        </div>

        <div className="typing-progress-track" aria-hidden="true">
          <span className="typing-progress-fill" style={{ width: `${progressPercent}%` }} />
          <span className="typing-progress-rider" style={{ left: `clamp(14px, ${progressPercent}%, calc(100% - 14px))` }}>
            <svg viewBox="0 0 24 24" focusable="false">
              <path
                d="M12 2c3.2 2.6 5 6.2 5 10.2 0 2.6-.7 4.9-1.9 6.8H8.9C7.7 17.1 7 14.8 7 12.2 7 8.2 8.8 4.6 12 2Z"
                fill="#ff8f4d"
                stroke="#d95a1f"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="10.4" r="2.1" fill="#fff3d6" stroke="#d95a1f" strokeWidth="1.4" />
              <path d="M9 19.5 7 23l3.4-1.4L14 23l-2-3.5Z" fill="#ffd05c" stroke="#d95a1f" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
          </span>
        </div>

        <div className="typing-legend" aria-label="Character feedback key">
          <span>
            <span aria-hidden="true" className="typing-legend__dot typing-legend__dot--correct">
              ✓
            </span>
            Correct
          </span>
          <span>
            <span aria-hidden="true" className="typing-legend__dot typing-legend__dot--wrong">
              !
            </span>
            Try again
          </span>
          <span>
            <span aria-hidden="true" className="typing-legend__dot typing-legend__dot--pending">
              •
            </span>
            Still to type
          </span>
        </div>

        <div
          aria-label={`Practice text: ${prompt}`}
          className="typing-prompt-text"
        >
          <span className="sr-only">{prompt}</span>
          {segments.map((segment) => {
            if (segment.kind === "space") {
              return (
                <span key={`space-${segment.start}`} className="typing-space">
                  {renderCharacter(segment.start)}
                </span>
              );
            }

            const isWordDone = completedWordFlags[segment.wordIndex] ?? false;
            const isWordWrong = wordMistakeFlags[segment.wordIndex] ?? false;
            const isWordActive =
              !isWordDone &&
              typedCharacters.length >= segment.start &&
              typedCharacters.length <= segment.end;

            const wordClasses = [
              "typing-word",
              isWordDone ? "typing-word--done" : "",
              isWordWrong ? "typing-word--wrong" : "",
              isWordActive ? "typing-word--active" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <span key={`word-${segment.wordIndex}`} className={wordClasses} data-word-index={segment.wordIndex}>
                {promptCharacters.slice(segment.start, segment.end).map((_, offset) => renderCharacter(segment.start + offset))}
                {isWordDone && (
                  <span className="typing-word__star" aria-hidden="true">
                    ★
                  </span>
                )}
              </span>
            );
          })}
          {typedCharacters.slice(promptCharacters.length).map((character, index) => (
            <span key={`extra-${index}`} aria-hidden="true" className="typing-char typing-char--wrong">
              {character}
            </span>
          ))}
        </div>
      </div>

      <label htmlFor="typing-entry" className="typing-entry-label">
        Your typing
      </label>
      <textarea
        id="typing-entry"
        value={typedCharacters.join("")}
        onChange={onChange}
        onPaste={(event) => event.preventDefault()}
        onDrop={(event) => event.preventDefault()}
        aria-label="Type the practice text shown above"
        aria-invalid={hasMistypedCharacter}
        aria-describedby="typing-hint typing-feedback"
        autoCapitalize="off"
        autoComplete="off"
        spellCheck={false}
        rows={2}
        placeholder="Start typing here…"
        className="typing-entry"
      />
      <p id="typing-hint" className="typing-hint">
        The timer starts with your first key. Fixes count as extra keys, and paste is turned off to keep
        scores fair.
      </p>
      <p id="typing-feedback" aria-live="off" className="typing-feedback">
        {typedCharacters.length === 0
          ? `Ready when you are! ${remainingCharacters} characters to type.`
          : `${correctCharacters} correct · ${incorrectCharacters} to fix · ${remainingCharacters} left to type${
              hasMistypedCharacter ? ". Letters marked with ! need another try." : "."
            }`}
      </p>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {hasMistypedCharacter ? "One or more letters need another try." : ""}
      </p>
    </>
  );
}

export default memo(PracticeBoard);
