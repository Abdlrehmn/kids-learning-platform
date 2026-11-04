"use client";

import { useState } from "react";
import { colorMatchPalette, type ColorMatchQuestion } from "@/components/games/colorMatchContent";
import { ROUNDS_PER_LEVEL } from "@/components/games/gameEngine";
import GameFeedback from "@/components/games/challenges/GameFeedback";

export default function ColorMatchChallenge({ question, round, onCorrect, onNext }: {
  question: ColorMatchQuestion;
  round: number;
  onCorrect: () => void;
  onNext: () => void;
}) {
  const [status, setStatus] = useState<"idle" | "right" | "wrong">("idle");
  const [feedback, setFeedback] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const choose = (color: string) => {
    if (status === "right") return;
    setSelected(color);
    if (color === question.color) {
      setStatus("right");
      setFeedback(`Yes! A ${question.object} is ${question.color}.`);
      onCorrect();
    } else {
      setStatus("wrong");
      setFeedback(`A ${question.object} is not ${color}. Look at the colors and try again.`);
    }
  };
  const retry = () => { setStatus("idle"); setFeedback(""); setSelected(null); };

  return (
    <div className="game-round">
      <div className="game-question-heading"><small>Round {round + 1} of {ROUNDS_PER_LEVEL}</small><h3>Color Match</h3><p>Look at the object and choose its real-world color.</p></div>
      <div className="game-color-object" key={question.id}>
        <span aria-hidden="true">{question.picture}</span>
        <b>{question.object}</b>
      </div>
      <p className="game-clue">What color is the {question.object}?</p>
      <div className="game-choice-grid game-choice-grid--colors" aria-label="Choose a color">
        {question.choices.map((color) => (
          <button type="button" key={color} className={`game-choice game-color-choice${selected === color ? " is-selected" : ""}`} disabled={status === "right"} onClick={() => choose(color)}>
            <span className="game-color-swatch" style={{ "--game-swatch": colorMatchPalette[color] } as React.CSSProperties} aria-hidden="true" />
            {color}
          </button>
        ))}
      </div>
      {status !== "idle" && <GameFeedback feedback={feedback} onNext={onNext} onRetry={retry} isCorrect={status === "right"} />}
    </div>
  );
}
