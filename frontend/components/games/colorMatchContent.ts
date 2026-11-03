export type ColorMatchQuestion = {
  id: string;
  object: string;
  picture: string;
  color: string;
  choices: string[];
};

export const colorMatchPalette: Record<string, string> = {
  red: "#ef4444",
  blue: "#3b82f6",
  yellow: "#facc15",
  purple: "#8b5cf6",
  orange: "#f97316",
  green: "#22c55e",
};

const canonicalObjectColors: Record<string, string> = {
  strawberry: "red", blueberry: "blue", banana: "yellow", grapes: "purple", orange: "orange",
  grass: "green", lemon: "yellow", carrot: "orange", tomato: "red", broccoli: "green",
  eggplant: "purple", sky: "blue",
};
const canonicalObjectPictures: Record<string, string> = {
  strawberry: "🍓", blueberry: "🫐", banana: "🍌", grapes: "🍇", orange: "🍊", grass: "🌱",
  lemon: "🍋", carrot: "🥕", tomato: "🍅", broccoli: "🥦", eggplant: "🍆", sky: "🌤️",
};

export const colorMatchQuestions: ColorMatchQuestion[] = [
  { id: "strawberry", object: "strawberry", picture: "🍓", color: "red", choices: ["red", "blue", "yellow", "green"] },
  { id: "blueberry", object: "blueberry", picture: "🫐", color: "blue", choices: ["purple", "blue", "red", "green"] },
  { id: "banana", object: "banana", picture: "🍌", color: "yellow", choices: ["yellow", "purple", "red", "green"] },
  { id: "grapes", object: "grapes", picture: "🍇", color: "purple", choices: ["purple", "green", "yellow", "red"] },
  { id: "orange", object: "orange", picture: "🍊", color: "orange", choices: ["orange", "yellow", "red", "purple"] },
  { id: "grass", object: "grass", picture: "🌱", color: "green", choices: ["green", "blue", "yellow", "purple"] },
  { id: "lemon", object: "lemon", picture: "🍋", color: "yellow", choices: ["yellow", "green", "orange", "purple"] },
  { id: "carrot", object: "carrot", picture: "🥕", color: "orange", choices: ["orange", "red", "yellow", "green"] },
  { id: "tomato", object: "tomato", picture: "🍅", color: "red", choices: ["red", "orange", "green", "purple"] },
  { id: "broccoli", object: "broccoli", picture: "🥦", color: "green", choices: ["green", "purple", "orange", "red"] },
  { id: "eggplant", object: "eggplant", picture: "🍆", color: "purple", choices: ["purple", "green", "blue", "red"] },
  { id: "sky", object: "sky", picture: "🌤️", color: "blue", choices: ["blue", "purple", "yellow", "green"] },
];

export function validateColorMatchQuestions(questions: ColorMatchQuestion[] = colorMatchQuestions): string[] {
  const errors: string[] = [];
  const seenIds = new Set<string>();
  for (const question of questions) {
    if (seenIds.has(question.id)) errors.push(`${question.id}: duplicate question id`);
    seenIds.add(question.id);
    if (canonicalObjectColors[question.id] !== question.color) errors.push(`${question.id}: expected ${canonicalObjectColors[question.id] ?? "a registered object"}, got ${question.color}`);
    if (question.object.trim().toLocaleLowerCase() !== question.id || canonicalObjectPictures[question.id] !== question.picture) errors.push(`${question.id}: object label or picture does not match its registered object`);
    if (!(question.color in colorMatchPalette)) errors.push(`${question.id}: unknown correct color`);
    if (question.choices.length !== 4 || new Set(question.choices).size !== question.choices.length) errors.push(`${question.id}: choices must contain four distinct colors`);
    if (question.choices.filter((choice) => choice === question.color).length !== 1) errors.push(`${question.id}: choices must contain the correct color exactly once`);
    if (question.choices.some((choice) => !(choice in colorMatchPalette))) errors.push(`${question.id}: choices contain an unknown color`);
    if (!question.object.trim() || !question.picture.trim()) errors.push(`${question.id}: object label and picture are required`);
  }
  return errors;
}

const colorMatchErrors = validateColorMatchQuestions();
if (colorMatchErrors.length) throw new Error(`Color matching data is invalid: ${colorMatchErrors.join("; ")}`);
