"use client";

import { difficultyOptions, type DifficultyFilter } from "@/components/games/gameMeta";

export default function GameToolbar({ query, onQuery, difficulty, onDifficulty, resultCount, hasFilters, onReset }: {
  query: string;
  onQuery: (query: string) => void;
  difficulty: DifficultyFilter;
  onDifficulty: (difficulty: DifficultyFilter) => void;
  resultCount: number;
  hasFilters: boolean;
  onReset: () => void;
}) {
  return (
    <div className="games-toolbar">
      <div className="games-toolbar-row">
        <div className="games-search">
          <span className="games-search-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="m15.5 15.5 5 5" />
            </svg>
          </span>
          <label className="games-sr-only" htmlFor="games-search">Search games</label>
          <input
            id="games-search"
            type="search"
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder="Search games..."
            autoComplete="off"
          />
          {query ? (
            <button type="button" className="games-search-clear" onClick={() => onQuery("")} aria-label="Clear search">×</button>
          ) : null}
        </div>

        <div className="games-difficulty" role="group" aria-label="Filter by difficulty">
          {difficultyOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`games-difficulty-pill games-difficulty-pill--${option.tone}${difficulty === option.id ? " is-active" : ""}`}
              aria-pressed={difficulty === option.id}
              onClick={() => onDifficulty(option.id)}
            >
              <span className="games-difficulty-dot" aria-hidden="true" />
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="games-toolbar-foot">
        <p className="games-result-count" role="status" aria-live="polite">
          {resultCount} {resultCount === 1 ? "game" : "games"} found
        </p>
        {hasFilters ? (
          <button type="button" className="games-reset" onClick={onReset}>
            <span aria-hidden="true">↺</span> Clear filters
          </button>
        ) : (
          <span className="games-toolbar-hint">Search, filter, then press play</span>
        )}
      </div>
    </div>
  );
}
