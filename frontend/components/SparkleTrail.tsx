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
    let lastSpawn = { x: -999, y: -999 };
    const activeSparkles = new Set<HTMLSpanElement>();
    let isTrackingPointer = false;

    const clearSparkles = () => {
      activeSparkles.forEach((sparkle) => sparkle.remove());
      activeSparkles.clear();
    };

    const spawnSparkle = (clientX: number, clientY: number) => {
      if (activeSparkles.size >= MAX_SPARKLES) return;

      const sparkle = document.createElement("span");
      sparkle.className = "sparkle-trail-bit";
      sparkle.textContent = Math.random() > 0.5 ? "✦" : "✧";
      sparkle.style.left = `${clientX + (Math.random() * 18 - 9)}px`;
      sparkle.style.top = `${clientY + (Math.random() * 18 - 9)}px`;
      sparkle.style.color = SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)];
      sparkle.style.fontSize = `${8 + Math.random() * 9}px`;

      activeSparkles.add(sparkle);
      sparkle.addEventListener(
        "animationend",
        () => {
          sparkle.remove();
          activeSparkles.delete(sparkle);
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

    const updatePointerTracking = () => {
      const shouldTrackPointer = !reducedMotion.matches && !coarsePointer.matches;
      if (shouldTrackPointer === isTrackingPointer) return;

      isTrackingPointer = shouldTrackPointer;
      lastSpawn = { x: -999, y: -999 };
      if (isTrackingPointer) {
        window.addEventListener("pointermove", handlePointerMove, { passive: true });
      } else {
        window.removeEventListener("pointermove", handlePointerMove);
        clearSparkles();
      }
    };

    reducedMotion.addEventListener("change", updatePointerTracking);
    coarsePointer.addEventListener("change", updatePointerTracking);
    updatePointerTracking();

    return () => {
      reducedMotion.removeEventListener("change", updatePointerTracking);
      coarsePointer.removeEventListener("change", updatePointerTracking);
      window.removeEventListener("pointermove", handlePointerMove);
      clearSparkles();
    };
  }, []);

  return <div ref={containerRef} className="sparkle-trail" aria-hidden="true" />;
}
