"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent, type ReactNode } from "react";
import WorldNavigation from "@/components/WorldNavigation";
import LearningZoneIsland from "@/components/3d/LearningZoneIsland";
import { fireConfetti } from "@/components/Confetti";
import {
  dailyChallengeTargets,
  englishCategories,
  grammarLessons,
  listeningActivities,
  partsOfSpeechRounds,
  sentencePrompts,
  speakingPrompts,
  stories,
  wordSets,
  type EnglishCategoryId,
} from "./englishContent";

type ProgressRecord = {
  completed: string[];
  dailyAwards: string[];
  lastActivityId: string | null;
};

const STORAGE_KEY = "kiddoworld-english-progress-v1";
const EMPTY_PROGRESS: ProgressRecord = { completed: [], dailyAwards: [], lastActivityId: null };

type SpeechRecognitionResultLike = { transcript: string };
type SpeechRecognitionEventLike = { results: ArrayLike<ArrayLike<SpeechRecognitionResultLike>> };
type SpeechRecognitionErrorLike = { error: string };
type BrowserSpeechRecognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: new () => BrowserSpeechRecognition;
  webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
};

function isProgressRecord(value: unknown): value is ProgressRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<ProgressRecord>;
  return Array.isArray(record.completed) && Array.isArray(record.dailyAwards) &&
    (typeof record.lastActivityId === "string" || record.lastActivityId === null);
}

function getDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDailyTarget(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const dayOfWeek = new Date(year, month - 1, day).getDay();
  return dailyChallengeTargets[dayOfWeek % dailyChallengeTargets.length];
}

function normaliseSentence(value: string) {
  return value.toLocaleLowerCase().replace(/[.!?,]/g, "").replace(/\s+/g, " ").trim();
}

function activityTitle(id: string | null) {
  if (!id) return "Choose your first adventure";
  if (id.startsWith("vocabulary-")) {
    const set = wordSets.find((item) => item.id === id.slice("vocabulary-".length));
    return set ? `${set.label} words` : "Vocabulary Adventure";
  }
  if (id.startsWith("story-")) return stories.find((item) => item.id === id.slice("story-".length))?.title ?? "Story Land";
  if (id.startsWith("grammar-")) return grammarLessons.find((item) => item.id === id.slice("grammar-".length))?.title ?? "Grammar Garden";
  if (id.startsWith("listening-")) return listeningActivities.find((item) => item.id === id.slice("listening-".length))?.prompt ?? "Listening Lagoon";
  if (id.startsWith("speaking-")) return speakingPrompts.find((item) => item.id === id.slice("speaking-".length))?.text ?? "Speaking Studio";
  if (id.startsWith("sentence-")) return sentencePrompts.find((item) => item.id === id.slice("sentence-".length))?.sentence ?? "Sentence Builder";
  if (id.startsWith("match-")) return `Picture match · ${wordSets.find((item) => item.id === id.slice("match-".length))?.label ?? "Vocabulary"}`;
  if (id.startsWith("spelling-")) return `Spelling puzzle · ${wordSets.find((item) => item.id === id.slice("spelling-".length))?.label ?? "Vocabulary"}`;
  return "English World";
}

function categoryCompletionCount(categoryId: EnglishCategoryId, completed: string[]) {
  const prefixes: Record<EnglishCategoryId, string[]> = {
    vocabulary: ["vocabulary-", "match-", "spelling-"],
    stories: ["story-"],
    grammar: ["grammar-"],
    listening: ["listening-"],
    speaking: ["speaking-"],
    sentences: ["sentence-"],
  };
  return completed.filter((id) => prefixes[categoryId].some((prefix) => id.startsWith(prefix))).length;
}

function highlightStoryVocabulary(text: string, words: string[]) {
  const pattern = new RegExp(`\\b(${words.join("|")})\\b`, "gi");
  return text.split(pattern).map((part, index) =>
    words.some((word) => word.toLocaleLowerCase() === part.toLocaleLowerCase())
      ? <mark className="ew-highlight" key={`${part}-${index}`}>{part}</mark>
      : part,
  );
}

function FeedbackMessage({ tone, children }: { tone: "good" | "try" | "info"; children: ReactNode }) {
  return <p className={`ew-feedback ew-feedback--${tone}`} role="status">{children}</p>;
}

function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="ew-progress-wrap">
      <div className="ew-progress-copy"><span>{label}</span><b>{value}%</b></div>
      <div className="ew-progress-track" role="progressbar" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function WorldMascot() {
  return (
    <div className="ew-mascot-scene" aria-hidden="true">
      <span className="ew-mascot-spark ew-mascot-spark--one">✦</span>
      <span className="ew-mascot-spark ew-mascot-spark--two">✧</span>
      <div className="ew-mascot">
        <span className="ew-mascot-hat"><i /><b /></span>
        <span className="ew-mascot-hair" />
        <span className="ew-mascot-face"><i /><b /><em /></span>
        <span className="ew-mascot-body" />
        <span className="ew-mascot-book">📖</span>
      </div>
      <span className="ew-mascot-orbit" />
    </div>
  );
}

function EnglishHero({ onStart }: { onStart: () => void }) {
  return (
    <section className="ew-hero" aria-labelledby="english-world-title">
      <span className="ew-cloud ew-cloud--one" aria-hidden="true" />
      <span className="ew-cloud ew-cloud--two" aria-hidden="true" />
      <span className="ew-hero-letter ew-hero-letter--one" aria-hidden="true">A</span>
      <span className="ew-hero-letter ew-hero-letter--two" aria-hidden="true">b</span>
      <span className="ew-hero-letter ew-hero-letter--three" aria-hidden="true">C</span>
      <span className="ew-hero-star ew-hero-star--one" aria-hidden="true">✦</span>
      <span className="ew-hero-star ew-hero-star--two" aria-hidden="true">✧</span>
      <WorldMascot />
      <div className="ew-hero-copy">
        <p className="ew-hero-kicker"><span aria-hidden="true">✦</span> A little learning goes a long way <span aria-hidden="true">✦</span></p>
        <h1 id="english-world-title">English <span>World</span></h1>
        <p>Read, listen, speak, and play your way to wonderful new words.</p>
        <button type="button" className="ew-button ew-button--gold ew-hero-cta" onClick={onStart}>
          <span aria-hidden="true">🚀</span> Start learning <span aria-hidden="true">→</span>
        </button>
      </div>
      <div className="ew-island" aria-hidden="true">
        <div className="ew-island-model"><LearningZoneIsland kind="english" /></div>
        <span className="ew-island-castle">🏰</span>
      </div>
    </section>
  );
}

