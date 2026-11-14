"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent, type ReactNode } from "react";
import Link from "next/link";
import WorldNavigation from "@/components/WorldNavigation";
import { api } from "@/lib/api";
import LearningZoneIsland from "@/components/3d/LearningZoneIsland";
import { fireConfetti } from "@/components/Confetti";
import AdventureGlyph from "./AdventureGlyph";
import AdventureIllustration from "./AdventureIllustration";
import TopicIllustration from "./TopicIllustration";
import {
  dailyChallengeTargets,
  englishCategories,
  grammarLessons,
  listeningActivities,
  conversationScenarios,
  partsOfSpeechRounds,
  sentencePrompts,
  speakingPrompts,
  stories,
  wordSets,
  createSpellingTiles,
  type EnglishCategoryId,
  type WordCard,
} from "./englishContent";

type ProgressRecord = {
  completed: string[];
  dailyAwards: string[];
  lastActivityId: string | null;
  reviewWordIds: string[];
};

const STORAGE_KEY = "kiddoworld-english-progress-v1";
const EMPTY_PROGRESS: ProgressRecord = { completed: [], dailyAwards: [], lastActivityId: null, reviewWordIds: [] };
const OPEN_IN_NEW_TAB = { target: "_blank", rel: "noopener noreferrer" } as const;

function VocabularyPicture({ word }: { word: WordCard }) {
  return word.colorHex
    ? <span className="ew-color-swatch" style={{ "--ew-swatch-color": word.colorHex } as React.CSSProperties} aria-hidden="true" />
    : <span aria-hidden="true">{word.picture}</span>;
}

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
    (typeof record.lastActivityId === "string" || record.lastActivityId === null) &&
    (record.reviewWordIds === undefined || Array.isArray(record.reviewWordIds));
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
  if (id.startsWith("sentence-")) return sentencePrompts.find((item) => item.id === id.slice("sentence-".length))?.sentence ?? conversationScenarios.find((item) => item.id === id.slice("sentence-".length))?.title ?? "Sentence Builder";
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

function topicActivityIds(categoryId: EnglishCategoryId, activityId: string) {
  if (categoryId === "vocabulary") {
    const setId = activityId.slice("vocabulary-".length);
    return [`vocabulary-${setId}`, `match-${setId}`, `spelling-${setId}`];
  }
  return [activityId];
}

const categoryDescriptions: Record<EnglishCategoryId, string> = {
  vocabulary: "Meet new words, look closely at their pictures, and practise matching sounds and spelling.",
  stories: "Open a storybook, read at your own pace, and look for clues in every page.",
  grammar: "Grow clear sentences by noticing the jobs words do and the way they fit together.",
  listening: "Listen carefully, replay each sentence, and choose the picture that matches what you hear.",
  speaking: "Hear a friendly example, practise a phrase, and use the honest voice or text tools on your device.",
  sentences: "Arrange word tiles into a clear sentence, then read it aloud as a little conversation.",
};

const featureWords: Record<EnglishCategoryId, [string, string]> = {
  vocabulary: ["Aa", "new words"],
  stories: ["Once…", "read"],
  grammar: ["N + V", "grow"],
  listening: ["Listen", "♪"],
  speaking: ["Hello!", "say it"],
  sentences: ["I can…", "build"],
};

const totalEnglishActivities = englishCategories.reduce(
  (total, category) => total + categoryActivityTotal(category.id),
  0,
);

type TopicCard = {
  activityId: string;
  title: string;
  description: string;
  tag: string;
};

const grammarTopicOrder = ["nouns", "verbs", "adjectives", "punctuation", "tenses"];

