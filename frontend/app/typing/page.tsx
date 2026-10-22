"use client";

import { useEffect, useState } from "react";
import CelebrationConfetti, { fireConfetti } from "@/components/Confetti";
import SparkleTrail from "@/components/SparkleTrail";
import WorldNavigation from "@/components/WorldNavigation";
import CompletionPanel from "@/components/typing/CompletionPanel";
import MetricCards from "@/components/typing/MetricCards";
import ModeSelector from "@/components/typing/ModeSelector";
import PracticeBoard from "@/components/typing/PracticeBoard";
import RewardShelf from "@/components/typing/RewardShelf";
import SentencePicker from "@/components/typing/SentencePicker";
import TypingMascot from "@/components/typing/TypingMascot";
import TypingScene from "@/components/typing/TypingScene";
import useReducedMotion from "@/components/typing/useReducedMotion";
import useTypingSession from "@/components/typing/useTypingSession";
import { MODE_OPTIONS, PRACTICE_TEXT } from "@/components/typing/practiceContent";

export default function TypingAcademyPage() {
  const [showGreeting, setShowGreeting] = useState(true);
  const {
    mode,
    promptIndex,
    prompt,
    promptCharacters,
    typedCharacters,
    segments,
    completedWordFlags,
    wordMistakeFlags,
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
  } = useTypingSession();

  const reducedMotion = useReducedMotion();
  const modeOption = MODE_OPTIONS.find((option) => option.id === mode) ?? MODE_OPTIONS[0];

  useEffect(() => {
    const greetingTimer = window.setTimeout(() => setShowGreeting(false), 1800);
    return () => window.clearTimeout(greetingTimer);
  }, []);

  // A word that was typed perfectly pops a small confetti burst where it sits.
  useEffect(() => {
    if (!wordCelebration || reducedMotion) return;

    const element = document.querySelector<HTMLElement>(
      `[data-word-index="${wordCelebration.wordIndex}"]`,
    );
    const bounds = element?.getBoundingClientRect();
    const originX = bounds ? bounds.left + bounds.width / 2 : window.innerWidth / 2;
    const originY = bounds ? bounds.top + bounds.height / 2 : window.innerHeight / 3;

    fireConfetti(originX, originY, 12);
  }, [reducedMotion, wordCelebration]);

  // Finishing a round earns one more confetti wave on top of the big one.
  useEffect(() => {
    if (roundCelebration === 0 || reducedMotion) return;

    const element = document.querySelector<HTMLElement>(".typing-complete-panel");
    const bounds = element?.getBoundingClientRect();
    const originX = bounds ? bounds.left + bounds.width / 2 : window.innerWidth / 2;
    const originY = bounds ? bounds.top + bounds.height / 3 : window.innerHeight / 3;

    fireConfetti(originX, originY, 22);
  }, [reducedMotion, roundCelebration]);

  const recentlyCompletedWord = wordCelebration
    ? segments.some(
        (segment) =>
          segment.kind === "word" &&
          segment.wordIndex === wordCelebration.wordIndex &&
          completedWordFlags[wordCelebration.wordIndex] &&
          typedCharacters.length === segment.end,
      )
    : false;

  const mascotMood = isComplete
    ? "celebrate"
    : hasMistypedCharacter
      ? "oops"
      : recentlyCompletedWord
        ? "success"
        : startTime !== null && completedAt === null
          ? "focus"
          : showGreeting
            ? "greeting"
            : "idle";

  const mascotMessage =
    mascotMood === "celebrate"
      ? "You did it! Super typing!"
      : mascotMood === "oops"
        ? "Almost! Fix the letter marked with !"
        : mascotMood === "success"
          ? "Lovely! You finished that word!"
          : mascotMood === "greeting"
            ? "Hi, typing star! Ready to play?"
            : mascotMood === "focus"
              ? "Keep those fingers going!"
              : "Ready when you are!";

  return (
    <div className={`typing-academy${reducedMotion ? " is-reduced-motion" : ""}`}>
      <TypingScene />
      <SparkleTrail />
      <CelebrationConfetti active={isComplete} />
      <WorldNavigation active="typing" />

      <main className="typing-main">
        <section className="typing-page-intro" aria-labelledby="typing-academy-title">
          <p className="typing-kicker">
            <span aria-hidden="true">✦</span> English practice trail
          </p>
          <h1 id="typing-academy-title">Typing Academy</h1>
          <p>
            Practise one key at a time, then try fun words and little sentences. Your score comes from
            your own typing.
          </p>
          <div className="typing-intro-details">
            <span>Letters</span>
            <i>·</i>
            <span>Words</span>
            <i>·</i>
            <span>Sentences</span>
          </div>
        </section>

        <div className="typing-layout">
          <section
            id="typing-practice"
            aria-label="Typing practice"
            className="typing-practice-panel"
          >
            <div className="typing-panel-head">
              <div>
                <p className="typing-section-title">Choose a practice</p>
                <p className="typing-panel-head__hint">
                  Pick a mode and the board will change for you.
                </p>
              </div>
              <span className="typing-reward-chip" aria-label={`${stars} stars and ${xp} experience points`}>
                <span aria-hidden="true">★</span>
                <b>{stars}</b>
                <span aria-hidden="true">✦</span>
                <b>{xp}</b>
                <span className="typing-reward-chip__label">XP</span>
              </span>
            </div>

            <ModeSelector mode={mode} onSelect={selectMode} />

            {mode === "sentences" && (
              <SentencePicker
                sentences={PRACTICE_TEXT.sentences}
                activeIndex={promptIndex}
                onSelect={selectSentence}
              />
            )}

            <div className="typing-board" key={`${mode}-${promptIndex}`}>
              {isComplete ? (
                <CompletionPanel
                  prompt={prompt}
                  mode={mode}
                  stars={stars}
                  xp={xp}
                  words={sessionWords}
                  rounds={sessionRounds}
                  attemptCount={attemptCount}
                  correctCharacters={correctCharacters}
                  startTime={startTime}
                  completedAt={completedAt}
                  onRetry={reset}
                  onNext={nextPrompt}
                />
              ) : (
                <PracticeBoard
                  prompt={prompt}
                  promptCharacters={promptCharacters}
                  typedCharacters={typedCharacters}
                  segments={segments}
                  completedWordFlags={completedWordFlags}
                  wordMistakeFlags={wordMistakeFlags}
                  correctCharacters={correctCharacters}
                  incorrectCharacters={incorrectCharacters}
                  remainingCharacters={remainingCharacters}
                  progressPercent={progressPercent}
                  hasMistypedCharacter={hasMistypedCharacter}
                  onChange={handleTypingChange}
                />
              )}
            </div>

            {!isComplete && (
              <MetricCards
                startTime={startTime}
                completedAt={completedAt}
                attemptCount={attemptCount}
                correctCharacters={correctCharacters}
              />
            )}
          </section>

          <aside className="typing-side-rail">
            <div className="typing-side-rail__card">
              <TypingMascot mood={mascotMood} message={mascotMessage} />
            </div>
            <RewardShelf
              stars={stars}
              xp={xp}
              words={sessionWords}
              rounds={sessionRounds}
              unit={modeOption.unit}
            />
          </aside>
        </div>
      </main>
    </div>
  );
}
