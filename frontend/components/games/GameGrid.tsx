"use client";

import GameCard from "@/components/games/GameCard";
import { popularGameIds, type Game, type GameId } from "@/components/games/gameCatalog";
import type { GameRecord } from "@/components/games/gameStorage";

export default function GameGrid({ games, records, featuredId, onPlay, onClear }: {
  games: Game[];
  records: Partial<Record<GameId, GameRecord>>;
  featuredId: GameId;
  onPlay: (gameId: GameId) => void;
  onClear: () => void;
}) {
  if (games.length === 0) {
    return (
      <div className="games-empty" role="status">
        <span className="games-empty-art" aria-hidden="true">🪄</span>
        <h3>No games match those filters</h3>
        <p>Try a different search, category, or difficulty.</p>
        <button type="button" className="games-reset games-reset--empty" onClick={onClear}>Clear all filters</button>
      </div>
    );
  }

  const featured = games.find((game) => game.id === featuredId);
  const popular = games.filter((game) => game.id !== featuredId && popularGameIds.includes(game.id));
  const remaining = games.filter((game) => game.id !== featuredId && !popularGameIds.includes(game.id));
  const ordered = [featured, ...popular, ...remaining].filter((game): game is Game => Boolean(game));

  return (
    <div className="games-grid">
      {ordered.map((game, index) => (
        <GameCard
          key={game.id}
          game={game}
          index={index}
          record={records[game.id]}
          badge={game.id === featuredId ? "featured" : popularGameIds.includes(game.id) ? "popular" : undefined}
          onPlay={() => onPlay(game.id)}
        />
      ))}
    </div>
  );
}
