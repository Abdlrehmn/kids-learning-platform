"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import WorldNavigation from "@/components/WorldNavigation";
import { sentencePrompts, stories, wordSets, type WordCard } from "@/components/english/englishContent";
import { colorMatchPalette, colorMatchQuestions, type ColorMatchQuestion } from "@/components/games/colorMatchContent";
import { fireConfetti } from "@/components/Confetti";
import { GameCategoryArt, GameWorldArt, RewardTrophy, type GameArtKind } from "@/components/games/GameWorldArt";

const GamesWorldScene = dynamic(() => import("@/components/games/GamesWorldScene"), { ssr: false });

const GAME_STORAGE_KEY = "kiddoworld-games-progress-v1";
const ROUNDS_PER_LEVEL = 5;

const games = [
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

type GameCategory = "word" | "math" | "memory" | "puzzle" | "logic";
const gameCategories: Record<GameId, GameCategory> = {
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

const categories = [
  { id: "all", title: "All Games", subtitle: "Every adventure", tint: "violet" },
  { id: "word", title: "Word Games", subtitle: "Read, spell & explore", tint: "blue" },
  { id: "math", title: "Math Games", subtitle: "Numbers are fun", tint: "yellow" },
  { id: "memory", title: "Memory Games", subtitle: "Remember & match", tint: "pink" },
  { id: "puzzle", title: "Puzzle Games", subtitle: "Piece it together", tint: "green" },
  { id: "logic", title: "Logic Games", subtitle: "Think it through", tint: "orange" },
] as const;

const popularGameIds: GameId[] = ["word-match", "spelling-bee", "memory-cards", "math-adventure", "noun-detective", "sentence-builder"];
const gameArtById: Record<GameId, GameArtKind> = {
  "word-match": "word-match", "picture-match": "picture-match", "color-match": "color-palette", "spelling-bee": "spelling-bee",
  "missing-letters": "letter-tiles", "word-scramble": "letter-tiles", "memory-cards": "memory-cards", "vocabulary-quiz": "letter-tiles",
  "noun-detective": "noun-detective", "verb-action": "action", "adjective-explorer": "color-palette", "sentence-builder": "sentence-builder",
  "treasure-hunt": "treasure-map", "punctuation-fixer": "punctuation", "story-sequence": "sequence", "listening-detective": "sound-wave",
  "word-sorting": "sorting", "odd-one-out": "odd-one-out", crossword: "crossword", "guess-the-word": "alphabet", "build-a-sentence": "sentence-builder",
  "alphabet-hunt": "alphabet", "math-adventure": "number-stacks", "number-quest": "number-stacks", "addition-adventure": "addition", "subtraction-challenge": "subtraction", "multiplication-stars": "multiplication", "division-explorer": "division", "shape-detective": "shapes", "counting-adventure": "counting", "number-sequence": "sequence",
  "picture-pairs": "memory-cards", "word-memory": "letter-tiles", "sound-memory": "sound-wave", "sequence-memory": "sequence", "animal-match": "animal-cards",
  "jigsaw-puzzle": "word-match", "picture-puzzle": "picture-match", "missing-piece": "sequence", "shape-builder": "house", "letter-puzzle": "letter-tiles", "pattern-builder": "sequence",
  "find-difference": "noun-detective", "pattern-detective": "sequence", "object-sorting": "sorting", "logic-quest": "treasure-map",
};
type GameId = (typeof games)[number]["id"];
type GameRecord = { level: number; bestScore: number; levelsCompleted: number };
type GameProgress = { xp: number; gamesPlayed: number; records: Partial<Record<GameId, GameRecord>> };
type Choice = { label: string; value: string; picture?: string; colorHex?: string };

const EMPTY_PROGRESS: GameProgress = { xp: 0, gamesPlayed: 0, records: {} };
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
      gamesPlayed: Number.isFinite(candidate.gamesPlayed) && Number(candidate.gamesPlayed) >= 0
        ? Math.floor(Number(candidate.gamesPlayed))
        : Object.values(records).reduce((total, record) => total + (record?.levelsCompleted ?? 0), 0),
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
  const [selectedCategory, setSelectedCategory] = useState<(typeof categories)[number]["id"]>("all");

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
        gamesPlayed: current.gamesPlayed,
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

  const startGame = (gameId: GameId) => {
    setProgress((current) => ({ ...current, gamesPlayed: current.gamesPlayed + 1 }));
    setSelectedGame(gameId);
  };

  const activeGame = games.find((game) => game.id === selectedGame);
  const visibleGames = games.filter((game) => selectedCategory === "all" || gameCategories[game.id] === selectedCategory);
  const popularGames = popularGameIds.filter((id) => visibleGames.some((game) => game.id === id));
  const otherGames = visibleGames.filter((game) => !popularGameIds.includes(game.id));
  const featuredGameId: GameId = ({ all: "word-match", word: "word-match", math: "math-adventure", memory: "memory-cards", puzzle: "sentence-builder", logic: "noun-detective" } as const)[selectedCategory];
  const featuredGame = games.find((game) => game.id === featuredGameId)!;
  const playerLevel = 1 + Math.floor(progress.xp / 100);
  return (
    <div className="english-world games-world">
      <WorldNavigation active="games" />
      <main className="games-main">
        <header className="games-hero">
          <div className="games-sky" aria-hidden="true">
            <GamesWorldScene mode="hero" />
          </div>
          <div className="games-hero-copy"><h1><span>Games</span> <b>World</b></h1><p className="games-hero-tagline">Play. Learn. Grow!</p><p className="games-hero-description">Explore exciting educational games and boost your skills!</p><a className="games-hero-button" href="#games-collection">Explore games <span>↓</span></a></div>
          <div className="games-xp"><span aria-hidden="true">⭐</span><b>{ready ? progress.xp : "—"}</b><small>XP earned</small></div>
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
          <section className="games-dashboard" id="games-collection" aria-labelledby="games-library-title">
            <aside className="games-sidebar" aria-label="Game categories">
              <div className="games-sidebar-title"><span>EXPLORE</span><b>Game zones</b></div>
              <div className="games-category-list">{categories.map((category) => <button type="button" key={category.id} className={`games-category games-category--${category.tint}${selectedCategory === category.id ? " is-active" : ""}`} onClick={() => setSelectedCategory(category.id)} aria-pressed={selectedCategory === category.id}><span className="games-category-icon"><GameCategoryArt name={category.id} /></span><span className="games-category-copy"><b>{category.title}</b><small>{category.subtitle}</small></span><span className="games-category-arrow">›</span></button>)}</div>
              <div className="games-promo"><span className="games-promo-spark">✦</span><RewardTrophy /><b>Play. Learn.<br/>Earn Rewards!</b><small>Every round brings a new star.</small></div>
            </aside>
            <div className="games-library">
              <div className="games-library-heading"><div><span className="games-count">{visibleGames.length} GAMES</span><h2 id="games-library-title">Games Collection</h2><p>Fun and educational games to make learning exciting!</p></div>
                <div className="games-stats"><div className="games-stat games-stat--played"><span>◷</span><b>{ready ? progress.gamesPlayed : "—"}</b><small>Games played</small></div><div className="games-stat games-stat--level"><span>♛</span><b>{ready ? playerLevel : "—"}</b><small>Player level</small></div><div className="games-stat games-stat--points"><span>✦</span><b>{ready ? progress.xp : "—"}</b><small>Total points</small></div></div>
              </div>
              <div className="games-featured">
                <div className="games-feature-scene" aria-hidden="true"><GamesWorldScene mode="feature" /></div>
                <div className="games-feature-copy">
                  <span className="games-feature-tag">✦ FEATURED ADVENTURE</span>
                  <h3>{featuredGame.title}</h3>
                  <p>{featuredGame.mechanic}</p>
                  <button type="button" className="games-play-now" onClick={() => startGame(featuredGame.id)}>Play Now <span>→</span></button>
                </div>
                <span className="games-feature-decoration" aria-hidden="true">✧</span>
              </div>
              <div className="games-popular-heading"><div><h3><span>★</span> {selectedCategory === "all" ? "Popular Games" : `${categories.find((category) => category.id === selectedCategory)?.title}`}</h3></div></div>
              {popularGames.length > 0 ? <div className="games-grid games-grid--popular">{popularGames.map((id, index) => { const game = games.find((item) => item.id === id)!; return <GameCard key={game.id} game={game} index={index} record={progress.records[game.id]} art={<GameWorldArt kind={gameArtById[game.id]} className="games-illustration-svg" />} onPlay={() => startGame(game.id)} />; })}</div> : null}
              {otherGames.length > 0 ? <div className="games-grid games-grid--extra">{otherGames.map((game, index) => <GameCard key={game.id} game={game} index={index + popularGames.length} record={progress.records[game.id]} art={<GameWorldArt kind={gameArtById[game.id]} className="games-illustration-svg" />} onPlay={() => startGame(game.id)} />)}</div> : null}
              {visibleGames.length === 0 && <div className="games-empty"><span>🪄</span><b>New adventures are on their way!</b><p>There aren’t any math games in the collection yet. Try another game zone.</p></div>}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function GameCard({ game, index, record, art, onPlay }: { game: (typeof games)[number]; index: number; record?: GameRecord; art: React.ReactNode; onPlay: () => void }) {
  return <article className={`games-card games-card--${index % 6}`} style={{ "--game-index": index } as React.CSSProperties}><div className="games-card-art"><span>{art}</span><i>✦</i></div><h4>{game.title}</h4><p>{game.mechanic}</p><small className="games-card-progress">{record ? `Level ${record.level} · ${record.levelsCompleted} complete` : "Level 1 · Ready to play"}</small><button type="button" className="games-card-action" onClick={onPlay}>Play <span>→</span></button></article>;
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
  const [runId, setRunId] = useState(0);
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
  const restart = () => { setRunId((current) => current + 1); setRound(0); setScore(0); setLevelComplete(false); };
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
          <ColorMatchChallenge key={`${game.id}-${level}-${round}-${runId}`} question={colorQuestion} round={round} onCorrect={handleCorrect} onNext={advance} />
        ) : target ? (
          <GameChallenge key={`${game.id}-${level}-${round}-${runId}`} gameId={game.id} gameTitle={game.title} instruction={game.instruction} target={target} level={level} round={round} onCorrect={handleCorrect} onNext={advance} />
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

function buildMathPrompt(gameId: GameId, level: number, round: number) {
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
  if (gameId === "number-quest") { prompt = `What is ${a} plus ${b}?`; visual = `${a} + ${b}`; }
  if (gameId === "math-adventure") { prompt = `The explorer has ${a} gems and finds ${b} more. How many gems now?`; visual = `💎 ${a}  +  💎 ${b}`; }
  const choices: string[] = gameId === "shape-detective"
    ? shuffle([String(answer), ...["circle", "square", "triangle", "rectangle", "star"].filter((shape) => shape !== answer).slice(0, 3)], seed)
    : shuffle([...new Set([Number(answer), Math.max(0, Number(answer) - 2), Number(answer) + 1, Number(answer) + 3, Number(answer) - 1].map(String))].slice(0, 4), seed);
  while (choices.length < 4) choices.push(String(Number(choices[choices.length - 1]) + choices.length + 2));
  return { prompt, answer: String(answer), visual, choices };
}

function MathGameChallenge({ gameId, level, round, instruction, onCorrect, onNext }: { gameId: GameId; level: number; round: number; instruction: string; onCorrect: () => void; onNext: () => void }) {
  const [status, setStatus] = useState<"idle" | "right" | "wrong">("idle");
  const [feedback, setFeedback] = useState("");
  const question = buildMathPrompt(gameId, level, round);
  const choose = (value: string) => {
    if (status === "right") return;
    if (value === question.answer) { setStatus("right"); setFeedback("Great thinking! You found the answer."); onCorrect(); }
    else { setStatus("wrong"); setFeedback("Almost! Try the numbers again."); }
  };
  const retry = () => { setStatus("idle"); setFeedback(""); };
  return <div className="game-round">{<div className="game-question-heading"><small>Round {round + 1} of {ROUNDS_PER_LEVEL}</small><h3>{games.find((game) => game.id === gameId)?.title}</h3><p>{instruction}</p></div>}<p className={`game-math-visual${gameId === "counting-adventure" ? " game-math-visual--counting" : ""}`} aria-label={question.visual}>{question.visual}</p><p className="game-clue game-clue--sentence">{question.prompt}</p><div className="game-choice-grid">{question.choices.map((choice) => <button type="button" key={choice} className="game-choice" disabled={status === "right"} onClick={() => choose(choice)}>{choice}</button>)}</div>{status !== "idle" && <GameFeedback feedback={feedback} onNext={onNext} onRetry={retry} isCorrect={status === "right"} />}</div>;
}

function SequenceMemoryChallenge({ round, level, instruction, onCorrect, onNext }: { round: number; level: number; instruction: string; onCorrect: () => void; onNext: () => void }) {
  const sequences = [["🔵", "⭐", "🍀"], ["🐱", "🌙", "🍎"], ["🟣", "🟡", "🔷"], ["🚗", "🌼", "☁️"]];
  const sequence = sequences[(round + level) % sequences.length];
  const [showSequence, setShowSequence] = useState(true);
  const [status, setStatus] = useState<"idle" | "right" | "wrong">("idle");
  const [feedback, setFeedback] = useState("");
  useEffect(() => {
    if (!showSequence) return;
    const timer = window.setTimeout(() => setShowSequence(false), 1800);
    return () => window.clearTimeout(timer);
  }, [showSequence]);
  const options = shuffle([sequence[2], ...sequences.flat().filter((item) => item !== sequence[2]).slice(0, 3)], round + level);
  const choose = (value: string) => {
    if (status === "right") return;
    if (value === sequence[2]) { setStatus("right"); setFeedback("You remembered the last symbol!"); onCorrect(); }
    else { setStatus("wrong"); setFeedback("Not quite. Try to remember the order."); }
  };
  const retry = () => { setStatus("idle"); setFeedback(""); setShowSequence(true); };
  return <div className="game-round"><div className="game-question-heading"><small>Round {round + 1} of {ROUNDS_PER_LEVEL}</small><h3>Sequence Memory</h3><p>{instruction}</p></div><div className="sequence-memory-board" aria-live="polite">{showSequence ? <><small>Remember this order!</small><b>{sequence.join("　")}</b></> : <><small>What was the last symbol?</small><b>❔</b></>}</div>{!showSequence && <div className="game-choice-grid">{options.map((option) => <button type="button" key={option} className="game-choice game-choice--sequence" disabled={status === "right"} onClick={() => choose(option)}>{option}</button>)}</div>}{status !== "idle" && <GameFeedback feedback={feedback} onNext={onNext} onRetry={retry} isCorrect={status === "right"} />}</div>;
}

function GameFeedback({ feedback, onNext, onRetry, isCorrect }: { feedback: string; onNext: () => void; onRetry: () => void; isCorrect: boolean }) {
  return <div className={`game-feedback ${isCorrect ? "is-right" : "is-wrong"}`} role="status"><span>{feedback}</span>{isCorrect ? <button type="button" className="games-primary" onClick={onNext}>Next round →</button> : <button type="button" className="games-secondary" onClick={onRetry}>Try again</button>}</div>;
}
