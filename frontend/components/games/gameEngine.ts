import { wordSets, type WordCard } from "@/components/english/englishContent";
import type { GameId } from "@/components/games/gameCatalog";
import { seededShuffle } from "@/components/games/wordQuestions";

export const ROUNDS_PER_LEVEL = 5;

export type Choice = { label: string; value: string; picture?: string; colorHex?: string };

export const wordPool = wordSets.flatMap((set) => set.words);
export const uniqueWords = [...new Map(wordPool.map((word) => [word.id, word])).values()];
export const vocabularyByTopic = new Map(wordSets.map((set) => [set.label, set.words]));

export const sentenceNormalise = (value: string) =>
  value.toLocaleLowerCase().replace(/[.!?,]/g, "").replace(/\s+/g, " ").trim();

export const getWordTopic = (word: WordCard) =>
  word.topic ?? wordSets.find((set) => set.words.some((entry) => entry.id === word.id))?.label ?? "Everyday Objects";

export function gameSeed(gameId: string) {
  return Array.from(gameId).reduce((total, letter) => total + letter.charCodeAt(0), 0);
}

export function getTarget(gameId: GameId, level: number, round: number) {
  const needsSingleWord = ["missing-letters", "word-scramble", "guess-the-word", "crossword", "jigsaw-puzzle"].includes(gameId);
  const pool = needsSingleWord ? uniqueWords.filter((word) => /^[a-z]+$/i.test(word.word)) : uniqueWords;
  const index = (gameSeed(gameId) + (level - 1) * 37 + round * 19) % pool.length;
  return pool[index];
}

export function getWordChoices(target: WordCard, gameId: GameId, level: number, round: number, count = 4) {
  const seed = gameSeed(`${gameId}-${target.id}-${level}-${round}`);
  const candidateSeed = (gameSeed(gameId) + level * 31 + round * 13) % uniqueWords.length;
  const choices: WordCard[] = [target];
  for (let offset = 0; choices.length < count && offset < uniqueWords.length; offset += 1) {
    const candidate = uniqueWords[(candidateSeed + offset * 17) % uniqueWords.length];
    if (!choices.some((choice) => choice.id === candidate.id)) choices.push(candidate);
  }
  const shuffled = shuffle(choices, seed);
  if (shuffled.length > 1 && shuffled[0].id === target.id) {
    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }
  return shuffled;
}

const invalidPictureMatchTargets = uniqueWords.filter((target, index) => {
  const choices = getWordChoices(target, "picture-match", 1, index);
  return !target.word.trim() || (!target.picture.trim() && !target.colorHex)
    || choices.filter((choice) => choice.id === target.id).length !== 1
    || new Set(choices.map((choice) => choice.word.toLocaleLowerCase())).size !== choices.length;
});

if (invalidPictureMatchTargets.length) {
  throw new Error(`Picture Match data has missing pictures or ambiguous word choices: ${invalidPictureMatchTargets.map((word) => word.id).join(", ")}`);
}

export function shuffle<T>(items: T[], seed: number) {
  return seededShuffle(items, seed);
}

export function buildMathPrompt(gameId: GameId, level: number, round: number) {
  const seed = gameSeed(`${gameId}-${level}-${round}`);
  const a = 2 + (seed % Math.min(10, 6 + level));
  const b = 2 + ((seed >> 3) % Math.min(9, 5 + level));
  let prompt = `${a} + ${b} = ?`;
  let answer: number | string = a + b;
  let visual = `${a} + ${b}`;
  if (gameId === "subtraction-challenge") { const high = Math.max(a, b); const low = Math.min(a, b); prompt = `${high} − ${low} = ?`; answer = high - low; visual = `${high} − ${low}`; }
  if (gameId === "multiplication-stars") { const x = 2 + (seed % Math.min(10, 5 + level)); const y = 2 + ((seed >> 2) % Math.min(9, 5 + level)); prompt = `${x} × ${y} = ?`; answer = x * y; visual = `${x} groups of ${y}`; }
  if (gameId === "division-explorer") { const divisor = 2 + (seed % 8); const quotient = 2 + ((seed >> 3) % 8); prompt = `${divisor * quotient} ÷ ${divisor} = ?`; answer = quotient; visual = `${divisor * quotient} shared into ${divisor} groups`; }
  if (gameId === "counting-adventure") { answer = 3 + (seed % 8); prompt = "How many stars are on the island?"; visual = "⭐ ".repeat(answer).trim(); }
  if (gameId === "number-sequence") { const start = 1 + (seed % 9); const step = 2 + ((seed >> 3) % 4); prompt = "What number comes next?"; visual = `${start}   ${start + step}   ${start + step * 2}   ?`; answer = start + step * 3; }
  if (gameId === "shape-detective") { const shapes = ["circle", "square", "triangle", "rectangle", "star"]; const correct = shapes[seed % shapes.length]; prompt = `Which shape has ${correct === "triangle" ? "three sides" : correct === "square" ? "four equal sides" : correct === "rectangle" ? "two long and two short sides" : correct === "star" ? "five points" : "no corners"}?`; answer = correct; visual = ({ circle: "●", square: "■", triangle: "▲", rectangle: "▰", star: "★" } as Record<string, string>)[correct]; }
  if (gameId === "number-quest") { answer = a + 1; prompt = `Which number comes after ${a}?`; visual = `${a} → ?`; }
  if (gameId === "math-adventure") { prompt = `The explorer has ${a} gems and finds ${b} more. How many gems now?`; visual = `💎 ${a}  +  💎 ${b}`; }
  const choices: string[] = gameId === "shape-detective"
    ? shuffle([String(answer), ...["circle", "square", "triangle", "rectangle", "star"].filter((shape) => shape !== answer).slice(0, 3)], seed)
    : shuffle([...new Set([Number(answer), Number(answer) - 1, Number(answer) + 1, Number(answer) - 2, Number(answer) + 2, Number(answer) + 3]
      .filter((candidate) => Number.isFinite(candidate) && candidate >= 0)
      .map(String))].slice(0, 4), seed);
  let nextDistractor = 0;
  while (choices.length < 4) {
    const candidate = String(Number(answer) + 4 + nextDistractor);
    nextDistractor += 1;
    if (!choices.includes(candidate)) choices.push(candidate);
  }
  return { prompt, answer: String(answer), visual, choices };
}
