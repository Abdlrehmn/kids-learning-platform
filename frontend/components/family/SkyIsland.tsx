"use client";

import type { CSSProperties } from "react";

/**
 * "Cloudhaven" — KiddoWorld's Family mascot art.
 *
 * A floating island in the clouds with a tiny learning house drawn in the
 * same sticker style as the home-world and Games hero art (organic shapes,
 * white sticker strokes, pastel fills). One friendly round owl watches over
 * the roof — dot eyes only, no risky faces. Decorative only (aria-hidden).
 */

type SkyIslandProps = {
  className?: string;
};

export function SkyIsland({ className = "" }: SkyIslandProps) {
  return (
    <svg className={className} viewBox="0 0 280 210" aria-hidden="true" focusable="false" style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}>
      {/* distant clouds for depth */}
      <g opacity=".5" transform="translate(6 14) scale(.42)"><circle cx="72" cy="66" r="33" fill="#fff" /><circle cx="120" cy="50" r="42" fill="#fff" /><circle cx="164" cy="70" r="28" fill="#fff" /><rect x="30" y="66" width="160" height="40" rx="20" fill="#fff" /></g>
      <g opacity=".42" transform="translate(232 40) scale(.3)"><circle cx="58" cy="70" r="30" fill="#fff" /><circle cx="118" cy="56" r="38" fill="#fff" /><circle cx="172" cy="72" r="26" fill="#fff" /><rect x="22" y="70" width="180" height="36" rx="18" fill="#fff" /></g>

      {/* sparkles */}
      <g className="family-art-star" style={{ "--star-delay": "0s" } as CSSProperties}>
        <path d="m34 62 3.2 6.5 7.2.8-5.3 5 1.2 7-6.3-3.3-6.3 3.3 1.2-7-5.3-5 7.2-.8Z" fill="#ffd05c" />
      </g>
      <g className="family-art-star" style={{ "--star-delay": "1.1s" } as CSSProperties}>
        <path d="m248 30 2.5 5 5.6.6-4.1 3.9 1 5.5-4.9-2.6-5 2.6 1-5.5-4.1-3.9 5.6-.6Z" fill="#8fd9c2" />
      </g>
      <g className="family-art-star" style={{ "--star-delay": "2.2s" } as CSSProperties}>
        <path d="m60 148 2 4 4.4.5-3.3 3 .7 4.4-3.8-2-3.9 2 .8-4.4-3.2-3 4.4-.5Z" fill="#ffb3c8" />
      </g>
      <circle cx="222" cy="64" r="3" fill="#ffd05c" opacity=".8" />
      <circle cx="44" cy="98" r="2.4" fill="#9fc3ef" opacity=".9" />
      <circle cx="258" cy="120" r="2.6" fill="#ffb3c8" opacity=".8" />

      {/* island underside rock with strata */}
      <path d="M60 98 218 98 196 138c-8 14-20 22-38 26l-16 22-12-23c-26-3-42-8-52-17-8-7-16-26-18-48Z"
        fill="#dcae7e" stroke="#fff" strokeWidth="5" strokeLinejoin="round" />
      <path d="M74 104c9 22 23 38 44 46 24 9 54 8 78-2l-8 12c-9 11-24 19-40 21l-13 21-11-22c-22-2-38-8-47-17-6-14 0-40-3-59Z" fill="#c89667" opacity=".55" />
      <path d="M86 110c-2 14 2 26 10 34M120 112c-1 16 4 30 12 40M154 112c0 12 4 24 10 32" stroke="#b9855a" strokeWidth="4" strokeLinecap="round" opacity=".7" fill="none" />

      {/* floating pebbles */}
      <g className="family-art-float" style={{ "--float-delay": "0s" } as CSSProperties}>
        <path d="M96 172c0-5 4-8 9-8s9 3 9 8-4 7-9 7-9-2-9-7Z" fill="#dcae7e" stroke="#fff" strokeWidth="3.5" />
      </g>
      <g className="family-art-float" style={{ "--float-delay": "-2.6s" } as CSSProperties}>
        <path d="M170 184c0-4 3-6 7-6s7 2 7 6-3 5-7 5-7-1-7-5Z" fill="#dcae7e" stroke="#fff" strokeWidth="3" />
      </g>

      {/* turf */}
      <path d="M58 98c0-16 36-29 82-29s82 13 82 29-36 29-82 29-82-13-82-29Z" fill="#bce4cb" stroke="#fff" strokeWidth="5" />
      <path d="M74 92c12-7 38-12 66-12 24 0 44 3 58 9-13 6-35 10-58 10s-53-2-66-7Z" fill="#d3f0dc" opacity=".9" />
      {/* grass tufts */}
      <g stroke="#93cba9" strokeWidth="4" strokeLinecap="round" fill="none">
        <path d="M92 106c2-6 6-9 10-10" />
        <path d="M104 109c1-5 4-8 7-10" />
        <path d="M180 104c2-5 5-8 9-10" />
        <path d="M192 106c2-4 5-7 8-9" />
      </g>

      {/* book stack on the turf */}
      <g>
        <rect x="76" y="88" width="34" height="8" rx="4" fill="#d4ecff" stroke="#fff" strokeWidth="2.5" />
        <rect x="79" y="80" width="30" height="8" rx="4" fill="#ffd9d1" stroke="#fff" strokeWidth="2.5" />
        <rect x="82" y="72" width="26" height="8" rx="4" fill="#ffe3a3" stroke="#fff" strokeWidth="2.5" />
        <path d="m95 66 1.6 3.3 3.7.4-2.7 2.6.6 3.6-3.2-1.7-3.2 1.7.6-3.6-2.7-2.6 3.7-.4Z" fill="#ffd05c" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
      </g>

      {/* learning house */}
      <g>
        {/* chimney + star smoke */}
        <rect x="172" y="42" width="11" height="18" rx="3" fill="#eab795" stroke="#fff" strokeWidth="3" />
        <circle className="family-art-float" style={{ "--float-delay": "-1.2s" } as CSSProperties} cx="184" cy="34" r="4.4" fill="#fff" opacity=".95" />
        <circle className="family-art-float" style={{ "--float-delay": "-2.4s" } as CSSProperties} cx="192" cy="24" r="3.2" fill="#fff" opacity=".8" />
        {/* walls */}
        <rect x="122" y="72" width="56" height="32" rx="7" fill="#fff6e4" stroke="#fff" strokeWidth="4.5" />
        {/* window */}
        <rect x="128" y="80" width="14" height="14" rx="4" fill="#ffe9a8" stroke="#f3cf8c" strokeWidth="2.5" />
        <path d="M135 81v12M129.5 87h11" stroke="#f3cf8c" strokeWidth="2" />
        {/* door */}
        <path d="M154 104v-15c0-4 3-7 7-7s7 3 7 7v15Z" fill="#f2c488" stroke="#dba76a" strokeWidth="2.5" />
        <circle cx="165" cy="95" r="1.7" fill="#9a6c34" />
        {/* roof */}
        <path d="M113 76c0-4 2-6 5-7l25-20c6-4 13-4 19 0l25 20c3 1 5 3 5 7Z" fill="#f7b39d" stroke="#fff" strokeWidth="4.5" strokeLinejoin="round" />
        <path d="M120 68c14-11 51-11 66 0" stroke="#ffd2b8" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity=".9" />
        {/* apex flag */}
        <path d="M140 49v-14" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
        <path d="M140 35h12l-4 5 4 5h-12Z" fill="#ffd763" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
        {/* bunting across the roof */}
        <path d="M118 72c10 8 38 8 48 0" stroke="#fff" strokeWidth="2.4" fill="none" />
        <path d="m124 74 4 7 3-8Z" fill="#ff9d8f" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="m140 78 4 6 3-7Z" fill="#8fd9c2" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
      </g>

      {/* friendly owl peeking over the roof edge (dot eyes only) */}
      <g>
        <path d="M104 78c0-8 6-13 12-13s12 5 12 13-5 13-12 13-12-5-12-13Z" fill="#bfe3d3" stroke="#fff" strokeWidth="3.5" />
        <ellipse cx="112" cy="70" rx="5" ry="4.6" fill="#fdfefb" />
        <ellipse cx="124" cy="70" rx="5" ry="4.6" fill="#fdfefb" />
        <circle cx="112.6" cy="70.4" r="1.9" fill="#4a6f65" />
        <circle cx="123.4" cy="70.4" r="1.9" fill="#4a6f65" />
        <path d="m117.4 73 2.4 3 2.4-3Z" fill="#e8a35c" />
        <path d="M107 82c1.6 3 4 5 9 5" stroke="#a5cdb9" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity=".9" />
      </g>

      {/* foreground cloud puff sliding under the island */}
      <g opacity=".94" transform="translate(-6 128) scale(.78)">
        <circle cx="72" cy="66" r="33" fill="#fff" />
        <circle cx="120" cy="50" r="42" fill="#fff" />
        <circle cx="164" cy="70" r="28" fill="#fff" />
        <rect x="30" y="66" width="160" height="40" rx="20" fill="#fff" />
        <ellipse cx="120" cy="66" rx="30" ry="20" fill="#f2f8ff" />
      </g>
      <g opacity=".66" transform="translate(196 150) scale(.5)">
        <circle cx="58" cy="70" r="30" fill="#fff" />
        <circle cx="118" cy="56" r="38" fill="#fff" />
        <circle cx="172" cy="72" r="26" fill="#fff" />
        <rect x="22" y="70" width="180" height="36" rx="18" fill="#fff" />
      </g>
    </svg>
  );
}

/** Tiny island badge used on the login card heading. */
export function SkyBadge() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false" style={{ width: "42px", height: "auto", display: "block" }}>
      <path d="m32 6 2.6 5.4 6 .7-4.4 4.2 1 5.9-6.2-3.2-6.2 3.2 1-5.9-4.4-4.2 6-.7Z" fill="#ffd05c" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
      <path d="M14 40v-8c0-3 2-4 4-5l12-10c3-2 7-2 10 0l10 8" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" />
      <rect x="20" y="36" width="26" height="16" rx="4" fill="#fff6e4" stroke="#fff" strokeWidth="3" />
      <path d="M14 36c6-3 8-8 18-8s14 5 18 8Z" fill="#f7b39d" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
      <rect x="26" y="40" width="7" height="7" rx="2" fill="#ffe9a8" stroke="#f3cf8c" strokeWidth="1.8" />
      <path d="M42 52v-9c0-3-2-5-4-5s-4 2-4 5v9Z" fill="#f2c488" stroke="#fff" strokeWidth="2" />
      <ellipse cx="32" cy="57" rx="17" ry="4.6" fill="#bfe3d3" stroke="#fff" strokeWidth="3" />
    </svg>
  );
}
