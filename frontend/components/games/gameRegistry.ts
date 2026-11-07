import type { GameArtKind } from "@/components/games/GameWorldArt";
import {
  featuredGameIdByCategory,
  gameArtById,
  gameCategories,
  games,
  popularGameIds,
  type CategoryId,
  type GameCategory,
  type GameId,
} from "@/components/games/gameCatalog";
import { gameMeta, type GameDifficulty } from "@/components/games/gameMeta";

/**
 * Central game registry — the single source of truth for inventory accounting.
 *
 * `gameCatalog.ts` stays the raw content definition (titles, mechanics, art),
 * and this module is the ONLY place that derives counts, statuses, routes and
 * duplicate review data from it. No page may hardcode a game total; import the
 * derived values from here instead.
 *
 * Design rules enforced by `validateRegistry()` below:
 *  - every game has exactly one stable id, and pool totals always come from
 *    unique ids;
 *  - the five primary categories exactly partition every playable game (no
 *    double counting), so a child adding "the five groups" always gets the
 *    real total;
 *  - "Fun Challenges" is a curated *facet*, so its count intentionally shares
 *    games with the primary groups and never hides behind a fake number.
 */

export type GameStatus = "playable" | "coming-soon";

/** Authored age suitability bands. Assigned per game only after mechanic review. */
export type GameAgeBand = "4-6" | "7-9" | "10-12";

/** Games World is one shelf; ids stay stable while the shelf grows. */
export type GameRoute = "/games";

/** Discovery facet used by the "Fun Challenges" list (games also live in a primary group). */
export type ChallengeFacet = "challenges";

export type GameRegistryEntry = {
  id: GameId;
  title: string;
  description: string;
  instruction: string;
  icon: string;
  artKind: GameArtKind;
  route: GameRoute;
  status: GameStatus;
  /** Every playable game belongs to exactly one primary category. */
  primaryCategory: GameCategory;
  /** Optional discovery facets (counts may overlap primary totals by design). */
  facets: readonly ChallengeFacet[];
  difficulty: GameDifficulty;
  minutes: number;
  /**
   * Curated gameplay family. Games sharing a family are mechanically related;
   * the derived `duplicateReviewGroups` flags families that need a Phase 6
   * differentiation decision versus clearly distinct variants.
   */
  mechanicFamily: string;
  /** Filled in Phase 5 together with the card experience; absent until authored. */
  ageBands?: readonly GameAgeBand[];
};

/**
 * Gameplay family per game, matched against the real implemented mechanics in
 * GameChallenge / MathGameChallenge / SequenceMemoryChallenge / ColorMatch.
 */
const mechanicFamilyById: Record<GameId, string> = {
  "word-match": "picture-to-word",
  "picture-match": "picture-to-word",
  "picture-puzzle": "picture-to-word",
  "color-match": "object-to-color",
  "spelling-bee": "type-the-word",
  crossword: "type-the-word",
  "missing-letters": "letter-fill",
  "letter-puzzle": "letter-fill",
  "word-scramble": "letter-order",
  "jigsaw-puzzle": "letter-order",
  "guess-the-word": "letter-guess",
  "memory-cards": "memory-pair",
  "picture-pairs": "memory-pair",
  "word-memory": "memory-pair",
  "sound-memory": "memory-pair",
  "animal-match": "memory-pair",
  "vocabulary-quiz": "sentence-fill",
  "noun-detective": "grammar-spot",
  "verb-action": "grammar-spot",
  "adjective-explorer": "grammar-spot",
  "sentence-builder": "tile-order",
  "build-a-sentence": "sentence-typing",
  "treasure-hunt": "topic-grouping",
  "word-sorting": "topic-grouping",
  "object-sorting": "topic-grouping",
  "punctuation-fixer": "punctuation-pick",
  "story-sequence": "event-order",
  "listening-detective": "audio-to-word",
  "odd-one-out": "odd-one-out",
  "find-difference": "odd-one-out",
  "alphabet-hunt": "letter-match",
  "math-adventure": "math-choice",
  "number-quest": "math-choice",
  "addition-adventure": "math-choice",
  "subtraction-challenge": "math-choice",
  "multiplication-stars": "math-choice",
  "division-explorer": "math-choice",
  "shape-detective": "math-choice",
  "counting-adventure": "math-choice",
  "number-sequence": "next-in-sequence",
  "sequence-memory": "next-in-sequence",
  "missing-piece": "next-in-sequence",
  "pattern-builder": "next-in-sequence",
  "pattern-detective": "next-in-sequence",
  "shape-builder": "shape-combining",
  "logic-quest": "riddle-choice",
};

/** Curated Phase 6 verdicts for families with more than one member. */
const duplicateReviewNotes: Partial<
  Record<string, { reviewStatus: "needs-decision" | "genuinely-distinct-variant"; note: string }>