function topicsForCategory(categoryId: EnglishCategoryId): TopicCard[] {
  switch (categoryId) {
    case "vocabulary":
      return wordSets.map((set) => ({
        activityId: `vocabulary-${set.id}`,
        title: set.label,
        description: `${set.words.slice(0, 4).map((word) => word.word).join(" · ")}${set.words.length > 4 ? " and more" : ""}`,
        tag: `${set.words.length} words · ${set.words[0]?.level ?? "Beginner"}`,
      }));
    case "stories":
      return stories.map((story) => ({
        activityId: `story-${story.id}`,
        title: story.title,
        description: story.vocabulary.join(" · "),
        tag: `${story.minutes} min read`,
      }));
    case "grammar":
      return grammarTopicOrder.flatMap((id) => {
        const lesson = grammarLessons.find((item) => item.id === id);
        return lesson ? [{
          activityId: `grammar-${lesson.id}`,
          title: lesson.title,
          description: lesson.explanation,
          tag: `${lesson.level ?? "Beginner"} · ${lesson.questions.length} questions`,
        }] : [];
      });
    case "listening":
      return listeningActivities.map((activity) => ({
        activityId: `listening-${activity.id}`,
        title: activity.prompt,
        description: `Play the sentence, then choose from ${activity.choices.length} friendly answers.`,
        tag: "Listen & choose",
      }));
    case "speaking":
      return speakingPrompts.map((prompt) => ({
        activityId: `speaking-${prompt.id}`,
        title: prompt.text,
        description: prompt.hint,
        tag: "Say it aloud",
      }));
    case "sentences":
      return sentencePrompts.map((prompt) => ({
        activityId: `sentence-${prompt.id}`,
        title: prompt.sentence,
        description: prompt.hint,
        tag: "Sentence builder",
      }));
  }
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

function ReaderMascot() {
  return (
    <svg className="ew-reader-mascot" viewBox="0 0 300 300" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="ew-reader-shirt" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#42b7ff" /><stop offset="1" stopColor="#586de4" /></linearGradient>
        <linearGradient id="ew-reader-book" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#a984ff" /><stop offset="1" stopColor="#6946d9" /></linearGradient>
        <filter id="ew-reader-shadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="11" stdDeviation="9" floodColor="#234e9b" floodOpacity=".25" /></filter>
      </defs>
      <ellipse cx="151" cy="274" rx="116" ry="18" fill="#fff" opacity=".45" />
      <g filter="url(#ew-reader-shadow)">
        <path d="M38 274c5-58 37-95 94-101h49c55 8 79 44 84 101Z" fill="url(#ew-reader-shirt)" stroke="#e5f6ff" strokeWidth="7" />
        <path d="M121 173h57v50h-57Z" fill="#f1a77e" />
        <path d="M81 89c0-43 31-70 72-70 45 0 75 31 72 77l-4 39c-4 46-38 69-75 68-41-1-69-31-70-71Z" fill="#f6bd91" stroke="#b96a50" strokeWidth="6" />
        <path d="M78 100c-6-48 20-82 64-88 39-6 71 13 82 45l-10 20c-19-4-32-14-44-28-13 19-40 35-87 38l-2 35Z" fill="#653621" />
        <path d="M94 66c15-27 38-37 57-36m-24 42c23-3 44-14 58-30m-93 53c2-13 9-22 20-26" fill="none" stroke="#9a5231" strokeWidth="13" strokeLinecap="round" />
        <ellipse cx="124" cy="120" rx="8" ry="12" fill="#3d3340" /><ellipse cx="180" cy="119" rx="8" ry="12" fill="#3d3340" />
        <circle cx="127" cy="116" r="3" fill="#fff" /><circle cx="183" cy="115" r="3" fill="#fff" />
        <path d="M137 149c10 11 24 12 35 1" fill="none" stroke="#a44759" strokeWidth="5" strokeLinecap="round" />
        <path d="M93 202c29 29 77 35 116 1" fill="none" stroke="#f5c398" strokeWidth="22" strokeLinecap="round" />
        <path d="M81 225c25-18 49-17 73 3v44c-25-19-49-18-73 1Z" fill="url(#ew-reader-book)" stroke="#ffe28b" strokeWidth="5" />
        <path d="M154 228c24-20 49-21 74-4v49c-25-16-50-15-74 2Z" fill="#8560e8" stroke="#ffe28b" strokeWidth="5" />
        <path d="M154 229v46" stroke="#fff2cb" strokeWidth="4" />
        <path d="M94 240c14-6 27-5 43 3m-43 10c13-5 26-4 39 2m-39 9c13-4 25-3 37 2m38-24c13-5 25-5 39 0m-39 11c12-4 24-4 36 0m-36 10c11-3 21-3 32 1" fill="none" stroke="#f5e7ff" strokeWidth="3.5" strokeLinecap="round" opacity=".83" />
      </g>
      <path className="ew-reader-spark ew-reader-spark--one" d="m47 79 6 15 16 1-12 10 4 15-14-8-13 8 3-15-12-10 16-1Z" fill="#ffe875" />
      <path className="ew-reader-spark ew-reader-spark--two" d="m248 108 4 10 11 1-8 7 3 11-10-6-9 6 2-11-8-7 11-1Z" fill="#fff" />
    </svg>
  );
}

function FloatingLearningIsland() {
  return (
    <svg className="ew-island-artwork" viewBox="0 0 460 340" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="ew-island-grass" x1="90" y1="85" x2="340" y2="265" gradientUnits="userSpaceOnUse"><stop stopColor="#c5f875" /><stop offset=".55" stopColor="#54d19c" /><stop offset="1" stopColor="#25aeb0" /></linearGradient>
        <linearGradient id="ew-island-cliff" x1="100" y1="206" x2="330" y2="340" gradientUnits="userSpaceOnUse"><stop stopColor="#b56e8e" /><stop offset=".54" stopColor="#805c9e" /><stop offset="1" stopColor="#4d67b0" /></linearGradient>
        <linearGradient id="ew-island-water" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#a9ffff" /><stop offset="1" stopColor="#50c9f5" /></linearGradient>
        <linearGradient id="ew-island-roof" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ff9ac4" /><stop offset="1" stopColor="#df558e" /></linearGradient>
        <filter id="ew-island-drop" x="-25%" y="-25%" width="150%" height="170%"><feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#254e99" floodOpacity=".28" /></filter>
        <filter id="ew-island-prop-shadow" x="-25%" y="-30%" width="150%" height="170%"><feDropShadow dx="0" dy="5" stdDeviation="3" floodColor="#234c86" floodOpacity=".2" /></filter>
      </defs>
      <ellipse cx="237" cy="299" rx="180" ry="22" fill="#175bb9" opacity=".18" />
      <g className="ew-island-floating-art" filter="url(#ew-island-drop)">
        <path d="M52 190c19-38 65-59 104-58 31-44 88-50 126-21 37-30 95-10 112 29 35 8 64 28 77 61l-18 38-39 31-61 12-55 36-55-21-66 17-55-29-62-7-43-31-14-30Z" fill="url(#ew-island-cliff)" />
        <path d="m104 247 53 9 40 25 64-16 47 17 46-29 47-10 35-30-3 21-38 34-49 10-43 29-56-17-65 18-59-28-51-6-31-22Z" fill="#d2859e" opacity=".75" />
        <path className="ew-island-waterfall" d="m148 255 8 43 20 18 14-10-7-40m58 2 8 48 18 12 13-9-10-54m39-15 5 36 19 10 10-8-5-44" fill="url(#ew-island-water)" />
        <path d="M44 193c19-42 73-62 111-57 35-45 91-47 127-20 37-29 96-11 113 28 34 8 65 28 76 55-26 29-65 39-100 35-37 22-85 17-116 1-43 20-90 12-120-4-36 14-77 1-91-15Z" fill="url(#ew-island-grass)" stroke="#e4ffc0" strokeWidth="5" />
        <path d="M66 197c22-20 47-23 71-9m101-65c17-10 35-7 47 4m98 61c18-12 35-11 49-2" fill="none" stroke="#e8ffbb" strokeWidth="7" strokeLinecap="round" opacity=".8" />
        <path d="M72 214c33 15 72 8 98-2m84 16c31 11 70 7 102-7" fill="none" stroke="#2ebf94" strokeWidth="8" strokeLinecap="round" opacity=".55" />
      </g>
      <g className="ew-island-trees" filter="url(#ew-island-prop-shadow)">
        <path d="M105 174h12v36h-12z" fill="#a9684b" /><circle cx="111" cy="158" r="22" fill="#30ad77" /><circle cx="96" cy="169" r="16" fill="#53c988" /><circle cx="126" cy="170" r="17" fill="#2bb884" /><circle cx="111" cy="144" r="14" fill="#73d95d" />
        <path d="M353 173h11v32h-11z" fill="#ad6a4d" /><circle cx="359" cy="158" r="20" fill="#24a979" /><circle cx="344" cy="167" r="15" fill="#6bd35c" /><circle cx="373" cy="167" r="16" fill="#39c88a" /><circle cx="359" cy="145" r="13" fill="#8ce25f" />
      </g>
      <g className="ew-island-castle" filter="url(#ew-island-prop-shadow)">
        <path d="M190 111h33v83h-33zm75-13h37v94h-37zm34 28h29v69h-29z" fill="#fff4dd" stroke="#e5c5d8" strokeWidth="3" />
        <path d="m181 115 25-36 26 36Zm66-13 37-53 38 53Zm42 29 20-30 21 30Z" fill="url(#ew-island-roof)" stroke="#fff2ef" strokeWidth="4" strokeLinejoin="round" />
        <path d="M204 144h12v18h-12zm77-14h14v20h-14zm-18 42h17v28h-17z" fill="#82dff5" stroke="#fff" strokeWidth="3" />
        <g className="ew-island-flags">
          <path d="M282 48V24m0 1 31 8-31 8M204 83V60m0 1 22 6-22 7" fill="none" stroke="#8c5cc7" strokeWidth="4" strokeLinecap="round" />
          <path d="m276 29 34 8-28 8Zm-71 34 24 7-20 7Z" fill="#ffdc69" />
        </g>
      </g>
      <g className="ew-island-book" filter="url(#ew-island-prop-shadow)">
        <path d="M123 187c25-19 51-20 75-4v57c-24-15-49-16-75 2Z" fill="#743fd0" stroke="#fff0a4" strokeWidth="5" strokeLinejoin="round" />
        <path d="M198 183c25-17 51-17 75 2v57c-25-17-50-16-75-2Z" fill="#9c64ed" stroke="#fff0a4" strokeWidth="5" strokeLinejoin="round" />
        <path d="M198 185v56m-61-44c17-6 32-3 47 4m-47 10c16-5 31-3 46 4m33-14c17-7 32-6 47 1m-46 11c15-6 29-5 43 0" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".85" />
        <path d="m192 181 7-14 7 14" fill="#ffda67" />
      </g>
      <g className="ew-island-learning-blocks" filter="url(#ew-island-prop-shadow)">
        <rect x="307" y="190" width="34" height="34" rx="7" fill="#ffae54" stroke="#fff" strokeWidth="3" /><text x="324" y="214" textAnchor="middle" fill="#fff" fontSize="19" fontWeight="900">A</text>
        <rect x="332" y="211" width="34" height="34" rx="7" fill="#55cfe0" stroke="#fff" strokeWidth="3" /><text x="349" y="235" textAnchor="middle" fill="#fff" fontSize="19" fontWeight="900">B</text>
      </g>
      <g className="ew-island-flowers" fill="#fff2a3"><circle cx="81" cy="202" r="5" /><circle cx="88" cy="196" r="5" /><circle cx="95" cy="202" r="5" /><circle cx="88" cy="208" r="5" /><circle cx="88" cy="202" r="3" fill="#ff9b68" /><circle cx="393" cy="199" r="5" /><circle cx="400" cy="193" r="5" /><circle cx="407" cy="199" r="5" /><circle cx="400" cy="205" r="5" /><circle cx="400" cy="199" r="3" fill="#ff9b68" /></g>
    </svg>
  );
}

function DistantCastle({ className = "" }: { className?: string }) {
  return (
    <svg className={`ew-hero-castle ${className}`} viewBox="0 0 190 150" aria-hidden="true" focusable="false">
      <g fill="#d8ecff" stroke="#a9d7f4" strokeWidth="2">
        <path d="M23 140V71h25v69Zm43 0V55h32v85Zm50 0V83h26v57Zm35 0V96h19v44Z" />
        <path d="M13 71h45l-9-18-13 10-14-10Zm33-16h52l-12-21-15 12-13-12Zm40 28h36l-8-14-10 8-10-8Zm25 13h29l-7-12-8 7-7-7Z" fill="#b6a4ef" stroke="#9782e3" />
        <path d="M39 91h12v15H39Zm57-18h13v16H96Zm66 26h10v13h-10Z" fill="#8fd9ff" />
      </g>
      <path d="M106 18V3m0 1 24 6-24 6M66 40V27m0 1 18 4-18 5" fill="none" stroke="#9e8ce8" strokeWidth="2.5" strokeLinecap="round" />
      <path d="m102 8 27 7-24 7Zm-38 25 20 5-18 5Z" fill="#ffe27a" />
    </svg>
  );
}

function HeroBirds() {
  return (
    <svg className="ew-hero-birds" viewBox="0 0 150 48" aria-hidden="true" focusable="false">
      <path d="M5 31c6-8 12-8 18 0 6-8 12-8 18 0" fill="none" stroke="#e8fbff" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M68 15c4-5 8-5 12 0 4-5 8-5 12 0" fill="none" stroke="#f5feff" strokeWidth="2.6" strokeLinecap="round" opacity=".84" />
      <path d="M119 34c3-4 7-4 10 0 3-4 7-4 10 0" fill="none" stroke="#e8fbff" strokeWidth="2.2" strokeLinecap="round" opacity=".7" />
    </svg>
  );
}

function EnglishHero() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)");
    let frameId: number | null = null;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let lastTime = 0;

    const writeParallax = () => {
      hero.style.setProperty("--ew-sky-x", `${(currentX * 8).toFixed(2)}px`);
      hero.style.setProperty("--ew-sky-y", `${(currentY * 5).toFixed(2)}px`);
      hero.style.setProperty("--ew-copy-x", `${(currentX * 2.5).toFixed(2)}px`);
      hero.style.setProperty("--ew-copy-y", `${(currentY * 1.5).toFixed(2)}px`);
      hero.style.setProperty("--ew-mascot-x", `${(currentX * 5).toFixed(2)}px`);
      hero.style.setProperty("--ew-mascot-y", `${(currentY * 3).toFixed(2)}px`);
      hero.style.setProperty("--ew-island-x", `${(currentX * 10).toFixed(2)}px`);
      hero.style.setProperty("--ew-island-y", `${(currentY * 6).toFixed(2)}px`);
    };

    const settle = () => {
      currentX = targetX;
      currentY = targetY;
      writeParallax();
      frameId = null;
    };

    const tick = (time: number) => {
      const elapsed = Math.min(48, time - lastTime || 16);
      lastTime = time;
      const ease = 1 - Math.exp(-elapsed / 85);
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;

      if (Math.abs(targetX - currentX) < 0.002 && Math.abs(targetY - currentY) < 0.002) {
        settle();
        return;
      }

      writeParallax();
      frameId = window.requestAnimationFrame(tick);
    };

    const requestFrame = () => {
      if (frameId !== null) return;
      lastTime = performance.now();
      frameId = window.requestAnimationFrame(tick);
    };

    const canMove = () => !reducedMotion.matches && finePointer.matches && window.innerWidth > 760;

    const handlePointerMove = (event: PointerEvent) => {
      if (!canMove() || event.pointerType !== "mouse") return;
      const bounds = hero.getBoundingClientRect();
      targetX = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
      targetY = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2));
      requestFrame();
    };

    const handlePointerLeave = () => {
      targetX = 0;
      targetY = 0;
      requestFrame();
    };

    const handlePreferenceChange = () => {
      if (canMove()) return;
      targetX = 0;
      targetY = 0;
      requestFrame();
    };

    writeParallax();
    hero.addEventListener("pointermove", handlePointerMove);
    hero.addEventListener("pointerleave", handlePointerLeave);
    reducedMotion.addEventListener("change", handlePreferenceChange);
    finePointer.addEventListener("change", handlePreferenceChange);

    return () => {
      hero.removeEventListener("pointermove", handlePointerMove);
      hero.removeEventListener("pointerleave", handlePointerLeave);
      reducedMotion.removeEventListener("change", handlePreferenceChange);
      finePointer.removeEventListener("change", handlePreferenceChange);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <section ref={heroRef} className="ew-hero" aria-labelledby="english-world-title">
      <div className="ew-hero-sky" aria-hidden="true">
        <span className="ew-hero-sun" />
        <span className="ew-hero-glow" />
        <HeroBirds />
        <DistantCastle className="ew-hero-castle--one" />
        <DistantCastle className="ew-hero-castle--two" />
        <span className="ew-cloud ew-cloud--one" /><span className="ew-cloud ew-cloud--two" /><span className="ew-cloud ew-cloud--three" /><span className="ew-cloud ew-cloud--four" />
        <span className="ew-hero-particle ew-hero-particle--one" /><span className="ew-hero-particle ew-hero-particle--two" /><span className="ew-hero-particle ew-hero-particle--three" /><span className="ew-hero-particle ew-hero-particle--four" /><span className="ew-hero-particle ew-hero-particle--five" /><span className="ew-hero-particle ew-hero-particle--six" />
        <span className="ew-hero-letter ew-hero-letter--one">A</span><span className="ew-hero-letter ew-hero-letter--two">b</span><span className="ew-hero-letter ew-hero-letter--three">C</span>
        <span className="ew-hero-star ew-hero-star--one">✦</span><span className="ew-hero-star ew-hero-star--two">✧</span><span className="ew-hero-star ew-hero-star--three">✦</span><span className="ew-hero-star ew-hero-star--four">✧</span>
        <span className="ew-hero-far-island ew-hero-far-island--one" /><span className="ew-hero-far-island ew-hero-far-island--two" /><span className="ew-hero-far-island ew-hero-far-island--three" />
        <span className="ew-hero-cloudbank" />
      </div>
      <div className="ew-mascot-scene">
        <span className="ew-mascot-bubble" aria-hidden="true"><b>Hi, explorer!</b><small>Ready for a word adventure?</small></span>
        <ReaderMascot />
        <span className="ew-mascot-spark ew-mascot-spark--one" aria-hidden="true">✦</span>
        <span className="ew-mascot-spark ew-mascot-spark--two" aria-hidden="true">✧</span>
      </div>
      <div className="ew-hero-copy">
        <p className="ew-hero-kicker"><span aria-hidden="true">✦</span> A little learning goes a long way <span aria-hidden="true">✦</span></p>
        <h1 id="english-world-title"><span className="ew-title-english">English</span> <span className="ew-title-world">World</span></h1>
        <p className="ew-hero-description">Learn English through fun, interactive adventures!</p>
        <div className="ew-hero-actions">
          <Link href="#adventures" className="ew-button ew-button--gold ew-hero-cta"><span aria-hidden="true">✦</span> Start Learning <span aria-hidden="true">→</span></Link>
          <Link href="#worlds" className="ew-hero-secondary">Explore all six worlds <span aria-hidden="true">↓</span></Link>
        </div>
        <ul className="ew-hero-facts" aria-label="English World highlights">
          <li><span aria-hidden="true">✦</span><b>{englishCategories.length}</b> magical worlds</li>
          <li><span aria-hidden="true">★</span><b>{totalEnglishActivities}</b> playful activities</li>
          <li><span aria-hidden="true">Aa</span><b>Read · Listen · Speak</b></li>
        </ul>
      </div>
      <div className="ew-island" aria-hidden="true">
        <span className="ew-island-halo" />
        <div className="ew-island-model"><LearningZoneIsland kind="english" /></div>
        <FloatingLearningIsland />
        <span className="ew-island-spark ew-island-spark--one">✦</span>
        <span className="ew-island-spark ew-island-spark--two">✧</span>
      </div>
    </section>
  );
}

