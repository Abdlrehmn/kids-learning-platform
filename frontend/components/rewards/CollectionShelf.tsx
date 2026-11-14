"use client";

/**
 * My Collection — display only.
 *
 * There is no item catalog or star-spending system in the backend yet, so
 * every shelf slot is locked and nothing can be bought here. Stars stay
 * safely in the real ledger until a secure shop exists.
 */

const ITEMS = [
  {
    id: "hat",
    name: "Star Cap",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3.5 15c1-5.5 4-9 8.5-9s7.5 3.5 8.5 9H3.5Zm0 0h17a2 2 0 0 1-17 0Zm8.5-9V3.5" />
      </svg>
    ),
  },
  {
    id: "glasses",
    name: "Sprout Glasses",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="7" cy="14" r="3.2" />
        <circle cx="17" cy="14" r="3.2" />
        <path d="M10.2 13.5c1-1 2.6-1 3.6 0M3.8 13 2.5 9.5M20.2 13l1.3-3.5" />
      </svg>
    ),
  },
  {
    id: "backpack",
    name: "Rocket Backpack",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 21h6m-5.5-3h5a1 1 0 0 0 1-1l.5-6a4 4 0 0 0-8 0l.5 6a1 1 0 0 0 1 1Zm2.5-13a2.5 2.5 0 0 1 5 0" />
      </svg>
    ),
  },
  {
    id: "cape",
    name: "Sparkle Cape",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3c2.5 2 5 2.5 7 2-.5 8-3 12-7 14-4-2-6.5-6-7-14 2 .5 4.5 0 7-2Zm0 3v9" />
      </svg>
    ),
  },
  {
    id: "frame",
    name: "Confetti Frame",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="3" />
        <path d="M8 9h.1M16 9h.1M9.5 14c1.4 1.4 3.6 1.4 5 0m-2-5h.1" />
      </svg>
    ),
  },
  {
    id: "plant",
    name: "Learning Plant",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 21v-8m0 3c-3.5 0-6-2.5-6-6 3.5 0 6 2.5 6 6Zm0-6c0-3.5 2.5-6 6-6 0 3.5-2.5 6-6 6ZM8 21h8" />
      </svg>
    ),
  },
] as const;

export default function CollectionShelf() {
  return (
    <section className="rewards-panel rewards-split__collection" aria-labelledby="rewards-collection-title">
      <div className="rewards-section-head" style={{ marginBottom: 10 }}>
        <div>
          <h2 id="rewards-collection-title" className="rewards-section-title">My collection</h2>
        </div>
        <span className="rewards-item__soon">Locked for now</span>
      </div>

      <div className="rewards-collection-grid">
        {ITEMS.map((item) => (
          <article key={item.id} className="rewards-item" aria-label={`${item.name}, locked for now`}>
            <span className="rewards-item__art" aria-hidden="true">{item.icon}</span>
            <span className="rewards-item__lock" aria-hidden="true">🔒</span>
            <span className="rewards-item__name">{item.name}</span>
            <span className="rewards-item__soon">Unlocks soon</span>
          </article>
        ))}
      </div>

      <p className="rewards-note">
        Hats, glasses, backpacks and avatar outfits will be <strong>unlocked safely from the
        backend</strong> one day. Until the shop opens, stars cannot be spent anywhere — they are
        safe in the ledger.
      </p>
    </section>
  );
}
