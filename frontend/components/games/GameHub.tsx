"use client";

import { useEffect, useMemo, useState } from "react";
import WorldNavigation from "@/components/WorldNavigation";
import { sentencePrompts, stories, wordSets, type WordCard } from "@/components/english/englishContent";
import { colorMatchPalette, colorMatchQuestions, type ColorMatchQuestion } from "@/components/games/colorMatchContent";
import { fireConfetti } from "@/components/Confetti";

const GAME_STORAGE_KEY = "kiddoworld-games-progress-v1";
const ROUNDS_PER_LEVEL = 5;

const games = [
  { id: "word-match", title: "Word Match", icon: "🔗", mechanic: "Match a word to its meaning.", instruction: "Read the clue, then choose the word that fits." },
  { id: "picture-match", title: "Picture Match", icon: "🖼️", mechanic: "Connect a picture with its word.", instruction: "Look at the picture and tap the matching word." },
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
] as const;

type GameId = (typeof games)[number]["id"];
type GameRecord = { level: number; bestScore: number; levelsCompleted: number };
type GameProgress = { xp: number; records: Partial<Record<GameId, GameRecord>> };
type Choice = { label: string; value: string; picture?: string; colorHex?: string };

const EMPTY_PROGRESS: GameProgress = { xp: 0, records: {} };
const wordPool = wordSets.flatMap((set) => set.words);
const uniqueWords = [...new Map(wordPool.map((word) => [word.id, word])).values()];
const vocabularyByTopic = new Map(wordSets.map((set) => [set.label, set.words]));
const sentenceNormalise = (value: string) => value.toLocaleLowerCase().replace(/[.!?,]/g, "").replace(/\s+/g, " ").trim();
const getWordTopic = (word: WordCard) => word.topic ?? wordSets.find((set) => set.words.some((entry) => entry.id === word.id))?.label ?? "Everyday Objects";

function gameSeed(gameId: string) {
  return Array.from(gameId).reduce((total, letter) => total + letter.charCodeAt(0), 0);
}

function getTarget(gameId: GameId, level: number, round: number) {
  const needsSingleWord = ["missing-letters", "word-scramble", "guess-the-word", "crossword"].includes(gameId);
  const pool = needsSingleWord ? uniqueWords.filter((word) => /^[a-z]+$/i.test(word.word)) : uniqueWords;
  const index = (gameSeed(gameId) + (level - 1) * 37 + round * 19) % pool.length;
  return pool[index];
}

function getWordChoices(target: WordCard, gameId: GameId, level: number, round: number, count = 4) {
  const seed = (gameSeed(gameId) + level * 31 + round * 13) % uniqueWords.length;
  const choices: WordCard[] = [target];
  for (let offset = 0; choices.length < count && offset < uniqueWords.length; offset += 1) {
    const candidate = uniqueWords[(seed + offset * 17) % uniqueWords.length];
    if (!choices.some((choice) => choice.id === candidate.id)) choices.push(candidate);
  }
  return choices;
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

function shuffle<T>(items: T[], seed: number) {
  return items.map((item, index) => ({ item, sort: (index * 31 + seed * 17) % 97 })).sort((left, right) => left.sort - right.sort).map(({ item }) => item);
}

function readProgress(value: string | null): GameProgress {
  if (!value) return EMPTY_PROGRESS;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object") return EMPTY_PROGRESS;
    const candidate = parsed as Partial<GameProgress>;
    const records: Partial<Record<GameId, GameRecord>> = {};
    for (const game of games) {
      const saved = candidate.records?.[game.id];
      if (!saved || typeof saved !== "object") continue;
      const level = Number(saved.level);
      const bestScore = Number(saved.bestScore);
      const levelsCompleted = Number(saved.levelsCompleted);
      if ([level, bestScore, levelsCompleted].every(Number.isFinite)) {
        records[game.id] = {
          level: Math.max(1, Math.floor(level)),
          bestScore: Math.max(0, Math.floor(bestScore)),
          levelsCompleted: Math.max(0, Math.floor(levelsCompleted)),
        };
      }
    }
    return {
      xp: Number.isFinite(candidate.xp) && Number(candidate.xp) >= 0 ? Number(candidate.xp) : 0,
      records,
    };
  } catch {
    return EMPTY_PROGRESS;
  }
}

