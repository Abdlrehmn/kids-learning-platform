"use client";

import { useState } from "react";
import ColorMatchChallenge from "@/components/games/challenges/ColorMatchChallenge";
import GameChallenge from "@/components/games/challenges/GameChallenge";
import { colorMatchQuestions } from "@/components/games/colorMatchContent";
import { games, type GameId } from "@/components/games/gameCatalog";
import { ROUNDS_PER_LEVEL, gameSeed, getTarget } from "@/components/games/gameEngine";
import type { GameRecord } from "@/components/games/gameStorage";

export default function GameSession({ game, saved, onBack, onFinish }: {
  game: (typeof games)[number];
  saved?: GameRecord;
  onBack: () => void;
  onFinish: (gameId: GameId, level: number, score: number) => void;
}) {
  const [level, setLevel] = useState(saved?.level ?? 1);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [levelComplete, setLevelComplete] = useState(false);
  const [runId, setRunId] = useState(0);
  const target = game.id === "color-match" ? null : getTarget(game.id, level, round);
  const colorQuestion = game.id === "color-match"
    ? colorMatchQuestions[(gameSeed(game.id) + (level - 1) * 7 + round * 5) % colorMatchQuestions.length]
    : null;

  const advance = () => {
    if (round === ROUNDS_PER_LEVEL - 1) {
      setLevelComplete(true);
      onFinish(game.id, level, score);
    } else setRound((current) => current + 1);
  };
  const handleCorrect = () => setScore((current) => current + 10);
  const restart = () => { setRunId((current) => current + 1); setRound(0); setScore(0); setLevelComplete(false); };
  const nextLevel = () => { setLevel((current) => current + 1); setRound(0); setScore(0); setLevelComplete(false); };

  return (
    <section className="games-session" aria-labelledby="games-session-title">
      <div className="games-session-top">
        <button type="button" className="games-back" onClick={onBack}>← All games</button>
        <div><p className="games-kicker">{game.icon} {game.title}</p><h2 id="games-session-title">Level {level}</h2></div>
        <div className="games-score"><b>{score}</b><small>points</small><button type="button" className="games-secondary" onClick={restart}>Restart</button></div>
      </div>
      <div className="games-progress" aria-label={`Round ${Math.min(round + 1, ROUNDS_PER_LEVEL)} of ${ROUNDS_PER_LEVEL}`}>
        {Array.from({ length: ROUNDS_PER_LEVEL }, (_, index) => <span key={index} className={index <= round ? "is-active" : ""} />)}
      </div>
      {levelComplete ? (
        <div className="games-complete" role="status"><span aria-hidden="true">🏆</span><p className="games-kicker">Level complete</p><h3>Brilliant playing!</h3><p>You earned 25 XP and scored {score} points.</p><div className="games-actions"><button type="button" className="games-primary" onClick={nextLevel}>Play level {level + 1}</button><button type="button" className="games-secondary" onClick={restart}>Replay level {level}</button></div></div>
      ) : (
        colorQuestion ? (
          <ColorMatchChallenge key={`${game.id}-${level}-${round}-${runId}`} question={colorQuestion} round={round} onCorrect={handleCorrect} onNext={advance} />
        ) : target ? (
          <GameChallenge key={`${game.id}-${level}-${round}-${runId}`} gameId={game.id} gameTitle={game.title} instruction={game.instruction} target={target} level={level} round={round} onCorrect={handleCorrect} onNext={advance} />
        ) : null
      )}
    </section>
  );
}
