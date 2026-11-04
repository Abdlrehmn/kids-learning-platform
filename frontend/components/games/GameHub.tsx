"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import WorldNavigation from "@/components/WorldNavigation";
import { fireConfetti } from "@/components/Confetti";
import GameGrid from "@/components/games/GameGrid";
import GameHubHero from "@/components/games/GameHubHero";
import GameSession from "@/components/games/GameSession";
import GameSidebar from "@/components/games/GameSidebar";
import GameToolbar from "@/components/games/GameToolbar";
import {
  categories,
  categoryTitle,
  featuredGameIdByCategory,
  gameCategories,
  games,
  type CategoryId,
  type GameId,
} from "@/components/games/gameCatalog";
import { gameMeta, type DifficultyFilter } from "@/components/games/gameMeta";
import {
  EMPTY_PROGRESS,
  GAME_STORAGE_KEY,
  readProgress,
  saveProgress,
  type GameProgress,
} from "@/components/games/gameStorage";

function scrollToGames() {
  const node = document.getElementById("games-collection");
  if (!node) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  node.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
}

export default function GameHub() {
  const [progress, setProgress] = useState<GameProgress>(EMPTY_PROGRESS);
  const [ready, setReady] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("all");
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("all");
  const sessionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setProgress(readProgress(window.localStorage.getItem(GAME_STORAGE_KEY)));
      } catch {
        setProgress(EMPTY_PROGRESS);
      }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveProgress(progress);
  }, [progress, ready]);

  useEffect(() => {
    if (!selectedGame || !sessionRef.current) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    sessionRef.current.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }, [selectedGame]);

  const finishLevel = (gameId: GameId, level: number, score: number) => {
    setProgress((current) => {
      const record = current.records[gameId] ?? { level: 1, bestScore: 0, levelsCompleted: 0 };
      return {
        xp: current.xp + 25,
        gamesPlayed: current.gamesPlayed,
        records: {
          ...current.records,
          [gameId]: {
            level: Math.max(record.level, level + 1),
            bestScore: Math.max(record.bestScore, score),
            levelsCompleted: record.levelsCompleted + 1,
          },
        },
      };
    });
    fireConfetti(window.innerWidth / 2, window.innerHeight * 0.35, 28);
  };

  const startGame = (gameId: GameId) => {
    setProgress((current) => ({ ...current, gamesPlayed: current.gamesPlayed + 1 }));
    setSelectedGame(gameId);
  };

  const closeGame = () => {
    setSelectedGame(null);
    window.requestAnimationFrame(scrollToGames);
  };

  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryId, number> = {
      all: games.length,
      word: 0,
      math: 0,
      memory: 0,
      puzzle: 0,
      logic: 0,
      challenges: 0,
    };
    for (const game of games) {
      counts[gameCategories[game.id]] += 1;
      if (gameMeta[game.id].challenge) counts.challenges += 1;
    }
    return counts;
  }, []);

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleGames = useMemo(() => games.filter((game) => {
    const inCategory = selectedCategory === "all"
      || (selectedCategory === "challenges"
        ? Boolean(gameMeta[game.id].challenge)
        : gameCategories[game.id] === selectedCategory);
    if (!inCategory) return false;
    if (difficulty !== "all" && gameMeta[game.id].difficulty !== difficulty) return false;
    if (!normalizedQuery) return true;
    const searchable = [
      game.title,
      game.mechanic,
      game.instruction,
      categoryTitle(gameCategories[game.id]),
      gameMeta[game.id].difficulty,
    ].join(" ").toLocaleLowerCase();
    return searchable.includes(normalizedQuery);
  }), [difficulty, normalizedQuery, selectedCategory]);

  const activeGame = games.find((game) => game.id === selectedGame);
  const featuredGameId = featuredGameIdByCategory[selectedCategory];
  const playerLevel = 1 + Math.floor(progress.xp / 100);
  const hasFilters = selectedCategory !== "all" || difficulty !== "all" || normalizedQuery.length > 0;

  const resetFilters = () => {
    setQuery("");
    setDifficulty("all");
    setSelectedCategory("all");
  };

  return (
    <div className="english-world games-world">
      <WorldNavigation active="games" />
      <main className="games-main">
        <GameHubHero gameCount={games.length} xp={progress.xp} ready={ready} />

        {activeGame ? (
          <div className="games-session-wrap" ref={sessionRef}>
            <GameSession
              key={activeGame.id}
              game={activeGame}
              saved={progress.records[activeGame.id]}
              onBack={closeGame}
              onFinish={finishLevel}
            />
          </div>
        ) : (
          <section className="games-dashboard" id="games-collection" aria-labelledby="games-library-title">
            <GameSidebar
              categories={categories}
              counts={categoryCounts}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />

            <div className="games-library">
              <header className="games-library-head">
                <div>
                  <p className="games-eyebrow"><span aria-hidden="true">✦</span> {games.length} games to explore</p>
                  <h2 id="games-library-title">Games Collection</h2>
                  <p>Pick a game, press play, and learn something new.</p>
                </div>
                <div className="games-stats" aria-label="Your game progress">
                  <div className="games-stat games-stat--played">
                    <span aria-hidden="true">◷</span>
                    <b>{ready ? progress.gamesPlayed : "—"}</b>
                    <small>Games played</small>
                  </div>
                  <div className="games-stat games-stat--level">
                    <span aria-hidden="true">♛</span>
                    <b>{ready ? playerLevel : "—"}</b>
                    <small>Player level</small>
                  </div>
                  <div className="games-stat games-stat--points">
                    <span aria-hidden="true">✦</span>
                    <b>{ready ? progress.xp : "—"}</b>
                    <small>Total XP</small>
                  </div>
                </div>
              </header>

              <GameToolbar
                query={query}
                onQuery={setQuery}
                difficulty={difficulty}
                onDifficulty={setDifficulty}
                resultCount={visibleGames.length}
                hasFilters={hasFilters}
                onReset={resetFilters}
              />

              <GameGrid
                games={visibleGames}
                records={progress.records}
                featuredId={featuredGameId}
                onPlay={startGame}
                onClear={resetFilters}
              />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