function CategoryList({ active, onSelect }: { active: EnglishCategoryId; onSelect: (id: EnglishCategoryId) => void }) {
  return (
    <nav className="ew-category-list" aria-label="English learning categories">
      {englishCategories.map((category) => (
        <button
          type="button"
          key={category.id}
          className={`ew-category-link ew-category-link--${category.tone}${active === category.id ? " is-active" : ""}`}
          aria-pressed={active === category.id}
          onClick={() => onSelect(category.id)}
        >
          <span className="ew-category-icon" aria-hidden="true">{category.icon}</span>
          <span className="ew-category-copy"><b>{category.shortTitle}</b><small>{category.subtitle}</small></span>
          <span className="ew-category-arrow" aria-hidden="true">›</span>
        </button>
      ))}
      <div className="ew-sidebar-note"><span aria-hidden="true">⭐</span><b>Small steps<br />Big dreams!</b><span className="ew-sidebar-note-book" aria-hidden="true">📚</span></div>
    </nav>
  );
}

function ProgressSummary({ completed, stars, badges }: { completed: number; stars: number; badges: number }) {
  return (
    <section className="ew-progress-summary" aria-label="Your English progress">
      <div className="ew-summary-item"><span className="ew-summary-icon ew-summary-icon--star" aria-hidden="true">⭐</span><span><b>{completed}</b><small>Completed activities</small></span></div>
      <span className="ew-summary-divider" aria-hidden="true" />
      <div className="ew-summary-item"><span className="ew-summary-icon ew-summary-icon--crown" aria-hidden="true">🏅</span><span><b>{stars}</b><small>Stars earned</small></span></div>
      <span className="ew-summary-divider" aria-hidden="true" />
      <div className="ew-summary-item"><span className="ew-summary-icon ew-summary-icon--badge" aria-hidden="true">🎖️</span><span><b>{badges}</b><small>Badges earned</small></span></div>
    </section>
  );
}

function ContinueCard({ activityId, onContinue, onStart }: { activityId: string | null; onContinue: () => void; onStart: () => void }) {
  return (
    <section className="ew-small-card ew-continue-card" aria-labelledby="ew-continue-title">
      <div className="ew-card-heading"><span className="ew-card-icon ew-card-icon--continue" aria-hidden="true">🧭</span><div><p className="ew-eyebrow">Your learning trail</p><h2 id="ew-continue-title">Continue learning</h2></div></div>
      {activityId ? <><p className="ew-card-mainline">Pick up with <b>{activityTitle(activityId)}</b></p><button className="ew-text-button" type="button" onClick={onContinue}>Continue <span aria-hidden="true">→</span></button></> : <><p className="ew-card-mainline">Your next adventure is waiting.</p><button className="ew-text-button" type="button" onClick={onStart}>Choose an activity <span aria-hidden="true">→</span></button></>}
    </section>
  );
}

function DailyChallenge({ targetTitle, subtitle, complete, onStart }: { targetTitle: string; subtitle: string; complete: boolean; onStart: () => void }) {
  return (
    <section className={`ew-small-card ew-daily-card${complete ? " is-complete" : ""}`} aria-labelledby="ew-daily-title">
      <div className="ew-card-heading"><span className="ew-card-icon ew-card-icon--daily" aria-hidden="true">🌟</span><div><p className="ew-eyebrow">Today&apos;s little quest</p><h2 id="ew-daily-title">Daily challenge</h2></div><span className="ew-daily-stamp" aria-label={complete ? "Complete" : "New challenge"}>{complete ? "✓" : "1"}</span></div>
      <p className="ew-card-mainline"><b>{complete ? "Challenge complete!" : targetTitle}</b></p>
      <p className="ew-card-subline">{complete ? "You earned today’s challenge star. Come back tomorrow for a new quest." : subtitle}</p>
      {!complete && <button className="ew-text-button" type="button" onClick={onStart}>Start today&apos;s challenge <span aria-hidden="true">→</span></button>}
    </section>
  );
}

function FeaturedCategory({ category, completed, onStart }: { category: (typeof englishCategories)[number]; completed: number; onStart: () => void }) {
  const categoryCopy: Record<EnglishCategoryId, string> = {
    vocabulary: "Meet bright new words, discover what they mean, and try a picture-word match.",
    stories: "Visit story land for short reads, helpful vocabulary, and a little question at the end.",
    grammar: "See how words work together, then try friendly grammar questions and word games.",
    listening: "Listen to a sentence as many times as you like, then choose what you heard.",
    speaking: "Hear a practice phrase and say it aloud. Your browser will tell you if voice tools are available.",
    sentences: "Move word tiles into place to make a clear sentence. Tap or drag to build it.",
  };
  return (
    <section className={`ew-featured ew-featured--${category.tone}`} aria-labelledby="ew-feature-title">
      <div className="ew-feature-art" aria-hidden="true"><span className="ew-feature-glow" /><span className="ew-feature-art-icon">{category.icon}</span><span className="ew-feature-art-spark ew-feature-art-spark--one">✦</span><span className="ew-feature-art-spark ew-feature-art-spark--two">✧</span><span className="ew-feature-art-letters">Aa</span></div>
      <div className="ew-feature-copy"><span className="ew-level-pill">{completed ? `${completed} ${completed === 1 ? "activity" : "activities"} completed` : "Ready for you"}</span><h2 id="ew-feature-title">{category.title}</h2><p>{categoryCopy[category.id]}</p><button type="button" className="ew-button ew-button--gold" onClick={onStart}>Start activity <span aria-hidden="true">→</span></button></div>
      <span className="ew-feature-cloud" aria-hidden="true">☁</span>
    </section>
  );
}

function CategoryGrid({ active, onSelect }: { active: EnglishCategoryId; onSelect: (id: EnglishCategoryId) => void }) {
  return (
    <section className="ew-category-grid" aria-label="Choose an English activity">
      {englishCategories.map((category) => (
        <button type="button" key={category.id} className={`ew-category-card ew-category-card--${category.tone}${active === category.id ? " is-active" : ""}`} onClick={() => onSelect(category.id)}>
          <span className="ew-category-card-star" aria-hidden="true">✦</span><span className="ew-category-card-art" aria-hidden="true">{category.icon}</span><b>{category.title}</b><small>{category.subtitle}</small><span className="ew-card-start">Explore <span aria-hidden="true">→</span></span>
        </button>
      ))}
    </section>
  );
}

