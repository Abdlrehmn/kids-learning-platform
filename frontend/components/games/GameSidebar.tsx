"use client";

import { GameCategoryArt, RewardTrophy } from "@/components/games/GameWorldArt";
import type { CategoryId } from "@/components/games/gameCatalog";

type SidebarCategory = { id: CategoryId; title: string; subtitle: string; tint: string };

export default function GameSidebar({ categories, counts, selected, onSelect }: {
  categories: readonly SidebarCategory[];
  counts: Record<CategoryId, number>;
  selected: CategoryId;
  onSelect: (category: CategoryId) => void;
}) {
  return (
    <aside className="games-sidebar" aria-label="Game categories">
      <div className="games-sidebar-head">
        <p className="games-sidebar-kicker">Explore</p>
        <h2>Game Categories</h2>
      </div>

      <div className="games-category-list" role="group" aria-label="Filter games by category">
        {categories.map((category) => {
          const isSelected = selected === category.id;
          return (
            <button
              key={category.id}
              type="button"
              className={`games-category games-category--${category.tint}${isSelected ? " is-active" : ""}`}
              onClick={() => onSelect(category.id)}
              aria-pressed={isSelected}
            >
              <span className="games-category-icon"><GameCategoryArt name={category.id} /></span>
              <span className="games-category-copy">
                <b>{category.title}</b>
                <small>{category.subtitle}</small>
              </span>
              <span className="games-category-count" aria-label={`${counts[category.id]} games`}>{counts[category.id]}</span>
            </button>
          );
        })}
      </div>

      <div className="games-promo" aria-label="Rewards preview">
        <span className="games-promo-spark" aria-hidden="true">✦</span>
        <RewardTrophy />
        <p className="games-promo-kicker">Rewards ahead</p>
        <b>Collect Stars &amp; Unlock Rewards!</b>
        <small>Every completed level earns 25 XP.</small>
        <span className="games-promo-stars" aria-hidden="true">✦ ✧ ★</span>
      </div>
    </aside>
  );
}
