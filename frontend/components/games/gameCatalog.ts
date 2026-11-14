import type { GameArtKind } from "@/components/games/GameWorldArt";

// Raw game definitions. Counting, statuses, duplicate review, and category
// accounting were derived from this file exclusively in ./gameRegistry.ts —
// never hardcode a game total or status anywhere else.
export const games = [
  { id: "word-match", title: "Word Match", icon: "🔗", mechanic: "Match a picture with its word.", instruction: "Look at the picture and choose the matching word." },
  { id: "picture-match", title: "Picture Word Match", icon: "🖼️", mechanic: "Connect a picture with its word.", instruction: "Look at the picture and tap the matching word." },
  { id: "color-match", title: "Color Match", icon: "🎨", mechanic: "Match familiar things to their colors.", instruction: "Look at the object and choose its real-world color." },
  { id: "spelling-bee", title: "Spelling Bee", icon: "🐝", mechanic: "Type the word you hear or see.", instruction: "Study the picture and type the whole word." },
  { id: "missing-letters", title: "Missing Letters", icon: "🔤", mechanic: "Complete a word one letter at a time.", instruction: "Fill the blank with the first letter of the word." },
  { id: "word-scramble", title: "Word Scramble", icon: "🔀", mechanic: "Put mixed-up letters in order.", instruction: "Tap the letters in the right order to spell the word." },
  { id: "memory-cards", title: "Memory Cards", icon: "🧠", mechanic: "Remember where each picture and word is.", instruction: "Turn over two cards at a time and find all three pairs." },
  { id: "vocabulary-quiz", title: "Vocabulary Quiz", icon: "📚", mechanic: "Choose the topic a word belongs to.", instruction: "Read the word and choose its learning topic." },
  { id: "noun-detective", title: "Noun Detective", icon: "🕵️", mechanic: "Find the naming word in a sentence.", instruction: "Tap the animal or thing named in the sentence." },
  { id: "verb-action", title: "Verb Action Challenge", icon: "🏃", mechanic: "Spot the action word.", instruction: "Choose the word that tells what someone does." },
  { id: "adjective-explorer", title: "Adjective Explorer", icon: "🌈", mechanic: "Find the describing word.", instruction: "Tap the word that tells what the puppy is like." },
  { id: "sentence-builder", title: "Sentence Builder", icon: "🧩", mechanic: "Arrange word tiles into a sentence.", instruction: "Tap the tiles in an order that makes a clear sentence." },
  { id: "treasure-hunt", title: "Grammar Treasure Hunt", icon: "🗺️", mechanic: "Search a grid for the right word group.", instruction: "Find a word that belongs to the topic on the treasure map." },
  { id: "punctuation-fixer", title: "Punctuation Fixer", icon: "❗", mechanic: "Choose a sentence's ending mark.", instruction: "Read the sentence and choose its correct ending mark." },
  { id: "story-sequence", title: "Story Sequence", icon: "📖", mechanic: "Put story moments in order.", instruction: "Tap what happened first, next, and last." },
  { id: "listening-detective", title: "Listening Detective", icon: "🎧", mechanic: "Listen to a word and identify it.", instruction: "Play the spoken word, then choose what you heard." },
  { id: "word-sorting", title: "Word Sorting", icon: "🗂️", mechanic: "Sort a word into its topic.", instruction: "Choose the group that the word belongs to." },
  { id: "odd-one-out", title: "Odd One Out", icon: "🔎", mechanic: "Find the word from a different group.", instruction: "Three words share a topic. Find the one that does not." },
  { id: "crossword", title: "Crossword Word Puzzle", icon: "▦", mechanic: "Solve a short clue with a word.", instruction: "Read the meaning clue and type the matching word." },
  { id: "guess-the-word", title: "Guess the Word", icon: "💡", mechanic: "Reveal a hidden word by guessing letters.", instruction: "Tap letters to uncover the word before you run out of tries." },
  { id: "build-a-sentence", title: "Build a Sentence", icon: "✍️", mechanic: "Write a sentence from a prompt.", instruction: "Type the sentence that matches the picture clue." },
  { id: "alphabet-hunt", title: "Alphabet Hunt", icon: "🔤", mechanic: "Find the word that begins with a letter.", instruction: "Choose a picture whose name begins with the target letter." },
  { id: "math-adventure", title: "Math Adventure", icon: "🔢", mechanic: "Solve a number puzzle to move ahead.", instruction: "Choose the answer that unlocks the next step." },
  { id: "number-quest", title: "Number Quest", icon: "🔢", mechanic: "Explore numbers with quick challenges.", instruction: "Read the number clue and choose the answer." },
  { id: "addition-adventure", title: "Addition Adventure", icon: "➕", mechanic: "Add numbers to reach the treasure.", instruction: "Add the numbers and choose the sum." },
  { id: "subtraction-challenge", title: "Subtraction Challenge", icon: "➖", mechanic: "Take away and find what remains.", instruction: "Subtract the smaller number from the larger one." },
  { id: "multiplication-stars", title: "Multiplication Stars", icon: "✖️", mechanic: "Use equal groups to multiply.", instruction: "Multiply the numbers to collect the stars." },
  { id: "division-explorer", title: "Division Explorer", icon: "➗", mechanic: "Share items into equal groups.", instruction: "Divide evenly to find how many are in each group." },
  { id: "shape-detective", title: "Shape Detective", icon: "🔺", mechanic: "Spot the shape described by the clue.", instruction: "Choose the shape with the matching name." },
  { id: "counting-adventure", title: "Counting Adventure", icon: "⭐", mechanic: "Count the objects on the island.", instruction: "Count the stars and choose the total." },
  { id: "number-sequence", title: "Number Sequence", icon: "🔢", mechanic: "Find the number that comes next.", instruction: "Look at the pattern and complete the sequence." },
  { id: "picture-pairs", title: "Picture Pairs", icon: "🃏", mechanic: "Find two cards with the same picture.", instruction: "Flip cards and find all three picture pairs." },
  { id: "word-memory", title: "Word Memory", icon: "🔠", mechanic: "Match pairs of the same word.", instruction: "Turn over two word cards and find all the pairs." },
  { id: "sound-memory", title: "Sound Memory", icon: "🔊", mechanic: "Match a spoken word with its picture.", instruction: "Listen to a word and find the matching picture card." },
  { id: "sequence-memory", title: "Sequence Memory", icon: "🧠", mechanic: "Remember a short sequence.", instruction: "Study the sequence, then choose what comes next." },
  { id: "animal-match", title: "Animal Match", icon: "🐾", mechanic: "Match each animal with its name.", instruction: "Look at the animal picture and choose its name." },
  { id: "jigsaw-puzzle", title: "Jigsaw Puzzle", icon: "🧩", mechanic: "Fit the pieces into the right order.", instruction: "Arrange the picture pieces to finish the puzzle." },
  { id: "picture-puzzle", title: "Picture Puzzle", icon: "🖼️", mechanic: "Solve a picture clue with a word.", instruction: "Choose the word that completes the picture puzzle." },
  { id: "missing-piece", title: "Missing Piece", icon: "◩", mechanic: "Find the shape missing from a pattern.", instruction: "Choose the piece that finishes the pattern." },
  { id: "shape-builder", title: "Shape Builder", icon: "🔷", mechanic: "Pick shapes that build a familiar object.", instruction: "Choose the shape needed to complete the object." },
  { id: "letter-puzzle", title: "Letter Puzzle", icon: "🅰️", mechanic: "Find the first letter in a word.", instruction: "Use the picture clue to choose the starting letter." },
  { id: "pattern-builder", title: "Pattern Builder", icon: "🟣", mechanic: "Continue a repeating pattern.", instruction: "Look at the pattern and choose what comes next." },
  { id: "find-difference", title: "Find the Difference", icon: "🔍", mechanic: "Notice what changed between two clues.", instruction: "Compare the two sets and find the different object." },
  { id: "pattern-detective", title: "Pattern Detective", icon: "🕵️", mechanic: "Solve a repeating logic pattern.", instruction: "Choose the item that comes next in the sequence." },
  { id: "object-sorting", title: "Object Sorting", icon: "🗂️", mechanic: "Group objects by where they belong.", instruction: "Choose the group that matches the object." },
  { id: "logic-quest", title: "Logic Quest", icon: "🧭", mechanic: "Use a clue to find the right answer.", instruction: "Think about the clue and choose the best answer." },
] as const;

