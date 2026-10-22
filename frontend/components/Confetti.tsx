"use client";

import { useEffect, useRef } from "react";

const CONFETTI_COLORS = ["#ff5c8a", "#ffd166", "#43e0ba", "#7bb0ff", "#b38bff", "#ff9f5a", "#ffe066"];

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Fire a round burst of confetti from a point in viewport coordinates. */
export function fireConfetti(originX: number, originY: number, count = 26) {
  if (typeof document === "undefined" || prefersReducedMotion()) return;

  for (let index = 0; index < count; index += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-bit";

    const angle = (Math.PI * 2 * index) / count + Math.random() * 0.7;
    const distance = 70 + Math.random() * 140;
    piece.style.setProperty("--cx", `${(Math.cos(angle) * distance).toFixed(1)}px`);
    piece.style.setProperty("--cy", `${(Math.sin(angle) * distance - 55).toFixed(1)}px`);
    piece.style.setProperty("--cr", `${Math.round(Math.random() * 540 - 270)}deg`);
    piece.style.left = `${originX}px`;
    piece.style.top = `${originY}px`;
    piece.style.background = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
    piece.style.animationDelay = `${(Math.random() * 0.12).toFixed(2)}s`;
    if (Math.random() > 0.5) piece.style.borderRadius = "50%";
    if (Math.random() > 0.7) piece.style.width = "8px";

    piece.addEventListener("animationend", () => piece.remove(), { once: true });
    document.body.appendChild(piece);
  }
}

/**
 * Big celebration: three confetti cannons across the viewport.
 * Fires once each time `active` turns true (e.g. a finished typing run).
 */
export default function CelebrationConfetti({ active }: { active: boolean }) {
  const hasFiredRef = useRef(false);

  useEffect(() => {
    if (!active) {
      hasFiredRef.current = false;
      return;
    }
    if (hasFiredRef.current || prefersReducedMotion()) return;
    hasFiredRef.current = true;

    const cannonCount = 3;
    const timeoutIds: number[] = [];
    for (let cannon = 0; cannon < cannonCount; cannon += 1) {
      const originX = window.innerWidth * (0.2 + cannon * 0.3);
      const originY = window.innerHeight * (0.32 + (cannon % 2) * 0.12);
      timeoutIds.push(window.setTimeout(() => fireConfetti(originX, originY, 34), cannon * 190));
    }

    return () => timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
  }, [active]);

  return null;
}