function VocabularyActivity({
  activeSet, onSet, wordIndex, onWordIndex, revealed, onReveal, onComplete, onStart,
  mode, onMode,
}: {
  activeSet: number; onSet: (index: number) => void; wordIndex: number; onWordIndex: (index: number) => void;
  revealed: boolean; onReveal: () => void; onComplete: (id: string) => void; onStart: (id: string) => void;
  mode: "cards" | "match" | "spelling"; onMode: (mode: "cards" | "match" | "spelling") => void;
}) {
  const set = wordSets[activeSet];
  const [matched, setMatched] = useState<string[]>([]);
  const [reviewed, setReviewed] = useState<string[]>([]);
  const [selectedPicture, setSelectedPicture] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [matchFeedback, setMatchFeedback] = useState("");
  const [spellingIndex, setSpellingIndex] = useState(0);
  const [spellingLetters, setSpellingLetters] = useState<number[]>([]);
  const [spellingFeedback, setSpellingFeedback] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [wordFeedback, setWordFeedback] = useState("");
  const word = set.words[wordIndex];
  const spellingWord = set.words[spellingIndex];

  const chooseMatchPicture = (id: string) => {
    if (matched.includes(id)) return;
    setSelectedPicture(id);
    const candidate = selectedWord;
    if (!candidate) return;
    if (candidate === id) {
      const next = [...matched, id];
      setMatched(next);
      setSelectedWord(null);
      setSelectedPicture(null);
      setMatchFeedback("A lovely match!");
      if (next.length === set.words.length) onComplete(`match-${set.id}`);
    } else {
      setMatchFeedback("Those two do not match yet. Try another word.");
      setSelectedWord(null);
      setSelectedPicture(null);
    }
  };

  const chooseMatchWord = (id: string) => {
    if (matched.includes(id)) return;
    setSelectedWord(id);
    if (!selectedPicture) return;
    if (selectedPicture === id) {
      const next = [...matched, id];
      setMatched(next);
      setSelectedWord(null);
      setSelectedPicture(null);
      setMatchFeedback("A lovely match!");
      if (next.length === set.words.length) onComplete(`match-${set.id}`);
    } else {
      setMatchFeedback("Those two do not match yet. Try another word.");
      setSelectedWord(null);
      setSelectedPicture(null);
    }
  };

  const spellingBank = useMemo(() => {
    const letters = Array.from(spellingWord.word.toLocaleUpperCase());
    return letters.map((letter, index) => ({ letter, index })).reverse();
  }, [spellingWord.word]);
  const chosenSpelling = spellingLetters.map((sourceIndex) => Array.from(spellingWord.word.toLocaleUpperCase())[sourceIndex]).join("");
  const checkSpelling = () => {
    if (chosenSpelling === spellingWord.word.toLocaleUpperCase()) {
      setSpellingFeedback("That's the word! Great spelling.");
      if (spellingIndex === set.words.length - 1) onComplete(`spelling-${set.id}`);
    } else setSpellingFeedback("Not quite yet. Look at the letters and try again.");
  };

  return (
    <div className="ew-activity-content">
      <div className="ew-tool-tabs" aria-label="Vocabulary activities">
        <button type="button" aria-pressed={mode === "cards"} className={mode === "cards" ? "is-active" : ""} onClick={() => onMode("cards")}>Word cards</button>
        <button type="button" aria-pressed={mode === "match"} className={mode === "match" ? "is-active" : ""} onClick={() => onMode("match")}>Picture match</button>
        <button type="button" aria-pressed={mode === "spelling"} className={mode === "spelling" ? "is-active" : ""} onClick={() => onMode("spelling")}>Spelling puzzle</button>
      </div>
      {mode === "cards" && <>
        <div className="ew-chip-row" aria-label="Word categories">{wordSets.map((item, index) => <button type="button" key={item.id} className={`ew-chip${activeSet === index ? " is-active" : ""}`} aria-pressed={activeSet === index} onClick={() => { onSet(index); onWordIndex(0); onStart(`vocabulary-${item.id}`); }}>{item.icon} {item.label}</button>)}</div>
        <article className="ew-word-card">
          <div className="ew-word-picture" aria-label={`${word.word} picture`}><span aria-hidden="true">{word.picture}</span><small>{set.label}</small></div>
          <div className="ew-word-copy"><p className="ew-eyebrow">Word {wordIndex + 1} of {set.words.length}</p><h3>{word.word}</h3><p className="ew-word-example"><b>Example:</b> {word.sentence}</p>{revealed && <p className="ew-definition"><b>It means:</b> {word.meaning}</p>}
            <div className="ew-button-row"><button type="button" className="ew-button ew-button--light" onClick={onReveal}>{revealed ? "Hide meaning" : "Reveal meaning"}</button><button type="button" className="ew-button ew-button--blue" onClick={() => { const nextReviewed = [...new Set([...reviewed, word.id])]; setReviewed(nextReviewed); setWordFeedback(""); if (wordIndex === set.words.length - 1) { if (nextReviewed.length === set.words.length) onComplete(`vocabulary-${set.id}`); else setWordFeedback("Go back and tap Got it on each word to finish this set."); } else onWordIndex(wordIndex + 1); }}>Got it <span aria-hidden="true">→</span></button></div>
          </div>
        </article>
        <ProgressBar value={Math.round((reviewed.length / set.words.length) * 100)} label={`${reviewed.length} of ${set.words.length} words marked Got it`} />
        <div className="ew-step-controls"><button type="button" className="ew-button ew-button--light" disabled={wordIndex === 0} onClick={() => onWordIndex(wordIndex - 1)}>← Previous</button><span>{wordIndex + 1} / {set.words.length}</span><button type="button" className="ew-button ew-button--light" disabled={wordIndex === set.words.length - 1} onClick={() => onWordIndex(wordIndex + 1)}>Next →</button></div>
        {wordFeedback && <FeedbackMessage tone="try">{wordFeedback}</FeedbackMessage>}
      {wordIndex === set.words.length - 1 && <button type="button" className="ew-reset-link" onClick={() => { onWordIndex(0); setReviewed([]); setWordFeedback(""); if (revealed) onReveal(); }}>Practice again from the first word</button>}
      </>}
      {mode === "match" && <>
        <p className="ew-instruction">Tap a picture, then tap its matching word.</p>
        <div className="ew-match-board">
          <div className="ew-match-pictures" aria-label="Pictures to match">{set.words.map((item) => <button type="button" key={item.id} className={`ew-match-picture${selectedPicture === item.id ? " is-selected" : ""}${matched.includes(item.id) ? " is-matched" : ""}`} aria-label={`Picture ${item.word}`} aria-pressed={selectedPicture === item.id} disabled={matched.includes(item.id)} onClick={() => chooseMatchPicture(item.id)}><span aria-hidden="true">{item.picture}</span>{matched.includes(item.id) && <small>Matched ✓</small>}</button>)}</div>
          <div className="ew-match-words" aria-label="Words to match">{set.words.map((item) => <button type="button" key={item.id} className={`ew-match-word${selectedWord === item.id ? " is-selected" : ""}${matched.includes(item.id) ? " is-matched" : ""}`} aria-pressed={selectedWord === item.id} disabled={matched.includes(item.id)} onClick={() => chooseMatchWord(item.id)}>{item.word}</button>)}</div>
        </div>
        <ProgressBar value={Math.round((matched.length / set.words.length) * 100)} label={`${matched.length} of ${set.words.length} picture matches`} />
        {matchFeedback && <FeedbackMessage tone={matchFeedback.includes("lovely") ? "good" : "try"}>{matchFeedback}</FeedbackMessage>}
        <button type="button" className="ew-reset-link" onClick={() => { setMatched([]); setSelectedPicture(null); setSelectedWord(null); setMatchFeedback(""); }}>Start matching again</button>
      </>}
      {mode === "spelling" && <>
        <div className="ew-spelling-card"><div className="ew-word-picture ew-word-picture--small"><span aria-hidden="true">{spellingWord.picture}</span><small>{set.label}</small></div><p className="ew-instruction">Tap the letters to spell this word.</p><div className="ew-spelling-answer" aria-label={`Your spelling: ${chosenSpelling || "empty"}`}>{spellingLetters.length ? spellingLetters.map((index, place) => <button type="button" key={`${index}-${place}`} aria-label={`Remove letter ${Array.from(spellingWord.word.toLocaleUpperCase())[index]}`} onClick={() => { setSpellingLetters((letters) => letters.filter((_, current) => current !== place)); setSpellingFeedback(""); }}>{Array.from(spellingWord.word.toLocaleUpperCase())[index]}</button>) : <span>Tap letters below</span>}</div><div className="ew-letter-bank">{spellingBank.map(({ letter, index }) => <button type="button" key={`${letter}-${index}`} disabled={spellingLetters.includes(index)} onClick={() => { setSpellingLetters((letters) => [...letters, index]); setSpellingFeedback(""); }}>{letter}</button>)}</div>{showHint && <p className="ew-hint">Hint: {spellingWord.meaning}</p>}<div className="ew-button-row"><button type="button" className="ew-button ew-button--light" onClick={() => { setSpellingLetters([]); setSpellingFeedback(""); }}>Reset letters</button><button type="button" className="ew-button ew-button--light" onClick={() => setShowHint((shown) => !shown)}>{showHint ? "Hide hint" : "Hint"}</button><button type="button" className="ew-button ew-button--blue" onClick={checkSpelling}>Check word</button></div>{spellingFeedback && <FeedbackMessage tone={spellingFeedback.startsWith("That's") ? "good" : "try"}>{spellingFeedback}</FeedbackMessage>}{spellingFeedback.startsWith("That's") && spellingIndex < set.words.length - 1 && <button type="button" className="ew-button ew-button--blue" onClick={() => { setSpellingIndex((index) => index + 1); setSpellingLetters([]); setSpellingFeedback(""); setShowHint(false); }}>Next word →</button>}</div>
      </>}
    </div>
  );
}

