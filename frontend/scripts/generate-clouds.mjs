// Generates photo-realistic cumulus cloud textures (RGBA PNG, soft alpha edges)
// for the KiddoWorld Family sky. Pure Node — no image libraries.
//
// Pipeline per texture:
//   1. silhouette mask  — overlapping gaussian lobes with a flattish base
//   2. billow detail    — domain-warped fBm breaks up the silhouette like real
//                         cauliflower vapor and tears the edges irregularly
//   3. thickness field  — multi-pass box blur ≈ how deep the point sits in cloud
//   4. lighting         — surface normal from the thickness gradient lit by a
//                         fixed upper-left sun → lit tops, cool shadowed crevices
//   5. albedo           — white highlights → pale ice-blue shadow, slight cool
//                         bluish base, faint micro turbulence (anti-banding)
//   6. alpha            — smooth shoulder curve, fully transparent outside
//
// Output: public/clouds/cloud-*.png (+ temporary preview-sheet.png when --preview)
// Run: node scripts/generate-clouds.mjs [--preview]

import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", "public", "clouds");
mkdirSync(OUT, { recursive: true });
const WITH_PREVIEW = process.argv.includes("--preview");

/* --------------------------------- png ---------------------------------- */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const out = Buffer.alloc(8 + data.length + 4);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "ascii");
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}

function filterRow(filter, row, prev, stride) {
  const out = Buffer.alloc(stride);
  const bpp = 4;
  for (let i = 0; i < stride; i++) {
    const x = row[i];
    const a = i >= bpp ? row[i - bpp] : 0;
    const b = prev ? prev[i] : 0;
    const c = prev && i >= bpp ? prev[i - bpp] : 0;
    let v;
    if (filter === 0) v = x;
    else if (filter === 1) v = x - a;
    else if (filter === 2) v = x - b;
    else if (filter === 3) v = x - ((a + b) >> 1);
    else {
      const p = (a + b - c) & 0xff;
      const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
      v = x - (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
    }
    out[i] = v & 0xff;
  }
  return out;
}

function encodePNG(width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type RGBA
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    const row = rgba.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? rgba.subarray((y - 1) * stride, y * stride) : null;
    let best = null, bestCost = Infinity, bestFilter = 0;
    for (let f = 0; f < 5; f++) {
      const fb = filterRow(f, row, prev, stride);
      let cost = 0;
      for (let i = 0; i < stride; i++) { const v = fb[i]; cost += v < 128 ? v : 256 - v; }
      if (cost < bestCost) { bestCost = cost; best = fb; bestFilter = f; }
    }
    const off = y * (stride + 1);
    raw[off] = bestFilter;
    best.copy(raw, off + 1);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/* -------------------------------- noise --------------------------------- */

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);

function hash2(ix, iy, seed) {
  let h = Math.imul(ix, 0x27d4eb2d) ^ Math.imul(iy, 0x165667b1) ^ Math.imul(seed, 0x9e3779b1);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

function vnoise(x, y, seed) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const wx = fade(x - ix), wy = fade(y - iy);
  const n00 = hash2(ix, iy, seed), n10 = hash2(ix + 1, iy, seed);
  const n01 = hash2(ix, iy + 1, seed), n11 = hash2(ix + 1, iy + 1, seed);
  return (n00 * (1 - wx) + n10 * wx) * (1 - wy) + (n01 * (1 - wx) + n11 * wx) * wy;
}

function fbm(x, y, seed, octaves, gain = 0.54) {
  let sum = 0, amp = 0.5, freq = 1, norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += amp * vnoise(x * freq, y * freq, seed + o * 131);
    norm += amp;
    amp *= gain;
    freq *= 2.07;
  }
  return sum / norm;
}

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smoothstep = (a, b, v) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const mix = (a, b, t) => a + (b - a) * t;

/* ------------------------------- blurring ------------------------------- */

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

function boxPass(src, dst, w, h, r, vertical) {
  const span = r * 2 + 1;
  if (vertical) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      for (let y = -r; y <= r; y++) sum += src[clamp(y, 0, h - 1) * w + x];
      for (let y = 0; y < h; y++) {
        dst[y * w + x] = sum / span;
        const out = clamp(y - r, 0, h - 1), inn = clamp(y + r + 1, 0, h - 1);
        sum += src[inn * w + x] - src[out * w + x];
      }
    }
  } else {
    for (let y = 0; y < h; y++) {
      const row = y * w;
      let sum = 0;
      for (let x = -r; x <= r; x++) sum += src[row + clamp(x, 0, w - 1)];
      for (let x = 0; x < w; x++) {
        dst[row + x] = sum / span;
        const out = clamp(x - r, 0, w - 1), inn = clamp(x + r + 1, 0, w - 1);
        sum += src[row + inn] - src[row + out];
      }
    }
  }
}

