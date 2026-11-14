"use client";

/**
 * A friendly golden trophy for the Rewards page. Purely decorative, so it
 * stays aria-hidden and the nearby text carries the meaning.
 */
export default function RewardsMascot() {
  return (
    <svg viewBox="0 0 200 168" aria-hidden="true" focusable="false" style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="rewards-trophy-cup" x1="60" y1="18" x2="130" y2="96" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffe493" />
          <stop offset="1" stopColor="#ffb52e" />
        </linearGradient>
        <linearGradient id="rewards-trophy-base" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#b9833b" />
          <stop offset="1" stopColor="#9a6524" />
        </linearGradient>
      </defs>

      {/* sparkles around the cup */}
      <g className="rewards-mascot-sparkles">
        <path d="m32 44 2.6 5.2 5.6.8-4 4 .9 5.6-5.1-2.7-5.1 2.7.9-5.6-4-4 5.6-.8Z" fill="#ffd05c" />
        <path d="m158 30 2 4 4.4.6-3.2 3 .7 4.4-3.9-2.1-3.9 2.1.7-4.4-3.2-3 4.4-.6Z" fill="#ff8fb1" />
        <path d="m168 64 1.6 3.2 3.5.5-2.5 2.4.5 3.5-3.1-1.7-3.1 1.7.5-3.5-2.5-2.4 3.5-.5Z" fill="#7cd6ff" />
      </g>

      {/* handles */}
      <path d="M52 40c-13 1-20 9-19 21 1 11 9 17 20 17" fill="none" stroke="#e0a52c" strokeWidth="7" strokeLinecap="round" />
      <path d="M148 40c13 1 20 9 19 21-1 11-9 17-20 17" fill="none" stroke="#e0a52c" strokeWidth="7" strokeLinecap="round" />

      {/* cup */}
      <path d="M62 20h76v34c0 21-17 38-38 38s-38-17-38-38Z" fill="url(#rewards-trophy-cup)" stroke="#daa32c" strokeWidth="4" strokeLinejoin="round" />
      <path d="M70 26h60" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" opacity=".55" />

      {/* face */}
      <g>
        <circle cx="88" cy="52" r="5" fill="#704293" />
        <circle cx="112" cy="52" r="5" fill="#704293" />
        <circle cx="89.7" cy="50.2" r="1.7" fill="#fff" />
        <circle cx="113.7" cy="50.2" r="1.7" fill="#fff" />
        <path d="M90 65c5.6 6 14.4 6 20 0" fill="none" stroke="#704293" strokeWidth="3.4" strokeLinecap="round" />
        <circle cx="79" cy="61" r="5" fill="#ff9d9d" opacity=".65" />
        <circle cx="121" cy="61" r="5" fill="#ff9d9d" opacity=".65" />
      </g>

      {/* stem + base */}
      <path d="M96 92h8l4 16h-16Z" fill="url(#rewards-trophy-base)" stroke="#7e5218" strokeWidth="3" strokeLinejoin="round" />
      <rect x="66" y="108" width="68" height="14" rx="7" fill="url(#rewards-trophy-base)" stroke="#7e5218" strokeWidth="3" />
      <rect x="58" y="122" width="84" height="16" rx="8" fill="#8a5c1d" stroke="#6f4712" strokeWidth="3" />
      <path d="M74 130h52" stroke="#ffd05c" strokeWidth="2.5" strokeLinecap="round" opacity=".5" />

      {/* little star resting on the base */}
      <path d="m146 118 1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6Z" fill="#ffd05c" stroke="#e0a52c" strokeWidth="1.6" />
    </svg>
  );
}
