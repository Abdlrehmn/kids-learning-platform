"use client";

import { memo } from "react";

export type MascotMood = "idle" | "greeting" | "focus" | "oops" | "success" | "celebrate";

type TypingMascotProps = {
  mood: MascotMood;
  /** Short friendly line shown under the mascot. */
  message: string;
};

const KEY_LABELS = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"];

/**
 * Friendly keyboard mascot. The face and the little hands react to the real
 * typing state, so the character never says something the child has not done.
 */
function TypingMascot({ mood, message }: TypingMascotProps) {
  return (
    <div className={`typing-mascot typing-mascot--${mood}`}>
      <svg className="typing-mascot__art" viewBox="0 0 230 200" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="typing-mascot-body" x1="40" y1="10" x2="190" y2="170" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8b7bff" />
            <stop offset=".55" stopColor="#6455e8" />
            <stop offset="1" stopColor="#3f31b8" />
          </linearGradient>
          <linearGradient id="typing-mascot-key" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#ffffff" />
            <stop offset="1" stopColor="#d9e0ff" />
          </linearGradient>
          <linearGradient id="typing-mascot-desk" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#6f63d8" />
            <stop offset="1" stopColor="#4234a8" />
          </linearGradient>
        </defs>

        {/* antenna */}
        <path d="M115 30c0-9 6-15 15-16" fill="none" stroke="#3f31b8" strokeWidth="5" strokeLinecap="round" />
        <g className="typing-mascot__antenna">
          <circle cx="132" cy="12" r="8" fill="#ffd05c" stroke="#e0a52c" strokeWidth="3" />
          <path d="m132 4 2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.8Z" fill="#fff5cf" />
        </g>

        {/* headphones */}
        <path d="M62 66a53 53 0 0 1 106 0" fill="none" stroke="#33279c" strokeWidth="9" strokeLinecap="round" />
        <rect className="typing-mascot__cup typing-mascot__cup--left" x="48" y="58" width="17" height="28" rx="8" fill="#ff8fb1" stroke="#d95f88" strokeWidth="3" />
        <rect className="typing-mascot__cup typing-mascot__cup--right" x="165" y="58" width="17" height="28" rx="8" fill="#8fe3c0" stroke="#4fb995" strokeWidth="3" />

        {/* head */}
        <circle cx="115" cy="66" r="45" fill="url(#typing-mascot-body)" stroke="#37299f" strokeWidth="4" />
        <path d="M88 40c9-9 24-13 37-9" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" opacity=".45" />

        {/* face */}
        <g className="typing-mascot__face">
          {mood === "celebrate" ? (
            <g stroke="#241a6b" strokeWidth="5" strokeLinecap="round" fill="none">
              <path d="M88 68c4-7 13-7 17 0" />
              <path d="M125 68c4-7 13-7 17 0" />
            </g>
          ) : mood === "oops" ? (
            <g stroke="#241a6b" strokeWidth="5" strokeLinecap="round" fill="none">
              <path d="M88 72c5-6 12-6 17 0" />
              <path d="M125 72c5-6 12-6 17 0" />
            </g>
          ) : (
            <g>
              <ellipse cx="96" cy="66" rx="12" ry="14" fill="#ffffff" />
              <ellipse cx="134" cy="66" rx="12" ry="14" fill="#ffffff" />
              <circle className="typing-mascot__pupil typing-mascot__pupil--left" cx="98" cy="68" r="6" fill="#2a1f66" />
              <circle className="typing-mascot__pupil typing-mascot__pupil--right" cx="136" cy="68" r="6" fill="#2a1f66" />
              <circle cx="100" cy="65" r="2.2" fill="#ffffff" />
              <circle cx="138" cy="65" r="2.2" fill="#ffffff" />
            </g>
          )}

          {mood === "celebrate" ? (
            <path d="M96 88c11 14 27 14 38 0-9 5-29 5-38 0Z" fill="#2a1f66" />
          ) : mood === "oops" ? (
            <path d="M100 92c4-6 8 4 12-1s8 4 12-2" fill="none" stroke="#2a1f66" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          ) : mood === "focus" ? (
            <ellipse cx="115" cy="92" rx="7" ry="6" fill="#2a1f66" />
          ) : (
            <path d="M99 88c9 8 23 8 32 0" fill="none" stroke="#2a1f66" strokeWidth="4.5" strokeLinecap="round" />
          )}
        </g>

        {mood === "oops" && (
          <g className="typing-mascot__sweat">
            <path d="M166 40c6 8 8 12 8 16a8 8 0 0 1-16 0c0-4 2-8 8-16Z" fill="#7fc8ff" stroke="#4aa3e8" strokeWidth="2.5" />
          </g>
        )}

        {mood === "celebrate" && (
          <g className="typing-mascot__confetti">
            <rect x="42" y="30" width="8" height="8" rx="2" fill="#ff8fb1" transform="rotate(18 46 34)" />
            <rect x="182" y="36" width="9" height="9" rx="2" fill="#8fe3c0" transform="rotate(-24 186 40)" />
            <rect x="196" y="22" width="7" height="7" rx="2" fill="#ffd05c" transform="rotate(12 199 25)" />
            <circle cx="38" cy="56" r="4" fill="#b38bff" />
          </g>
        )}

        {mood === "success" && (
          <g className="typing-mascot__success-sparkles">
            <path d="m55 43 3.2 6.4 7.1 1-5.1 5 1.2 7-6.4-3.4-6.4 3.4 1.2-7-5.1-5 7.1-1Z" fill="#ffd05c" />
            <path d="m177 51 2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7Z" fill="#ff8fb1" />
          </g>
        )}

        {/* body behind the desk */}
        <path d="M74 118c0-13 18-22 41-22s41 9 41 22v26H74Z" fill="url(#typing-mascot-body)" stroke="#37299f" strokeWidth="4" />
        <path d="M99 112c5 6 21 6 32 0-4 9-28 9-32 0Z" fill="#ffd05c" opacity=".9" />

        {/* arms */}
        <path className="typing-mascot__arm typing-mascot__arm--left" d="M78 124c-9 4-13 12-12 21" fill="none" stroke="#37299f" strokeWidth="9" strokeLinecap="round" />
        <circle className="typing-mascot__hand typing-mascot__hand--left" cx="66" cy="148" r="8" fill="#ffd9b0" stroke="#37299f" strokeWidth="3" />
        <g className="typing-mascot__wave">
          <path className="typing-mascot__arm typing-mascot__arm--right" d="M152 124c9 4 13 12 12 21" fill="none" stroke="#37299f" strokeWidth="9" strokeLinecap="round" />
          <circle className="typing-mascot__hand typing-mascot__hand--right" cx="164" cy="148" r="8" fill="#ffd9b0" stroke="#37299f" strokeWidth="3" />
        </g>

        {/* desk + keyboard */}
        <rect x="34" y="146" width="162" height="46" rx="16" fill="url(#typing-mascot-desk)" stroke="#2c2190" strokeWidth="4" />
        <rect x="44" y="156" width="142" height="26" rx="9" fill="#2c2190" opacity=".55" />
        {KEY_LABELS.map((label, index) => (
          <rect
            key={label}
            className={`typing-mascot__key${index % 3 === 0 ? " typing-mascot__key--tap" : ""}`}
            x={50 + index * 13}
            y={160}
            width="11"
            height="18"
            rx="4"
            fill="url(#typing-mascot-key)"
            style={{ animationDelay: `${(index % 3) * 0.18}s` }}
          />
        ))}
        <rect x="50" y="182" width="130" height="8" rx="4" fill="#8b7bff" />
      </svg>

      <p className="typing-mascot__message" aria-live="polite" aria-atomic="true">
        {message}
      </p>
    </div>
  );
}

export default memo(TypingMascot);