function blurField(field, w, h, r, passes = 3) {
  const tmp = new Float32Array(field.length);
  for (let p = 0; p < passes; p++) {
    boxPass(field, tmp, w, h, r, false);
    boxPass(tmp, field, w, h, r, true);
  }
}

/* ------------------------------ sky palette ----------------------------- */

const SUN = { x: -0.42, y: -0.68, z: 0.6 }; // fixed sun, upper-left
const COL_SHADOW = [193, 209, 231];
const COL_MID = [234, 241, 250];
const COL_LIT = [255, 255, 255];
const COL_BASE_TINT = [206, 221, 240];

/* ---------------------------- texture painter --------------------------- */

function renderCloud(t) {
  const { w, h, seed, blobs, cut, blurR, billowScale, warp, octaves, rim, softLight, alphaFloor } = t;
  const n = w * h;
  const mask = new Float32Array(n);
  const rng = mulberry32(seed);
  const jitter = t.jitter ?? 0.012;
  let badLit = 0, badColor = 0, badAlpha = 0;

  // 1 — silhouette mask from gaussian lobes (fractions of w/h)
  for (const b of blobs) {
    const cx = (b.cx + (rng() - 0.5) * jitter) * w;
    const cy = (b.cy + (rng() - 0.5) * jitter) * h;
    const rx = Math.max(6, (b.rx + (rng() - 0.5) * jitter) * w);
    const ry = Math.max(6, (b.ry + (rng() - 0.5) * jitter) * h);
    const x0 = clamp(Math.floor(cx - rx * 1.35), 0, w - 1);
    const x1 = clamp(Math.ceil(cx + rx * 1.35), 0, w - 1);
    const y0 = clamp(Math.floor(cy - ry * 1.35), 0, h - 1);
    const y1 = clamp(Math.ceil(cy + ry * 1.35), 0, h - 1);
    for (let py = y0; py <= y1; py++) {
      const ny = (py - cy) / ry;
      const rowOff = py * w;
      for (let px = x0; px <= x1; px++) {
        const nx = (px - cx) / rx;
        const d2 = nx * nx + ny * ny;
        if (d2 < 6.5) mask[rowOff + px] += Math.exp(-d2 * 1.35);
      }
    }
  }

  const alpha = new Float32Array(n);
  const yCut = cut * h;
  const baseSoft = h * 0.1;
  const bs = billowScale / w; // noise frequency per texel
  const wbs = billowScale * 0.7 / w;

  // 2+6 — billow-modulated density → alpha
  for (let py = 0; py < h; py++) {
    const rowOff = py * w;
    // near the base the vapor is compact: reduce billow tearing so the
    // underside stays solid like a real cumulus base
    const solidity = 1 - 0.72 * smoothstep(yCut * 0.5, yCut, py);
    for (let px = 0; px < w; px++) {
      const m = mask[rowOff + px];
      if (m <= 0.003) continue;
      const wx = (fbm(px * wbs, py * wbs, seed + 900, 3) - 0.5) * warp;
      const wy = (fbm(px * wbs + 40, py * wbs + 40, seed + 901, 3) - 0.5) * warp;
      const billow = fbm(px * bs + wx, py * bs + wy, seed, octaves);
      // base cut — cumulus bottoms are flat-ish
      const under = smoothstep(yCut, yCut + baseSoft, py);
      const density = m * (0.72 + 0.6 * (billow - 0.5) * solidity) * (1 - under * 0.92);
      let a = smoothstep(alphaFloor, alphaFloor + 0.52, density);
      a = Math.pow(a, 0.9);
      alpha[rowOff + px] = a;
    }
  }

  // 3 — thickness = blurred coverage
  const thick = Float32Array.from(alpha);
  blurField(thick, w, h, blurR, 3);

  // 4+5 — light the heightfield and write RGBA
  const rgba = Buffer.alloc(n * 4);
  const microScale = billowScale * 2.6 / w;
  for (let py = 0; py < h; py++) {
    const rowOff = py * w;
    for (let px = 0; px < w; px++) {
      const i = rowOff + px;
      const a = alpha[i];
      if (a <= 0.004) continue;

      const sx = clamp(px + 2, 0, w - 1), spx = clamp(px - 2, 0, w - 1);
      const sy = clamp(py + 2, 0, h - 1), spy = clamp(py - 2, 0, h - 1);
      const dTx = thick[i + (sx - px)] - thick[i + (spx - px)];
      const dTy = thick[i + (sy - py) * w] - thick[i + (spy - py) * w];
      // heightfield normal: rising thickness tilts the normal away from the
      // slope, so upper/left faces catch the upper-left sun
      let nlx = -dTx, nly = -dTy, nlz = 34 / (blurR * 2.4);
      const len = Math.sqrt(nlx * nlx + nly * nly + nlz * nlz);
      nlx /= len; nly /= len; nlz /= len;
      let lit = 0.54 + 0.52 * (nlx * SUN.x + nly * SUN.y + nlz * SUN.z);
      lit += rim * Math.pow(clamp01(lit), 6); // faint hot rim on top edges
      // micro turbulence keeps large gradients from banding
      const micro = (fbm(px * microScale, py * microScale, seed + 700, 2) - 0.5) * 0.07;
      lit = clamp01(lit + micro);
      if (!Number.isFinite(lit)) { badLit++; continue; }

      // albedo: deep crevices → pale blue, mid → ice white, peaks → white
      let r = mix(COL_SHADOW[0], COL_MID[0], smoothstep(0.12, 0.72, lit));
      let g = mix(COL_SHADOW[1], COL_MID[1], smoothstep(0.12, 0.72, lit));
      let b = mix(COL_SHADOW[2], COL_MID[2], smoothstep(0.12, 0.72, lit));
      const peak = smoothstep(0.8, 1.0, lit) * 0.92;
      r = mix(r, COL_LIT[0], peak); g = mix(g, COL_LIT[1], peak); b = mix(b, COL_LIT[2], peak);
      // cool, slightly denser air toward the base
      const baseTint = smoothstep(h * 0.42, h * 0.88, py) * 0.4;
      r = mix(r, COL_BASE_TINT[0], baseTint);
      g = mix(g, COL_BASE_TINT[1], baseTint);
      b = mix(b, COL_BASE_TINT[2], baseTint);
      if (softLight) { r = mix(r, 255, 0.18); g = mix(g, 254, 0.18); b = mix(b, 253, 0.18); }
      if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b)) { badColor++; continue; }

      const o = i * 4;
      const ab = Math.round(a * 255);
      if (!Number.isFinite(ab)) { badAlpha++; continue; }
      rgba[o] = r; rgba[o + 1] = g; rgba[o + 2] = b; rgba[o + 3] = ab;
    }
  }
  if (badLit || badColor || badAlpha) {
    console.log(`  [warn] ${t.file}: badLit=${badLit} badColor=${badColor} badAlpha=${badAlpha}`);
  }
  return rgba;
}

