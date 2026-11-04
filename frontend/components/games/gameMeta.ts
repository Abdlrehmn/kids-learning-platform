import type { GameId } from "@/components/games/gameCatalog";

export type GameDifficulty = "easy" | "medium" | "hard";

export type GameMeta = {
  difficulty: GameDifficulty;
  /** Approximate minutes for one five-round level. */
  minutes: number;
  /** Curated set used by the "Fun Challenges" discovery category. */
  challenge?: boolean;
};

/**
 * Editorial discovery metadata. This does not change gameplay, scoring, or the
 * number of rounds — it only helps children choose a game.
 */
export const gameMeta: Record<GameId, GameMeta> = {
  // Word games
  "word-match": { difficulty: "easy", minutes: 3 },
  "picture-match": { difficulty: "easy", minutes: 3 },
  "spelling-bee": { difficulty: "medium", minutes: 4, challenge: true },
  "missing-letters": { difficulty: "easy", minutes: 3 },
  "vocabulary-quiz": { difficulty: "medium", minutes: 4 },
  "noun-detective": { difficulty: "easy", minutes: 3 },
  "verb-action": { difficulty: "easy", minutes: 3 },
  "adjective-explorer": { difficulty: "easy", minutes: 3 },
  "punctuation-fixer": { difficulty: "medium", minutes: 4 },
  "listening-detective": { difficulty: "medium", minutes: 4 },
  "alphabet-hunt": { difficulty: "easy", minutes: 3 },

  // Math games
  "math-adventure": { difficulty: "medium", minutes: 4 },
  "number-quest": { difficulty: "easy", minutes: 3 },
  "addition-adventure": { difficulty: "easy", minutes: 3 },
  "subtraction-challenge": { difficulty: "medium", minutes: 4 },
  "multiplication-stars": { difficulty: "hard", minutes: 5 },
  "division-explorer": { difficulty: "hard", minutes: 5 },
  "shape-detective": { difficulty: "easy", minutes: 3 },
  "counting-adventure": { difficulty: "easy", minutes: 3 },
  "number-sequence": { difficulty: "medium", minutes: 4, challenge: true },

  // Memory games
  "memory-cards": { difficulty: "medium", minutes: 4 },
  "picture-pairs": { difficulty: "easy", minutes: 3 },
  "word-memory": { difficulty: "medium", minutes: 4 },
  "sound-memory": { difficulty: "hard", minutes: 5 },
  "sequence-memory": { difficulty: "hard", minutes: 5, challenge: true },
  "animal-match": { difficulty: "easy", minutes: 3 },

  // Puzzle games
  "word-scramble": { difficulty: "medium", minutes: 4, challenge: true },
  "sentence-builder": { difficulty: "medium", minutes: 4 },
  crossword: { difficulty: "hard", minutes: 5 },
  "jigsaw-puzzle": { difficulty: "medium", minutes: 4, challenge: true },
  "picture-puzzle": { difficulty: "easy", minutes: 3 },
  "missing-piece": { difficulty: "easy", minutes: 3 },
  "shape-builder": { difficulty: "easy", minutes: 3 },
  "letter-puzzle": { difficulty: "easy", minutes: 3 },
  "pattern-builder": { difficulty: "easy", minutes: 3 },

  // Logic games
  "color-match": { difficulty: "easy", minutes: 3 },
  "treasure-hunt": { difficulty: "medium", minutes: 4 },
  "story-sequence": { difficulty: "hard", minutes: 5 },
  "word-sorting": { difficulty: "easy", minutes: 3 },
  "odd-one-out": { difficulty: "medium", minutes: 4 },
  "guess-the-word": { difficulty: "hard", minutes: 5, challenge: true },
  "build-a-sentence": { difficulty: "hard", minutes: 5 },
  "find-difference": { difficulty: "medium", minutes: 4, challenge: true },
  "pattern-detective": { difficulty: "medium", minutes: 4 },
  "object-sorting": { difficulty: "easy", minutes: 3 },
  "logic-quest": { difficulty: "hard", minutes: 5, challenge: true },
};

export const difficultyOptions = [
  { id: "all", label: "All", tone: "all" },
  { id: "easy", label: "Easy", tone: "easy" },
  { id: "medium", label: "Medium", tone: "medium" },
  { id: "hard", label: "Hard", tone: "hard" },
] as const;

export type DifficultyFilter = (typeof difficultyOptions)[number]["id"];
