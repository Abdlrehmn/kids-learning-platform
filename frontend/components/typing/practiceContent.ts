/**
 * Static practice content and small pure helpers for Typing Academy.
 * Nothing here depends on React, so it stays safe to import from anywhere.
 */

export type PracticeMode = "letters" | "words" | "sentences";

export const PRACTICE_TEXT: Record<PracticeMode, string[]> = {
  letters: ["a s d f g h j k l", "q w e r t y u i o p", "z x c v b n m"],
  words: ["cat dog sun moon", "red blue green", "read write play"],
  sentences: [
    "The cat is big.",
    "I like to play.",
    "The sun is hot.",
    "We can read a book.",
    "My dog can run fast.",
  ],
};

export type ModeOption = {
  id: PracticeMode;
  label: string;
  blurb: string;
  /** Short noun used by the reward shelf, e.g. "keys you typed". */
  unit: string;
};

export const MODE_OPTIONS: ModeOption[] = [
  { id: "letters", label: "Letters", blurb: "One key at a time", unit: "keys" },
  { id: "words", label: "Words", blurb: "Build little word trails", unit: "words" },
  { id: "sentences", label: "Sentences", blurb: "Type a whole thought", unit: "words" },
];

export type PromptWord = {
  /** Ordinal of the word inside the prompt. */
  index: number;
  /** Character index of the first letter of the word. */
  start: number;
  /** Character index just after the last letter of the word. */
  end: number;
  text: string;
};

export type PromptSegment = {
  kind: "word" | "space";
  /** Character index of the first character of the segment. */
  start: number;
  /** Character index just after the last character of the segment. */
  end: number;
  /** Ordinal of the word this segment belongs to (spaces use the previous word). */
  wordIndex: number;
  text: string;
};

/**
 * Splits a prompt into words and single-space segments while keeping the
 * original character indexes, so every character can still be matched against
 * the real typed value.
 */
export function splitPrompt(prompt: string): { words: PromptWord[]; segments: PromptSegment[] } {
  const characters = Array.from(prompt);
  const words: PromptWord[] = [];
  const segments: PromptSegment[] = [];
  let cursor = 0;

  while (cursor < characters.length) {
    if (characters[cursor] === " ") {
      segments.push({
        kind: "space",
        start: cursor,
        end: cursor + 1,
        wordIndex: words.length - 1,
        text: " ",
      });
      cursor += 1;
      continue;
    }

    const start = cursor;
    while (cursor < characters.length && characters[cursor] !== " ") cursor += 1;

    const wordIndex = words.length;
    const text = characters.slice(start, cursor).join("");
    words.push({ index: wordIndex, start, end: cursor, text });
    segments.push({ kind: "word", start, end: cursor, wordIndex, text });
  }

  return { words, segments };
}

/**
 * A word counts as finished when every one of its characters has been typed
 * and every one of them matches the prompt.
 */
export function getCompletedWordFlags(
  promptCharacters: string[],
  typedCharacters: string[],
  words: PromptWord[],
): boolean[] {
  return words.map((word) => {
    if (typedCharacters.length < word.end) return false;
    for (let index = word.start; index < word.end; index += 1) {
      if (typedCharacters[index] !== promptCharacters[index]) return false;
    }
    return true;
  });
}

/** A word carries a mistake flag while any typed letter inside it is wrong. */
export function getWordMistakeFlags(
  promptCharacters: string[],
  typedCharacters: string[],
  words: PromptWord[],
): boolean[] {
  return words.map((word) => {
    const limit = Math.min(word.end, typedCharacters.length);
    for (let index = word.start; index < limit; index += 1) {
      if (typedCharacters[index] !== promptCharacters[index]) return true;
    }
    return false;
  });
}

/**
 * Counts how many characters were added between two textarea values.
 * Backspacing returns a negative number, which never counts as progress.
 */
export function countInsertedCharacters(previous: string, next: string) {
  const previousCharacters = Array.from(previous);
  const nextCharacters = Array.from(next);
  let prefixLength = 0;

  while (
    prefixLength < previousCharacters.length &&
    prefixLength < nextCharacters.length &&
    previousCharacters[prefixLength] === nextCharacters[prefixLength]
  ) {
    prefixLength += 1;
  }

  let previousEnd = previousCharacters.length;
  let nextEnd = nextCharacters.length;

  while (
    previousEnd > prefixLength &&
    nextEnd > prefixLength &&
    previousCharacters[previousEnd - 1] === nextCharacters[nextEnd - 1]
  ) {
    previousEnd -= 1;
    nextEnd -= 1;
  }

  return nextEnd - prefixLength;
}

export function formatTime(seconds: number) {
  return seconds < 10 ? `${seconds.toFixed(1)} sec` : `${Math.round(seconds)} sec`;
}

/** Star and XP rules. Every number below is derived from real typing activity. */
export const REWARD_RULES = {
  xpPerWord: 10,
  xpPerRound: 30,
  starsPerRound: 3,
} as const;
