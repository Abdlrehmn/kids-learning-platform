"use client";

import GameHeroIllustration from "@/components/games/GameHeroIllustration";

export default function GameHubHero({ gameCount, xp, ready }: { gameCount: number; xp: number; ready: boolean }) {
  return (
    <header className="games-hero">
      <GameHeroIllustration className="games-hero-illustration" />

      <div className="games-hero-copy">
        <p className="games-hero-kicker"><span aria-hidden="true">✦</span> Welcome to the arcade <span aria-hidden="true">✦</span></p>
        <h1><span>Games</span> <b>World</b></h1>
        <p className="games-hero-tagline">Play <i aria-hidden="true">•</i> Learn <i aria-hidden="true">•</i> Be Awesome!</p>
        <p className="games-hero-description">Pick a world, press play, and learn something new with every round.</p>
        <div className="games-hero-actions">
          <a className="games-hero-button" href="#games-collection">Explore all games <span aria-hidden="true">↓</span></a>
          <span className="games-hero-count"><b>{gameCount}</b> Amazing Educational Games</span>
        </div>
      </div>

      <div className="games-xp" aria-label={ready ? `${xp} XP earned` : "Loading your XP"}>
        <span aria-hidden="true">⭐</span>
        <b>{ready ? xp : "—"}</b>
        <small>XP earned</small>
      </div>
    </header>
  );
}
