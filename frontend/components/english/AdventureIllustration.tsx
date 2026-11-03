import { useId } from "react";
import type { EnglishCategoryId } from "./englishContent";

const palette: Record<EnglishCategoryId, { sky: string; horizon: string; grass: string; rock: string; light: string; accent: string }> = {
  vocabulary: { sky: "#b9f4ff", horizon: "#54d8e3", grass: "#42c99a", rock: "#986e62", light: "#a9f2ac", accent: "#ffca51" },
  stories: { sky: "#e8caff", horizon: "#b584ff", grass: "#a680e8", rock: "#79557f", light: "#f8a5d3", accent: "#ffe079" },
  grammar: { sky: "#d5f5bd", horizon: "#80d78f", grass: "#49b985", rock: "#80685d", light: "#b8e978", accent: "#a277ff" },
  listening: { sky: "#bbebff", horizon: "#5ec7f3", grass: "#38b8c9", rock: "#6f718e", light: "#8de3ed", accent: "#ffce68" },
  speaking: { sky: "#ffd0e7", horizon: "#fa9abf", grass: "#f17eaf", rock: "#896478", light: "#ffc293", accent: "#ff914f" },
  sentences: { sky: "#ffe4b2", horizon: "#ffc66c", grass: "#62c99a", rock: "#9a7055", light: "#a9e8cb", accent: "#ff8b59" },
};

