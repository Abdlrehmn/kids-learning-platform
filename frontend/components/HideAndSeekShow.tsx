"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import { createPortal } from "react-dom";

export type HideAndSeekPhase =
  | "waiting"
  | "peeking-left"
  | "hiding-left"
  | "peeking-right"
  | "hiding-right"
  | "peeking-around"
  | "hiding-around"
  | "sneaking-in"
  | "taking-star"
  | "escaping"
  | "hidden"
  | "returning"
  | "hiding-island";

export type HideAndSeekTarget =
  | "planet-cloud-left"
  | "planet-cloud-right"
  | "cloud-left"
  | "cloud-right"
  | "hero-rider"
  | "benefit-strip"
  | "nav-pill"
  | "zone-typing"
  | "zone-english"
  | "zone-games"
  | "zone-rewards"
  | "screen-edge-left"
  | "screen-edge-right"
  | "island";

export type StarPosition = "home" | "taking" | "carried" | "hidden" | "returning";

export interface HideAndSeekState {
  phase: HideAndSeekPhase;
  target: HideAndSeekTarget | null;
  cycle: number;
  starPosition: StarPosition;
  reduceMotion: boolean;
  isSmallScreen: boolean;
}

interface HideAndSeekStep {
  phase: HideAndSeekPhase;
  target: HideAndSeekTarget | null;
  duration: number;
  starPosition: StarPosition;
}

interface HideAndSeekRun {
  steps: HideAndSeekStep[];
  index: number;
  cycle: number;
}

const DOM_TARGETS: HideAndSeekTarget[] = [
  "cloud-left",
  "cloud-right",
  "hero-rider",
  "benefit-strip",
  "nav-pill",
  "zone-typing",
  "zone-english",
  "zone-games",
  "zone-rewards",
  "screen-edge-left",
  "screen-edge-right",
];

export const HEIST_PHASE_DURATIONS: Record<Exclude<HideAndSeekPhase, "waiting">, number> = {
  "peeking-left": 1450,
  "hiding-left": 560,
  "peeking-right": 1450,
  "hiding-right": 560,
  "peeking-around": 1900,
  "hiding-around": 600,
  "sneaking-in": 2350,
  "taking-star": 820,
  escaping: 2350,
  hidden: 2200,
  returning: 900,
  "hiding-island": 2100,
};

export const ACTOR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="216" height="224" viewBox="0 0 108 112">
<defs><linearGradient id="jacket" x1="34" y1="55" x2="69" y2="91" gradientUnits="userSpaceOnUse"><stop stop-color="#39d4dc"/><stop offset="1" stop-color="#2670dc"/></linearGradient><linearGradient id="hair" x1="38" y1="8" x2="70" y2="39" gradientUnits="userSpaceOnUse"><stop stop-color="#a95d47"/><stop offset="1" stop-color="#52354a"/></linearGradient></defs>
<ellipse cx="51" cy="105" rx="25" ry="4" fill="#193f90" opacity=".16"/><path d="M29 53c-7 1-11 7-11 15l1 12 16 5 8-24Z" fill="#f3a24c" stroke="#bd6a46" stroke-width="3"/><path d="m23 63 17-3-1 9-16 4Z" fill="#ffe17b"/><path d="m39 84-8 13c-2 4 1 7 5 6l13-11 3-8Zm22 1 9 13c3 4 7 3 9-1l-9-18Z" fill="#385aa7" stroke="#263e79" stroke-width="3" stroke-linejoin="round"/><path d="m31 98 16-9 5 4-10 11c-4 4-12 2-11-3Zm35-3 9 7c4 3 10 0 8-4l-8-9Z" fill="#fff" stroke="#7184c5" stroke-width="3" stroke-linejoin="round"/><path d="M37 53c6-7 17-9 27-4l8 7-2 28c-12 9-28 8-39-1l-1-19c0-5 2-9 7-11Z" fill="url(#jacket)" stroke="#2764bb" stroke-width="3" stroke-linejoin="round"/><path d="M39 58c-7-1-12 3-17 8l-5 6c-3 4 1 8 5 6l15-10m29-16c7-7 13-12 20-17l8-7c3-2 6 1 4 4l-4 5 7-3c3-1 5 3 2 5l-8 7-13 13-12 8Z" fill="url(#jacket)" stroke="#2764bb" stroke-width="3" stroke-linejoin="round"/><path d="M79 44c4-3 8-5 12-7 4-2 7 2 4 5l-5 5 5-1c4 0 5 4 1 6l-10 4c-4 2-8 1-11-2Z" fill="#f6bc91" stroke="#d98b6b" stroke-width="2" stroke-linejoin="round"/><path d="M41 22c2-10 12-16 23-14 11 2 17 11 16 22l-4 16c-3 8-12 13-22 11-10-2-16-10-15-20Z" fill="#f6c092" stroke="#d98b6b" stroke-width="2"/><path d="M38 34c-4-7-3-17 3-23 5-7 14-10 23-8 6-4 14 0 16 6 8 4 11 13 7 21-4-5-9-8-16-9-8 8-19 10-29 7l-3 10Z" fill="url(#hair)"/><path d="M48 32c3-2 7-2 10 0m9-1c3-2 7-1 9 1" fill="none" stroke="#563a4a" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="54" cy="39" rx="3.2" ry="4.6" fill="#fff"/><ellipse cx="72" cy="38" rx="3.2" ry="4.6" fill="#fff"/><ellipse cx="55" cy="40" rx="1.7" ry="2.6" fill="#3a5789"/><ellipse cx="73" cy="39" rx="1.7" ry="2.6" fill="#3a5789"/><circle cx="55.5" cy="39" r=".9" fill="#fff"/><circle cx="73.5" cy="38" r=".9" fill="#fff"/><path d="M62 43c-2 4-1 6 2 6m-8 5c5 4 11 4 15-1" fill="none" stroke="#a64e51" stroke-width="2.5" stroke-linecap="round"/><path d="m48 27 10-2m10 0 8 2" stroke="#593a48" stroke-width="3" stroke-linecap="round"/>
</svg>`;

export const ACTOR_SVG_DATA_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(ACTOR_SVG)}`;

