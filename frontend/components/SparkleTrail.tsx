"use client";

import { useEffect, useRef } from "react";

const SPARKLE_COLORS = ["#ffe066", "#8fe3c0", "#b38bff", "#9dcaff", "#ffb3c8", "#ff9f5a"];
const SPAWN_DISTANCE_PX = 26;
const MAX_SPARKLES = 42;

/**
 * A playful sparkle trail that follows the mouse pointer.
 * Sparkles rise, spin, and fade away. Disabled for touch devices
 * and for visitors who prefer reduced motion.
 */
export default function SparkleTrail() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    if (reducedMotion.matches || coarsePointer.matches) return;

    let lastSpawn = { x: -999, y: -999 };
    let activeSparkles = 0;

    const spawnSparkle = (clientX: number, clientY: number) => {
      if (activeSparkles >= MAX_SPARKLES) return;

      const sparkle = document.createElement("span");
      sparkle.className = "sparkle-trail-bit";
      sparkle.textContent = Math.random() > 0.5 ? "✦" : "✧";
      sparkle.style.left = `${clientX + (Math.random() * 18 - 9)}px`;
      sparkle.style.top = `${clientY + (Math.random() * 18 - 9)}px`;
      sparkle.style.color = SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)];
      sparkle.style.fontSize = `${8 + Math.random() * 9}px`;

      activeSparkles += 1;
      sparkle.addEventListener(
        "animationend",
        () => {
          sparkle.remove();
          activeSparkles -= 1;
        },
        { once: true },
      );
      container.appendChild(sparkle);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const deltaX = event.clientX - lastSpawn.x;
      const deltaY = event.clientY - lastSpawn.y;
      if (deltaX * deltaX + deltaY * deltaY < SPAWN_DISTANCE_PX * SPAWN_DISTANCE_PX) return;
      lastSpawn = { x: event.clientX, y: event.clientY };
      spawnSparkle(event.clientX, event.clientY);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  return <div ref={containerRef} className="sparkle-trail" aria-hidden="true" />;
}