function AdventureSidebar({
  selected,
  onSelect,
  completed,
  learnerLevel,
  stars,
  storageReady,
}: {
  selected: EnglishCategoryId;
  onSelect: (category: EnglishCategoryId) => void;
  completed: string[];
  learnerLevel: number;
  stars: number;
  storageReady: boolean;
}) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") nextIndex = (index + 1) % englishCategories.length;
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") nextIndex = (index - 1 + englishCategories.length) % englishCategories.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = englishCategories.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    onSelect(englishCategories[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <aside className="ew-adventure-sidebar" aria-label="English learning adventures">
      <div className="ew-sidebar-heading">
        <p className="ew-sidebar-kicker"><span aria-hidden="true">✦</span> Learning adventures</p>
        <span className="ew-sidebar-count">{englishCategories.length} worlds</span>
      </div>
      <div className="ew-adventure-tabs" role="tablist" aria-label="Choose an adventure">
        {englishCategories.map((category, index) => {
          const categoryCompleted = categoryCompletionCount(category.id, completed);
          const isSelected = category.id === selected;
          return (
            <button
              key={category.id}
              ref={(element) => { tabRefs.current[index] = element; }}
              type="button"
              role="tab"
              id={`ew-adventure-tab-${category.id}`}
              aria-selected={isSelected}
              aria-controls="ew-selected-adventure"
              tabIndex={isSelected ? 0 : -1}
              className={`ew-adventure-tab ew-adventure-tab--${category.tone}${isSelected ? " is-selected" : ""}`}
              style={{ "--tab-index": index } as React.CSSProperties}
              onClick={() => onSelect(category.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              <span className="ew-adventure-tab-icon" aria-hidden="true"><AdventureGlyph category={category.id} /></span>
              <span className="ew-adventure-tab-copy">
                <strong>{category.shortTitle}</strong>
                <small>{category.subtitle}</small>
              </span>
              {categoryCompleted > 0 && (
                <span className="ew-adventure-tab-done" title={`${categoryCompleted} completed activit${categoryCompleted === 1 ? "y" : "ies"}`} aria-label={`${categoryCompleted} completed`}>
                  {categoryCompleted > 99 ? "99+" : categoryCompleted}
                </span>
              )}
              <span className="ew-adventure-tab-arrow" aria-hidden="true">→</span>
            </button>
          );
        })}
      </div>
      <div className="ew-sidebar-note">
        <span className="ew-sidebar-note-star" aria-hidden="true">★</span>
        <p>
          <small>Your explorer level</small>
          <strong>{storageReady ? `Level ${learnerLevel}` : "Loading…"}</strong>
          <span>{storageReady ? `${stars} ${stars === 1 ? "star" : "stars"} collected` : "Reading saved progress"}</span>
        </p>
        <svg className="ew-sidebar-note-book" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
          <path d="M10 20c9-5 16-4 22 2v29c-6-6-13-7-22-3Z" fill="#fff8e8" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M32 22c7-6 15-7 23-2v28c-9-4-16-3-23 3Z" fill="#bda6ff" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M32 22v29M17 28c4-1 7 0 10 2m-10 5c4-1 7 0 10 2m10-9c3-2 6-3 10-2m-10 7c3-2 6-3 10-2" fill="none" stroke="#7d68cf" strokeWidth="2" strokeLinecap="round" opacity=".62" />
          <path d="m46 7 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="#ffdb62" stroke="#fff8ce" strokeWidth="1.2" />
        </svg>
      </div>
      <p className="ew-sidebar-caption" aria-hidden="true">Pick a world. Every tiny lesson adds a star.</p>
    </aside>
  );
}