const HideAndSeekContext = createContext<HideAndSeekState>({
  phase: "waiting",
  target: null,
  cycle: 0,
  starPosition: "home",
  reduceMotion: false,
  isSmallScreen: false,
});

function shuffledTargets(): HideAndSeekTarget[] {
  const targets = [...DOM_TARGETS];
  for (let index = targets.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [targets[index], targets[swap]] = [targets[swap], targets[index]];
  }
  return targets;
}

function createRun(cycle: number, isInitial: boolean, isSmallScreen: boolean): HideAndSeekRun {
  const shuffled = shuffledTargets();
  const pagePeeks = shuffled.slice(0, isSmallScreen ? 2 : 3);
  const steps: HideAndSeekStep[] = [];
  const add = (
    phase: HideAndSeekPhase,
    target: HideAndSeekTarget | null,
    duration: number,
    starPosition: StarPosition = "home",
  ) => steps.push({ phase, target, duration, starPosition });

  add("peeking-left", "planet-cloud-left", HEIST_PHASE_DURATIONS["peeking-left"]);
  add("hiding-left", "planet-cloud-left", HEIST_PHASE_DURATIONS["hiding-left"]);
  if (!isSmallScreen) {
    add("peeking-right", "planet-cloud-right", HEIST_PHASE_DURATIONS["peeking-right"]);
    add("hiding-right", "planet-cloud-right", HEIST_PHASE_DURATIONS["hiding-right"]);
  }
  for (const target of pagePeeks) {
    add("peeking-around", target, HEIST_PHASE_DURATIONS["peeking-around"]);
    add("hiding-around", target, HEIST_PHASE_DURATIONS["hiding-around"]);
  }
  add("sneaking-in", "island", HEIST_PHASE_DURATIONS["sneaking-in"]);
  add("taking-star", "island", HEIST_PHASE_DURATIONS["taking-star"], "taking");
  add("escaping", "planet-cloud-left", HEIST_PHASE_DURATIONS.escaping, "carried");
  add("hidden", shuffled[3] ?? "cloud-left", HEIST_PHASE_DURATIONS.hidden, "hidden");
  add("returning", "island", HEIST_PHASE_DURATIONS.returning, "returning");
  add("hiding-island", "island", HEIST_PHASE_DURATIONS["hiding-island"]);

  const activeDuration = steps.reduce((total, step) => total + step.duration, 0);
  const cycleDuration = 60_000 + Math.random() * 60_000;
  const waitingDuration = isInitial
    ? 8_500 + Math.random() * 4_000
    : Math.max(8_000, cycleDuration - activeDuration);

  return {
    steps: [{ phase: "waiting", target: null, duration: waitingDuration, starPosition: "home" }, ...steps],
    index: 0,
    cycle,
  };
}

