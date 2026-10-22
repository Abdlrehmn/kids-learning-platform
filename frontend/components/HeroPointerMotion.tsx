"use client";

import { useEffect, useRef, type ReactNode } from "react";

type HeroPointerMotionProps = {
  children: ReactNode;
};

type PointerPosition = {
  x: number;
  y: number;
};

function clamp(value: number) {
  return Math.max(-1, Math.min(1, value));
}

export default function HeroPointerMotion({ children }: HeroPointerMotionProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const surface = surfaceRef.current;
    const world = surface?.closest<HTMLElement>(".space-home");
    if (!surface || !world) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    const compactScreen = window.matchMedia("(max-width: 700px)");
    const target: PointerPosition = { x: 0, y: 0 };
    const current: PointerPosition = { x: 0, y: 0 };
    let canTrackPointer = false;
    let frameId: number | null = null;
    let lastFrameTime = 0;

    const writeMotion = () => {
      surface.style.setProperty("--rider-x", `${(current.x * 11).toFixed(2)}px`);
      surface.style.setProperty("--rider-y", `${(current.y * 7).toFixed(2)}px`);
      surface.style.setProperty("--rider-tilt", `${(current.x * 2.4 - current.y * 0.45).toFixed(2)}deg`);
      surface.style.setProperty("--planet-x", `${(current.x * -2.5).toFixed(2)}px`);
      surface.style.setProperty("--planet-y", `${(current.y * -2).toFixed(2)}px`);
      world.style.setProperty("--world-drift-x", `${(current.x * -2.4).toFixed(2)}px`);
      world.style.setProperty("--world-drift-y", `${(current.y * -1.8).toFixed(2)}px`);
      world.style.setProperty("--world-near-x", `${(current.x * -4.5).toFixed(2)}px`);
      world.style.setProperty("--world-near-y", `${(current.y * -3.5).toFixed(2)}px`);
      world.style.setProperty("--world-cloud-x", `${(current.x * -6).toFixed(2)}px`);
      world.style.setProperty("--world-cloud-y", `${(current.y * -4).toFixed(2)}px`);
    };

    const animate = (time: number) => {
      frameId = null;
      const elapsed = Math.min(time - (lastFrameTime || time - 16), 32);
      const easing = 1 - Math.exp(-elapsed / 82);
      lastFrameTime = time;
      current.x += (target.x - current.x) * easing;
      current.y += (target.y - current.y) * easing;

      const settled = Math.abs(target.x - current.x) < 0.002 && Math.abs(target.y - current.y) < 0.002;
      if (settled) {
        current.x = target.x;
        current.y = target.y;
      }

      writeMotion();
      if (!settled) frameId = window.requestAnimationFrame(animate);
    };

    const scheduleMotion = () => {
      if (canTrackPointer && frameId === null) frameId = window.requestAnimationFrame(animate);
    };

    const resetMotion = () => {
      target.x = 0;
      target.y = 0;
      scheduleMotion();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!canTrackPointer || !event.isPrimary || (event.pointerType !== "mouse" && event.pointerType !== "pen")) return;
      const bounds = surface.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;

      target.x = clamp(((event.clientX - bounds.left) / bounds.width) * 2 - 1);
      target.y = clamp(((event.clientY - bounds.top) / bounds.height) * 2 - 1);
      scheduleMotion();
    };

    const updateMotionPreference = () => {
      canTrackPointer = !reducedMotion.matches && !coarsePointer.matches && !compactScreen.matches;
      if (canTrackPointer) return;

      target.x = 0;
      target.y = 0;
      current.x = 0;
      current.y = 0;
      lastFrameTime = 0;
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      frameId = null;
      writeMotion();
    };

    surface.addEventListener("pointermove", onPointerMove, { passive: true });
    surface.addEventListener("pointerleave", resetMotion);
    surface.addEventListener("pointercancel", resetMotion);
    reducedMotion.addEventListener("change", updateMotionPreference);
    coarsePointer.addEventListener("change", updateMotionPreference);
    compactScreen.addEventListener("change", updateMotionPreference);
    updateMotionPreference();

    return () => {
      surface.removeEventListener("pointermove", onPointerMove);
      surface.removeEventListener("pointerleave", resetMotion);
      surface.removeEventListener("pointercancel", resetMotion);
      reducedMotion.removeEventListener("change", updateMotionPreference);
      coarsePointer.removeEventListener("change", updateMotionPreference);
      compactScreen.removeEventListener("change", updateMotionPreference);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      surface.style.removeProperty("--rider-x");
      surface.style.removeProperty("--rider-y");
      surface.style.removeProperty("--rider-tilt");
      surface.style.removeProperty("--planet-x");
      surface.style.removeProperty("--planet-y");
      world.style.removeProperty("--world-drift-x");
      world.style.removeProperty("--world-drift-y");
      world.style.removeProperty("--world-near-x");
      world.style.removeProperty("--world-near-y");
      world.style.removeProperty("--world-cloud-x");
      world.style.removeProperty("--world-cloud-y");
    };
  }, []);

  return (
    <div ref={surfaceRef} className="space-hero-pointer">
      {children}
    </div>
  );
}
