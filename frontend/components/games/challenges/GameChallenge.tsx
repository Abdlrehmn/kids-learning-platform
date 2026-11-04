"use client";

import { useMemo, useState } from "react";
import { sentencePrompts, stories, wordSets, type WordCard } from "@/components/english/englishContent";
import type { GameId } from "@/components/games/gameCatalog";
import {
  ROUNDS_PER_LEVEL,
  gameSeed,
  getWordChoices,
  getWordTopic,
  sentenceNormalise,
  shuffle,
  uniqueWords,
  vocabularyByTopic,
  type Choice,
} from "@/components/games/gameEngine";
import GameFeedback from "@/components/games/challenges/GameFeedback";
import MathGameChallenge from "@/components/games/challenges/MathGameChallenge";
import SequenceMemoryChallenge from "@/components/games/challenges/SequenceMemoryChallenge";

export default function GameChallenge({ gameId, gameTitle, instruction, target, level, round, onCorrect, onNext }: {
  gameId: GameId;
  gameTitle: string;
  instruction: string;
  target: WordCard;
  level: number;
  round: number;
  onCorrect: () => void;
  onNext: () => void;
}) {
  const [status, setStatus] = useState<"idle" | "right" | "wrong">("idle");
  const [feedback, setFeedback] = useState("");
  const [answer, setAnswer] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [memoryOpen, setMemoryOpen] = useState<string[]>([]);
  const [memoryError, setMemoryError] = useState(false);
  const [memoryAttempts, setMemoryAttempts] = useState(0);

  const choices = useMemo(() => getWordChoices(target, gameId, level, round), [target, gameId, level, round]);
  const check = (isCorrect: boolean, success: string, retry: string) => {
    if (status === "right") return;
    if (isCorrect) {
      setStatus("right");
      setFeedback(success);
      onCorrect();
    } else {
      setStatus("wrong");
      setFeedback(retry);
    }
  };
  const retry = () => { setStatus("idle"); setFeedback(""); setAnswer(""); setSelected([]); };
  const choose = (value: string, expected: string, success: string, retry: string) => {
    setAnswer(value);
    check(value === expected, success, retry);
  };
  const playAudio = () => {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      setFeedback("Audio is not available in this browser. Read the word and keep playing.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(target.word);
    utterance.lang = "en-US";
    utterance.rate = 0.82;
    window.speechSynthesis.speak(utterance);
  };

  const handleMemory = (cardId: string) => {
    if (matched.includes(cardId) || memoryOpen.includes(cardId) || memoryOpen.length === 2) return;
    const [cardType, wordId] = cardId.split(":");
    if (cardType === "sound" && "speechSynthesis" in window) {
      const word = uniqueWords.find((entry) => entry.id === wordId);
      if (word) { window.speechSynthesis.cancel(); window.speechSynthesis.speak(new SpeechSynthesisUtterance(word.word)); }
    }
    const nextOpen = [...memoryOpen, cardId];
    setMemoryOpen(nextOpen);
    if (nextOpen.length === 2) {
      setMemoryAttempts((attempts) => attempts + 1);
      const firstWord = nextOpen[0].split(":")[1];
      const secondWord = nextOpen[1].split(":")[1];
      if (firstWord === secondWord) {
        const nextMatched = [...matched, ...nextOpen];
        setMatched(nextMatched);
        setMemoryOpen([]);
        setMemoryError(false);
        if (nextMatched.length === 6) check(true, "All the pairs match!", "Try another pair.");
      } else {
        setMemoryError(true);
        window.setTimeout(() => { setMemoryOpen([]); setMemoryError(false); }, 650);
      }
    }
  };

  const memoryGameIds: GameId[] = ["memory-cards", "picture-pairs", "word-memory", "sound-memory", "animal-match"];
  const animalWords = wordSets.find((set) => set.label.toLocaleLowerCase() === "animals")?.words ?? [];
  const memoryWords = gameId === "animal-match" && animalWords.length >= 3 ? animalWords.slice(0, 3) : choices.slice(0, 3);
  const memoryCards = shuffle(memoryWords.flatMap((word) => {
    if (gameId === "picture-pairs") return [
      { id: `picture:${word.id}`, wordId: word.id, face: word.picture },
      { id: `picture-copy:${word.id}`, wordId: word.id, face: word.picture },
    ];
    if (gameId === "word-memory") return [
      { id: `word:${word.id}`, wordId: word.id, face: word.word },
      { id: `word-copy:${word.id}`, wordId: word.id, face: word.word },
    ];
    if (gameId === "sound-memory") return [
      { id: `sound:${word.id}`, wordId: word.id, face: `🔊 ${word.word}` },
      { id: `picture:${word.id}`, wordId: word.id, face: word.picture },
    ];
    return [
      { id: `picture:${word.id}`, wordId: word.id, face: word.picture },
      { id: `word:${word.id}`, wordId: word.id, face: word.word },
    ];
  }), gameSeed(gameId) + round + level);

  const nextTile = (index: number, tileList: string[]) => {
    const updated = [...selected, tileList[index]];
    setSelected(updated);
    if (updated.length === tileList.length) check(updated.join(" ") === sentencePrompt.sentence, "You built the sentence!", "That order does not make a sentence yet.");
  };

  const sentencePrompt = sentencePrompts[(level + round) % sentencePrompts.length];
  const sortedSentenceTiles = shuffle(sentencePrompt.tiles, gameSeed(gameId) + level + round);
  const story = stories[(level + round) % stories.length];
  const storyOrder = selected.map(Number);
  const punctuationPrompts = [
    { sentence: "Where is my storybook", answer: "?", choices: [".", "?", "!"] },
    { sentence: "The little bird is singing", answer: ".", choices: ["?", "!", "."] },
    { sentence: "What a bright rainbow", answer: "!", choices: ["!", ".", "?"] },
  ];
  const punctuation = punctuationPrompts[(level + round) % punctuationPrompts.length];
  const noun = (vocabularyByTopic.get("Animals") ?? [target])[round % (vocabularyByTopic.get("Animals")?.length ?? 1)];
  const verbs = ["jump", "swim", "laugh", "climb", "dance", "whisper", "build", "read"];
  const targetVerb = verbs[(round + level) % verbs.length];
  const adjectiveWords = ["bright", "fluffy", "tiny", "gentle", "playful", "colorful", "sleepy", "curious"];
  const targetAdjective = adjectiveWords[(round + level) % adjectiveWords.length];
  const sentenceChoices = [targetVerb, "pencil", "bright", "gently"];
  const findAdjectiveChoices = [targetAdjective, "puppy", "runs", "softly"];
  const nameChoices: Choice[] = choices.map((word) => ({ label: word.word, value: word.word, picture: word.picture, colorHex: word.colorHex }));

  const titleLine = <div className="game-question-heading"><small>Round {round + 1} of {ROUNDS_PER_LEVEL}</small><h3>{gameTitle}</h3><p>{instruction}</p></div>;
  const textChoices = (items: string[], expected: string, success: string, retry: string) => (
    <div className="game-choice-grid">{items.map((item) => <button type="button" key={item} className={`game-choice${answer === item ? " is-selected" : ""}`} disabled={status === "right"} onClick={() => choose(item, expected, success, retry)}>{item}</button>)}</div>
  );

  if (["math-adventure", "number-quest", "addition-adventure", "subtraction-challenge", "multiplication-stars", "division-explorer", "shape-detective", "counting-adventure", "number-sequence"].includes(gameId)) {
    return <MathGameChallenge gameId={gameId} level={level} round={round} instruction={instruction} onCorrect={onCorrect} onNext={onNext} />;
  }

  if (gameId === "sequence-memory") {
    return <SequenceMemoryChallenge round={round} level={level} instruction={instruction} onCorrect={onCorrect} onNext={onNext} />;
  }

  if (memoryGameIds.includes(gameId)) {
    return <div className="game-round">{titleLine}<div className="memory-grid">{memoryCards.map((card) => {
      const isRevealed = memoryOpen.includes(card.id) || matched.includes(card.id);
      return <button type="button" key={card.id} className={`memory-card${isRevealed ? " is-open" : ""}${matched.includes(card.id) ? " is-matched" : ""}`} disabled={status === "right"} onClick={() => handleMemory(card.id)} aria-label={isRevealed ? card.face : "Hidden memory card"} aria-pressed={isRevealed}><span className="memory-card-back" aria-hidden="true">?</span><span className="memory-card-face" aria-hidden={!isRevealed}>{isRevealed ? card.face : ""}</span></button>;
    })}</div><p className="memory-attempt-count">Pairs tried: <b>{memoryAttempts}</b> · Pairs found: <b>{matched.length / 2} of 3</b></p>{memoryError && <p className="game-feedback is-wrong" role="status">Those cards do not match. Keep the picture in mind and try again.</p>}{status === "right" && <GameFeedback feedback={feedback} onNext={onNext} onRetry={retry} isCorrect={status === "right"} />}</div>;
  }

  if (gameId === "alphabet-hunt") {
    const letter = target.word[0].toLocaleUpperCase();
    const firstLetterChoices = shuffle([target, ...uniqueWords.filter((word) => word.id !== target.id && word.word[0]?.toLocaleUpperCase() !== letter).slice((level + round) % 30, (level + round) % 30 + 3)], gameSeed(gameId) + level + round);
    return <div className="game-round">{titleLine}<div className="game-alphabet-target">{letter}<small>Find a picture that starts with this letter</small></div><div className="game-choice-grid">{firstLetterChoices.map((word) => <button type="button" key={word.id} className="game-choice game-choice--picture" disabled={status === "right"} onClick={() => choose(word.word, target.word, "You found the right beginning sound!", "Say the word slowly and listen to its first sound.")}>{word.picture}<b>{word.word}</b></button>)}</div>{status !== "idle" && <GameFeedback feedback={feedback} onNext={onNext} onRetry={retry} isCorrect={status === "right"} />}</div>;
  }

  if (["jigsaw-puzzle", "picture-puzzle"].includes(gameId)) {
    return <div className="game-round">{titleLine}<div className="game-picture-prompt"><span aria-hidden="true">{target.picture}</span><small>{gameId === "jigsaw-puzzle" ? "Which puzzle piece completes this picture?" : "Choose the word that matches the picture."}</small></div><div className="game-choice-grid">{choices.map((word) => <button type="button" key={word.id} className="game-choice game-choice--picture" disabled={status === "right"} onClick={() => choose(word.word, target.word, "You found the matching puzzle piece!", "That piece belongs to another picture. Try again.")}>{word.picture}<b>{word.word}</b></button>)}</div>{status !== "idle" && <GameFeedback feedback={feedback} onNext={onNext} onRetry={retry} isCorrect={status === "right"} />}</div>;
  }

  if (gameId === "letter-puzzle") {
    const letter = target.word[0].toLocaleUpperCase();
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const letterChoices = shuffle([letter, ...alphabet.filter((character) => character !== letter).slice((level * 5 + round * 3) % 19, (level * 5 + round * 3) % 19 + 3)], gameSeed(gameId) + level + round);
    return <div className="game-round">{titleLine}<span className="game-big-picture" aria-hidden="true">{target.picture}</span><p className="game-clue">Which letter starts the word <b>{target.word}</b>?</p>{textChoices(letterChoices, letter, "You found the first letter!", "Say the word slowly and listen for its first letter.")}{status !== "idle" && <GameFeedback feedback={feedback} onNext={onNext} onRetry={retry} isCorrect={status === "right"} />}</div>;
  }

  if (["missing-piece", "pattern-builder", "pattern-detective"].includes(gameId)) {
    const patterns = [
      { tiles: ["🔴", "🔵", "🔴", "🔵", "?"], answer: "🔴", options: ["🔴", "🔵", "🟡", "🟢"] },
      { tiles: ["⭐", "⭐", "🌙", "⭐", "⭐", "?"], answer: "🌙", options: ["🌙", "⭐", "☀️", "☁️"] },
      { tiles: ["▲", "■", "●", "▲", "■", "?"], answer: "●", options: ["●", "■", "▲", "★"] },
      { tiles: ["🍎", "🍌", "🍌", "🍎", "🍌", "🍌", "?"], answer: "🍎", options: ["🍎", "🍌", "🍇", "🍊"] },
    ];
    const pattern = patterns[(level + round + gameSeed(gameId)) % patterns.length];
    return <div className="game-round">{titleLine}<div className="game-pattern-tiles">{pattern.tiles.map((tile, index) => <span key={`${tile}-${index}`} className={tile === "?" ? "is-missing" : ""}>{tile}</span>)}</div><p className="game-clue">{gameId === "missing-piece" ? "Find the piece that is missing." : "What comes next in the pattern?"}</p>{textChoices(pattern.options, pattern.answer, "You completed the pattern!", "Look at what repeats and try again.")}{status !== "idle" && <GameFeedback feedback={feedback} onNext={onNext} onRetry={retry} isCorrect={status === "right"} />}</div>;
  }

  if (gameId === "shape-builder") {
    const shapeChoices = ["Square + triangle = house", "Circle + line = tree", "Two circles = boat", "Star + square = fish"];
    const answerShape = shapeChoices[0];
    return <div className="game-round">{titleLine}<div className="game-shape-build" aria-hidden="true"><span>□</span><span>△</span><b>?</b></div><p className="game-clue">Which shapes can build a little house?</p>{textChoices(shapeChoices, answerShape, "You built the house!", "A house has a square base and a triangle roof.")}{status !== "idle" && <GameFeedback feedback={feedback} onNext={onNext} onRetry={retry} isCorrect={status === "right"} />}</div>;
  }

  if (gameId === "find-difference") {
    const groupTopic = getWordTopic(target);
    const sameTopic = (vocabularyByTopic.get(groupTopic) ?? [target]).filter((word) => word.id !== target.id).slice(0, 4);
    const different = uniqueWords.find((word) => getWordTopic(word) !== groupTopic) ?? target;
    const pairs = shuffle([[sameTopic[0] ?? target, sameTopic[1] ?? target], [sameTopic[1] ?? target, sameTopic[2] ?? target], [sameTopic[2] ?? target, different], [sameTopic[0] ?? target, sameTopic[3] ?? target]], level + round + gameSeed(gameId));
    const oddPair = pairs.find((pair) => pair.some((word) => getWordTopic(word) !== groupTopic)) ?? pairs[2];
    const pairLabel = (pair: WordCard[]) => pair.map((word) => word.picture || word.word).join("  +  ");
    return <div className="game-round">{titleLine}<p className="game-clue">Three pairs belong to the same topic. Which pair is different?</p><div className="game-choice-grid">{pairs.map((pair, index) => <button type="button" key={`${pair[0].id}-${pair[1].id}-${index}`} className="game-choice" disabled={status === "right"} onClick={() => choose(pairLabel(pair), pairLabel(oddPair), "You spotted the difference!", "Those two belong together. Try another pair.")}>{pairLabel(pair)}</button>)}</div>{status !== "idle" && <GameFeedback feedback={feedback} onNext={onNext} onRetry={retry} isCorrect={status === "right"} />}</div>;
  }

  if (gameId === "logic-quest") {
    const riddles = [
      { clue: "I have hands but cannot clap. What am I?", answer: "A clock", options: ["A clock", "A puppy", "A tree", "A shoe"] },
      { clue: "I get wetter the more I dry. What am I?", answer: "A towel", options: ["A towel", "A cloud", "A book", "A kite"] },
      { clue: "I have a face and two hands but no arms. What am I?", answer: "A clock", options: ["A clock", "A cat", "A chair", "A flower"] },
      { clue: "I have many teeth but never eat. What am I?", answer: "A comb", options: ["A comb", "A fish", "A cake", "A bird"] },
    ];
    const riddle = riddles[(level + round + gameSeed(gameId)) % riddles.length];
    return <div className="game-round">{titleLine}<p className="game-clue game-clue--sentence">{riddle.clue}</p>{textChoices(riddle.options, riddle.answer, "Great detective thinking!", "Read the clue one more time.")}{status !== "idle" && <GameFeedback feedback={feedback} onNext={onNext} onRetry={retry} isCorrect={status === "right"} />}</div>;
  }

  if (gameId === "story-sequence") {
    const scrambledPages = [2, 0, 1].map((pageIndex) => ({ pageIndex, text: story.pages[pageIndex] }));
    const expectedIndex = storyOrder.length;
    return <div className="game-round">{titleLine}<p className="game-clue">Story: <b>{story.title}</b>. Choose the events in the order they happened.</p><div className="story-sequence-list">{scrambledPages.map(({ pageIndex, text }) => <button type="button" key={pageIndex} className={`story-sequence-card${selected.includes(String(pageIndex)) ? " is-used" : ""}`} disabled={selected.includes(String(pageIndex)) || status === "right"} onClick={() => { const correct = pageIndex === expectedIndex; if (correct) { const nextOrder = [...selected, String(pageIndex)]; setSelected(nextOrder); if (nextOrder.length === story.pages.length) check(true, "You put the story in order!", "Try a different order."); } else check(false, "", "That moment belongs later in the story. Try another card."); }}>{text}</button>)}</div>{status === "right" && <GameFeedback feedback={feedback} onNext={onNext} onRetry={retry} isCorrect={status === "right"} />}{status === "wrong" && <button type="button" className="games-secondary" onClick={() => { setStatus("idle"); setFeedback(""); }}>Try again</button>}</div>;
  }

  if (gameId === "sentence-builder") {
    return <div className="game-round">{titleLine}<p className="game-clue">Build this sentence: <b>{sentencePrompt.sentence}</b></p><div className="game-tile-answer">{selected.length ? selected.join(" ") : "Tap the words below"}</div><div className="game-word-tiles">{sortedSentenceTiles.map((tile, index) => <button type="button" key={`${tile}-${index}`} disabled={selected.includes(tile) || status === "right"} onClick={() => nextTile(index, sortedSentenceTiles)}>{tile}</button>)}</div>{status === "right" && <GameFeedback feedback={feedback} onNext={onNext} onRetry={retry} isCorrect={status === "right"} />}{status === "wrong" && <button type="button" className="games-secondary" onClick={() => { setSelected([]); setStatus("idle"); setFeedback(""); }}>Reset tiles</button>}</div>;
  }

  if (gameId === "punctuation-fixer") {
    return <div className="game-round">{titleLine}<p className="game-clue game-clue--sentence">{punctuation.sentence}<span aria-hidden="true"> ___</span></p>{textChoices(punctuation.choices, punctuation.answer, "That mark fits the sentence!", "Read it again and choose another mark.")}{status !== "idle" && <GameFeedback feedback={feedback} onNext={onNext} onRetry={retry} isCorrect={status === "right"} />}</div>;
  }

  if (gameId === "noun-detective") {
    return <div className="game-round">{titleLine}<p className="game-clue game-clue--sentence">The <b>{noun.word}</b> is resting by the tree.</p>{textChoices([noun.word, "resting", "by", "gently"], noun.word, "You found the naming word!", "A noun names a person, place, animal, or thing.")}{status !== "idle" && <GameFeedback feedback={feedback} onNext={onNext} onRetry={retry} isCorrect={status === "right"} />}</div>;
  }

  if (gameId === "verb-action") {
    return <div className="game-round">{titleLine}<p className="game-clue game-clue--sentence">The children <b>{targetVerb}</b> together.</p>{textChoices(sentenceChoices, targetVerb, "That word tells the action!", "A verb tells what someone or something does.")}{status !== "idle" && <GameFeedback feedback={feedback} onNext={onNext} onRetry={retry} isCorrect={status === "right"} />}</div>;
  }

  if (gameId === "adjective-explorer") {
    return <div className="game-round">{titleLine}<p className="game-clue game-clue--sentence">The <b>{targetAdjective}</b> puppy runs to its bowl.</p>{textChoices(findAdjectiveChoices, targetAdjective, "You spotted the describing word!", "An adjective describes a person, place, animal, or thing.")}{status !== "idle" && <GameFeedback feedback={feedback} onNext={onNext} onRetry={retry} isCorrect={status === "right"} />}</div>;
  }

  if (gameId === "vocabulary-quiz") {
    const sentenceClue = target.sentence.toLocaleLowerCase().replace(target.word.toLocaleLowerCase(), "_____");
    const quizWords = getWordChoices(target, gameId, level, round).map((word) => word.word);
    return <div className="game-round">{titleLine}<p className="game-clue">Choose the word that completes the sentence:</p><p className="game-clue game-clue--sentence">{sentenceClue}</p>{textChoices(quizWords, target.word, "That word completes the idea!", "Read the sentence and try another word.")}{status !== "idle" && <GameFeedback feedback={feedback} onNext={onNext} onRetry={retry} isCorrect={status === "right"} />}</div>;
  }

  if (gameId === "word-sorting" || gameId === "treasure-hunt" || gameId === "object-sorting") {
    const expectedTopic = getWordTopic(target);
    const topics = [...new Set(uniqueWords.map((word) => word.topic).filter((topic): topic is string => Boolean(topic)))];
    const topicOptions = shuffle([expectedTopic, ...topics.filter((topic) => topic !== expectedTopic).slice(0, 3)], gameSeed(gameId) + round + level);
    const topicWords = uniqueWords.filter((word) => word.topic === expectedTopic);
    const huntTarget = topicWords[(round + level) % Math.max(1, topicWords.length)] ?? target;
    const huntChoices = shuffle([huntTarget, ...uniqueWords.filter((word) => word.topic !== expectedTopic).slice((round + level) % 40, (round + level) % 40 + 8)], gameSeed(gameId) + round + level);
    const options = gameId === "treasure-hunt" ? huntChoices.map((word) => ({ label: `${word.picture} ${word.word}`, value: word.word })) : topicOptions.map((topic) => ({ label: topic, value: topic }));
    const expectedValue = gameId === "treasure-hunt" ? huntTarget.word : expectedTopic;
    return <div className="game-round">{titleLine}<p className="game-clue">{gameId === "treasure-hunt" ? `Find a ${expectedTopic.toLocaleLowerCase()} word in the treasure grid.` : <>Sort <b>{target.word}</b> into its topic.</>}</p><div className={`game-choice-grid${gameId === "treasure-hunt" ? " game-choice-grid--treasure" : ""}`}>{options.map((option) => <button type="button" key={option.value} className={`game-choice${answer === option.value ? " is-selected" : ""}`} disabled={status === "right"} onClick={() => choose(option.value, expectedValue, "You found the right word group!", "That word belongs to another group. Try again.")}>{option.label}</button>)}</div>{status !== "idle" && <GameFeedback feedback={feedback} onNext={onNext} onRetry={retry} isCorrect={status === "right"} />}</div>;
  }

  if (gameId === "odd-one-out") {
    const groupTopic = getWordTopic(target);
    const sameTopic = (vocabularyByTopic.get(groupTopic) ?? [target]).slice(0, 3);
    const different = uniqueWords.find((word) => getWordTopic(word) !== groupTopic) ?? target;
    const oddChoices = shuffle([...sameTopic.slice(0, 3), different], level + round + gameSeed(gameId));
    return <div className="game-round">{titleLine}<p className="game-clue">Three words belong together. Tap the word from another topic.</p>{textChoices(oddChoices.map((word) => word.word), different.word, "You found the odd one out!", "Look for the word with a different topic.")}{status !== "idle" && <GameFeedback feedback={feedback} onNext={onNext} onRetry={retry} isCorrect={status === "right"} />}</div>;
  }

  if (gameId === "missing-letters") {
    const missingLetter = target.word[0].toLocaleUpperCase();
    const letterChoices = shuffle([missingLetter, ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").filter((letter) => letter !== missingLetter).slice(0, 3)], gameSeed(gameId) + level + round);
    return <div className="game-round">{titleLine}<span className="game-big-picture" aria-hidden="true">{target.picture}</span><p className="game-clue">Complete the word: <b className="game-missing-word">_ {target.word.slice(1).replace(/./g, "_ ")}</b></p>{textChoices(letterChoices, missingLetter, "That is the missing letter!", "Try another letter.")}{status !== "idle" && <GameFeedback feedback={feedback} onNext={onNext} onRetry={retry} isCorrect={status === "right"} />}</div>;
  }

  if (gameId === "word-scramble") {
    const letters = shuffle(Array.from(target.word.toLocaleUpperCase()), gameSeed(gameId) + round + level);
    const letterAnswer = selected.join("");
    return <div className="game-round">{titleLine}<span className="game-big-picture" aria-hidden="true">{target.picture}</span><p className="game-clue">Unscramble these letters to spell the word.</p><div className="game-tile-answer">{letterAnswer || "Tap letters in order"}</div><div className="game-word-tiles">{letters.map((letter, index) => <button type="button" key={`${letter}-${index}`} disabled={selected.filter((item) => item === letter).length >= letters.slice(0, index + 1).filter((item) => item === letter).length || status === "right"} onClick={() => { const nextLetters = [...selected, letter]; setSelected(nextLetters); if (nextLetters.length === letters.length) check(nextLetters.join("").toLocaleLowerCase() === target.word.toLocaleLowerCase(), "You unscrambled it!", "The letters are not in the right order. Reset and try again."); }}>{letter}</button>)}</div>{status === "right" && <GameFeedback feedback={feedback} onNext={onNext} onRetry={retry} isCorrect={status === "right"} />}{status === "wrong" && <button type="button" className="games-secondary" onClick={() => { setSelected([]); setStatus("idle"); setFeedback(""); }}>Reset letters</button>}</div>;
  }

  if (gameId === "guess-the-word") {
    const wrongGuesses = selected.filter((letter) => !target.word.toLocaleLowerCase().includes(letter)).length;
    const guessesLeft = Math.max(0, 7 - wrongGuesses);
    const guessedWord = Array.from(target.word).map((letter) => selected.includes(letter.toLocaleLowerCase()) ? letter : "_ ").join(" ");
    const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
    return <div className="game-round">{titleLine}<span className="game-big-picture" aria-hidden="true">{target.picture}</span><p className="game-clue">Guess the word. {guessesLeft} wrong guesses left.</p><p className="game-hidden-word" aria-label="Hidden word">{guessedWord}</p><div className="game-letter-bank">{alphabet.map((letter) => <button type="button" key={letter} disabled={selected.includes(letter) || status !== "idle"} onClick={() => { const nextLetters = [...selected, letter]; setSelected(nextLetters); const containsAll = Array.from(new Set(target.word.toLocaleLowerCase())).every((character) => nextLetters.includes(character)); const wrongCount = nextLetters.filter((guess) => !target.word.toLocaleLowerCase().includes(guess)).length; if (containsAll) check(true, "You uncovered the word!", "Try again."); else if (wrongCount >= 7) check(false, `No tries left. The word was ${target.word}.`, "Try a new word."); }}>{letter}</button>)}</div>{status === "right" && <GameFeedback feedback={feedback} onNext={onNext} onRetry={retry} isCorrect={status === "right"} />}{status === "wrong" && <div className="game-feedback is-wrong" role="status"><span>{feedback}</span><button type="button" className="games-secondary" onClick={retry}>Try this word again</button></div>}</div>;
  }

  if (gameId === "crossword") {
    return <div className="game-round">{titleLine}<p className="game-clue">Clue: {target.meaning}</p><div className="crossword-tiles" aria-hidden="true">{Array.from(target.word.replace(/[^a-z]/gi, "")).map((letter, index) => <span key={`${letter}-${index}`}>{answer[index]?.toLocaleUpperCase() ?? ""}</span>)}</div><label className="games-input-label">Your word<input value={answer} onChange={(event) => setAnswer(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") check(sentenceNormalise(answer) === sentenceNormalise(target.word), "That solves the clue!", `Try again. It has ${target.word.length} letters.`); }} autoComplete="off" /></label><button type="button" className="games-primary" onClick={() => check(sentenceNormalise(answer) === sentenceNormalise(target.word), "That solves the clue!", `Try again. It has ${target.word.length} letters.`)}>Check word</button>{status !== "idle" && <GameFeedback feedback={feedback} onNext={onNext} onRetry={retry} isCorrect={status === "right"} />}</div>;
  }

  if (gameId === "build-a-sentence") {
    const buildPrompt = sentencePrompts[(level + round + 2) % sentencePrompts.length];
    return <div className="game-round">{titleLine}<p className="game-clue">Use these words to write the sentence: <b>{buildPrompt.tiles.join(" · ")}</b></p><label className="games-input-label">Your sentence<input value={answer} onChange={(event) => setAnswer(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") check(sentenceNormalise(answer) === sentenceNormalise(buildPrompt.sentence), "Your sentence is in order!", "Try moving the words around."); }} autoComplete="off" /></label><button type="button" className="games-primary" onClick={() => check(sentenceNormalise(answer) === sentenceNormalise(buildPrompt.sentence), "Your sentence is in order!", "Try moving the words around.")}>Check sentence</button>{status !== "idle" && <GameFeedback feedback={feedback} onNext={onNext} onRetry={retry} isCorrect={status === "right"} />}</div>;
  }

  if (gameId === "spelling-bee") {
    return <div className="game-round">{titleLine}<span className="game-big-picture" aria-hidden="true">{target.picture}</span><p className="game-clue">Type the word shown by the picture.</p><label className="games-input-label">Spell the word<input value={answer} onChange={(event) => setAnswer(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") check(sentenceNormalise(answer) === sentenceNormalise(target.word), "Perfect spelling!", "Check the letters and try again."); }} autoComplete="off" /></label><button type="button" className="games-primary" onClick={() => check(sentenceNormalise(answer) === sentenceNormalise(target.word), "Perfect spelling!", "Check the letters and try again.")}>Check spelling</button>{status !== "idle" && <GameFeedback feedback={feedback} onNext={onNext} onRetry={retry} isCorrect={status === "right"} />}</div>;
  }

  if (gameId === "listening-detective") {
    return <div className="game-round">{titleLine}<button type="button" className="games-listen-button" onClick={playAudio}>🔊 Play the word</button><p className="game-clue">Listen, then choose what you heard.</p><div className="game-choice-grid">{nameChoices.map((choice) => <button type="button" key={choice.value} className="game-picture-choice" disabled={status === "right"} onClick={() => choose(choice.value, target.word, "You heard the word!", "Listen again and try another word.")}>{choice.colorHex ? <span className="game-color-swatch" style={{ "--game-swatch": choice.colorHex } as React.CSSProperties} aria-hidden="true" /> : <span aria-hidden="true">{choice.picture}</span>}<b>{choice.label}</b></button>)}</div>{status !== "idle" && <GameFeedback feedback={feedback} onNext={onNext} onRetry={retry} isCorrect={status === "right"} />}</div>;
  }

  if (gameId === "picture-match") {
    return <div className="game-round">{titleLine}{target.colorHex ? <span className="game-color-swatch game-color-swatch--large" style={{ "--game-swatch": target.colorHex } as React.CSSProperties} aria-hidden="true" /> : <span className="game-big-picture" aria-hidden="true">{target.picture}</span>}<p className="game-clue">Which word matches this picture?</p><div className="game-choice-grid">{nameChoices.map((choice) => <button type="button" key={choice.value} className="game-choice" disabled={status === "right"} onClick={() => choose(choice.value, target.word, "That picture and word match!", "Look closely at the picture and try again.")}>{choice.label}</button>)}</div>{status !== "idle" && <GameFeedback feedback={feedback} onNext={onNext} onRetry={retry} isCorrect={status === "right"} />}</div>;
  }

  if (gameId === "word-match") {
    return <div className="game-round">{titleLine}<div className="game-picture-prompt"><span aria-hidden="true">{target.colorHex ? <span className="game-color-swatch game-color-swatch--large" style={{ "--game-swatch": target.colorHex } as React.CSSProperties} /> : target.picture}</span><small>Which word matches this picture?</small></div><div className="game-choice-grid">{choices.map((choice) => <button type="button" key={choice.id} className="game-choice game-choice--picture" disabled={status === "right"} onClick={() => choose(choice.word, target.word, "That picture and word match!", "Look closely at the picture and try another word.")}>{choice.word}</button>)}</div>{status !== "idle" && <GameFeedback feedback={feedback} onNext={onNext} onRetry={retry} isCorrect={status === "right"} />}</div>;
  }

  const topic = getWordTopic(target);
  const topicChoices = shuffle([topic, ...wordSets.map((set) => set.label).filter((label) => label !== topic).slice(0, 3)], round + level);
  return <div className="game-round">{titleLine}<span className="game-big-picture" aria-hidden="true">{target.picture}</span><p className="game-clue">Which topic does <b>{target.word}</b> belong to?</p>{textChoices(topicChoices, topic, "You chose the right topic!", "Try another topic.")}{status !== "idle" && <GameFeedback feedback={feedback} onNext={onNext} onRetry={retry} isCorrect={status === "right"} />}</div>;
}