function actorHostFor(target: HideAndSeekTarget): Element | null {
  if (target === "screen-edge-left" || target === "screen-edge-right") return document.body;
  if (target === "nav-pill") return document.querySelector(".space-header");
  if (target === "island" || target === "planet-cloud-left" || target === "planet-cloud-right") return null;
  return document.querySelector(`[data-hide-target="${target}"]`);
}

function ActorPeek({ phase, target }: { phase: HideAndSeekPhase; target: HideAndSeekTarget }) {
  return (
    <div
      className={`hide-show-actor hide-show-actor--${phase} hide-show-actor--${target}`}
      data-hide-side={target === "screen-edge-right" ? "right" : "left"}
      aria-hidden="true"
    >
      <Image src={ACTOR_SVG_DATA_URL} alt="" width={216} height={224} unoptimized draggable={false} />
    </div>
  );
}

export function useHideAndSeek(): HideAndSeekState {
  return useContext(HideAndSeekContext);
}

export default function HideAndSeekShow({ children }: { children: ReactNode }) {
  const [run, setRun] = useState<HideAndSeekRun>({
    steps: [{ phase: "waiting", target: null, duration: 0, starPosition: "home" }],
    index: 0,
    cycle: 0,
  });
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [actorHost, setActorHost] = useState<Element | null>(null);
  const smallScreenRef = useRef(false);
  const currentStep = run.steps[run.index] ?? run.steps[0];

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compactScreen = window.matchMedia("(max-width: 700px)");
    const updatePreferences = () => {
      smallScreenRef.current = compactScreen.matches;
      setReduceMotion(motionPreference.matches);
      setIsSmallScreen(compactScreen.matches);
    };
    const updatePageVisibility = () => setIsPageVisible(document.visibilityState !== "hidden");

    updatePreferences();
    updatePageVisibility();
    motionPreference.addEventListener("change", updatePreferences);
    compactScreen.addEventListener("change", updatePreferences);
    document.addEventListener("visibilitychange", updatePageVisibility);

    return () => {
      motionPreference.removeEventListener("change", updatePreferences);
      compactScreen.removeEventListener("change", updatePreferences);
      document.removeEventListener("visibilitychange", updatePageVisibility);
    };
  }, []);

  useEffect(() => {
    if (reduceMotion || !isPageVisible) return;

    const timeoutId = window.setTimeout(() => {
      if (run.steps.length === 1 && currentStep.duration === 0) {
        setRun(createRun(0, true, smallScreenRef.current));
        return;
      }

      const nextIndex = run.index + 1;
      if (nextIndex < run.steps.length) {
        const nextStep = run.steps[nextIndex];
        const nextCycle = run.cycle + (nextStep.phase === "taking-star" ? 1 : 0);
        setActorHost(nextStep.target && (nextStep.phase === "peeking-around" || nextStep.phase === "hiding-around")
          ? actorHostFor(nextStep.target)
          : null);
        setRun({ ...run, index: nextIndex, cycle: nextCycle });
      } else {
        setActorHost(null);
        setRun(createRun(run.cycle, false, smallScreenRef.current));
      }
    }, currentStep.duration);

    return () => window.clearTimeout(timeoutId);
  }, [currentStep, isPageVisible, reduceMotion, run]);

  const phase = reduceMotion ? "waiting" : currentStep.phase;
  const target = reduceMotion ? null : currentStep.target;
  const starPosition = reduceMotion ? "home" : currentStep.starPosition;
  const isPeeking = phase === "peeking-around" || phase === "hiding-around";

  const contextValue: HideAndSeekState = {
    phase,
    target,
    cycle: run.cycle,
    starPosition,
    reduceMotion,
    isSmallScreen,
  };

  const actor = actorHost && target && isPeeking && isPageVisible
    ? createPortal(<ActorPeek phase={phase} target={target} />, actorHost)
    : null;

  return (
    <HideAndSeekContext.Provider value={contextValue}>
      {children}
      {actor}
    </HideAndSeekContext.Provider>
  );
}