function StoryActivity({ storyIndex, onStoryIndex, onComplete, onStart, speak, speechMessage }: { storyIndex: number; onStoryIndex: (index: number) => void; onComplete: (id: string) => void; onStart: (id: string) => void; speak: (text: string) => void; speechMessage: string }) {
  const story = stories[storyIndex];
  const [page, setPage] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const selectStory = (index: number) => { onStoryIndex(index); onStart(`story-${stories[index].id}`); };
  const checkAnswer = () => {
    if (!answer) { setFeedback("Pick an answer first, then check it."); return; }
    if (answer === story.answer) { setFeedback("You understood the story. Well read!"); onComplete(`story-${story.id}`); }
    else setFeedback("That answer is not in the story. Read the pages again and try once more.");
  };
  return (
    <div className="ew-activity-content">
      <div className="ew-story-shelf" aria-label="Choose a story">{stories.map((item, index) => <button type="button" key={item.id} className={`ew-story-choice${index === storyIndex ? " is-active" : ""}`} onClick={() => selectStory(index)}><span aria-hidden="true">{item.picture}</span><b>{item.title}</b><small>{item.level} · {item.minutes} min</small></button>)}</div>
      <article className="ew-story-reader"><div className="ew-story-reader-head"><div><p className="ew-eyebrow">{story.level} reader · about {story.minutes} min</p><h3>{story.title}</h3></div><span aria-hidden="true" className="ew-story-big-icon">{story.picture}</span></div><div className="ew-story-page"><span className="ew-page-number">Page {page + 1} of {story.pages.length}</span><p>{highlightStoryVocabulary(story.pages[page], story.vocabulary)}</p><div className="ew-vocab-tags">{story.vocabulary.map((term) => <span key={term}>{term}</span>)}</div></div><div className="ew-button-row ew-story-controls"><button type="button" className="ew-button ew-button--light" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>← Previous page</button><button type="button" className="ew-button ew-button--blue" onClick={() => speak(story.pages[page])}>🔊 Read this page</button>{page < story.pages.length - 1 ? <button type="button" className="ew-button ew-button--light" onClick={() => setPage((current) => current + 1)}>Next page →</button> : <span className="ew-read-complete">Story read! Answer below ↓</span>}</div>
        {page === story.pages.length - 1 && <div className="ew-story-question"><h4>{story.question}</h4><div className="ew-choice-list">{story.choices.map((choice) => <button type="button" key={choice} className={`ew-answer-choice${answer === choice ? " is-selected" : ""}`} aria-pressed={answer === choice} onClick={() => { setAnswer(choice); setFeedback(""); }}>{choice}</button>)}</div><div className="ew-button-row"><button type="button" className="ew-button ew-button--gold" onClick={checkAnswer}>Check answer</button><button type="button" className="ew-button ew-button--light" onClick={() => { setAnswer(""); setFeedback(""); setPage(0); }}>Read again</button></div>{feedback && <FeedbackMessage tone={feedback.startsWith("You understood") ? "good" : "try"}>{feedback}</FeedbackMessage>}{speechMessage && <p className="ew-speech-status" role="status">{speechMessage}</p>}</div>}
      </article>
    </div>
  );
}

