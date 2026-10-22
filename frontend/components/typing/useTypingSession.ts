"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  PRACTICE_TEXT,
  REWARD_RULES,
  countInsertedCharacters,
  getCompletedWordFlags,
  getWordMistakeFlags,
  splitPrompt,
  type PracticeMode,
  type PromptSegment,
  type PromptWord,
} from "./practiceContent";

export type WordCelebration = {
  wordIndex: number;
  /** Increases on every celebration so effects can re-trigger. */
  nonce: number;
};

export type TypingSession = {
  mode: PracticeMode;
  promptIndex: number;
  prompt: string;
  promptCharacters: string[];
  typedCharacters: string[];
  words: PromptWord[];
  segments: PromptSegment[];
  completedWordFlags: boolean[];
  wordMistakeFlags: boolean[];
  completedWordCount: number;
  correctCharacters: number;
  incorrectCharacters: number;
  remainingCharacters: number;
  progressPercent: number;
  hasMistypedCharacter: boolean;
  attemptCount: number;
  startTime: number | null;
  completedAt: number | null;
  isComplete: boolean;
  sessionWords: number;
  sessionRounds: number;
  stars: number;
  xp: number;
  wordCelebration: WordCelebration | null;
  roundCelebration: number;
  selectMode: (mode: PracticeMode) => void;
  selectSentence: (index: number) => void;
  nextPrompt: () => void;
  reset: () => void;
  handleTypingChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
};

/**
 * Owns every piece of Typing Academy state: the prompt, the raw typed value,
 * the timer, the scoring maths and the reward counters.
 *
 * The scoring formulas are intentionally identical to the previous
 * implementation so nothing about the measured results changes:
 *   speed    = round(attemptCount / 5 * 60 / elapsedSeconds)
 *   accuracy = round(correctCharacters / attemptCount * 100)
 */