function EnglishDashboard({
  progress,
  storageReady,
  todayTarget,
  dailyComplete,
  badges,
  stars,
}: {
  progress: ProgressRecord;
  storageReady: boolean;
  todayTarget: (typeof dailyChallengeTargets)[number] | null;
  dailyComplete: boolean;
  badges: number;
  stars: number;
}) {
  const [selectedAdventure, setSelectedAdventure] = useState<EnglishCategoryId | null>(null);
  const resolvedAdventure = selectedAdventure ?? activityCategory(progress.lastActivityId) ?? "vocabulary";
  const category = englishCategories.find((item) => item.id === resolvedAdventure) ?? englishCategories[0];
  const topics = useMemo(() => topicsForCategory(category.id), [category.id]);
  const [showAllVocabularyTopics, setShowAllVocabularyTopics] = useState(false);
  const visibleTopics = category.id === "vocabulary" && !showAllVocabularyTopics ? topics.slice(0, 10) : topics;
  const completedCount = categoryCompletionCount(category.id, progress.completed);
  const totalCount = categoryActivityTotal(category.id);
  const progressPercent = Math.round((completedCount / totalCount) * 100);
  const learnerLevel = badges + 1;
  const adventureNumber = englishCategories.findIndex((item) => item.id === category.id) + 1;

  const selectAdventure = (categoryId: EnglishCategoryId) => {
    setSelectedAdventure(categoryId);
  };

  return (
    <section className="ew-learning-dashboard" id="adventures" aria-labelledby="ew-dashboard-title">
      <div className="ew-dashboard-magic" aria-hidden="true">
        <span className="ew-dash-orb ew-dash-orb--one" />
        <span className="ew-dash-orb ew-dash-orb--two" />
        <span className="ew-dash-spark ew-dash-spark--one">✦</span>
        <span className="ew-dash-spark ew-dash-spark--two">✧</span>
        <span className="ew-dash-spark ew-dash-spark--three">✦</span>
        <span className="ew-dash-spark ew-dash-spark--four">✧</span>
        <span className="ew-dash-spark ew-dash-spark--five">✦</span>
      </div>
      <div className="ew-dashboard-grid">
        <AdventureSidebar
          selected={category.id}
          onSelect={selectAdventure}
          completed={progress.completed}
          learnerLevel={learnerLevel}
          stars={stars}
          storageReady={storageReady}
        />

        <div key={category.id} className="ew-dashboard-content" id="ew-selected-adventure" role="tabpanel" aria-labelledby={`ew-adventure-tab-${category.id}`}>
          <header className="ew-dash-heading">
            <div className="ew-dash-heading-main">
              <span className={`ew-dash-crest ew-dash-crest--${category.tone}`} aria-hidden="true">
                <AdventureGlyph category={category.id} />
              </span>
              <div className="ew-dash-copy">
                <p className="ew-section-kicker"><span aria-hidden="true">✦</span> Adventure {adventureNumber} of {englishCategories.length} <span aria-hidden="true">✦</span></p>
                <div className="ew-dash-title-row">
                  <h2 id="ew-dashboard-title">{category.title}</h2>
                  <span className="ew-dash-level">{category.level}</span>
                </div>
                <p className="ew-dash-description">{categoryDescriptions[category.id]}</p>
                <div className="ew-dash-meter">
                  <ProgressBar
                    value={progressPercent}
                    label={storageReady ? `${completedCount} of ${totalCount} activities complete` : "Loading saved progress…"}
                  />
                </div>
              </div>
            </div>
            <div className="ew-dash-stats" aria-label="Progress summary">
              <div className="ew-dash-stat">
                <span className="ew-dash-stat-icon" aria-hidden="true">✓</span>
                <span><b>{storageReady ? `${completedCount}/${totalCount}` : "…"}</b><small>Activities done</small></span>
              </div>
              <div className="ew-dash-stat">
                <span className="ew-dash-stat-icon ew-dash-stat-icon--badge" aria-hidden="true">★</span>
                <span><b>{storageReady ? `Level ${learnerLevel}` : "…"}</b><small>{storageReady ? `${badges} ${badges === 1 ? "badge" : "badges"} earned` : "Loading progress"}</small></span>
              </div>
              <div className="ew-dash-stat">
                <span className="ew-dash-stat-icon ew-dash-stat-icon--star" aria-hidden="true">✦</span>
                <span><b>{storageReady ? stars : "…"}</b><small>Stars collected</small></span>
              </div>
            </div>
          </header>

          <section className={`ew-feature-banner ew-feature-banner--${category.tone}`} aria-labelledby="ew-feature-title">
            <div className="ew-feature-copy">
              <span className="ew-feature-eyebrow"><span aria-hidden="true">✦</span> Featured adventure</span>
              <h3 id="ew-feature-title">{category.title}</h3>
              <p>{categoryDescriptions[category.id]}</p>
              <ul className="ew-feature-facts">
                <li><b>{topics.length}</b> topics</li>
                <li><b>{completedCount}</b> of {totalCount} done</li>
                <li><b>{category.level}</b></li>
              </ul>
              <div className="ew-feature-actions">
                <Link
                  href={`/english/${category.id}`}
                  className="ew-button ew-button--gold ew-feature-start"
                  aria-label={`Start ${category.title} in a new tab`}
                  {...OPEN_IN_NEW_TAB}
                >
                  Start Lesson <span aria-hidden="true">→</span>
                </Link>
                <Link href="#ew-topics" className="ew-feature-topics">See all {topics.length} topics <span aria-hidden="true">↓</span></Link>
              </div>
            </div>
            <div className="ew-feature-art" aria-hidden="true">
              <span className="ew-feature-crest"><AdventureGlyph category={category.id} /></span>
              <div className="ew-feature-art-frame"><AdventureIllustration category={category.id} /></div>
              <span className="ew-feature-spark ew-feature-spark--one">✦</span>
              <span className="ew-feature-spark ew-feature-spark--two">✧</span>
              <span className="ew-feature-letters">Aa</span>
              <span className="ew-feature-word ew-feature-word--one">{featureWords[category.id][0]}</span>
              <span className="ew-feature-word ew-feature-word--two">{featureWords[category.id][1]}</span>
            </div>
            <span className="ew-feature-shine" aria-hidden="true" />
          </section>

          <div className="ew-topic-heading" id="ew-topics">
            <div>
              <p className="ew-section-kicker"><span aria-hidden="true">✦</span> Pick a topic <span aria-hidden="true">✦</span></p>
              <h3>Where will you begin?</h3>
            </div>
            <Link
              href={`/english/${category.id}`}
              className="ew-topic-all"
              aria-label={`Open the full ${category.title} in a new tab`}
              {...OPEN_IN_NEW_TAB}
            >
              Open full adventure <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div id={category.id === "vocabulary" ? "ew-vocabulary-topic-list" : undefined} className={`ew-topic-grid ew-topic-grid--${category.tone}${showAllVocabularyTopics && category.id === "vocabulary" ? " is-expanded" : ""}`} aria-label={`${category.shortTitle} topics`}>
            {visibleTopics.map((topic, index) => {
              const topicIds = topicActivityIds(category.id, topic.activityId);
              const topicDone = topicIds.filter((id) => progress.completed.includes(id)).length;
              const isDone = topicDone === topicIds.length;
              const topicPercent = Math.round((topicDone / topicIds.length) * 100);
              return (
                <Link
                  key={topic.activityId}
                  href={activityUrl(topic.activityId)}
                  className={`ew-topic-card ew-topic-card--${category.tone}${isDone ? " is-done" : ""}`}
                  style={{ "--topic-index": index } as React.CSSProperties}
                  aria-label={`${topic.title} — ${isDone ? "practise again" : topicDone > 0 ? "continue" : "start"} in a new tab`}
                  {...OPEN_IN_NEW_TAB}
                >
                  <span className="ew-topic-card-star" aria-hidden="true">✦</span>
                  <span className="ew-topic-icon" aria-hidden="true">
                    <TopicIllustration category={category.id} index={index} />
                    <span className="ew-topic-number">{String(index + 1).padStart(2, "0")}</span>
                  </span>
                  <span className="ew-topic-tag">{isDone ? "Completed" : topic.tag}</span>
                  <strong>{topic.title}</strong>
                  <small>{topic.description}</small>
                  <span className="ew-topic-meter">
                    <span className="ew-topic-meter-track" aria-hidden="true"><span style={{ width: `${topicPercent}%` }} /></span>
                    <small>{topicDone}/{topicIds.length} done</small>
                  </span>
                  <span className="ew-topic-start">{isDone ? "Practise again" : topicDone > 0 ? "Continue" : "Start"} <span aria-hidden="true">→</span></span>
                </Link>
              );
            })}
          </div>
          {category.id === "vocabulary" && topics.length > 10 && (
            <div className="ew-topic-expander">
              <p>{showAllVocabularyTopics ? `Showing all ${topics.length} vocabulary topics` : `Showing 10 of ${topics.length} vocabulary topics`}</p>
              <button type="button" className="ew-topic-expand-button" aria-expanded={showAllVocabularyTopics} aria-controls="ew-vocabulary-topic-list" onClick={() => setShowAllVocabularyTopics((shown) => !shown)}>
                {showAllVocabularyTopics ? "Show Less" : `View All Topics (${topics.length})`} <span aria-hidden="true">{showAllVocabularyTopics ? "↑" : "↓"}</span>
              </button>
            </div>
          )}

          <LandingJourney progress={progress} target={todayTarget} dailyComplete={dailyComplete} />
        </div>
      </div>
    </section>
  );
}

