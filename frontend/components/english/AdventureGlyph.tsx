import { useId } from "react";
import type { EnglishCategoryId } from "./englishContent";

type AdventureGlyphProps = {
  category: EnglishCategoryId;
  className?: string;
};

const glyphThemes: Record<EnglishCategoryId, {
  sky: string;
  horizon: string;
  ink: string;
  accent: string;
  paper: string;
}> = {
  vocabulary: { sky: "#e8feff", horizon: "#7de4fa", ink: "#0e769f", accent: "#ffcc4d", paper: "#fff9e8" },
  stories: { sky: "#f4e8ff", horizon: "#b88cf8", ink: "#7042a6", accent: "#ffe079", paper: "#fff6f2" },
  grammar: { sky: "#e9ffd9", horizon: "#83d895", ink: "#27774f", accent: "#a279ff", paper: "#fbfff2" },
  listening: { sky: "#e0f7ff", horizon: "#6bc9f5", ink: "#246e9f", accent: "#ffd25e", paper: "#f5fdff" },
  speaking: { sky: "#ffe5f2", horizon: "#fa92c5", ink: "#a33c71", accent: "#ffad4d", paper: "#fff6fb" },
  sentences: { sky: "#fff1c9", horizon: "#ffc45e", ink: "#93602c", accent: "#47c6a4", paper: "#fffdf5" },
};

