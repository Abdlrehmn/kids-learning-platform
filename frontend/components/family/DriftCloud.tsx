"use client";

import { useId } from "react";

/**
 * Volumetric drifting cloud for the Family sky.
 *
 * Each cloud is built from layered puff spheres:
 *   1. a faint halo for the dreamy diffuse edge,
 *   2. a pale blue "shade" layer shifted down (the cloud's soft underside),
 *   3. the white body — every puff gets its own vertical gradient, which
 *      reads as genuine 3D shading rather than flat sticker circles,
 *   4. bright sunlit highlight puffs offset to the upper edge.
 *
 * Motion is split across two nested spans so transform-only, GPU-friendly
 * animations never conflict: the outer span travels across the whole sky
 * (seamless loop — both ends start off-screen), the inner span bobs subtly.
 * All timing variables come from CSS classes, so React renders once.
 */

type DriftCloudProps = {
  /** Puff arrangement — 1 = big cumulus, 2 = wide flat band, 3 = small cloud. */
  variant?: 1 | 2 | 3;
  /** Mirror the silhouette so clouds in the same layer don't look cloned. */
  flip?: boolean;
  /** Placement/travel classes from family.css (e.g. family-sky-cloud--near-1). */
  className?: string;
  /** Ambient decor (login card, overview art) that bobs but never travels. */
  travel?: boolean;
};

type Puff = { x: number; y: number; r: number };

const PUFF_SETS: Record<1 | 2 | 3, { puffs: Puff[]; band: { cx: number; cy: number; rx: number; ry: number } }> = {
  1: {
    puffs: [
      { x: 62, y: 116, r: 46 },
      { x: 112, y: 84, r: 58 },
      { x: 172, y: 74, r: 66 },
      { x: 232, y: 96, r: 52 },
      { x: 266, y: 124, r: 38 },
      { x: 292, y: 100, r: 18 },
    ],
    band: { cx: 160, cy: 130, rx: 122, ry: 40 },
  },
  2: {
    puffs: [
      { x: 74, y: 110, r: 52 },
      { x: 134, y: 88, r: 62 },
      { x: 200, y: 92, r: 56 },
      { x: 250, y: 114, r: 44 },
      { x: 286, y: 112, r: 20 },
    ],
    band: { cx: 160, cy: 132, rx: 128, ry: 36 },
  },
  3: {
    puffs: [
      { x: 86, y: 112, r: 48 },
      { x: 148, y: 92, r: 56 },
      { x: 204, y: 110, r: 44 },
      { x: 236, y: 118, r: 22 },
    ],
    band: { cx: 150, cy: 134, rx: 110, ry: 34 },
  },
};

export default function DriftCloud({ variant = 1, flip = false, className = "", travel = true }: DriftCloudProps) {
  // Unique, CSS-safe gradient ids per instance so clouds never share defs.
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const haloId = `cl-halo-${uid}`;
  const bodyId = `cl-body-${uid}`;
  const shadeId = `cl-shade-${uid}`;

  const { puffs, band } = PUFF_SETS[variant];
  const highlights = puffs
    .filter((puff, index) => index < puffs.length - 1)
    .map((puff) => ({ x: puff.x - puff.r * 0.16, y: puff.y - puff.r * 0.24, r: puff.r * 0.6 }));

  return (
    <span className={`family-cloud-base${travel ? " family-drift" : " family-static-cloud"} ${className}`.trim()}>
      <span className="family-sky-bob">
        <svg
          viewBox="0 0 320 190"
          aria-hidden="true"
          focusable="false"
          style={{ width: "100%", height: "auto", display: "block", overflow: "visible", transform: flip ? "scaleX(-1)" : undefined }}
        >
          <defs>
            <linearGradient id={bodyId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset=".55" stopColor="#fdfeff" />
              <stop offset="1" stopColor="#e9f2fb" />
            </linearGradient>
            <linearGradient id={shadeId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#d5e4f4" />
              <stop offset="1" stopColor="#bcd3ea" />
            </linearGradient>
            <radialGradient id={haloId}>
              <stop offset="0" stopColor="#ffffff" stopOpacity=".5" />
              <stop offset=".7" stopColor="#ffffff" stopOpacity=".28" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* dreamy halo */}
          <ellipse cx="158" cy="112" rx="152" ry="82" fill={`url(#${haloId})`} />

          {/* pale-blue underside */}
          <g fill={`url(#${shadeId})`} transform="translate(0 10)">
            <ellipse {...band} />
            {puffs.map((puff, index) => (
              <circle key={`shade-${index}`} cx={puff.x} cy={puff.y} r={puff.r} />
            ))}
          </g>

          {/* white body — every puff shades itself via its own gradient */}
          <g>
            <ellipse {...band} fill={`url(#${bodyId})`} />
            {puffs.map((puff, index) => (
              <circle key={`body-${index}`} cx={puff.x} cy={puff.y} r={puff.r} fill={`url(#${bodyId})`} />
            ))}
          </g>

          {/* sunlit highlight lumps */}
          <g fill="#ffffff" opacity=".92">
            {highlights.map((puff, index) => (
              <circle key={`hl-${index}`} cx={puff.x} cy={puff.y} r={puff.r} />
            ))}
          </g>
        </svg>
      </span>
    </span>
  );
}