export default function GameHub() {
  const [progress, setProgress] = useState<GameProgress>(EMPTY_PROGRESS);
  const [ready, setReady] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { setProgress(readProgress(window.localStorage.getItem(GAME_STORAGE_KEY))); }
      catch { setProgress(EMPTY_PROGRESS); }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(progress));
    } catch {
      return;
    }
  }, [progress, ready]);

  const finishLevel = (gameId: GameId, level: number, score: number) => {
    setProgress((current) => {
      const record = current.records[gameId] ?? { level: 1, bestScore: 0, levelsCompleted: 0 };
      return {
        xp: current.xp + 25,
        records: {
          ...current.records,
          [gameId]: {
            level: Math.max(record.level, level + 1),
            bestScore: Math.max(record.bestScore, score),
            levelsCompleted: record.levelsCompleted + 1,
          },
        },
      };
    });
    fireConfetti(window.innerWidth / 2, window.innerHeight * 0.35, 28);
  };

  const activeGame = games.find((game) => game.id === selectedGame);
  return (
    <div className="english-world games-world">
      <WorldNavigation active="games" />
      <main className="games-main">
        <header className="games-hero">
          <span className="games-hero-star games-hero-star--one" aria-hidden="true">✦</span>
          <span className="games-hero-star games-hero-star--two" aria-hidden="true">✧</span>
          <p className="games-kicker">Play · practise · grow</p>
          <h1>Learning Games</h1>
          <p>Choose a game, try a new challenge, and collect learning stars along the way.</p>
          <div className="games-xp"><span aria-hidden="true">⭐</span><b>{ready ? progress.xp : "—"}</b><small>XP earned here</small></div>
        </header>

        {activeGame ? (
          <GameSession
            key={activeGame.id}
            game={activeGame}
            saved={progress.records[activeGame.id]}
            onBack={() => setSelectedGame(null)}
            onFinish={finishLevel}
          />
        ) : (
          <section className="games-library" aria-labelledby="games-library-title">
            <div className="games-library-heading"><div><p className="games-kicker">Pick your next challenge</p><h2 id="games-library-title">{games.length} ways to play and learn</h2></div><p>Every game has its own controls, clues, and five-round levels.</p></div>
            <div className="games-grid">
              {games.map((game, index) => {
                const record = progress.records[game.id];
                return (
                  <button type="button" key={game.id} className="games-card" style={{ "--game-index": index } as React.CSSProperties} onClick={() => setSelectedGame(game.id)}>
                    <span className="games-card-icon" aria-hidden="true">{game.icon}</span>
                    <strong>{game.title}</strong>
                    <small>{game.mechanic}</small>
                    <span className="games-card-progress">{record ? `Level ${record.level} · ${record.levelsCompleted} complete` : "Level 1 · Ready to play"}</span>
                    <span className="games-card-action">Play game <span aria-hidden="true">→</span></span>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function GameSession({ game, saved, onBack, onFinish }: {
  game: (typeof games)[number];
  saved?: GameRecord;
  onBack: () => void;
  onFinish: (gameId: GameId, level: number, score: number) => void;
}) {
  const [level, setLevel] = useState(saved?.level ?? 1);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [levelComplete, setLevelComplete] = useState(false);
  const target = game.id === "color-match" ? null : getTarget(game.id, level, round);
  const colorQuestion = game.id === "color-match"
    ? colorMatchQuestions[(gameSeed(game.id) + (level - 1) * 7 + round * 5) % colorMatchQuestions.length]
    : null;

  const advance = () => {
    if (round === ROUNDS_PER_LEVEL - 1) {
      setLevelComplete(true);
      onFinish(game.id, level, score);
    } else setRound((current) => current + 1);
  };
  const handleCorrect = () => setScore((current) => current + 10);
  const restart = () => { setRound(0); setScore(0); setLevelComplete(false); };
  const nextLevel = () => { setLevel((current) => current + 1); setRound(0); setScore(0); setLevelComplete(false); };

  return (
    <section className="games-session" aria-labelledby="games-session-title">
      <div className="games-session-top">
        <button type="button" className="games-back" onClick={onBack}>← All games</button>
        <div><p className="games-kicker">{game.icon} {game.title}</p><h2 id="games-session-title">Level {level}</h2></div>
        <div className="games-score"><b>{score}</b><small>points</small><button type="button" className="games-secondary" onClick={restart}>Restart</button></div>
      </div>
      <div className="games-progress" aria-label={`Round ${Math.min(round + 1, ROUNDS_PER_LEVEL)} of ${ROUNDS_PER_LEVEL}`}>
        {Array.from({ length: ROUNDS_PER_LEVEL }, (_, index) => <span key={index} className={index <= round ? "is-active" : ""} />)}
      </div>
      {levelComplete ? (
        <div className="games-complete" role="status"><span aria-hidden="true">🏆</span><p className="games-kicker">Level complete</p><h3>Brilliant playing!</h3><p>You earned 25 XP and scored {score} points.</p><div className="games-actions"><button type="button" className="games-primary" onClick={nextLevel}>Play level {level + 1}</button><button type="button" className="games-secondary" onClick={restart}>Replay level {level}</button></div></div>
      ) : (
        colorQuestion ? (
          <ColorMatchChallenge key={`${game.id}-${level}-${round}`} question={colorQuestion} round={round} onCorrect={handleCorrect} onNext={advance} />
        ) : target ? (
          <GameChallenge key={`${game.id}-${level}-${round}`} gameId={game.id} gameTitle={game.title} instruction={game.instruction} target={target} level={level} round={round} onCorrect={handleCorrect} onNext={advance} />
        ) : null
      )}
    </section>
  );
}

function ColorMatchChallenge({ question, round, onCorrect, onNext }: {
  question: ColorMatchQuestion;
  round: number;
  onCorrect: () => void;
  onNext: () => void;
}) {
  const [status, setStatus] = useState<"idle" | "right" | "wrong">("idle");
  const [feedback, setFeedback] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const choose = (color: string) => {
    if (status === "right") return;
    setSelected(color);
    if (color === question.color) {
      setStatus("right");
      setFeedback(`Yes! A ${question.object} is ${question.color}.`);
      onCorrect();
    } else {
      setStatus("wrong");
      setFeedback(`A ${question.object} is not ${color}. Look at the colors and try again.`);
    }
  };
  const retry = () => { setStatus("idle"); setFeedback(""); setSelected(null); };

  return (
    <div className="game-round">
      <div className="game-question-heading"><small>Round {round + 1} of {ROUNDS_PER_LEVEL}</small><h3>Color Match</h3><p>Look at the object and choose its real-world color.</p></div>
      <div className="game-color-object" key={question.id}>
        <span aria-hidden="true">{question.picture}</span>
        <b>{question.object}</b>
      </div>
      <p className="game-clue">What color is the {question.object}?</p>
      <div className="game-choice-grid game-choice-grid--colors" aria-label="Choose a color">
        {question.choices.map((color) => (
          <button type="button" key={color} className={`game-choice game-color-choice${selected === color ? " is-selected" : ""}`} disabled={status === "right"} onClick={() => choose(color)}>
            <span className="game-color-swatch" style={{ "--game-swatch": colorMatchPalette[color] } as React.CSSProperties} aria-hidden="true" />
            {color}
          </button>
        ))}
      </div>
      {status !== "idle" && <GameFeedback feedback={feedback} onNext={onNext} onRetry={retry} isCorrect={status === "right"} />}
    </div>
  );
}

function GameChallenge({ gameId, gameTitle, instruction, target, level, round, onCorrect, onNext }: {
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
    const nextOpen = [...memoryOpen, cardId];
    setMemoryOpen(nextOpen);
    if (nextOpen.length === 2) {
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

  const memoryWords = choices.slice(0, 3);
  const memoryCards = shuffle(memoryWords.flatMap((word) => [
    { id: `picture:${word.id}`, wordId: word.id, face: word.picture },
    { id: `word:${word.id}`, wordId: word.id, face: word.word },
  ]), gameSeed(gameId) + round + level);

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

  if (gameId === "memory-cards") {
    return <div className="game-round">{titleLine}<div className="memory-grid">{memoryCards.map((card) => {
      const isRevealed = memoryOpen.includes(card.id) || matched.includes(card.id);
      return <button type="button" key={card.id} className={`memory-card${isRevealed ? " is-open" : ""}${matched.includes(card.id) ? " is-matched" : ""}`} disabled={status === "right"} onClick={() => handleMemory(card.id)} aria-label={isRevealed ? card.face : "Hidden memory card"}>{isRevealed ? card.face : "?"}</button>;
    })}</div>{memoryError && <p className="game-feedback is-wrong" role="status">Those cards do not match. Keep the picture in mind and try again.</p>}{status === "right" && <GameFeedback feedback={feedback} onNext={onNext} onRetry={retry} isCorrect={status === "right"} />}</div>;
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

  if (gameId === "word-sorting" || gameId === "treasure-hunt") {
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
    return <div className="game-round">{titleLine}<span className="game-big-picture" aria-hidden="true">{target.picture}</span><p className="game-clue">Complete the word: <b className="game-missing-word">_ {target.word.slice(1).replace(/./g, "_ ")}</b></p>{textChoices([...new Set([missingLetter, "A", "S", "T"])], missingLetter, "That is the missing letter!", "Try another letter.")}{status !== "idle" && <GameFeedback feedback={feedback} onNext={onNext} onRetry={retry} isCorrect={status === "right"} />}</div>;
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
    const meaningChoices = [target, ...uniqueWords.filter((word) => word.id !== target.id && word.meaning !== target.meaning).slice((round + level) % 40, (round + level) % 40 + 3)];
    return <div className="game-round">{titleLine}<p className="game-clue">Find the word that means: <b>{target.meaning}</b></p>{textChoices(meaningChoices.map((choice) => choice.word), target.word, "You matched the meaning!", "Read the clue again and choose another word.")}{status !== "idle" && <GameFeedback feedback={feedback} onNext={onNext} onRetry={retry} isCorrect={status === "right"} />}</div>;
  }

  const topic = getWordTopic(target);
  const topicChoices = shuffle([topic, ...wordSets.map((set) => set.label).filter((label) => label !== topic).slice(0, 3)], round + level);
  return <div className="game-round">{titleLine}<span className="game-big-picture" aria-hidden="true">{target.picture}</span><p className="game-clue">Which topic does <b>{target.word}</b> belong to?</p>{textChoices(topicChoices, topic, "You chose the right topic!", "Try another topic.")}{status !== "idle" && <GameFeedback feedback={feedback} onNext={onNext} onRetry={retry} isCorrect={status === "right"} />}</div>;
}

function GameFeedback({ feedback, onNext, onRetry, isCorrect }: { feedback: string; onNext: () => void; onRetry: () => void; isCorrect: boolean }) {
  return <div className={`game-feedback ${isCorrect ? "is-right" : "is-wrong"}`} role="status"><span>{feedback}</span>{isCorrect ? <button type="button" className="games-primary" onClick={onNext}>Next round →</button> : <button type="button" className="games-secondary" onClick={onRetry}>Try again</button>}</div>;
}