export default function AdventureGlyph({ category, className = "" }: AdventureGlyphProps) {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const theme = glyphThemes[category];
  const backgroundId = `${uid}-background`;
  const paperId = `${uid}-paper`;
  const inkId = `${uid}-ink`;

  return (
    <svg className={`ew-adventure-glyph ${className}`} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={backgroundId} x1="8" y1="5" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor={theme.sky} />
          <stop offset="1" stopColor={theme.horizon} />
        </linearGradient>
        <linearGradient id={paperId} x1="16" y1="17" x2="48" y2="49" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" />
          <stop offset="1" stopColor={theme.paper} />
        </linearGradient>
        <linearGradient id={inkId} x1="19" y1="12" x2="45" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor={theme.ink} />
          <stop offset="1" stopColor="#253c87" />
        </linearGradient>
      </defs>

      <rect x="3" y="3" width="58" height="58" rx="18" fill={`url(#${backgroundId})`} stroke="rgba(255,255,255,.92)" strokeWidth="2.5" />
      <path d="M11 20c4-8 13-13 24-13" fill="none" stroke="rgba(255,255,255,.58)" strokeWidth="4" strokeLinecap="round" />
      <path d="M53 48c-4 7-11 11-21 11" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="3" strokeLinecap="round" />

      {category === "vocabulary" && (
        <g>
          <path d="M12 27c7-4 13-4 19 1v22c-6-5-12-5-19-1Z" fill={`url(#${paperId})`} stroke="#bfeaff" strokeWidth="2" strokeLinejoin="round" />
          <path d="M32 28c6-5 13-5 20-1v22c-7-4-14-4-20 1Z" fill={`url(#${paperId})`} stroke="#bfeaff" strokeWidth="2" strokeLinejoin="round" />
          <path d="M32 28v22M18 32c4-1 7 0 10 2m-10 4c4-1 7 0 10 2m10-8c3-2 6-3 10-2m-10 6c3-2 6-3 10-2" fill="none" stroke={theme.ink} strokeWidth="1.8" strokeLinecap="round" opacity=".58" />
          <g transform="rotate(-6 25 48)">
            <rect x="12" y="39" width="21" height="16" rx="4.5" fill={theme.accent} stroke="#fff8d2" strokeWidth="2" />
            <text x="22.5" y="51" textAnchor="middle" fill="#6e4c11" fontFamily="Trebuchet MS, sans-serif" fontSize="11" fontWeight="900">A</text>
          </g>
          <circle cx="47" cy="15" r="4.5" fill={theme.accent} stroke="#fff" strokeWidth="1.5" />
          <path d="m17 12 1.6 3.8L22 17l-3.4 1.2L17 22l-1.6-3.8L12 17l3.4-1.2Z" fill="#fff" opacity=".92" />
        </g>
      )}

      {category === "stories" && (
        <g>
          <path d="M25 38V23h5v-5l4 4 4-4v5h5v15" fill="#f0ddff" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
          <path d="m39 11 1.7 4.2L45 17l-4.3 1.5L39 23l-1.7-4.5L33 17l4.3-1.8Z" fill={theme.accent} stroke="#fff8d3" strokeWidth="1.2" />
          <path d="M12 30c7-5 13-5 20 0v20c-7-5-13-5-20 0Z" fill={`url(#${paperId})`} stroke="#d8c1ff" strokeWidth="2" strokeLinejoin="round" />
          <path d="M32 30c7-5 13-5 20 0v20c-7-5-13-5-20 0Z" fill={`url(#${paperId})`} stroke="#d8c1ff" strokeWidth="2" strokeLinejoin="round" />
          <path d="M32 30v20M18 35c4-1 7 0 10 2m-10 4c4-1 7 0 10 2m9-8c3-2 6-3 10-2m-10 6c3-2 6-3 10-2" fill="none" stroke={theme.ink} strokeWidth="1.7" strokeLinecap="round" opacity=".55" />
          <path d="M27 52c3-2 7-2 10 0" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".8" />
        </g>
      )}

      {category === "grammar" && (
        <g>
          <path d="M32 43V24" fill="none" stroke="#2d8e5e" strokeWidth="4" strokeLinecap="round" />
          <path d="M31 29c-8 0-12-4-12-11 8-1 13 2 12 11Z" fill="#65ca7f" stroke="#e8ffcf" strokeWidth="1.5" />
          <path d="M33 33c8 0 12-4 12-10-8-1-12 2-12 10Z" fill="#9bdd68" stroke="#f0ffd8" strokeWidth="1.5" />
          <g transform="rotate(-5 26 47)">
            <rect x="13" y="39" width="21" height="16" rx="4.5" fill={`url(#${inkId})`} stroke="#fff" strokeWidth="2" />
            <text x="23.5" y="51" textAnchor="middle" fill="#fff7c7" fontFamily="Trebuchet MS, sans-serif" fontSize="10" fontWeight="900">N</text>
          </g>
          <g transform="rotate(5 42 47)">
            <rect x="32" y="39" width="21" height="16" rx="4.5" fill={theme.accent} stroke="#fff" strokeWidth="2" />
            <text x="42.5" y="51" textAnchor="middle" fill="#fff" fontFamily="Trebuchet MS, sans-serif" fontSize="10" fontWeight="900">V</text>
          </g>
          <circle cx="15" cy="14" r="3.5" fill={theme.accent} stroke="#fff" strokeWidth="1.5" />
          <path d="m49 12 1.5 3.5L54 17l-3.5 1.5L49 22l-1.5-3.5L44 17l3.5-1.5Z" fill="#fff" opacity=".9" />
        </g>
      )}

      {category === "listening" && (
        <g>
          <path d="M17 35v-4a15 15 0 0 1 30 0v4" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" />
          <rect x="12" y="31" width="11" height="18" rx="5" fill={theme.accent} stroke="#fff8cf" strokeWidth="2" />
          <rect x="41" y="31" width="11" height="18" rx="5" fill={theme.accent} stroke="#fff8cf" strokeWidth="2" />
          <path d="M25 34c0 7 3 11 7 11s7-4 7-11" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity=".88" />
          <circle cx="32" cy="47" r="2.2" fill="#fff" />
          <path d="M20 18c3-3 7-4 11-3M44 17c-3-2-6-3-9-2" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".75" />
          <path d="m48 44 1.4 3.3 3.4 1.2-3.4 1.2L48 53l-1.4-3.3L43 48.5l3.6-1.2Z" fill="#fff" opacity=".9" />
        </g>
      )}

      {category === "speaking" && (
        <g>
          <rect x="25" y="13" width="14" height="24" rx="7" fill="#fff" stroke="#f7a4d0" strokeWidth="2" />
          <path d="M20 29c0 8 5 13 12 13s12-5 12-13" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M32 42v8m-6 0h12" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
          <path d="M24 18h16m-16 7h16" fill="none" stroke="#ffc0dc" strokeWidth="2" strokeLinecap="round" />
          <path d="M11 15c2-2 5-3 8-3m34 10c1 2 2 4 2 6" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".8" />
          <path d="M44 13c3-1 5-1 8 1l-1 6-5-2Z" fill={theme.accent} stroke="#fff" strokeWidth="1.3" />
          <circle cx="17" cy="48" r="3.5" fill={theme.accent} stroke="#fff" strokeWidth="1.4" />
        </g>
      )}

      {category === "sentences" && (
        <g>
          <g transform="rotate(-4 20 24)">
            <rect x="8" y="17" width="24" height="14" rx="5" fill={`url(#${inkId})`} stroke="#fff" strokeWidth="2" />
            <text x="20" y="27" textAnchor="middle" fill="#fff8d2" fontFamily="Trebuchet MS, sans-serif" fontSize="9" fontWeight="900">I</text>
          </g>
          <g transform="rotate(3 43 33)">
            <rect x="31" y="26" width="24" height="14" rx="5" fill={theme.accent} stroke="#fff" strokeWidth="2" />
            <text x="43" y="36" textAnchor="middle" fill="#fff" fontFamily="Trebuchet MS, sans-serif" fontSize="8" fontWeight="900">can</text>
          </g>
          <g transform="rotate(-2 33 47)">
            <rect x="16" y="40" width="32" height="14" rx="5" fill="#fff" stroke="#ffd783" strokeWidth="2" />
            <text x="32" y="50" textAnchor="middle" fill="#8b6554" fontFamily="Trebuchet MS, sans-serif" fontSize="8" fontWeight="900">fly</text>
          </g>
          <path d="m9 37 4 4 7-8" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m49 9 1.5 3.7L54 14l-3.5 1.5L49 19l-1.5-3.5L44 14l3.5-1.3Z" fill="#fff" opacity=".9" />
        </g>
      )}
    </svg>
  );
}