export type Game = (typeof games)[number];
export type GameId = Game["id"];
export type GameCategory = "word" | "math" | "memory" | "puzzle" | "logic";
export type CategoryId = "all" | GameCategory | "challenges";

export const gameCategories: Record<GameId, GameCategory> = {
  "word-match": "word", "picture-match": "word", "color-match": "logic", "spelling-bee": "word",
  "missing-letters": "word", "word-scramble": "puzzle", "memory-cards": "memory", "vocabulary-quiz": "word",
  "noun-detective": "logic", "verb-action": "word", "adjective-explorer": "word", "sentence-builder": "puzzle",
  "treasure-hunt": "logic", "punctuation-fixer": "word", "story-sequence": "logic", "listening-detective": "word",
  "word-sorting": "logic", "odd-one-out": "logic", crossword: "puzzle", "guess-the-word": "logic", "build-a-sentence": "word",
  "alphabet-hunt": "word", "math-adventure": "math", "number-quest": "math", "addition-adventure": "math", "subtraction-challenge": "math", "multiplication-stars": "math", "division-explorer": "math", "shape-detective": "math", "counting-adventure": "math", "number-sequence": "math",
  "picture-pairs": "memory", "word-memory": "memory", "sound-memory": "memory", "sequence-memory": "memory", "animal-match": "memory",
  "jigsaw-puzzle": "puzzle", "picture-puzzle": "puzzle", "missing-piece": "puzzle", "shape-builder": "puzzle", "letter-puzzle": "puzzle", "pattern-builder": "puzzle",
  "find-difference": "logic", "pattern-detective": "logic", "object-sorting": "logic", "logic-quest": "logic",
};