export default function useTypingSession(): TypingSession {
  const [mode, setMode] = useState<PracticeMode>("sentences");
  const [promptIndex, setPromptIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [attemptCount, setAttemptCount] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [completedAt, setCompletedAt] = useState<number | null>(null);

  const [sessionWords, setSessionWords] = useState(0);
  const [sessionRounds, setSessionRounds] = useState(0);
  /** Bumped every time a fresh practice attempt starts. */
  const [attemptId, setAttemptId] = useState(0);
  const [wordCelebration, setWordCelebration] = useState<WordCelebration | null>(null);
  const [roundCelebration, setRoundCelebration] = useState(0);

  const prompt = PRACTICE_TEXT[mode][promptIndex];
  const promptCharacters = useMemo(() => Array.from(prompt), [prompt]);
  const typedCharacters = useMemo(() => Array.from(typed), [typed]);
  const { words, segments } = useMemo(() => splitPrompt(prompt), [prompt]);

  const correctCharacters = useMemo(
    () =>
      typedCharacters.reduce(
        (total, character, index) => total + (character === promptCharacters[index] ? 1 : 0),
        0,
      ),
    [promptCharacters, typedCharacters],
  );

  const incorrectCharacters = Math.max(typedCharacters.length - correctCharacters, 0);
  const remainingCharacters = Math.max(promptCharacters.length - typedCharacters.length, 0);
  const progressPercent = Math.min(
    100,
    Math.round((correctCharacters / promptCharacters.length) * 100),
  );
  const hasMistypedCharacter = typedCharacters.some(
    (character, index) => character !== promptCharacters[index],
  );
  const isComplete = completedAt !== null && typed === prompt;

  /** A word counts as finished when it is fully typed and every letter matches. */
  const completedWordFlags = useMemo(
    () => getCompletedWordFlags(promptCharacters, typedCharacters, words),
    [promptCharacters, typedCharacters, words],
  );

  const wordMistakeFlags = useMemo(
    () => getWordMistakeFlags(promptCharacters, typedCharacters, words),
    [promptCharacters, typedCharacters, words],
  );

  const completedWordCount = completedWordFlags.reduce(
    (total, isFinished) => total + (isFinished ? 1 : 0),
    0,
  );

  const stars = sessionWords + sessionRounds * REWARD_RULES.starsPerRound;
  const xp = sessionWords * REWARD_RULES.xpPerWord + sessionRounds * REWARD_RULES.xpPerRound;

  const countedWordsRef = useRef<Set<number>>(new Set());
  const countedRoundRef = useRef(false);
  const activeAttemptRef = useRef(attemptId);
  const celebrationNonceRef = useRef(0);

  // A fresh attempt (new prompt or a retry) starts a fresh reward tally, so
  // typing the same sentence again earns its stars again.
  useEffect(() => {
    if (activeAttemptRef.current === attemptId) return;
    activeAttemptRef.current = attemptId;
    countedWordsRef.current = new Set<number>();
    countedRoundRef.current = false;
  }, [attemptId]);

  // Every word that is typed perfectly earns one star and one celebration.
  useEffect(() => {
    completedWordFlags.forEach((isFinished, index) => {
      if (!isFinished) return;
      if (countedWordsRef.current.has(index)) return;
      countedWordsRef.current.add(index);
      setSessionWords((total) => total + 1);
      celebrationNonceRef.current += 1;
      setWordCelebration({ wordIndex: index, nonce: celebrationNonceRef.current });
    });
  }, [completedWordFlags]);

  // A finished prompt earns the round bonus exactly once per attempt.
  useEffect(() => {
    if (!isComplete) return;
    if (countedRoundRef.current) return;
    countedRoundRef.current = true;
    setSessionRounds((total) => total + 1);
    setRoundCelebration((total) => total + 1);
  }, [isComplete]);

  const reset = useCallback(() => {
    setTyped("");
    setAttemptCount(0);
    setStartTime(null);
    setCompletedAt(null);
    setAttemptId((currentAttempt) => currentAttempt + 1);
  }, []);

  const selectMode = useCallback(
    (nextMode: PracticeMode) => {
      setMode(nextMode);
      setPromptIndex(0);
      reset();
    },
    [reset],
  );

  const nextPrompt = useCallback(() => {
    setPromptIndex((currentIndex) => (currentIndex + 1) % PRACTICE_TEXT[mode].length);
    reset();
  }, [mode, reset]);

  const selectSentence = useCallback(
    (index: number) => {
      setPromptIndex(index);
      reset();
    },
    [reset],
  );

  const handleTypingChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      const nextTyped = event.currentTarget.value;
      const insertedCharacters = countInsertedCharacters(typed, nextTyped);
      const timestamp = performance.now();

      setTyped(nextTyped);

      if (insertedCharacters > 0) {
        if (startTime === null) setStartTime(timestamp);
        setAttemptCount((currentCount) => currentCount + insertedCharacters);
      }

      if (nextTyped === prompt && (startTime !== null || insertedCharacters > 0)) {
        setCompletedAt(timestamp);
      } else {
        setCompletedAt(null);
      }
    },
    [prompt, startTime, typed],
  );

  return {
    mode,
    promptIndex,
    prompt,
    promptCharacters,
    typedCharacters,
    words,
    segments,
    completedWordFlags,
    wordMistakeFlags,
    completedWordCount,
    correctCharacters,
    incorrectCharacters,
    remainingCharacters,
    progressPercent,
    hasMistypedCharacter,
    attemptCount,
    startTime,
    completedAt,
    isComplete,
    sessionWords,
    sessionRounds,
    stars,
    xp,
    wordCelebration,
    roundCelebration,
    selectMode,
    selectSentence,
    nextPrompt,
    reset,
    handleTypingChange,
  };
}

export type TypingMetricsInput = {
  startTime: number | null;
  completedAt: number | null;
  attemptCount: number;
  correctCharacters: number;
};

export type TypingMetrics = {
  elapsedSeconds: number;
  wordsPerMinute: number;
  accuracy: number;
  isRunning: boolean;
};

/**
 * Live timing and scoring for the metric cards.
 *
 * The ticker lives inside this hook so that the 200 ms clock only re-renders
 * the small metric subtree instead of the whole academy page.
 */
export function useTypingMetrics({
  startTime,
  completedAt,
  attemptCount,
  correctCharacters,
}: TypingMetricsInput): TypingMetrics {
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (startTime === null || completedAt !== null) return;

    const sample = () => setNow(performance.now());
    // The first sample lands on the next frame so the clock starts instantly.
    const frameId = window.requestAnimationFrame(sample);
    const timerId = window.setInterval(sample, 200);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearInterval(timerId);
    };
  }, [completedAt, startTime]);

  const elapsedSeconds =
    startTime === null ? 0 : Math.max(0, ((completedAt ?? now) - startTime) / 1000);
  const wordsPerMinute =
    elapsedSeconds > 0 ? Math.round((attemptCount / 5) * (60 / elapsedSeconds)) : 0;
  const accuracy = attemptCount > 0 ? Math.round((correctCharacters / attemptCount) * 100) : 0;

  return {
    elapsedSeconds,
    wordsPerMinute,
    accuracy,
    isRunning: startTime !== null && completedAt === null,
  };
}
