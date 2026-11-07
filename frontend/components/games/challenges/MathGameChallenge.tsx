"use client";

import { useRef, useState } from "react";
import { games, type GameId } from "@/components/games/gameCatalog";
import { ROUNDS_PER_LEVEL, buildMathPrompt } from "@/components/games/gameEngine";
import GameFeedback from "@/components/games/challenges/GameFeedback";

export default function MathGameChallenge({ gameId, level, round, instruction, onCorrect, onNext }: { gameId: GameId; level: number; round: number; instruction: string; onCorrect: () => void; onNext: () => void }) {
  const [status, setStatus] = useState<"idle" | "right" | "wrong">("idle");
  const [feedback, setFeedback] = useState("");
  const correctAwardedRef = useRef(false);
  const question = buildMathPrompt(gameId, level, round);
  const choose = (value: string) => {
    if (status === "right" || correctAwardedRef.current) return;
    if (value === question.answer) { correctAwardedRef.current = true; setStatus("right"); setFeedback("Great thinking! You found the answer."); onCorrect(); }
    else { setStatus("wrong"); setFeedback("Almost! Try the numbers again."); }
  };
  const retry = () => { correctAwardedRef.current = false; setStatus("idle"); setFeedback(""); };
  return <div className="game-round">{<div className="game-question-heading"><small>Round {round + 1} of {ROUNDS_PER_LEVEL}</small><h3>{games.find((game) => game.id === gameId)?.title}</h3><p>{instruction}</p></div>}<p className={`game-math-visual${gameId === "counting-adventure" ? " game-math-visual--counting" : ""}`} aria-label={question.visual}>{question.visual}</p><p className="game-clue game-clue--sentence">{question.prompt}</p><div className="game-choice-grid">{question.choices.map((choice) => <button type="button" key={choice} className="game-choice" disabled={status === "right"} onClick={() => choose(choice)}>{choice}</button>)}</div>{status !== "idle" && <GameFeedback feedback={feedback} onNext={onNext} onRetry={retry} isCorrect={status === "right"} />}</div>;
}