/* --------------------------- texture definitions ------------------------ */

const LIGHT = { octaves: 5, rim: 0.16, softLight: false, alphaFloor: 0.12 };

export const TEXTURES = [
  {
    file: "cloud-a", w: 760, h: 480, seed: 111, // classic twin-cumulus, foreground
    blobs: [
      { cx: 0.26, cy: 0.5, rx: 0.13, ry: 0.17 },
      { cx: 0.43, cy: 0.36, rx: 0.15, ry: 0.2 },
      { cx: 0.62, cy: 0.32, rx: 0.17, ry: 0.22 },
      { cx: 0.78, cy: 0.44, rx: 0.13, ry: 0.17 },
      { cx: 0.88, cy: 0.56, rx: 0.08, ry: 0.1 },
      { cx: 0.12, cy: 0.62, rx: 0.09, ry: 0.11 },
      { cx: 0.34, cy: 0.2, rx: 0.07, ry: 0.09 },
    ],
    cut: 0.78, blurR: 44, billowScale: 6.2, warp: 0.34, ...LIGHT,
  },
  {
    file: "cloud-b", w: 860, h: 430, seed: 211, // long layered bank, middle distance
    blobs: [
      { cx: 0.12, cy: 0.62, rx: 0.1, ry: 0.12 },
      { cx: 0.27, cy: 0.5, rx: 0.12, ry: 0.14 },
      { cx: 0.45, cy: 0.4, rx: 0.14, ry: 0.15 },
      { cx: 0.63, cy: 0.46, rx: 0.13, ry: 0.14 },
      { cx: 0.79, cy: 0.56, rx: 0.12, ry: 0.12 },
      { cx: 0.91, cy: 0.64, rx: 0.07, ry: 0.09 },
      { cx: 0.36, cy: 0.24, rx: 0.09, ry: 0.1 },
      { cx: 0.58, cy: 0.22, rx: 0.08, ry: 0.09 },
    ],
    cut: 0.74, blurR: 42, billowScale: 7, warp: 0.36, ...LIGHT,
  },
  {
    file: "cloud-c", w: 760, h: 500, seed: 309, // tall two-tower cumulus
    blobs: [
      { cx: 0.3, cy: 0.42, rx: 0.15, ry: 0.22 },
      { cx: 0.34, cy: 0.22, rx: 0.09, ry: 0.12 },
      { cx: 0.68, cy: 0.38, rx: 0.15, ry: 0.21 },
      { cx: 0.72, cy: 0.18, rx: 0.07, ry: 0.09 },
      { cx: 0.5, cy: 0.58, rx: 0.16, ry: 0.14 },
      { cx: 0.16, cy: 0.6, rx: 0.08, ry: 0.1 },
      { cx: 0.86, cy: 0.58, rx: 0.09, ry: 0.11 },
    ],
    cut: 0.8, blurR: 46, billowScale: 5.6, warp: 0.38, ...LIGHT,
  },
  {
    file: "cloud-g", w: 760, h: 520, seed: 707, // dramatic multi-tier foreground
    blobs: [
      { cx: 0.22, cy: 0.56, rx: 0.13, ry: 0.16 },
      { cx: 0.38, cy: 0.36, rx: 0.14, ry: 0.18 },
      { cx: 0.3, cy: 0.18, rx: 0.08, ry: 0.1 },
      { cx: 0.56, cy: 0.46, rx: 0.16, ry: 0.17 },
      { cx: 0.74, cy: 0.3, rx: 0.12, ry: 0.15 },
      { cx: 0.86, cy: 0.5, rx: 0.1, ry: 0.13 },
      { cx: 0.64, cy: 0.14, rx: 0.06, ry: 0.08 },
      { cx: 0.1, cy: 0.68, rx: 0.07, ry: 0.09 },
    ],
    cut: 0.8, blurR: 48, billowScale: 5.2, warp: 0.4, ...LIGHT,
  },
  {
    file: "cloud-d", w: 620, h: 380, seed: 533, // medium fluff
    blobs: [
      { cx: 0.28, cy: 0.5, rx: 0.14, ry: 0.18 },
      { cx: 0.5, cy: 0.38, rx: 0.15, ry: 0.18 },
      { cx: 0.72, cy: 0.5, rx: 0.13, ry: 0.15 },
      { cx: 0.86, cy: 0.62, rx: 0.08, ry: 0.1 },
      { cx: 0.14, cy: 0.62, rx: 0.09, ry: 0.11 },
      { cx: 0.42, cy: 0.24, rx: 0.06, ry: 0.08 },
    ],
    cut: 0.8, blurR: 34, billowScale: 5, warp: 0.36, ...LIGHT,
  },
  {
    file: "cloud-e", w: 520, h: 330, seed: 661, // small mid puff
    blobs: [
      { cx: 0.3, cy: 0.52, rx: 0.14, ry: 0.19 },
      { cx: 0.52, cy: 0.4, rx: 0.15, ry: 0.19 },
      { cx: 0.74, cy: 0.54, rx: 0.13, ry: 0.16 },
      { cx: 0.88, cy: 0.66, rx: 0.07, ry: 0.09 },
      { cx: 0.16, cy: 0.64, rx: 0.08, ry: 0.1 },
    ],
    cut: 0.8, blurR: 28, billowScale: 4.2, warp: 0.34, ...LIGHT,
  },
  {
    file: "cloud-f", w: 420, h: 260, seed: 811, // distant soft cumulus
    blobs: [
      { cx: 0.3, cy: 0.48, rx: 0.15, ry: 0.22 },
      { cx: 0.54, cy: 0.38, rx: 0.16, ry: 0.24 },
      { cx: 0.74, cy: 0.5, rx: 0.12, ry: 0.18 },
      { cx: 0.9, cy: 0.6, rx: 0.07, ry: 0.1 },
      { cx: 0.15, cy: 0.6, rx: 0.08, ry: 0.11 },
    ],
    cut: 0.8, blurR: 22, billowScale: 3.6, warp: 0.3,
    rim: 0.1, softLight: true, alphaFloor: 0.16, octaves: 5,
  },
  {
    file: "cloud-h", w: 360, h: 230, seed: 971, // far wispy stretched band
    blobs: [
      { cx: 0.26, cy: 0.5, rx: 0.18, ry: 0.2 },
      { cx: 0.5, cy: 0.42, rx: 0.18, ry: 0.22 },
      { cx: 0.72, cy: 0.5, rx: 0.15, ry: 0.18 },
      { cx: 0.88, cy: 0.58, rx: 0.08, ry: 0.1 },
    ],
    cut: 0.78, blurR: 20, billowScale: 3, warp: 0.52,
    rim: 0.08, softLight: true, alphaFloor: 0.18, octaves: 5,
  },
];