> = {
  "picture-to-word": {
    reviewStatus: "needs-decision",
    note:
      "word-match, picture-match and picture-puzzle all show a picture (or color swatch) and ask the child to pick its word. Phase 6 must decide how to differentiate or merge them.",
  },
  "letter-fill": {
    reviewStatus: "needs-decision",
    note:
      "missing-letters and letter-puzzle both use a picture clue and ask for the first letter of the word. Phase 6 must differentiate or merge them.",
  },
  "next-in-sequence": {
    reviewStatus: "needs-decision",
    note:
      "pattern-builder, pattern-detective, missing-piece, number-sequence and sequence-memory all reuse the choose-what-comes-next flow. Differences live only in the sequence content; Phase 6 must divide honest teaching territory between them.",
  },
  "memory-pair": {
    reviewStatus: "genuinely-distinct-variant",
    note:
      "All five flip hidden cards to find pairs, but each changes what a card face is (picture / word / sound / animal picture), so the skill exercised differs.",
  },
  "topic-grouping": {
    reviewStatus: "genuinely-distinct-variant",
    note:
      "All three ask which group a word belongs to, but treasure-hunt hunts a concrete word in a grid while word-sorting and object-sorting name the group itself.",
  },
  "grammar-spot": {
    reviewStatus: "genuinely-distinct-variant",
    note:
      "The three grammar games target different word jobs (noun, verb, adjective) inside different sentence prompts.",
  },
  "odd-one-out": {
    reviewStatus: "genuinely-distinct-variant",
    note:
      "odd-one-out singles out one word; find-difference compares whole pairs and asks which pair is different.",
  },
  "type-the-word": {
    reviewStatus: "genuinely-distinct-variant",
    note:
      "spelling-bee spells a pictured word letter by letter; crossword solves a meaning clue with a typed answer.",
  },
  "letter-order": {
    reviewStatus: "genuinely-distinct-variant",
    note:
      "word-scramble orders individual letters; jigsaw-puzzle joins two-letter chunks of the picture word.",
  },
  "math-choice": {
    reviewStatus: "genuinely-distinct-variant",
    note:
      "One prompt engine with a distinct question shape per game (gems story, next number, sums, differences, products, quotients, shapes, counting).",
  },
};

export type DuplicateReviewGroup = {
  mechanicFamily: string;
  gameIds: readonly GameId[];
  reviewStatus: "needs-decision" | "genuinely-distinct-variant";
  note: string;
};

function buildRegistry(): GameRegistryEntry[] {
  const seenIds = new Set<string>();
  const entries: GameRegistryEntry[] = [];

  for (const game of games) {
    if (seenIds.has(game.id)) throw new Error(`Game registry has a duplicate id: ${game.id}`);
    seenIds.add(game.id);

    const family = mechanicFamilyById[game.id];
    if (!family) throw new Error(`Game registry is missing a mechanic family for: ${game.id}`);

    const meta = gameMeta[game.id];
    if (!meta) throw new Error(`Game registry is missing meta for: ${game.id}`);
    if (!Number.isInteger(meta.minutes) || meta.minutes < 1) {
      throw new Error(`Game registry has an invalid duration for: ${game.id}`);
    }
    if (!game.title.trim() || !game.mechanic.trim() || !game.instruction.trim() || !game.icon.trim()) {
      throw new Error(`Game registry has empty card copy for: ${game.id}`);
    }

    // Age bands (Phase 5) must be authored on real mechanics, never defaulted.
    if (mechanicFamilyById[game.id] === undefined) {
      throw new Error(`Game registry cannot read mechanics for: ${game.id}`);
    }

    entries.push({
      id: game.id,
      title: game.title,
      description: game.mechanic,
      instruction: game.instruction,
      icon: game.icon,
      artKind: gameArtById[game.id],
      route: "/games",
      // Every entry in the catalog is a real, implemented game. Coming-soon
      // entries must never be invented to reach a target count.
      status: "playable",
      primaryCategory: gameCategories[game.id],
      facets: meta.challenge ? ["challenges"] : [],
      difficulty: meta.difficulty,
      minutes: meta.minutes,
      mechanicFamily: family,
      // ageBands: authored in Phase 5 with the card experience.
    });
  }

  if (entries.length !== new Set(entries.map((entry) => entry.id)).size) {
    throw new Error("Game registry ids are not unique.");
  }

  for (const [categoryId, gameId] of Object.entries(featuredGameIdByCategory) as Array<[CategoryId, GameId]>) {
    if (!seenIds.has(gameId)) throw new Error(`Featured game for "${categoryId}" is unknown: ${gameId}`);
  }
  for (const gameId of popularGameIds) {
    if (!seenIds.has(gameId)) throw new Error(`Popular game is unknown: ${gameId}`);
  }

  return entries;
}

