import type { WordCard } from "@/components/english/englishContent";

export type WordQuestionOption = { id: string; text: string };

export type WordQuestion = {
  id: string;
  image: string;
  imageAlt: string;
  prompt: string;
  correctAnswerId: string;
  options: WordQuestionOption[];
};

export function validateWordQuestion(question: WordQuestion, knownQuestionIds: ReadonlySet<string> = new Set()) {
  const errors: string[] = [];
  if (!question.id.trim()) errors.push("question ID is empty");
  if (knownQuestionIds.has(question.id)) errors.push(`duplicate question ID: ${question.id}`);
  if (!question.image.trim()) errors.push(`${question.id}: picture is empty`);
  if (!question.imageAlt.trim()) errors.push(`${question.id}: picture description is empty`);
  if (!question.prompt.trim()) errors.push(`${question.id}: prompt is empty`);
  if (question.options.length < 2) errors.push(`${question.id}: fewer than two options`);

  const optionIds = new Set<string>();
  const optionTexts = new Set<string>();
  for (const option of question.options) {
    if (!option.id.trim()) errors.push(`${question.id}: option ID is empty`);
    if (optionIds.has(option.id)) errors.push(`${question.id}: duplicate option ID ${option.id}`);
    optionIds.add(option.id);
    if (!option.text.trim()) errors.push(`${question.id}: option ${option.id} has empty text`);
    const normalizedText = option.text.trim().toLocaleLowerCase();
    if (optionTexts.has(normalizedText)) errors.push(`${question.id}: duplicate option text ${option.text}`);
    optionTexts.add(normalizedText);
  }

  if (!optionIds.has(question.correctAnswerId)) errors.push(`${question.id}: correct answer ID is missing from options`);
  if (errors.length) throw new Error(`Invalid word question: ${errors.join("; ")}`);
  return true;
}

export function createWordQuestion(
  target: WordCard,
  choices: WordCard[],
  gameId: string,
  level: number,
  round: number,
  prompt = "Which word matches this picture?",
): WordQuestion {
  const question: WordQuestion = {
    id: `${gameId}-${target.id}-level-${level}-round-${round + 1}`,
    image: target.picture,
    imageAlt: `${target.word}: ${target.meaning}`,
    prompt,
    correctAnswerId: target.id,
    options: choices.map(({ id, word }) => ({ id, text: word })),
  };
  validateWordQuestion(question);
  return question;
}

export function isWordAnswerCorrect(question: WordQuestion, selectedOptionId: string) {
  return selectedOptionId === question.correctAnswerId;
}

export function seededShuffle<T>(items: T[], seed: number) {
  const shuffled = [...items];
  let state = seed >>> 0;
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const swapIndex = state % (index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}