function GrammarActivity({ lessonIndex, onLessonIndex, onStart, onComplete }: { lessonIndex: number; onLessonIndex: (index: number) => void; onStart: (id: string) => void; onComplete: (id: string) => void }) {
  const [mode, setMode] = useState<"lesson" | "game">("lesson");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [answerState, setAnswerState] = useState<"idle" | "right" | "wrong">("idle");
  const [showHint, setShowHint] = useState(false);
  const [gameIndex, setGameIndex] = useState(0);
  const [gameSelected, setGameSelected] = useState("");
  const [gameState, setGameState] = useState<"idle" | "right" | "wrong">("idle");
  const [gameDone, setGameDone] = useState(false);
  const lesson = grammarLessons[lessonIndex];
  const question = lesson.questions[questionIndex];
  const gameRound = partsOfSpeechRounds[gameIndex];
  const selectLesson = (index: number) => { onLessonIndex(index); onStart(`grammar-${grammarLessons[index].id}`); setMode("lesson"); };
  const checkQuiz = () => {
    if (!selected) { setAnswerState("wrong"); return; }
    if (selected === question.answer) {
      setAnswerState("right");
      if (questionIndex === lesson.questions.length - 1) onComplete(`grammar-${lesson.id}`);
    } else setAnswerState("wrong");
  };
  const nextQuestion = () => { setQuestionIndex((index) => index + 1); setSelected(""); setAnswerState("idle"); setShowHint(false); };
  const checkGame = () => { if (!gameSelected) { setGameState("wrong"); return; } setGameState(gameSelected.toLocaleLowerCase() === gameRound.answer.toLocaleLowerCase() ? "right" : "wrong"); };
  const nextGame = () => {
    if (gameIndex === partsOfSpeechRounds.length - 1) { onComplete("grammar-parts-of-speech"); setGameDone(true); setGameIndex(0); }
    else setGameIndex((index) => index + 1);
    setGameSelected(""); setGameState("idle");
  };
  return (
    <div className="ew-activity-content">
      <div className="ew-tool-tabs" aria-label="Grammar activities"><button type="button" aria-pressed={mode === "lesson"} className={mode === "lesson" ? "is-active" : ""} onClick={() => setMode("lesson")}>Mini lessons</button><button type="button" aria-pressed={mode === "game"} className={mode === "game" ? "is-active" : ""} onClick={() => setMode("game")}>Parts of speech game</button></div>
      {mode === "lesson" && <>
        <div className="ew-grammar-lesson-list" aria-label="Grammar topics">{grammarLessons.map((item, index) => <button type="button" key={item.id} className={`ew-grammar-topic${index === lessonIndex ? " is-active" : ""}`} onClick={() => selectLesson(index)}><span aria-hidden="true">{item.icon}</span><span>{item.title}</span></button>)}</div>
        <article className="ew-grammar-card"><div className="ew-grammar-explain"><span className="ew-grammar-icon" aria-hidden="true">{lesson.icon}</span><div><p className="ew-eyebrow">Grammar Garden · mini lesson</p><h3>{lesson.title}</h3><p>{lesson.explanation}</p><p className="ew-example-line"><b>Example:</b> {lesson.example}</p></div></div><div className="ew-quiz-box"><div className="ew-quiz-heading"><span>Question {questionIndex + 1} of {lesson.questions.length}</span><button type="button" className="ew-hint-button" onClick={() => setShowHint((shown) => !shown)}>{showHint ? "Hide lesson note" : "Show lesson note"}</button></div>{showHint && <p className="ew-hint">{lesson.explanation}</p>}<h4>{question.prompt}</h4><div className="ew-choice-list">{question.choices.map((choice) => <button type="button" key={choice} className={`ew-answer-choice${selected === choice ? " is-selected" : ""}`} aria-pressed={selected === choice} onClick={() => { setSelected(choice); setAnswerState("idle"); }}>{choice}</button>)}</div><div className="ew-button-row"><button type="button" className="ew-button ew-button--gold" onClick={checkQuiz}>Check answer</button>{answerState === "wrong" && <button type="button" className="ew-button ew-button--light" onClick={() => setAnswerState("idle")}>Try again</button>}{answerState === "right" && questionIndex < lesson.questions.length - 1 && <button type="button" className="ew-button ew-button--blue" onClick={nextQuestion}>Next question →</button>}</div>{answerState === "right" && <FeedbackMessage tone="good">{question.explanation}</FeedbackMessage>}{answerState === "wrong" && <FeedbackMessage tone="try">{selected ? "Not quite. Read the lesson note and try another answer." : "Choose an answer to get started."}</FeedbackMessage>}</div></article>
      </>}
      {mode === "game" && (gameDone ? <article className="ew-word-game"><p className="ew-eyebrow">Parts of speech · complete</p><h3>Great work, word detective!</h3><p>Each answer was checked as you played. Try the game again whenever you like.</p><button type="button" className="ew-button ew-button--blue" onClick={() => { setGameDone(false); setGameIndex(0); setGameSelected(""); setGameState("idle"); }}>Play again</button></article> : <article className="ew-word-game"><p className="ew-eyebrow">Parts of speech · round {gameIndex + 1} of {partsOfSpeechRounds.length}</p><h3>{gameRound.sentence}</h3><p className="ew-instruction">Tap the {gameRound.target} in this sentence.</p><div className="ew-token-list">{gameRound.sentence.replace(/[.!?]/g, "").split(" ").map((token, index) => <button type="button" key={`${token}-${index}`} className={gameSelected === token ? "is-selected" : ""} aria-pressed={gameSelected === token} onClick={() => { setGameSelected(token); setGameState("idle"); }}>{token}</button>)}</div><p className="ew-hint">{gameRound.hint}</p><div className="ew-button-row"><button type="button" className="ew-button ew-button--gold" onClick={checkGame}>Check word</button>{gameState === "right" && <button type="button" className="ew-button ew-button--blue" onClick={nextGame}>Next sentence →</button>}{gameState === "wrong" && <button type="button" className="ew-button ew-button--light" onClick={() => setGameState("idle")}>Try again</button>}</div>{gameState === "right" && <FeedbackMessage tone="good">Yes! “{gameRound.answer}” is the {gameRound.target}.</FeedbackMessage>}{gameState === "wrong" && <FeedbackMessage tone="try">Look at the hint and choose a word to try again.</FeedbackMessage>}</article>)}
    </div>
  );
}

function ListeningActivity({ index, onIndex, onStart, onComplete, speak, speechMessage }: { index: number; onIndex: (index: number) => void; onStart: (id: string) => void; onComplete: (id: string) => void; speak: (text: string) => void; speechMessage: string }) {
  const [selected, setSelected] = useState("");
  const [feedback, setFeedback] = useState("");
  const activity = listeningActivities[index];
  const check = () => {
    if (!selected) { setFeedback("Choose an answer first."); return; }
    if (selected === activity.answer) { setFeedback("You heard that carefully!"); onComplete(`listening-${activity.id}`); }
    else setFeedback("Listen again and try another answer.");
  };
  const next = () => { const nextIndex = (index + 1) % listeningActivities.length; onIndex(nextIndex); onStart(`listening-${listeningActivities[nextIndex].id}`); setSelected(""); setFeedback(""); };
  return <div className="ew-activity-content"><article className="ew-listening-card"><div className="ew-listening-visual"><span aria-hidden="true">{activity.picture}</span><small>Listen, then choose</small></div><div className="ew-listening-question"><p className="ew-eyebrow">Listening Lagoon · activity {index + 1} of {listeningActivities.length}</p><h3>{activity.prompt}</h3><p>Play the sentence. You can listen again whenever you need.</p><button type="button" className="ew-button ew-button--blue" onClick={() => speak(activity.speak)}>🔊 Play sentence again</button>{speechMessage && <p className="ew-speech-status" role="status">{speechMessage}</p>}<div className="ew-choice-list">{activity.choices.map((choice) => <button type="button" key={choice} className={`ew-answer-choice${selected === choice ? " is-selected" : ""}`} aria-pressed={selected === choice} onClick={() => { setSelected(choice); setFeedback(""); }}>{choice}</button>)}</div><div className="ew-button-row"><button type="button" className="ew-button ew-button--gold" onClick={check}>Check answer</button>{feedback.startsWith("You heard") && <button type="button" className="ew-button ew-button--blue" onClick={next}>Next listening game →</button>}</div>{feedback && <FeedbackMessage tone={feedback.startsWith("You heard") ? "good" : "try"}>{feedback}</FeedbackMessage>}</div></article><ProgressBar value={feedback.startsWith("You heard") ? 100 : 0} label="Current listening activity" /></div>;
}