export const gameRegistry: readonly GameRegistryEntry[] = buildRegistry();

const entriesById: ReadonlyMap<GameId, GameRegistryEntry> = new Map(
  gameRegistry.map((entry) => [entry.id, entry]),
);

export function getRegistryEntry(id: GameId): GameRegistryEntry | undefined {
  return entriesById.get(id);
}

export function requireRegistryEntry(id: GameId): GameRegistryEntry {
  const entry = entriesById.get(id);
  if (!entry) throw new Error(`Unknown game id: ${id as string}`);
  return entry;
}

export function primaryCategoryOf(id: GameId): GameCategory {
  return requireRegistryEntry(id).primaryCategory;
}

/** One predicate shared by inventory counts and the Games World filters. */
export function gameIsInCategory(id: GameId, category: CategoryId): boolean {
  if (category === "all") return true;
  const entry = requireRegistryEntry(id);
  if (entry.status !== "playable") return false;
  if (category === "challenges") return entry.facets.includes("challenges");
  return entry.primaryCategory === category;
}

export const playableGames: readonly GameRegistryEntry[] = gameRegistry.filter(
  (entry) => entry.status === "playable",
);

export const comingSoonGames: readonly GameRegistryEntry[] = gameRegistry.filter(
  (entry) => entry.status === "coming-soon",
);

/** Totals are always derived from unique game ids. */
export const playableGameCount = new Set(playableGames.map((entry) => entry.id)).size;
export const comingSoonGameCount = new Set(comingSoonGames.map((entry) => entry.id)).size;
export const totalGameCount = playableGameCount + comingSoonGameCount;

export const gameInventoryTotals = {
  total: totalGameCount,
  playable: playableGameCount,
  comingSoon: comingSoonGameCount,
} as const;

const categoryCountsByPrimary: Record<GameCategory, number> = gameRegistry.reduce(
  (counts, entry) => {
    if (entry.status !== "playable") return counts;
    counts[entry.primaryCategory] += 1;
    return counts;
  },
  { word: 0, math: 0, puzzle: 0, logic: 0, memory: 0 } as Record<GameCategory, number>,
);

const challengeFacetCount = gameRegistry.filter(
  (entry) => entry.status === "playable" && entry.facets.includes("challenges"),
).length;

/**
 * Category counts shown in the Games World sidebar.
 * - "all" counts unique playable games.
 * - the five primary groups exactly partition the playable games.
 * - "challenges" is a curated facet that shares games with the primaries; its
 *   badge explains that so adding the numbers still makes sense to a child.
 */
export const categoryCounts: Record<CategoryId, number> = {
  all: playableGameCount,
  word: categoryCountsByPrimary.word,
  math: categoryCountsByPrimary.math,
  puzzle: categoryCountsByPrimary.puzzle,
  logic: categoryCountsByPrimary.logic,
  memory: categoryCountsByPrimary.memory,
  challenges: challengeFacetCount,
};

/** Optional hover text describing what a category count means, kept honest. */
export const categoryCountHints: Partial<Record<CategoryId, string>> = {
  challenges: "quick picks that also live in the five groups above",
};

/** Fails fast if the primary groups ever stop being an exact partition (the "54 problem"). */
function validateRegistry() {
  const primarySum =
    categoryCounts.word + categoryCounts.math + categoryCounts.puzzle
    + categoryCounts.logic + categoryCounts.memory;
  if (primarySum !== playableGameCount) {
    throw new Error(
      `Primary game categories must exactly partition playable games: got ${primarySum} of ${playableGameCount}.`,
    );
  }
  if (categoryCounts.challenges > playableGameCount) {
    throw new Error("Challenge facet count cannot exceed the playable games.");
  }
  if (totalGameCount !== gameRegistry.length) {
    throw new Error("Registry totals must be computed from unique game ids.");
  }
}

validateRegistry();

const duplicateGroupsById = new Map<string, GameId[]>();
for (const entry of gameRegistry) {
  const group = duplicateGroupsById.get(entry.mechanicFamily) ?? [];
  group.push(entry.id);
  duplicateGroupsById.set(entry.mechanicFamily, group);
}

export const duplicateReviewGroups: readonly DuplicateReviewGroup[] = [...duplicateGroupsById]
  .filter(([, gameIds]) => gameIds.length > 1)
  .map(([mechanicFamily, gameIds]) => {
    const curated = duplicateReviewNotes[mechanicFamily];
    if (!curated) throw new Error(`Family with several games needs a review note: ${mechanicFamily}`);
    return {
      mechanicFamily,
      gameIds,
      reviewStatus: curated.reviewStatus,
      note: curated.note,
    };
  });

export const duplicateReviewRequired = duplicateReviewGroups.some(
  (group) => group.reviewStatus === "needs-decision",
);
