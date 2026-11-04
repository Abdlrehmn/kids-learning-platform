"use client";

import { useEffect, useState } from "react";
import { ROUNDS_PER_LEVEL, shuffle } from "@/components/games/gameEngine";
import GameFeedback from "@/components/games/challenges/GameFeedback";

export default function SequenceMemoryChallenge({ round, level, instruction, onCorrect, onNext }: { round: number; level: number; instruction: string; onCorrect: () => void; onNext: () => void }) {
  const sequences = [["🔵", "⭐", "🍀"], ["🐱", "🌙", "🍎"], ["🟣", "🟡", "🔷"], ["🚗", "🌼", "☁️"]];
  const sequence = sequences[(round + level) % sequences.length];
  const [showSequence, setShowSequence] = useState(true);
  const [status, setStatus] = useState<"idle" | "right" | "wrong">("idle");
  const [feedback, setFeedback] = useState("");
  useEffect(() => {
    if (!showSequence) return;
    const timer = window.setTimeout(() => setShowSequence(false), 1800);
    return () => window.clearTimeout(timer);
  }, [showSequence]);
  const options = shuffle([sequence[2], ...sequences.flat().filter((item) => item !== sequence[2]).slice(0, 3)], round + level);
  const choose = (value: string) => {
    if (status === "right") return;
    if (value === sequence[2]) { setStatus("right"); setFeedback("You remembered the last symbol!"); onCorrect(); }
    else { setStatus("wrong"); setFeedback("Not quite. Try to remember the order."); }
  };
  const retry = () => { setStatus("idle"); setFeedback(""); setShowSequence(true); };
  return <div className="game-round"><div className="game-question-heading"><small>Round {round + 1} of {ROUNDS_PER_LEVEL}</small><h3>Sequence Memory</h3><p>{instruction}</p></div><div className="sequence-memory-board" aria-live="polite">{showSequence ? <><small>Remember this order!</small><b>{sequence.join("　")}</b></> : <><small>What was the last symbol?</small><b>❔</b></>}</div>{!showSequence && <div className="game-choice-grid">{options.map((option) => <button type="button" key={option} className="game-choice game-choice--sequence" disabled={status === "right"} onClick={() => choose(option)}>{option}</button>)}</div>}{status !== "idle" && <GameFeedback feedback={feedback} onNext={onNext} onRetry={retry} isCorrect={status === "right"} />}</div>;
}