/* ------------------------------ write assets ---------------------------- */

const results = [];
for (const t of TEXTURES) {
  const rgba = renderCloud(t);
  const png = encodePNG(t.w, t.h, rgba);
  writeFileSync(join(OUT, `${t.file}.png`), png);
  results.push({ file: t.file, bytes: png.length });
  console.log(`${t.file}.png  ${t.w}x${t.h}  ${(png.length / 1024).toFixed(0)} KB`);
}
const total = results.reduce((s, r) => s + r.bytes, 0);
console.log(`total: ${(total / 1024).toFixed(0)} KB`);

/* --------------------------- preview contact sheet ---------------------- */

if (WITH_PREVIEW) {
  const SW = 940;
  const rows = [];
  let y = 0;
  const placements = TEXTURES.map((t, i) => {
    if (i % 2 === 0 && i > 0) y += 210;
    return { t, x: i % 2 === 0 ? 10 : 480, y };
  });
  const SH = y + 240;
  const sheet = Buffer.alloc(SH * SW * 4);
  for (let py = 0; py < SH; py++) {
    for (let px = 0; px < SW; px++) {
      const o = (py * SW + px) * 4;
      const v = 1 - py / SH;
      sheet[o] = mix(142, 196, v);
      sheet[o + 1] = mix(194, 226, v);
      sheet[o + 2] = mix(238, 250, v);
      sheet[o + 3] = 255;
    }
  }
  for (const { t, x, y } of placements) {
    const rgba = renderCloud(t) || null;
    const s = Math.min(0.42, 430 / t.w, 190 / t.h);
    const dw = Math.round(t.w * s), dh = Math.round(t.h * s);
    for (let py = 0; py < dh; py++) {
      for (let px = 0; px < dw; px++) {
        const sx = (px + 0.5) / s - 0.5, sy = (py + 0.5) / s - 0.5;
        const x0 = clamp(Math.floor(sx), 0, t.w - 1), x1 = clamp(x0 + 1, 0, t.w - 1);
        const y0 = clamp(Math.floor(sy), 0, t.h - 1), y1 = clamp(y0 + 1, 0, t.h - 1);
        const tx = clamp01(sx - Math.floor(sx)), ty = clamp01(sy - Math.floor(sy));
        const i00 = (y0 * t.w + x0) * 4, i10 = (y0 * t.w + x1) * 4;
        const i01 = (y1 * t.w + x0) * 4, i11 = (y1 * t.w + x1) * 4;
        const fa = mix(mix(rgba[i00 + 3], rgba[i10 + 3], tx), mix(rgba[i01 + 3], rgba[i11 + 3], tx), ty) / 255;
        if (fa <= 0.002) continue;
        const o = ((y + py) * SW + (x + px)) * 4;
        if (o < 0 || o >= sheet.length) continue;
        const inv = 1 - fa;
        sheet[o] = rgba[i00] * fa + sheet[o] * inv;
        sheet[o + 1] = rgba[i00 + 1] * fa + sheet[o + 1] * inv;
        sheet[o + 2] = rgba[i00 + 2] * fa + sheet[o + 2] * inv;
        sheet[o + 3] = 255;
      }
    }
    console.log(`preview: ${t.file} at ${x},${y}`);
  }
  writeFileSync(join(OUT, "preview-sheet.png"), encodePNG(SW, SH, sheet));
  console.log("preview-sheet.png written");
}