function SpeakingActivity({ index, onIndex, onStart, onComplete, speak, speechMessage }: { index: number; onIndex: (index: number) => void; onStart: (id: string) => void; onComplete: (id: string) => void; speak: (text: string) => void; speechMessage: string }) {
  const [transcript, setTranscript] = useState("");
  const [recognitionAvailable, setRecognitionAvailable] = useState(false);
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState("");
  const [feedback, setFeedback] = useState("");
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const prompt = speakingPrompts[index];
  useEffect(() => {
    const browserWindow = window as SpeechRecognitionWindow;
    const frame = window.requestAnimationFrame(() => {
      setRecognitionAvailable(Boolean(browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition));
    });
    return () => {
      window.cancelAnimationFrame(frame);
      recognitionRef.current?.abort();
    };
  }, []);
  const startRecognition = () => {
    const browserWindow = window as SpeechRecognitionWindow;
    const Recognition = browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition;
    if (!Recognition) { setStatus("Speech recognition is not supported here. Use the text alternative below."); return; }
    try {
      const recognition = new Recognition();
      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onresult = (event) => {
        const text = event.results[0]?.[0]?.transcript ?? "";
        setTranscript(text);
        setStatus(text ? "Speech was transcribed by your browser. Check the words below." : "No words were transcribed. Try again or use the text alternative.");
      };
      recognition.onerror = (event) => {
        const messages: Record<string, string> = {
          "not-allowed": "Microphone permission was blocked. You can use the text alternative below.",
          "service-not-allowed": "This browser does not allow speech recognition here. Try the text alternative.",
          "audio-capture": "No microphone was found. Try the text alternative below.",
          network: "Speech recognition could not connect. Try the text alternative below.",
          "no-speech": "No speech was heard. Try again when you are ready.",
        };
        setStatus(messages[event.error] ?? "Speech recognition stopped. You can try again or type what you said.");
        setListening(false);
      };
      recognition.onend = () => setListening(false);
      recognitionRef.current = recognition;
      setTranscript("");
      setStatus("Listening… speak the practice sentence when you are ready.");
      setListening(true);
      recognition.start();
    } catch {
      setListening(false);
      setStatus("The microphone could not start. Check browser permission or use the text alternative.");
    }
  };
  const stopRecognition = () => { recognitionRef.current?.stop(); setListening(false); setStatus("Listening stopped."); };
  const checkWords = () => {
    if (!transcript.trim()) { setFeedback("Say or type the practice sentence first."); return; }
    if (normaliseSentence(transcript) === normaliseSentence(prompt.text)) {
      setFeedback("The words match the practice sentence. Pronunciation is not scored here.");
      onComplete(`speaking-${prompt.id}`);
    } else setFeedback("The words are different from the practice sentence. Listen again, edit the text, and retry.");
  };
  const next = () => { const nextIndex = (index + 1) % speakingPrompts.length; onIndex(nextIndex); onStart(`speaking-${speakingPrompts[nextIndex].id}`); setTranscript(""); setStatus(""); setFeedback(""); };
  return <div className="ew-activity-content"><article className="ew-speaking-card"><div className="ew-speaking-prompt"><span aria-hidden="true">🗣️</span><p className="ew-eyebrow">Speaking Studio · phrase {index + 1} of {speakingPrompts.length}</p><h3>{prompt.text}</h3><p>{prompt.hint}</p><button type="button" className="ew-button ew-button--blue" onClick={() => speak(prompt.text)}>🔊 Play example</button>{speechMessage && <p className="ew-speech-status" role="status">{speechMessage}</p>}</div><div className="ew-speaking-tools"><h4>Practise the words</h4>{recognitionAvailable ? <div className="ew-button-row"><button type="button" className="ew-button ew-button--pink" onClick={listening ? stopRecognition : startRecognition}>{listening ? "■ Stop microphone" : "🎙️ Use microphone"}</button><span className="ew-mic-note">Your browser asks for microphone access.</span></div> : <p className="ew-hint">Speech recognition is not available in this browser. Use the text alternative; this activity will not pretend to hear you.</p>}{status && <p className="ew-speech-status" role="status">{status}</p>}<label className="ew-field-label" htmlFor="ew-speaking-text">Text alternative: type the words you practised</label><input id="ew-speaking-text" className="ew-text-input" value={transcript} onChange={(event) => { setTranscript(event.target.value); setFeedback(""); }} placeholder="Type what you said" autoComplete="off" /><p className="ew-hint">The check compares words only. It does not grade pronunciation or accent.</p><div className="ew-button-row"><button type="button" className="ew-button ew-button--gold" onClick={checkWords}>Check words</button>{feedback.startsWith("The words match") && <button type="button" className="ew-button ew-button--blue" onClick={next}>Next phrase →</button>}</div>{feedback && <FeedbackMessage tone={feedback.startsWith("The words match") ? "good" : "try"}>{feedback}</FeedbackMessage>}</div></article></div>;
}