function AdventureWorlds({ progress, storageReady }: { progress: ProgressRecord; storageReady: boolean }) {
  return (
    <section className="ew-worlds-section" id="worlds" aria-labelledby="ew-worlds-title">
      <div className="ew-worlds-heading">
        <p className="ew-section-kicker"><span aria-hidden="true">✦</span> The whole world map <span aria-hidden="true">✦</span></p>
        <h2 id="ew-worlds-title">Six worlds. One big adventure.</h2>
        <p>Every world has its own story, friendly challenges, and little wins. Pick a door and peek inside.</p>
      </div>
      <div className="ew-world-grid">
        {englishCategories.map((world, index) => {
          const completed = categoryCompletionCount(world.id, progress.completed);
          const total = categoryActivityTotal(world.id);
          const percent = Math.round((completed / total) * 100);
          const worldNumber = String(index + 1).padStart(2, "0");

          return (
            <Link
              key={world.id}
              href={`/english/${world.id}`}
              className={`ew-world-card ew-world-card--${world.tone}`}
              style={{ "--world-index": index } as React.CSSProperties}
              aria-label={`Open ${world.title} in a new tab`}
              {...OPEN_IN_NEW_TAB}
            >
              <span className="ew-world-art" aria-hidden="true">
                <span className="ew-world-art-glow" />
                <span className="ew-world-art-frame"><AdventureIllustration category={world.id} /></span>
                <span className="ew-world-crest"><AdventureGlyph category={world.id} /></span>
                <span className="ew-world-index">World {worldNumber}</span>
                <span className="ew-world-art-spark ew-world-art-spark--one">✦</span>
                <span className="ew-world-art-spark ew-world-art-spark--two">✧</span>
              </span>
              <span className="ew-world-copy">
                <span className="ew-world-meta">
                  <span>{world.level}</span>
                  <span>{storageReady ? `${completed}/${total} done` : "Reading progress…"}</span>
                </span>
                <strong className="ew-world-title">{world.title}</strong>
                <span className="ew-world-description">{categoryDescriptions[world.id]}</span>
                <span className="ew-world-meter">
                  <span className="ew-world-meter-track" aria-hidden="true"><span style={{ width: `${percent}%` }} /></span>
                  <small>{storageReady ? `${percent}% complete` : "Loading progress"}</small>
                </span>
                <span className="ew-world-action">
                  Start Adventure <span aria-hidden="true">→</span>
                </span>
              </span>
            </Link>
          );
        })}
      </div>
      <p className="ew-worlds-note"><span aria-hidden="true">✦</span> Each card opens in a new tab, so your world map stays right here.</p>
    </section>
  );
}

function activityCategory(id: string | null): EnglishCategoryId | null {
  if (!id) return null;
  if (id.startsWith("vocabulary-") || id.startsWith("match-") || id.startsWith("spelling-")) return "vocabulary";
  if (id.startsWith("story-")) return "stories";
  if (id.startsWith("grammar-")) return "grammar";
  if (id.startsWith("listening-")) return "listening";
  if (id.startsWith("speaking-")) return "speaking";
  if (id.startsWith("sentence-")) return "sentences";
  return null;
}

function activityUrl(id: string) {
  const category = activityCategory(id);
  return `/english/${category ?? "vocabulary"}?activity=${encodeURIComponent(id)}`;
}

function LandingJourney({ progress, target, dailyComplete }: { progress: ProgressRecord; target: (typeof dailyChallengeTargets)[number] | null; dailyComplete: boolean }) {
  return (
    <div className="ew-journey-rail">
      {progress.lastActivityId ? (
        <Link className="ew-journey-chip ew-journey-chip--continue" href={activityUrl(progress.lastActivityId)} aria-label="Continue your last activity in a new tab" {...OPEN_IN_NEW_TAB}>
          <span className="ew-journey-icon" aria-hidden="true">↗</span><span><small>Continue your trail</small><strong>{activityTitle(progress.lastActivityId)}</strong></span><span className="ew-journey-action">Continue →</span>
        </Link>
      ) : (
        <p className="ew-first-step"><span className="ew-journey-icon" aria-hidden="true">✦</span><span><small>New explorer?</small><strong>Your first star is waiting in any adventure.</strong></span></p>
      )}
      {target ? (
        <Link className={`ew-journey-chip ew-journey-chip--daily${dailyComplete ? " is-complete" : ""}`} href={activityUrl(target.activityId)} aria-label={`${dailyComplete ? "Review" : "Try"} today's quest in a new tab`} {...OPEN_IN_NEW_TAB}>
          <span className="ew-journey-icon" aria-hidden="true">{dailyComplete ? "✓" : "★"}</span><span><small>Today&apos;s little quest</small><strong>{dailyComplete ? "Challenge complete!" : target.title}</strong></span><span className="ew-journey-action">{dailyComplete ? "Review →" : "Try it →"}</span>
        </Link>
      ) : (
        <p className="ew-journey-chip ew-journey-chip--daily is-loading"><span className="ew-journey-icon" aria-hidden="true">★</span><span><small>Today&apos;s little quest</small><strong>Choosing your next quest…</strong></span></p>
      )}
    </div>
  );
}