export const categories = [
  { id: "all", title: "All Games", subtitle: "Every adventure", tint: "violet" },
  { id: "word", title: "Word Games", subtitle: "Read, spell & explore", tint: "blue" },
  { id: "math", title: "Math Games", subtitle: "Numbers are fun", tint: "yellow" },
  { id: "puzzle", title: "Puzzle Games", subtitle: "Piece it together", tint: "green" },
  { id: "logic", title: "Logic Games", subtitle: "Think it through", tint: "orange" },
  { id: "memory", title: "Memory Games", subtitle: "Remember & match", tint: "pink" },
  { id: "challenges", title: "Fun Challenges", subtitle: "Quick brain teasers", tint: "purple" },
] as const satisfies ReadonlyArray<{ id: CategoryId; title: string; subtitle: string; tint: string }>;

export const popularGameIds: GameId[] = ["word-match", "spelling-bee", "memory-cards", "math-adventure", "noun-detective", "sentence-builder"];

export const gameArtById: Record<GameId, GameArtKind> = {
  "word-match": "word-card-match", "picture-match": "picture-match", "color-match": "color-palette", "spelling-bee": "spelling-bee",
  "missing-letters": "missing-letters", "word-scramble": "letter-tiles", "memory-cards": "memory-match", "vocabulary-quiz": "topic-quiz",
  "noun-detective": "noun-detective", "verb-action": "action", "adjective-explorer": "color-palette", "sentence-builder": "sentence-builder",
  "treasure-hunt": "treasure-map", "punctuation-fixer": "punctuation", "story-sequence": "storybook", "listening-detective": "sound-wave",
  "word-sorting": "sorting", "odd-one-out": "odd-one-out", crossword: "crossword", "guess-the-word": "crossword", "build-a-sentence": "build-sentence",
  "alphabet-hunt": "alphabet", "math-adventure": "number-stacks", "number-quest": "number-quest", "addition-adventure": "addition", "subtraction-challenge": "subtraction", "multiplication-stars": "multiplication", "division-explorer": "division", "shape-detective": "shapes", "counting-adventure": "counting", "number-sequence": "number-sequence",
  "picture-pairs": "memory-cards", "word-memory": "word-memory-cards", "sound-memory": "sound-wave", "sequence-memory": "sequence-memory", "animal-match": "animal-cards",
  "jigsaw-puzzle": "word-match", "picture-puzzle": "picture-puzzle", "missing-piece": "shapes", "shape-builder": "house", "letter-puzzle": "letter-puzzle", "pattern-builder": "sequence",
  "find-difference": "odd-one-out", "pattern-detective": "noun-detective", "object-sorting": "sorting", "logic-quest": "treasure-map",
};

export const featuredGameIdByCategory: Record<CategoryId, GameId> = {
  all: "word-match",
  word: "word-match",
  math: "math-adventure",
  puzzle: "sentence-builder",
  logic: "noun-detective",
  memory: "memory-cards",
  challenges: "guess-the-word",
};

export function categoryTitle(category: GameCategory) {
  return categories.find((entry) => entry.id === category)?.title ?? "Games";
}