function SentenceBuilderActivity({ index, onIndex, onStart, onComplete }: { index: number; onIndex: (index: number) => void; onStart: (id: string) => void; onComplete: (id: string) => void }) {
  const [placed, setPlaced] = useState<number[]>([]);
  const [dragged, setDragged] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [showHint, setShowHint] = useState(false);
  const item = sentencePrompts[index];
  const sentence = placed.map((tileIndex) => item.tiles[tileIndex]).join(" ");
  const remaining = item.tiles.map((word, tileIndex) => ({ word, tileIndex })).filter(({ tileIndex }) => !placed.includes(tileIndex));
  const addTile = (tileIndex: number) => { setPlaced((current) => current.includes(tileIndex) ? current : [...current, tileIndex]); setFeedback(""); };
  const dropTile = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); if (dragged !== null) addTile(dragged); setDragged(null); };
  const check = () => {
    if (!placed.length) { setFeedback("Tap or drag a word tile into the sentence first."); return; }
    if (sentence === item.sentence) { setFeedback("Your words make a clear sentence!"); onComplete(`sentence-${item.id}`); }
    else setFeedback("The words are not in the right order yet. Try again.");
  };
  const next = () => { const nextIndex = (index + 1) % sentencePrompts.length; onIndex(nextIndex); onStart(`sentence-${sentencePrompts[nextIndex].id}`); setPlaced([]); setFeedback(""); setShowHint(false); };
  return <div className="ew-activity-content"><article className="ew-builder-card"><div className="ew-builder-top"><span className="ew-builder-icon" aria-hidden="true">🧩</span><div><p className="ew-eyebrow">Sentence {index + 1} of {sentencePrompts.length}</p><h3>Put the words in order</h3></div></div><p className="ew-instruction">Tap a word, or drag it into the sentence. Tap a placed word to send it back.</p><div className="ew-sentence-drop" onDragOver={(event) => event.preventDefault()} onDrop={dropTile} aria-label="Sentence being built">{placed.length ? placed.map((tileIndex, position) => <button type="button" key={`${tileIndex}-${position}`} draggable onDragStart={() => setDragged(tileIndex)} onClick={() => { setPlaced((current) => current.filter((_, currentIndex) => currentIndex !== position)); setFeedback(""); }}>{item.tiles[tileIndex]}</button>) : <span>Build your sentence here…</span>}</div><div className="ew-tile-bank" aria-label="Word tiles">{remaining.map(({ word, tileIndex }) => <button type="button" key={tileIndex} draggable onDragStart={() => setDragged(tileIndex)} onClick={() => addTile(tileIndex)}>{word}</button>)}</div>{showHint && <p className="ew-hint">Hint: {item.hint}</p>}<div className="ew-button-row"><button type="button" className="ew-button ew-button--light" onClick={() => { setPlaced([]); setFeedback(""); }}>Reset</button><button type="button" className="ew-button ew-button--light" onClick={() => setShowHint((shown) => !shown)}>{showHint ? "Hide hint" : "Hint"}</button><button type="button" className="ew-button ew-button--gold" onClick={check}>Check sentence</button>{feedback.startsWith("Your words") && <button type="button" className="ew-button ew-button--blue" onClick={next}>Next sentence →</button>}</div>{feedback && <FeedbackMessage tone={feedback.startsWith("Your words") ? "good" : "try"}>{feedback}</FeedbackMessage>}<p className="ew-hint">Keyboard tip: Tab to a tile and press Enter or Space to move it.</p></article></div>;
}