function VocabularyActivity({
  activeSet, onSet, wordIndex, onWordIndex, revealed, onReveal, onComplete, onStart,
  mode, onMode, speak, reviewWordIds, onReviewWord, onClearReview,
}: {
  activeSet: number; onSet: (index: number) => void; wordIndex: number; onWordIndex: (index: number) => void;
  revealed: boolean; onReveal: () => void; onComplete: (id: string) => void; onStart: (id: string) => void;
  mode: "cards" | "match" | "spelling"; onMode: (mode: "cards" | "match" | "spelling") => void;
  speak: (text: string) => void;
  reviewWordIds: string[]; onReviewWord: (id: string) => void; onClearReview: (id: string) => void;
}) {
  const set = wordSets[activeSet];
  const [matchedBySet, setMatchedBySet] = useState<Record<string, string[]>>({});
  const [reviewedBySet, setReviewedBySet] = useState<Record<string, string[]>>({});
  const [reviewBatch, setReviewBatch] = useState(0);
  const matched = matchedBySet[set.id] ?? [];
  const reviewed = reviewedBySet[set.id] ?? [];
  const [matchBatch, setMatchBatch] = useState(0);
  const [selectedPicture, setSelectedPicture] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [matchFeedback, setMatchFeedback] = useState("");
  const [spellingBySet, setSpellingBySet] = useState<Record<string, { index: number; letters: number[]; feedback: string }>>({});
  const spellingState = spellingBySet[set.id] ?? { index: 0, letters: [], feedback: "" };
  const { index: spellingIndex, letters: spellingLetters, feedback: spellingFeedback } = spellingState;
  const updateSpelling = (update: Partial<typeof spellingState>) => setSpellingBySet((current) => ({ ...current, [set.id]: { ...spellingState, ...update } }));
  const [showHint, setShowHint] = useState(false);
  const [wordFeedback, setWordFeedback] = useState("");
  const word = set.words[wordIndex];
  const spellingWord = set.words[spellingIndex];
  const batchStart = Math.floor(wordIndex / 10) * 10;
  const wordBatch = set.words.slice(batchStart, batchStart + 10);
  const matchStart = matchBatch * 10;
  const matchWords = set.words.slice(matchStart, matchStart + 10);
  const batchCount = Math.ceil(set.words.length / 10);
  const reviewPageCount = Math.ceil(reviewWordIds.length / 10);
  const reviewPage = Math.min(reviewBatch, Math.max(0, reviewPageCount - 1));
  const reviewBatchWords = reviewWordIds.slice(reviewPage * 10, reviewPage * 10 + 10);
  const changeMatchBatch = (nextBatch: number) => { setMatchBatch(nextBatch); setSelectedPicture(null); setSelectedWord(null); setMatchFeedback(""); };

  const chooseMatchPicture = (id: string) => {
    if (matched.includes(id)) return;
    setSelectedPicture(id);
    const candidate = selectedWord;
    if (!candidate) return;
    if (candidate === id) {
      const next = [...matched, id];
      setMatchedBySet((current) => ({ ...current, [set.id]: next }));
      setSelectedWord(null);
      setSelectedPicture(null);
      setMatchFeedback("A lovely match!");
      if (next.length === set.words.length) onComplete(`match-${set.id}`);
    } else {
      onReviewWord(id);
      onReviewWord(candidate);
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
      setMatchedBySet((current) => ({ ...current, [set.id]: next }));
      setSelectedWord(null);
      setSelectedPicture(null);
      setMatchFeedback("A lovely match!");
      if (next.length === set.words.length) onComplete(`match-${set.id}`);
    } else {
      onReviewWord(id);
      onReviewWord(selectedPicture);
      setMatchFeedback("Those two do not match yet. Try another word.");
      setSelectedWord(null);
      setSelectedPicture(null);
    }
  };

  const spellingBank = useMemo(() => createSpellingTiles(spellingWord.word), [spellingWord.word]);
  const chosenSpelling = spellingLetters.map((sourceIndex) => Array.from(spellingWord.word.toLocaleUpperCase())[sourceIndex]).join("");
  const checkSpelling = () => {
    if (chosenSpelling === spellingWord.word.toLocaleUpperCase()) {
      updateSpelling({ feedback: "That's the word! Great spelling." });
      if (spellingIndex === set.words.length - 1) onComplete(`spelling-${set.id}`);
    } else { onReviewWord(spellingWord.id); updateSpelling({ feedback: "Not quite yet. Look at the letters and try again." }); }
  };

  return (
    <div className="ew-activity-content">
      <div className="ew-tool-tabs" aria-label="Vocabulary activities">
        <button type="button" aria-pressed={mode === "cards"} className={mode === "cards" ? "is-active" : ""} onClick={() => onMode("cards")}>Word cards</button>
        <button type="button" aria-pressed={mode === "match"} className={mode === "match" ? "is-active" : ""} onClick={() => onMode("match")}>Picture match</button>
        <button type="button" aria-pressed={mode === "spelling"} className={mode === "spelling" ? "is-active" : ""} onClick={() => onMode("spelling")}>Spelling puzzle</button>
      </div>
      {mode === "cards" && <>
        {reviewWordIds.length > 0 && <section className="ew-review-panel" aria-label="Words to practise again"><div className="ew-review-heading"><div><p className="ew-eyebrow">Your saved review shelf · {reviewWordIds.length} words</p><h3>Let&apos;s practise these again</h3></div><div className="ew-review-paging"><button type="button" className="ew-button ew-button--light" disabled={reviewPage === 0} onClick={() => setReviewBatch((page) => Math.max(0, page - 1))}>Previous 10</button><span>{reviewPage + 1} / {reviewPageCount}</span><button type="button" className="ew-button ew-button--light" disabled={reviewPage + 1 >= reviewPageCount} onClick={() => setReviewBatch((page) => Math.min(reviewPageCount - 1, page + 1))}>Next 10</button></div></div><div className="ew-review-words">{reviewBatchWords.map((id) => { const reviewWord = wordSets.flatMap((item) => item.words).find((item) => item.id === id); return reviewWord ? <article className="ew-review-word" key={id}><VocabularyPicture word={reviewWord} /><b>{reviewWord.word}</b><small>{reviewWord.meaning}</small><div className="ew-button-row"><button type="button" className="ew-button ew-button--light" onClick={() => speak(reviewWord.word)}>Hear it</button><button type="button" className="ew-button ew-button--blue" onClick={() => onClearReview(id)}>I know it now</button></div></article> : null; })}</div></section>}
        <div className="ew-chip-row" aria-label="Word categories">{wordSets.map((item, index) => <button type="button" key={item.id} className={`ew-chip${activeSet === index ? " is-active" : ""}`} aria-pressed={activeSet === index} onClick={() => { onSet(index); onWordIndex(0); setMatchBatch(0); setSelectedPicture(null); setSelectedWord(null); setMatchFeedback(""); onStart(`vocabulary-${item.id}`); }}>{item.icon} {item.label}</button>)}</div>
        <div className="ew-batch-navigation"><button type="button" className="ew-button ew-button--light" disabled={batchStart === 0} onClick={() => onWordIndex(Math.max(0, batchStart - 10))}>← Previous 10</button><span>Words {batchStart + 1}–{Math.min(batchStart + 10, set.words.length)} of {set.words.length}</span><button type="button" className="ew-button ew-button--light" disabled={batchStart + 10 >= set.words.length} onClick={() => onWordIndex(Math.min(batchStart + 10, set.words.length - 1))}>Next 10 →</button></div>
        <div key={batchStart} className="ew-word-picker" aria-label={`Words ${batchStart + 1} to ${Math.min(batchStart + 10, set.words.length)}`}>
          {wordBatch.map((item, offset) => { const index = batchStart + offset; return <button type="button" key={item.id} className={`${wordIndex === index ? "is-active" : ""}${reviewed.includes(item.id) ? " is-learned" : ""}`} aria-pressed={wordIndex === index} onClick={() => { onWordIndex(index); setWordFeedback(""); }}><VocabularyPicture word={item} /><b>{item.word}</b>{reviewed.includes(item.id) && <small>✓</small>}</button>; })}
        </div>
        <article className="ew-word-card">
          <div className="ew-word-picture" key={word.id} aria-label={`${word.word} picture`}><VocabularyPicture word={word} /><small>{set.label}</small></div>
          <div className="ew-word-copy"><p className="ew-eyebrow">Word {wordIndex + 1} of {set.words.length}</p><h3>{word.word}</h3>{word.topic && <p className="ew-eyebrow">{word.topic} · {word.level}</p>}<p className="ew-word-example"><b>Example:</b> {word.sentence}</p>{revealed && <p className="ew-definition"><b>It means:</b> {word.meaning}</p>}
            <div className="ew-button-row"><button type="button" className="ew-button ew-button--light" onClick={() => speak(word.pronunciation ?? word.word)}>🔊 Hear word</button><button type="button" className="ew-button ew-button--light" onClick={onReveal}>{revealed ? "Hide meaning" : "Reveal meaning"}</button><button type="button" className="ew-button ew-button--blue" onClick={() => { const nextReviewed = [...new Set([...reviewed, word.id])]; setReviewedBySet((current) => ({ ...current, [set.id]: nextReviewed })); setWordFeedback(""); if (wordIndex === set.words.length - 1) { if (nextReviewed.length === set.words.length) onComplete(`vocabulary-${set.id}`); else setWordFeedback("Go back and tap Got it on each word to finish this set."); } else onWordIndex(wordIndex + 1); }}>Got it <span aria-hidden="true">→</span></button></div>
          </div>
        </article>
        <ProgressBar value={Math.round((reviewed.length / set.words.length) * 100)} label={`${reviewed.length} of ${set.words.length} words marked Got it`} />
        <p className="ew-word-page-note">Showing a small set of words at a time keeps practice easy to follow. Choose a word above to revisit it.</p>
        {wordFeedback && <FeedbackMessage tone="try">{wordFeedback}</FeedbackMessage>}
      {wordIndex === set.words.length - 1 && <button type="button" className="ew-reset-link" onClick={() => { onWordIndex(0); setReviewedBySet((current) => ({ ...current, [set.id]: [] })); setWordFeedback(""); if (revealed) onReveal(); }}>Practice again from the first word</button>}
      </>}
      {mode === "match" && <>
        <div className="ew-batch-navigation"><button type="button" className="ew-button ew-button--light" disabled={matchBatch === 0} onClick={() => changeMatchBatch(Math.max(0, matchBatch - 1))}>← Previous 10</button><span>Choices {matchStart + 1}–{Math.min(matchStart + 10, set.words.length)} of {set.words.length} · group {matchBatch + 1} of {batchCount}</span><button type="button" className="ew-button ew-button--light" disabled={matchBatch + 1 >= batchCount} onClick={() => changeMatchBatch(Math.min(batchCount - 1, matchBatch + 1))}>Next 10 →</button></div>
        <p className="ew-instruction">Tap a picture, then tap its matching word.</p>
        <div key={matchBatch} className="ew-match-board">
          <div className="ew-match-pictures" aria-label="Pictures to match">{matchWords.map((item) => <button type="button" key={item.id} className={`ew-match-picture${selectedPicture === item.id ? " is-selected" : ""}${matched.includes(item.id) ? " is-matched" : ""}`} aria-label={`Picture ${item.word}`} aria-pressed={selectedPicture === item.id} disabled={matched.includes(item.id)} onClick={() => chooseMatchPicture(item.id)}><VocabularyPicture word={item} />{matched.includes(item.id) && <small>Matched ✓</small>}</button>)}</div>
          <div className="ew-match-words" aria-label="Words to match">{matchWords.map((item) => <button type="button" key={item.id} className={`ew-match-word${selectedWord === item.id ? " is-selected" : ""}${matched.includes(item.id) ? " is-matched" : ""}`} aria-pressed={selectedWord === item.id} disabled={matched.includes(item.id)} onClick={() => chooseMatchWord(item.id)}>{item.word}</button>)}</div>
        </div>
        <ProgressBar value={Math.round((matched.length / set.words.length) * 100)} label={`${matched.length} of ${set.words.length} picture matches`} />
        {matchFeedback && <FeedbackMessage tone={matchFeedback.includes("lovely") ? "good" : "try"}>{matchFeedback}</FeedbackMessage>}
        <button type="button" className="ew-reset-link" onClick={() => { setMatchedBySet((current) => ({ ...current, [set.id]: [] })); setSelectedPicture(null); setSelectedWord(null); setMatchFeedback(""); }}>Start matching again</button>
      </>}
      {mode === "spelling" && <>
        <div className="ew-spelling-card"><div className="ew-word-picture ew-word-picture--small"><VocabularyPicture word={spellingWord} /><small>{set.label}</small></div><p className="ew-instruction">Tap the letters to spell this word.</p><div className="ew-spelling-answer" aria-label={`Your spelling: ${chosenSpelling || "empty"}`}>{spellingLetters.length ? spellingLetters.map((sourceIndex, place) => { const character = Array.from(spellingWord.word.toLocaleUpperCase())[sourceIndex]; return <button type="button" key={`${sourceIndex}-${place}`} className={character === " " ? "ew-letter-space" : undefined} aria-label={`Remove ${character === " " ? "space" : `letter ${character}`}`} onClick={() => { updateSpelling({ letters: spellingLetters.filter((_, current) => current !== place), feedback: "" }); }}>{character === " " ? <small>SPACE</small> : character}</button>; }) : <span>Tap letters below</span>}</div><div className="ew-letter-bank" aria-label="Letter tiles">{spellingBank.map(({ character, sourceIndex }) => <button type="button" key={sourceIndex} className={character === " " ? "ew-letter-space" : undefined} aria-label={character === " " ? "Space" : `Letter ${character}`} disabled={spellingLetters.includes(sourceIndex)} onClick={() => { updateSpelling({ letters: [...spellingLetters, sourceIndex], feedback: "" }); }}>{character === " " ? <small>SPACE</small> : character}</button>)}</div>{showHint && <p className="ew-hint">Hint: {spellingWord.meaning}</p>}<div className="ew-button-row"><button type="button" className="ew-button ew-button--light" onClick={() => { updateSpelling({ letters: [], feedback: "" }); }}>Reset letters</button><button type="button" className="ew-button ew-button--light" onClick={() => setShowHint((shown) => !shown)}>{showHint ? "Hide hint" : "Hint"}</button><button type="button" className="ew-button ew-button--blue" onClick={checkSpelling}>Check word</button></div>{spellingFeedback && <FeedbackMessage tone={spellingFeedback.startsWith("That's") ? "good" : "try"}>{spellingFeedback}</FeedbackMessage>}{spellingFeedback.startsWith("That's") && spellingIndex < set.words.length - 1 && <button type="button" className="ew-button ew-button--blue" onClick={() => { updateSpelling({ index: spellingIndex + 1, letters: [], feedback: "" }); setShowHint(false); }}>Next word →</button>}</div>
      </>}
    </div>
  );
}

