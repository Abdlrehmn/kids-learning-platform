"use client";

import type { CSSProperties } from "react";
import { GameWorldArt } from "@/components/games/GameWorldArt";
import { gameArtById, type Game } from "@/components/games/gameCatalog";
import { gameMeta } from "@/components/games/gameMeta";
import type { GameRecord } from "@/components/games/gameStorage";

export default function GameCard({ game, index, record, badge, onPlay }: {
  game: Game;
  index: number;
  record?: GameRecord;
  badge?: "featured" | "popular";
  onPlay: () => void;
}) {
  const meta = gameMeta[game.id];
  return (
    <article
      className={`games-card games-card--${index % 6}${badge === "featured" ? " is-featured" : ""}`}
      style={{ "--game-index": index } as CSSProperties}
    >
      <div className="games-card-art">
        {badge ? <span className="games-card-ribbon">{badge === "featured" ? "Featured" : "Popular"}</span> : null}
        <span className="games-card-art-inner">
          <GameWorldArt kind={gameArtById[game.id]} className="games-illustration-svg" />
        </span>
        <i aria-hidden="true">✦</i>
      </div>

      <div className="games-card-body">
        <h3>{game.title}</h3>
        <p>{game.mechanic}</p>
        <div className="games-card-meta">
          <span className={`games-difficulty-badge games-difficulty-badge--${meta.difficulty}`}>
            <i aria-hidden="true" />
            {meta.difficulty}
          </span>
          <span className="games-time-badge">≈ {meta.minutes} min</span>
        </div>
        <small className="games-card-progress">
          {record ? `Level ${record.level} · ${record.levelsCompleted} complete` : "Level 1 · Ready to play"}
        </small>
      </div>

      <button type="button" className="games-card-action" onClick={onPlay} aria-label={`Play ${game.title}`}>
        Play <span aria-hidden="true">→</span>
      </button>
    </article>
  );
}