export default function AdventureIllustration({
  category,
  className = "",
}: {
  category: EnglishCategoryId;
  className?: string;
}) {
  const colors = palette[category];
  const uid = `art-${category}-${useId().replace(/:/g, "")}`;

  return (
    <svg className={`ew-art-scene ew-art-scene--${category} ${className}`} viewBox="0 0 500 280" role="img" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={colors.sky} /><stop offset="1" stopColor={colors.horizon} /></linearGradient>
        <linearGradient id={`${uid}-grass`} x1="0" y1="0" x2="0" y2="1"><stop stopColor={colors.light} /><stop offset="1" stopColor={colors.grass} /></linearGradient>
        <linearGradient id={`${uid}-rock`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#bd9580" /><stop offset="1" stopColor={colors.rock} /></linearGradient>
        <linearGradient id={`${uid}-book`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fffef4" /><stop offset="1" stopColor="#ffe8b9" /></linearGradient>
        <filter id={`${uid}-shadow`} x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="9" stdDeviation="8" floodColor="#465aa0" floodOpacity=".22" /></filter>
      </defs>

      <rect width="500" height="280" rx="28" fill={`url(#${uid}-sky)`} />
      <circle cx="410" cy="53" r="49" fill="#fff" opacity=".18" />
      <circle cx="89" cy="218" r="70" fill="#fff" opacity=".15" />
      <path d="M53 70c0-13 10-23 23-23 9 0 17 5 21 13 3-3 7-4 11-4 11 0 20 9 20 20H53Z" fill="#fff" opacity=".78" />
      <path d="M364 100c0-10 8-18 18-18 7 0 13 4 16 10 3-2 6-3 9-3 9 0 16 7 16 16h-59Z" fill="#fff" opacity=".64" />
      <path d="m220 39 5 11 12 1-9 8 3 12-11-6-10 6 2-12-9-8 12-1Z" fill="#fff8ba" opacity=".95" />
      <path d="m326 52 3 7 8 1-6 5 2 8-7-4-7 4 1-8-6-5 8-1Z" fill="#fff" opacity=".9" />
      <path d="M45 193c37-15 72-20 111-15 31 4 57 15 94 15 60 0 94-20 144-16 26 2 47 9 67 19v30H45Z" fill="#fff" opacity=".15" />

      <g className="ew-art-cloud ew-art-cloud--one" fill="#fff" opacity=".7"><path d="M77 139c0-9 7-16 16-16 6 0 11 3 14 8 2-2 5-3 8-3 7 0 13 6 13 13H77Z" /></g>
      <g className="ew-art-cloud ew-art-cloud--two" fill="#fff" opacity=".62"><path d="M382 150c0-7 6-13 13-13 5 0 9 3 11 7 2-2 4-2 6-2 6 0 11 5 11 11h-41Z" /></g>

      <g className="ew-art-island" filter={`url(#${uid}-shadow)`}>
        <path d="M72 187c34-17 82-21 130-12 43 8 74 9 112-1 40-10 77-4 113 18l-20 29c-57 11-111 18-167 18-63 0-116-6-160-18Z" fill={`url(#${uid}-rock)`} />
        <path d="M50 181c26-31 77-47 130-41 39 5 59 18 98 15 48-4 77-26 123-19 25 4 46 17 63 37-28 19-70 30-117 31-41 1-66-10-112-7-58 4-101 17-151 4-16-4-27-10-34-20Z" fill={`url(#${uid}-grass)`} />
        <path d="M92 184c32 10 64 13 102 10m80-1c28 4 59 2 87-6" stroke="#d8ffc3" strokeWidth="5" strokeLinecap="round" opacity=".55" />
        <path d="M134 223c24 5 46 7 71 7m74-2c23-1 44-4 65-9" stroke="#f4c59b" strokeWidth="5" strokeLinecap="round" opacity=".48" />
        <g className="ew-art-tree ew-art-tree--left"><path d="M113 171v-28" stroke="#835641" strokeWidth="8" strokeLinecap="round" /><circle cx="112" cy="137" r="19" fill="#2ba87a" /><circle cx="100" cy="144" r="11" fill="#5bc98b" /><circle cx="124" cy="145" r="12" fill="#8dde87" /></g>
        <g className="ew-art-tree ew-art-tree--right"><path d="M379 168v-24" stroke="#835641" strokeWidth="7" strokeLinecap="round" /><circle cx="379" cy="135" r="17" fill="#319d78" /><circle cx="367" cy="141" r="10" fill="#65ca8b" /><circle cx="390" cy="141" r="10" fill="#a0df7e" /></g>
        <path d="M187 179c9-9 19-11 28-8m69 11c11-7 22-8 31-4" fill="none" stroke="#fff8ad" strokeWidth="5" strokeLinecap="round" />
      </g>

      {category === "vocabulary" && <g className="ew-art-object ew-art-object--vocabulary" filter={`url(#${uid}-shadow)`}>
        <g transform="translate(176 110) rotate(-8)"><path d="m0 12 30-13 31 12-31 14Z" fill="#43a7ee" /><path d="M0 12 30 25v36L0 48Z" fill="#2d8bd8" /><path d="M30 25 61 11v37L30 61Z" fill="#67c6ff" /><text x="30" y="48" textAnchor="middle" fill="#fff" fontSize="27" fontWeight="900">A</text></g>
        <g transform="translate(239 126) rotate(7)"><path d="m0 9 27-11 28 11-28 13Z" fill="#ffdf76" /><path d="M0 9 27 22v31L0 42Z" fill="#ffc84e" /><path d="M27 22 55 9v32L27 53Z" fill="#ff9a63" /><text x="27" y="43" textAnchor="middle" fill="#fff" fontSize="22" fontWeight="900">B</text></g>
        <path d="M328 124c7-16 32-18 42-3 6 9 2 22-9 29l-14 11-17-9c-13-7-11-20-2-28Z" fill="#fff" opacity=".9" /><circle cx="345" cy="134" r="3" fill="#485895" /><circle cx="357" cy="134" r="3" fill="#485895" /><path d="M346 144q6 5 12 0" fill="none" stroke="#e26d74" strokeWidth="3" strokeLinecap="round" />
        <text x="320" y="92" fill="#fff6a7" fontSize="31" fontWeight="900" transform="rotate(11 320 92)">Aa</text>
      </g>}

      {category === "stories" && <g className="ew-art-object ew-art-object--stories" filter={`url(#${uid}-shadow)`}>
        <g transform="translate(168 67)"><path d="M10 84V34h30V15h26v69h-8V49H46v35Z" fill="#8c57c6" stroke="#fff" strokeWidth="4" strokeLinejoin="round" /><path d="M4 34h43v-8h11v58H4Z" fill="#b16cdb" /><path d="M4 34 25 22l22 12v50H4Z" fill="#d395ec" /><path d="m27 22 12-10 12 10v13H27Z" fill="#f4a9c8" /><path d="M14 46h11v15H14Zm25 0h11v15H39Zm-13 23h13v15H26Z" fill="#ffe78f" /><path d="M27 12V0h3v12" stroke="#fff" strokeWidth="3" /><path d="m29 2 18 5-18 5Z" fill="#ff787a" /></g>
        <g transform="translate(278 143) rotate(-5)"><path d="M0 13c22-15 43-13 63 0v39C42 41 21 41 0 54Z" fill={`url(#${uid}-book)`} stroke="#ba6fd3" strokeWidth="4" /><path d="M63 13c20-14 41-15 63 0v41c-22-14-43-13-63-2Z" fill="#fff6d9" stroke="#ba6fd3" strokeWidth="4" /><path d="M63 13v42" stroke="#8b55b9" strokeWidth="4" /><path d="M11 26h34m-34 10h30m31-10h34m-34 10h27" stroke="#d7b8e9" strokeWidth="3" strokeLinecap="round" /></g>
        <path d="m331 87 6 14 15 1-11 9 4 14-14-8-13 8 3-14-11-9 15-1Z" fill="#ffe582" />
      </g>}

      {category === "grammar" && <g className="ew-art-object ew-art-object--grammar" filter={`url(#${uid}-shadow)`}>
        <path d="M251 160v-62m0 31c-23-2-31-13-34-26 17-2 30 5 34 26Zm2-11c5-17 18-25 33-25-1 15-12 26-33 29Zm-3 36c-17-2-26-10-29-20 13-2 23 3 29 20Zm2-14c4-13 15-19 27-18-1 11-10 18-27 21Z" fill="#45bd7c" stroke="#237d68" strokeWidth="4" strokeLinejoin="round" />
        <path d="M240 168h26" stroke="#8c5b44" strokeWidth="10" strokeLinecap="round" />
        <g transform="translate(153 121) rotate(-9)"><rect width="54" height="49" rx="10" fill="#9a75f4" /><text x="27" y="34" textAnchor="middle" fill="#fff" fontSize="24" fontWeight="900">N</text></g>
        <g transform="translate(292 126) rotate(8)"><rect width="54" height="49" rx="10" fill="#35bfa5" /><text x="27" y="34" textAnchor="middle" fill="#fff" fontSize="24" fontWeight="900">V</text></g>
        <path d="m342 95 5 10 11 1-8 7 3 11-11-6-10 6 2-11-8-7 11-1Z" fill="#ffed8c" />
      </g>}

      {category === "listening" && <g className="ew-art-object ew-art-object--listening" filter={`url(#${uid}-shadow)`}>
        <path d="M96 185q45-20 89 0t89 0q45-20 89 0t89 0" fill="none" stroke="#b1f4ff" strokeWidth="11" strokeLinecap="round" opacity=".8" />
        <path d="M112 199q35-14 71 0t71 0q36-14 71 0t71 0" fill="none" stroke="#49b9dd" strokeWidth="5" strokeLinecap="round" opacity=".65" />
        <g transform="translate(205 76) rotate(-8)"><path d="M-37 57V40a45 45 0 0 1 90 0v17" fill="none" stroke="#4858bd" strokeWidth="15" strokeLinecap="round" /><rect x="-46" y="48" width="25" height="44" rx="12" fill="#8d78ff" /><rect x="34" y="48" width="25" height="44" rx="12" fill="#8d78ff" /><path d="M-34 57v16m70-16v16" stroke="#c5b9ff" strokeWidth="4" strokeLinecap="round" /></g>
        <path d="M303 94v47m-14-33v20m28-31v42" stroke="#ffdb69" strokeWidth="8" strokeLinecap="round" />
        <path d="M137 158c12-8 25-8 38 0-13 17-25 18-38 0Zm0 0-8-11m8 11-9 10" fill="#53d0de" stroke="#3189b5" strokeWidth="3" strokeLinejoin="round" />
      </g>}

      {category === "speaking" && <g className="ew-art-object ew-art-object--speaking" filter={`url(#${uid}-shadow)`}>
        <g transform="translate(207 69)"><rect x="-24" y="0" width="48" height="91" rx="24" fill="#fd769f" stroke="#fff" strokeWidth="5" /><path d="M-12 30v18m12-31v37m12-27v21" stroke="#ffeafa" strokeWidth="5" strokeLinecap="round" /><path d="M-45 60a45 45 0 0 0 90 0" fill="none" stroke="#a74cc1" strokeWidth="8" strokeLinecap="round" /><path d="M0 105v22m-23 0h46" stroke="#7e4db0" strokeWidth="8" strokeLinecap="round" /></g>
        <path d="M296 85h82a17 17 0 0 1 17 17v25a17 17 0 0 1-17 17h-37l-22 18 4-18h-27a17 17 0 0 1-17-17v-25a17 17 0 0 1 17-17Z" fill="#fff" stroke="#dc77be" strokeWidth="4" /><circle cx="317" cy="114" r="5" fill="#dc77be" /><circle cx="343" cy="114" r="5" fill="#dc77be" /><circle cx="369" cy="114" r="5" fill="#dc77be" />
        <path d="M150 107h55a15 15 0 0 1 15 15v15a15 15 0 0 1-15 15h-17l-15 13 3-13h-26a15 15 0 0 1-15-15v-15a15 15 0 0 1 15-15Z" fill="#fff8e7" stroke="#ffad7b" strokeWidth="4" />
        <path d="M169 125q8-10 16 0 8-10 16 0-5 11-16 17-11-6-16-17Z" fill="#f18ba6" />
      </g>}

      {category === "sentences" && <g className="ew-art-object ew-art-object--sentences" filter={`url(#${uid}-shadow)`}>
        <g transform="translate(137 103) rotate(-6)"><rect width="90" height="48" rx="12" fill="#fff7dc" stroke="#ffb45c" strokeWidth="4" /><text x="45" y="31" textAnchor="middle" fill="#9c5e42" fontSize="18" fontWeight="800">The</text></g>
        <g transform="translate(228 83) rotate(4)"><rect width="82" height="48" rx="12" fill="#dcf7ff" stroke="#46bdd1" strokeWidth="4" /><text x="41" y="31" textAnchor="middle" fill="#357d9c" fontSize="17" fontWeight="800">cat</text></g>
        <g transform="translate(311 111) rotate(-3)"><rect width="98" height="48" rx="12" fill="#f1e9ff" stroke="#9b79ed" strokeWidth="4" /><text x="49" y="31" textAnchor="middle" fill="#6c4cc5" fontSize="16" fontWeight="800">jumps!</text></g>
        <path d="M181 166h133" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeDasharray="2 13" />
        <path d="M359 78c10-13 29-13 39 0 13-4 26 7 24 20-2 9-10 14-19 14h-32c-13 0-22-11-18-22 1-5 3-8 6-12Z" fill="#fff" opacity=".92" stroke="#f8a260" strokeWidth="3" />
        <path d="m381 83 4 9 10 1-8 7 2 10-8-5-9 5 2-10-8-7 10-1Z" fill="#ffb44b" />
      </g>}
    </svg>
  );
}