function StoryActivity({ storyIndex, onStoryIndex, onComplete, onStart, speak, speechMessage }: { storyIndex: number; onStoryIndex: (index: number) => void; onComplete: (id: string) => void; onStart: (id: string) => void; speak: (text: string) => void; speechMessage: string }) {
  const story = stories[storyIndex];
  const [page, setPage] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const selectStory = (index: number) => { onStoryIndex(index); onStart(`story-${stories[index].id}`); setPage(0); setAnswer(""); setFeedback(""); };
  const checkAnswer = () => {
    if (!answer) { setFeedback("Pick an answer first, then check it."); return; }
    if (answer === story.answer) { setFeedback("You understood the story. Well read!"); onComplete(`story-${story.id}`); }
    else setFeedback("That answer is not in the story. Read the pages again and try once more.");
  };
  return (
    <div className="ew-activity-content">
      <div className="ew-story-shelf" aria-label="Choose a story">{stories.map((item, index) => <button type="button" key={item.id} className={`ew-story-choice${index === storyIndex ? " is-active" : ""}`} onClick={() => selectStory(index)}><span aria-hidden="true">{item.picture}</span><b>{item.title}</b><small>{item.level} · {item.minutes} min</small></button>)}</div>
      <article className="ew-story-reader"><div className="ew-story-reader-head"><div><p className="ew-eyebrow">{story.level} reader · about {story.minutes} min</p><h3>{story.title}</h3></div><span aria-hidden="true" className="ew-story-big-icon">{story.picture}</span></div><div className="ew-story-page" key={page}><span className="ew-page-number">Page {page + 1} of {story.pages.length}</span><p>{highlightStoryVocabulary(story.pages[page], story.vocabulary)}</p><div className="ew-vocab-tags">{story.vocabulary.map((term) => <span key={term}>{term}</span>)}</div></div><div className="ew-button-row ew-story-controls"><button type="button" className="ew-button ew-button--light" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>← Previous page</button><button type="button" className="ew-button ew-button--blue" onClick={() => speak(story.pages[page])}>🔊 Read this page</button>{page < story.pages.length - 1 ? <button type="button" className="ew-button ew-button--light" onClick={() => setPage((current) => current + 1)}>Next page →</button> : <span className="ew-read-complete">Story read! Answer below ↓</span>}</div>
        {page === story.pages.length - 1 && <div className="ew-story-question"><h4>{story.question}</h4><div className="ew-choice-list">{story.choices.map((choice) => <button type="button" key={choice} className={`ew-answer-choice${answer === choice ? " is-selected" : ""}`} aria-pressed={answer === choice} onClick={() => { setAnswer(choice); setFeedback(""); }}>{choice}</button>)}</div><div className="ew-button-row"><button type="button" className="ew-button ew-button--gold" onClick={checkAnswer}>Check answer</button><button type="button" className="ew-button ew-button--light" onClick={() => { setAnswer(""); setFeedback(""); setPage(0); }}>Read again</button></div>{feedback && <FeedbackMessage tone={feedback.startsWith("You understood") ? "good" : "try"}>{feedback}</FeedbackMessage>}{speechMessage && <p className="ew-speech-status" role="status">{speechMessage}</p>}</div>}
      </article>
    </div>
  );
}