export default function EnglishWorld() {
  const [activeCategory, setActiveCategory] = useState<EnglishCategoryId>("grammar");
  const [progress, setProgress] = useState<ProgressRecord>(EMPTY_PROGRESS);
  const [storageReady, setStorageReady] = useState(false);
  const [storageNotice, setStorageNotice] = useState("");
  const [todayKey, setTodayKey] = useState("");
  const [vocabularySet, setVocabularySet] = useState(0);
  const [vocabularyWordIndex, setVocabularyWordIndex] = useState(0);
  const [vocabularyRevealed, setVocabularyRevealed] = useState(false);
  const [vocabularyMode, setVocabularyMode] = useState<"cards" | "match" | "spelling">("cards");
  const [storyIndex, setStoryIndex] = useState(0);
  const [grammarIndex, setGrammarIndex] = useState(0);
  const [listeningIndex, setListeningIndex] = useState(0);
  const [speakingIndex, setSpeakingIndex] = useState(0);
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [speechMessage, setSpeechMessage] = useState("");
  const activityRef = useRef<HTMLElement>(null);
  const selectedCategory = englishCategories.find((category) => category.id === activeCategory) ?? englishCategories[2];
  const completedCount = progress.completed.length;
  const stars = completedCount + progress.dailyAwards.length;
  const badges = Math.floor(completedCount / 3);
  const todayTarget = todayKey ? getDailyTarget(todayKey) : dailyChallengeTargets[0];
  const dailyComplete = Boolean(todayKey && progress.dailyAwards.includes(todayKey));

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setTodayKey(getDateKey());
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: unknown = JSON.parse(stored);
          if (isProgressRecord(parsed)) setProgress({
            completed: [...new Set(parsed.completed.filter((id): id is string => typeof id === "string"))],
            dailyAwards: [...new Set(parsed.dailyAwards.filter((id): id is string => typeof id === "string"))],
            lastActivityId: parsed.lastActivityId,
          });
        }
      } catch {
        setStorageNotice("Progress could not be read from this browser. You can still play; it may not be saved.");
      } finally {
        setStorageReady(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      } catch {
        setStorageNotice("This browser could not save progress. Your activities still work for this visit.");
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [progress, storageReady]);

  useEffect(() => () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  const speak = useCallback((text: string) => {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      setSpeechMessage("Speech playback is not supported in this browser. You can still read the text.");
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.88;
      utterance.onstart = () => setSpeechMessage("Playing browser speech…");
      utterance.onend = () => setSpeechMessage("Finished. Play again any time.");
      utterance.onerror = () => setSpeechMessage("Browser speech could not play. Try the button again or read the text.");
      setSpeechMessage("Starting browser speech…");
      window.speechSynthesis.speak(utterance);
    } catch {
      setSpeechMessage("Browser speech could not play. Try the button again or read the text.");
    }
  }, []);

  const rememberActivity = (id: string) => setProgress((current) => ({ ...current, lastActivityId: id }));
  const completeActivity = (id: string) => {
    const isNew = !progress.completed.includes(id);
    const earnsDaily = todayKey && id === todayTarget.activityId && !progress.dailyAwards.includes(todayKey);
    setProgress((current) => ({
      completed: current.completed.includes(id) ? current.completed : [...current.completed, id],
      dailyAwards: earnsDaily && !current.dailyAwards.includes(todayKey) ? [...current.dailyAwards, todayKey] : current.dailyAwards,
      lastActivityId: id,
    }));
    if (isNew || earnsDaily) {
      const bounds = activityRef.current?.getBoundingClientRect();
      fireConfetti(bounds ? bounds.left + bounds.width / 2 : window.innerWidth / 2, bounds ? bounds.top + 100 : window.innerHeight / 3, 20);
    }
  };

  const focusActivity = () => window.setTimeout(() => activityRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
  const startCurrentActivity = () => {
    const activityIds: Record<EnglishCategoryId, string> = {
      vocabulary: `vocabulary-${wordSets[vocabularySet].id}`,
      stories: `story-${stories[storyIndex].id}`,
      grammar: `grammar-${grammarLessons[grammarIndex].id}`,
      listening: `listening-${listeningActivities[listeningIndex].id}`,
      speaking: `speaking-${speakingPrompts[speakingIndex].id}`,
      sentences: `sentence-${sentencePrompts[sentenceIndex].id}`,
    };
    rememberActivity(activityIds[activeCategory]);
    focusActivity();
  };

  const openActivity = (id: string) => {
    if (id.startsWith("vocabulary-")) {
      const index = wordSets.findIndex((set) => set.id === id.slice("vocabulary-".length));
      if (index >= 0) { setVocabularySet(index); setVocabularyWordIndex(0); setVocabularyMode("cards"); }
      setActiveCategory("vocabulary");
    } else if (id.startsWith("story-")) {
      const index = stories.findIndex((story) => story.id === id.slice("story-".length));
      if (index >= 0) setStoryIndex(index);
      setActiveCategory("stories");
    } else if (id.startsWith("grammar-")) {
      const index = grammarLessons.findIndex((lesson) => lesson.id === id.slice("grammar-".length));
      if (index >= 0) setGrammarIndex(index);
      setActiveCategory("grammar");
    } else if (id.startsWith("match-") || id.startsWith("spelling-")) {
      const isMatch = id.startsWith("match-");
      const index = wordSets.findIndex((set) => set.id === id.slice(isMatch ? "match-".length : "spelling-".length));
      if (index >= 0) setVocabularySet(index);
      setVocabularyMode(isMatch ? "match" : "spelling");
      setActiveCategory("vocabulary");
    } else if (id.startsWith("listening-")) {
      const index = listeningActivities.findIndex((activity) => activity.id === id.slice("listening-".length));
      if (index >= 0) setListeningIndex(index);
      setActiveCategory("listening");
    } else if (id.startsWith("speaking-")) {
      const index = speakingPrompts.findIndex((prompt) => prompt.id === id.slice("speaking-".length));
      if (index >= 0) setSpeakingIndex(index);
      setActiveCategory("speaking");
    } else if (id.startsWith("sentence-")) {
      const index = sentencePrompts.findIndex((item) => item.id === id.slice("sentence-".length));
      if (index >= 0) setSentenceIndex(index);
      setActiveCategory("sentences");
    }
    rememberActivity(id);
    focusActivity();
  };

  const continueActivity = () => {
    if (!progress.lastActivityId) return;
    openActivity(progress.lastActivityId);
  };

  const chooseCategory = (id: EnglishCategoryId) => {
    setActiveCategory(id);
    setSpeechMessage("");
  };

  return (
    <div className="english-world">
      <WorldNavigation active="english" />
      <EnglishHero onStart={() => { chooseCategory("grammar"); document.getElementById("ew-learn")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} />
      <main className="ew-dashboard" id="ew-learn">
        <div className="ew-dashboard-heading"><div><p className="ew-eyebrow">Welcome, English explorer!</p><h2>What shall we learn today?</h2><p>Choose a little adventure and learn at your own pace.</p></div><div className="ew-learning-level"><span aria-hidden="true">👑</span><span><b>Beginner</b><small>Learning level</small></span></div></div>
        <div className="ew-dashboard-layout">
          <aside className="ew-sidebar"><CategoryList active={activeCategory} onSelect={chooseCategory} /></aside>
          <div className="ew-main-column">
            <ProgressSummary completed={completedCount} stars={stars} badges={badges} />
            <div className="ew-small-card-grid"><ContinueCard activityId={progress.lastActivityId} onContinue={continueActivity} onStart={() => { chooseCategory("grammar"); focusActivity(); }} /><DailyChallenge targetTitle={todayTarget.title} subtitle={todayTarget.subtitle} complete={dailyComplete} onStart={() => openActivity(todayTarget.activityId)} /></div>
            <FeaturedCategory category={selectedCategory} completed={categoryCompletionCount(activeCategory, progress.completed)} onStart={startCurrentActivity} />
            <section className="ew-section-heading"><div><p className="ew-eyebrow">Explore the world</p><h2>Choose your adventure</h2></div><span>Six ways to learn English ✨</span></section>
            <CategoryGrid active={activeCategory} onSelect={(id) => { chooseCategory(id); focusActivity(); }} />
            <section className={`ew-activity-panel ew-activity-panel--${selectedCategory.tone}`} id="ew-activity" ref={activityRef} aria-labelledby="ew-activity-title">
              <div className="ew-activity-heading"><div><p className="ew-eyebrow">Your next little step</p><h2 id="ew-activity-title">{selectedCategory.title}</h2><p>{selectedCategory.subtitle}. Take your time, try again, and have fun.</p></div><span className="ew-activity-heading-icon" aria-hidden="true">{selectedCategory.icon}</span></div>
              {activeCategory === "vocabulary" && <VocabularyActivity key={vocabularySet} activeSet={vocabularySet} onSet={setVocabularySet} wordIndex={vocabularyWordIndex} onWordIndex={setVocabularyWordIndex} revealed={vocabularyRevealed} onReveal={() => setVocabularyRevealed((shown) => !shown)} onComplete={completeActivity} onStart={rememberActivity} mode={vocabularyMode} onMode={setVocabularyMode} />}
              {activeCategory === "stories" && <StoryActivity key={storyIndex} storyIndex={storyIndex} onStoryIndex={setStoryIndex} onComplete={completeActivity} onStart={rememberActivity} speak={speak} speechMessage={speechMessage} />}
              {activeCategory === "grammar" && <GrammarActivity key={grammarIndex} lessonIndex={grammarIndex} onLessonIndex={setGrammarIndex} onStart={rememberActivity} onComplete={completeActivity} />}
              {activeCategory === "listening" && <ListeningActivity index={listeningIndex} onIndex={setListeningIndex} onStart={rememberActivity} onComplete={completeActivity} speak={speak} speechMessage={speechMessage} />}
              {activeCategory === "speaking" && <SpeakingActivity index={speakingIndex} onIndex={setSpeakingIndex} onStart={rememberActivity} onComplete={completeActivity} speak={speak} speechMessage={speechMessage} />}
              {activeCategory === "sentences" && <SentenceBuilderActivity index={sentenceIndex} onIndex={setSentenceIndex} onStart={rememberActivity} onComplete={completeActivity} />}
              <p className="ew-reward-note">{storageNotice || (storageReady ? "Your progress is saved in this browser on this device." : "Loading your saved progress…")}</p>
            </section>
            <section className="ew-badges-section" aria-labelledby="ew-badges-title"><div><p className="ew-eyebrow">Earned by trying</p><h2 id="ew-badges-title">Your badges</h2><p>One badge appears for every three different activities you finish.</p></div><div className="ew-badge-row">{badges ? Array.from({ length: badges }).map((_, index) => <span className="ew-earned-badge" key={index} aria-label={`Badge ${index + 1}`}>🏅<small>Word explorer</small></span>) : <p className="ew-empty-badges">Your first badge is waiting. Finish three activities to earn it!</p>}</div></section>
          </div>
        </div>
        <footer className="ew-footer"><span>⭐</span><p>Small steps, bright words, big dreams.</p><a href="#ew-learn">Back to your learning map ↑</a></footer>
      </main>
    </div>
  );
}
