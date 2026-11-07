/* eslint @typescript-eslint/no-require-imports: off */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

const frontendRoot = path.resolve(__dirname, "../..");
const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function resolveAlias(request, parent, isMain, options) {
  const resolvedRequest = request.startsWith("@/")
    ? path.join(frontendRoot, request.slice(2))
    : request;
  return originalResolveFilename.call(this, resolvedRequest, parent, isMain, options);
};
require.extensions[".ts"] = (module, filename) => {
  const source = fs.readFileSync(filename, "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  module._compile(compiled, filename);
};

const {
  createWordQuestion,
  isWordAnswerCorrect,
  seededShuffle,
  validateWordQuestion,
} = require("./wordQuestions.ts");
const { getTarget, getWordChoices, shuffle, uniqueWords } = require("./gameEngine.ts");

const sampleQuestion = {
  id: "vehicle-bus-001",
  image: "🚌",
  imageAlt: "A yellow school bus",
  prompt: "What is shown in this picture?",
  correctAnswerId: "bus",
  options: [
    { id: "car", text: "Car" },
    { id: "bus", text: "Bus" },
    { id: "train", text: "Train" },
    { id: "bicycle", text: "Bicycle" },
  ],
};

test("answer validation follows option IDs across repeated shuffles", () => {
  const originalOptions = sampleQuestion.options;
  let correctWasNotFirst = false;
  for (let seed = 0; seed < 200; seed += 1) {
    const question = { ...sampleQuestion, options: seededShuffle(originalOptions, seed) };
    if (question.options[0].id !== "bus") correctWasNotFirst = true;
    assert.equal(isWordAnswerCorrect(question, "bus"), true);
    assert.equal(isWordAnswerCorrect(question, "car"), false);
    assert.deepEqual(new Set(question.options.map(({ id }) => id)), new Set(originalOptions.map(({ id }) => id)));
  }
  assert.equal(correctWasNotFirst, true);
});

test("question builder keeps the target ID as the correct answer", () => {
  const target = { id: "bus", word: "bus", picture: "🚌", meaning: "A road vehicle.", sentence: "The bus takes children to school." };
  const question = createWordQuestion(target, [target, { ...target, id: "car", word: "car" }], "word-match", 1, 0);
  assert.equal(question.correctAnswerId, "bus");
  assert.equal(question.options.find(({ id }) => id === "bus")?.text, "bus");
  assert.equal(validateWordQuestion(question), true);
});

test("validator rejects missing answers, duplicate option IDs and duplicate text", () => {
  assert.throws(() => validateWordQuestion({ ...sampleQuestion, options: sampleQuestion.options.filter(({ id }) => id !== "bus") }), /correct answer ID is missing/);
  assert.throws(() => validateWordQuestion({ ...sampleQuestion, options: [...sampleQuestion.options, { id: "bus", text: "School bus" }] }), /duplicate option ID/);
  assert.throws(() => validateWordQuestion({ ...sampleQuestion, options: [...sampleQuestion.options, { id: "bus-copy", text: " BUS " }] }), /duplicate option text/);
});

test("validator rejects empty pictures, empty options and duplicate question IDs", () => {
  assert.throws(() => validateWordQuestion({ ...sampleQuestion, image: "" }), /picture is empty/);
  assert.throws(() => validateWordQuestion({ ...sampleQuestion, options: [] }), /fewer than two options/);
  assert.throws(() => validateWordQuestion(sampleQuestion, new Set([sampleQuestion.id])), /duplicate question ID/);
});

test("every generated word choice set retains one correct option through shuffling", () => {
  const gameIds = ["word-match", "picture-match", "picture-puzzle", "listening-detective", "vocabulary-quiz"];
  let ordersWithCorrectNotFirst = 0;
  for (const gameId of gameIds) {
    for (let level = 1; level <= 20; level += 1) {
      for (let round = 0; round < 5; round += 1) {
        const target = getTarget(gameId, level, round);
        const choices = getWordChoices(target, gameId, level, round);
        const question = createWordQuestion(target, choices, gameId, level, round);
        assert.equal(question.options.filter(({ id }) => id === question.correctAnswerId).length, 1);
        assert.equal(isWordAnswerCorrect(question, question.correctAnswerId), true);
        assert.equal(isWordAnswerCorrect(question, "not-an-option"), false);
        assert.equal(new Set(question.options.map(({ id }) => id)).size, question.options.length);
        if (question.options[0].id !== question.correctAnswerId) ordersWithCorrectNotFirst += 1;
      }
    }
  }
  assert.ok(ordersWithCorrectNotFirst > 0);

  for (const target of uniqueWords) {
    const options = shuffle(getWordChoices(target, "word-match", 1, uniqueWords.indexOf(target)), uniqueWords.indexOf(target));
    const question = createWordQuestion(target, options, "word-match", 1, uniqueWords.indexOf(target));
    assert.equal(question.options.filter(({ id }) => id === target.id).length, 1, target.id);
  }
});