function GrammarActivity({ lessonIndex, onLessonIndex, onStart, onComplete, initialMode = "lesson" }: { lessonIndex: number; onLessonIndex: (index: number) => void; onStart: (id: string) => void; onComplete: (id: string) => void; initialMode?: "lesson" | "game" }) {
  const [mode, setMode] = useState<"lesson" | "game">(initialMode);
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
  const selectLesson = (index: number) => { onLessonIndex(index); setQuestionIndex(0); setSelected(""); setAnswerState("idle"); setShowHint(false); onStart(`grammar-${grammarLessons[index].id}`); setMode("lesson"); };
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

function ConversationActivity({ initialActivityId, onStart, onComplete }: { initialActivityId: string | null; onStart: (id: string) => void; onComplete: (id: string) => void }) {
  const startIndex = Math.max(0, conversationScenarios.findIndex((item) => initialActivityId === `sentence-${item.id}`));
  const [open, setOpen] = useState(() => Boolean(initialActivityId?.startsWith("sentence-dialogue-")));
  const [index, setIndex] = useState(startIndex);
  const [feedback, setFeedback] = useState("");
  const scenario = conversationScenarios[index];
  const next = () => { const nextIndex = (index + 1) % conversationScenarios.length; setIndex(nextIndex); setFeedback(""); onStart(`sentence-${conversationScenarios[nextIndex].id}`); };
  return <article className="ew-builder-card"><div className="ew-builder-top"><span className="ew-builder-icon" aria-hidden="true">💬</span><div><p className="ew-eyebrow">50 everyday dialogue situations</p><h3>Conversation Corner</h3></div></div><p className="ew-instruction">Practise a friendly reply in school, shops, and everyday life.</p><button type="button" className="ew-button ew-button--pink" onClick={() => { setOpen((value) => !value); setFeedback(""); onStart(`sentence-${scenario.id}`); }}>{open ? "Close conversation practice" : "Start conversation practice"}</button>{open && <><p className="ew-eyebrow">Conversation {index + 1} of {conversationScenarios.length} · {scenario.level}</p><p className="ew-instruction"><b>{scenario.character}:</b> “{scenario.prompt}”</p><p className="ew-hint">{scenario.hint}</p><div className="ew-choice-list">{scenario.choices.map((choice) => <button type="button" key={choice} className="ew-answer-choice" disabled={feedback.startsWith("That is a friendly")} onClick={() => { const correct = choice === scenario.answer; setFeedback(correct ? "That is a friendly reply! The conversation is complete." : "Try a kind, clear reply that fits what they said."); if (correct) onComplete(`sentence-${scenario.id}`); }}>{choice}</button>)}</div>{feedback && <FeedbackMessage tone={feedback.startsWith("That is a friendly") ? "good" : "try"}>{feedback}</FeedbackMessage>}{feedback.startsWith("That is a friendly") && <button type="button" className="ew-button ew-button--blue" onClick={next}>Next conversation →</button>}</>}</article>;
}

function useEnglishProgress() {
  const [progress, setProgress] = useState<ProgressRecord>(EMPTY_PROGRESS);
  const [storageReady, setStorageReady] = useState(false);
  const [storageNotice, setStorageNotice] = useState("");
  const [todayKey, setTodayKey] = useState("");
  const todayTarget = todayKey ? getDailyTarget(todayKey) : null;
  const dailyComplete = Boolean(todayKey && progress.dailyAwards.includes(todayKey));
  const stars = progress.completed.length + progress.dailyAwards.length;
  const badges = Math.floor(progress.completed.length / 3);

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
            reviewWordIds: [...new Set((parsed.reviewWordIds ?? []).filter((id): id is string => typeof id === "string"))],
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

  const rememberActivity = useCallback((id: string) => {
    setProgress((current) => ({ ...current, lastActivityId: id }));
  }, []);

  const completeActivity = useCallback((id: string) => {
    const isNew = !progress.completed.includes(id);
    const earnsDaily = Boolean(todayKey && id === todayTarget?.activityId && !progress.dailyAwards.includes(todayKey));
    setProgress((current) => ({
      ...current,
      completed: current.completed.includes(id) ? current.completed : [...current.completed, id],
      dailyAwards: earnsDaily && todayKey && !current.dailyAwards.includes(todayKey) ? [...current.dailyAwards, todayKey] : current.dailyAwards,
      lastActivityId: id,
    }));
    const childId = window.localStorage.getItem("kiddoworld-active-child-id");
    if (childId) {
      void api("learning/english/complete/", {
        method: "POST",
        body: JSON.stringify({ child_id: Number(childId), activity_key: id, client_session_id: window.crypto.randomUUID() }),
      }).catch(() => undefined);
    }
    if (isNew || earnsDaily) fireConfetti(window.innerWidth / 2, window.innerHeight * 0.36, 24);
  }, [progress.completed, progress.dailyAwards, todayKey, todayTarget?.activityId]);

  const markWordForReview = useCallback((id: string) => {
    setProgress((current) => current.reviewWordIds.includes(id) ? current : { ...current, reviewWordIds: [...current.reviewWordIds, id] });
  }, []);
  const clearWordForReview = useCallback((id: string) => {
    setProgress((current) => ({ ...current, reviewWordIds: current.reviewWordIds.filter((wordId) => wordId !== id) }));
  }, []);

  return { progress, storageReady, storageNotice, todayKey, todayTarget, dailyComplete, stars, badges, rememberActivity, completeActivity, markWordForReview, clearWordForReview };
}

function useBrowserSpeech() {
  const [speechMessage, setSpeechMessage] = useState("");
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

  return { speak, speechMessage };
}

function categoryActivityTotal(categoryId: EnglishCategoryId) {
  switch (categoryId) {
    case "vocabulary": return wordSets.length * 3;
    case "stories": return stories.length;
    case "grammar": return grammarLessons.length + 1;
    case "listening": return listeningActivities.length;
    case "speaking": return speakingPrompts.length;
    case "sentences": return sentencePrompts.length + conversationScenarios.length;
  }
}

function defaultActivityId(categoryId: EnglishCategoryId) {
  switch (categoryId) {
    case "vocabulary": return `vocabulary-${wordSets[0].id}`;
    case "stories": return `story-${stories[0].id}`;
    case "grammar": return `grammar-${grammarLessons[0].id}`;
    case "listening": return `listening-${listeningActivities[0].id}`;
    case "speaking": return `speaking-${speakingPrompts[0].id}`;
    case "sentences": return `sentence-${sentencePrompts[0].id}`;
  }
}

function activityIndex<T extends { id: string }>(id: string, prefix: string, items: T[]) {
  if (!id.startsWith(prefix)) return 0;
  const index = items.findIndex((item) => item.id === id.slice(prefix.length));
  return index < 0 ? 0 : index;
}

export default function EnglishWorld() {
  const { progress, storageReady, todayTarget, dailyComplete, badges, stars } = useEnglishProgress();
  return (
    <div className="english-world ew-landing-page">
      <WorldNavigation active="english" />
      <EnglishHero />
      <main className="ew-landing-main">
        <EnglishDashboard
          progress={progress}
          storageReady={storageReady}
          todayTarget={todayTarget}
          dailyComplete={dailyComplete}
          badges={badges}
          stars={stars}
        />
        <AdventureWorlds progress={progress} storageReady={storageReady} />
        <footer className="ew-world-footer"><span aria-hidden="true">✦</span><p>Small steps. Bright words. Big dreams.</p><Link href="/">Back to KiddoWorld <span aria-hidden="true">→</span></Link></footer>
      </main>
    </div>
  );
}

export function EnglishAdventure({ adventure, initialActivityId }: { adventure: EnglishCategoryId; initialActivityId?: string }) {
  const category = englishCategories.find((item) => item.id === adventure);
  const { progress, storageReady, storageNotice, rememberActivity, completeActivity, markWordForReview, clearWordForReview } = useEnglishProgress();
  const { speak, speechMessage } = useBrowserSpeech();
  const validActivityId = initialActivityId && activityCategory(initialActivityId) === adventure ? initialActivityId : defaultActivityId(adventure);
  const [vocabularySet, setVocabularySet] = useState(() => activityIndex(validActivityId, "vocabulary-", wordSets) || activityIndex(validActivityId, "match-", wordSets) || activityIndex(validActivityId, "spelling-", wordSets));
  const [vocabularyWordIndex, setVocabularyWordIndex] = useState(0);
  const [vocabularyRevealed, setVocabularyRevealed] = useState(false);
  const [vocabularyMode, setVocabularyMode] = useState<"cards" | "match" | "spelling">(() => validActivityId.startsWith("match-") ? "match" : validActivityId.startsWith("spelling-") ? "spelling" : "cards");
  const [storyIndex, setStoryIndex] = useState(() => activityIndex(validActivityId, "story-", stories));
  const [grammarIndex, setGrammarIndex] = useState(() => activityIndex(validActivityId, "grammar-", grammarLessons));
  const [listeningIndex, setListeningIndex] = useState(() => activityIndex(validActivityId, "listening-", listeningActivities));
  const [speakingIndex, setSpeakingIndex] = useState(() => activityIndex(validActivityId, "speaking-", speakingPrompts));
  const [sentenceIndex, setSentenceIndex] = useState(() => activityIndex(validActivityId, "sentence-", sentencePrompts));
  const grammarMode = validActivityId === "grammar-parts-of-speech" ? "game" : "lesson";
  const completed = categoryCompletionCount(adventure, progress.completed);
  const total = categoryActivityTotal(adventure);
  const progressPercent = Math.round((completed / total) * 100);

  useEffect(() => {
    rememberActivity(validActivityId);
  }, [rememberActivity, validActivityId]);

  if (!category) return null;

  return (
    <div className={`english-world ew-adventure-page ew-adventure-page--${adventure}`}>
      <WorldNavigation active="english" />
      <main className="ew-adventure-main">
        <header className={`ew-adventure-hero ew-adventure-hero--${adventure}`}>
          <span className="ew-adventure-halo" aria-hidden="true" />
          <span className="ew-adventure-sheen" aria-hidden="true" />
          <div className="ew-adventure-copy">
            <Link href="/english#adventures" className="ew-back-link"><span aria-hidden="true">←</span> Back to English World</Link>
            <p className="ew-adventure-kicker"><span aria-hidden="true">✦</span> Your next little step</p>
            <div className="ew-adventure-title-row">
              <span className="ew-adventure-crest" aria-hidden="true"><AdventureGlyph category={adventure} /></span>
              <h1>{category.title}</h1>
            </div>
            <p className="ew-adventure-description">{categoryDescriptions[adventure]}</p>
            <ProgressBar value={progressPercent} label={`${completed} of ${total} activities complete`} />
            {storageNotice && <p className="ew-storage-notice" role="status">{storageNotice}</p>}
            <p className="ew-storage-note">{storageReady ? "Your progress is saved in this browser on this device." : "Loading your saved progress…"}</p>
          </div>
          <div className="ew-adventure-art"><AdventureIllustration category={adventure} /></div>
          <span className="ew-adventure-spark ew-adventure-spark--one" aria-hidden="true">✦</span>
          <span className="ew-adventure-spark ew-adventure-spark--two" aria-hidden="true">✧</span>
        </header>

        <section className={`ew-activity-panel ew-activity-panel--${category.tone}`} id="ew-activity" aria-labelledby="ew-activity-title">
          <div className="ew-activity-heading"><div><p className="ew-eyebrow">Pick up a pencil, open a book, and explore</p><h2 id="ew-activity-title">{category.shortTitle} activity</h2><p>{category.subtitle}. Take your time, try again, and have fun.</p></div><span className={`ew-activity-heading-icon ew-activity-heading-icon--${adventure}`} aria-hidden="true"><AdventureIllustration category={adventure} className="ew-activity-mark" /></span></div>
          {adventure === "vocabulary" && <VocabularyActivity activeSet={vocabularySet} onSet={setVocabularySet} wordIndex={vocabularyWordIndex} onWordIndex={setVocabularyWordIndex} revealed={vocabularyRevealed} onReveal={() => setVocabularyRevealed((shown) => !shown)} onComplete={completeActivity} onStart={rememberActivity} mode={vocabularyMode} onMode={setVocabularyMode} speak={speak} reviewWordIds={progress.reviewWordIds} onReviewWord={markWordForReview} onClearReview={clearWordForReview} />}
          {adventure === "stories" && <StoryActivity key={storyIndex} storyIndex={storyIndex} onStoryIndex={setStoryIndex} onComplete={completeActivity} onStart={rememberActivity} speak={speak} speechMessage={speechMessage} />}
          {adventure === "grammar" && <GrammarActivity key={grammarIndex} lessonIndex={grammarIndex} onLessonIndex={setGrammarIndex} onStart={rememberActivity} onComplete={completeActivity} initialMode={grammarMode} />}
          {adventure === "listening" && <ListeningActivity index={listeningIndex} onIndex={setListeningIndex} onStart={rememberActivity} onComplete={completeActivity} speak={speak} speechMessage={speechMessage} />}
          {adventure === "speaking" && <SpeakingActivity index={speakingIndex} onIndex={setSpeakingIndex} onStart={rememberActivity} onComplete={completeActivity} speak={speak} speechMessage={speechMessage} />}
          {adventure === "sentences" && <><SentenceBuilderActivity index={sentenceIndex} onIndex={setSentenceIndex} onStart={rememberActivity} onComplete={completeActivity} /><ConversationActivity initialActivityId={validActivityId} onStart={rememberActivity} onComplete={completeActivity} /></>}
        </section>
      </main>
    </div>
  );
}
