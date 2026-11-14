"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AchievementBadges from "@/components/rewards/AchievementBadges";
import CollectionShelf from "@/components/rewards/CollectionShelf";
import DailyChallenges from "@/components/rewards/DailyChallenges";
import LevelProgress from "@/components/rewards/LevelProgress";
import RecentActivity from "@/components/rewards/RecentActivity";
import RewardsMascot from "@/components/rewards/RewardsMascot";
import RewardsSummary, { REWARD_STAT_ICONS, type RewardStat } from "@/components/rewards/RewardsSummary";
import WorldNavigation from "@/components/WorldNavigation";
import { api, type CurrentAccount } from "@/lib/api";
import { rewardLevelInfo } from "@/lib/rewardLevels";
import { fetchRewardSummary, type RewardSummary } from "@/lib/rewards";

type PageState = "loading" | "signed-out" | "no-children" | "ready" | "error";

const ACTIVE_CHILD_KEY = "kiddoworld-active-child-id";

type LoadError = { status?: number; message?: string };

/** The compact header block reused by several page states. */
function RewardsHeader({
  nickname,
  level,
  stars,
}: {
  nickname: string;
  level?: ReturnType<typeof rewardLevelInfo>;
  stars?: number;
}) {
  return (
    <section className="rewards-intro" aria-labelledby="rewards-title">
      <p className="rewards-kicker"><span aria-hidden="true">✦</span> Star trophy room</p>
      <div className="rewards-intro-row">
        <div className="rewards-intro-copy">
          <h1 id="rewards-title">My Rewards</h1>
          <p>Every little achievement makes you stronger!</p>
          {nickname && (
            <div className="rewards-intro-chips">
              <span className="rewards-child-chip">
                <span aria-hidden="true">✦</span> Playing as <b>{nickname}</b>
              </span>
            </div>
          )}
        </div>
        <div className="rewards-header-visual" aria-hidden="true">
          <span className="rewards-header-visual__ground" />
          {level && (
            <span className="rewards-star-chip rewards-star-chip--level"><span aria-hidden="true">⚑</span> Level {level.level}</span>
          )}
          {typeof stars === "number" && (
            <span className="rewards-star-chip rewards-star-chip--stars"><span aria-hidden="true">★</span> {stars} stars</span>
          )}
          <div className="rewards-header-visual__art"><RewardsMascot /></div>
        </div>
      </div>
    </section>
  );
}

export default function RewardsCenter() {
  const [state, setState] = useState<PageState>("loading");
  const [childId, setChildId] = useState<number | null>(null);
  const [nickname, setNickname] = useState("");
  const [summary, setSummary] = useState<RewardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const requestedChild = useRef<number | null>(null);

  /** Ask the backend for the guardian's children and resolve the selected one. */
  const loadChildren = useCallback(async () => {
    try {
      const current = await api<CurrentAccount>("auth/me/");
      const savedId = window.localStorage.getItem(ACTIVE_CHILD_KEY);
      const saved = current.children.some((child) => String(child.id) === savedId)
        ? savedId!
        : String(current.children[0]?.id ?? "");
      if (saved) window.localStorage.setItem(ACTIVE_CHILD_KEY, saved);
      else window.localStorage.removeItem(ACTIVE_CHILD_KEY);

      if (current.children.length === 0) {
        setChildId(null);
        setNickname("");
        setState("no-children");
        return;
      }

      const child = current.children.find((entry) => String(entry.id) === saved) ?? current.children[0];
      setChildId(child.id);
      setNickname(child.nickname);
    } catch {
      setChildId(null);
      setNickname("");
      setState("signed-out");
    }
  }, []);

  /** Fetch the reward summary for the selected child (ownership checked server-side). */
  const loadSummary = useCallback(async () => {
    const id = childId;
    if (!id) return;
    requestedChild.current = id;
    setSummary(null);
    setError(null);
    setState("loading");
    try {
      const data = await fetchRewardSummary(id);
      if (requestedChild.current !== id) return;
      setSummary(data);
      setError(null);
      setState("ready");
    } catch (caught) {
      if (requestedChild.current !== id) return;
      const status = (caught as LoadError).status;
      const detail = (caught as LoadError).message || "";
      if (status === 404) {
        // The saved profile is no longer on this guardian account.
        window.localStorage.removeItem(ACTIVE_CHILD_KEY);
      }
      setError(
        status === 403
          ? "This profile needs a verified parent email before the reward room can open."
          : detail || "The rewards shelf did not load. Please try again.",
      );
      setSummary(null);
      setState("error");
    }
  }, [childId]);

  useEffect(() => {
    void Promise.resolve().then(loadChildren);
  }, [loadChildren]);

  useEffect(() => {
    if (!childId) return;
    void Promise.resolve().then(loadSummary);
  }, [childId, loadSummary]);

  const level = useMemo(() => rewardLevelInfo(summary?.xp ?? 0), [summary?.xp]);

  const stats: RewardStat[] = useMemo(() => {
    if (!summary) return [];
    return [
      { key: "xp", value: String(summary.xp), label: "Total XP", extra: "experience earned" },
      { key: "stars", value: String(summary.stars), label: "Stars", extra: summary.stars === 1 ? "shiny star" : "shiny stars" },
      { key: "level", value: String(level.level), label: "Current level", extra: level.maxed ? "top level reached" : `next at ${level.totalXpForNextLevel} XP` },
      { key: "streak", value: String(summary.streak.current_days), suffix: summary.streak.current_days === 1 ? "day" : "days", label: "Learning streak", extra: `best ${summary.streak.best_days} days` },
    ];
  }, [summary, level]);

  const isEmpty = summary !== null && summary.xp === 0 && summary.stars === 0 && summary.recent_rewards.length === 0;

  function handleRetry() {
    setRetrying(true);
    void loadChildren()
      .then(() => {
        if (childId && requestedChild.current === childId) return loadSummary();
        return undefined;
      })
      .finally(() => setRetrying(false));
  }

  return (
    <div className="rewards-center">
      <div className="rewards-scene" aria-hidden="true">
        <span className="rewards-scene__cloud rewards-scene__cloud--one" />
        <span className="rewards-scene__cloud rewards-scene__cloud--two" />
        <span className="rewards-scene__sparkle rewards-scene__sparkle--one">✦</span>
        <span className="rewards-scene__sparkle rewards-scene__sparkle--two">✧</span>
        <span className="rewards-scene__sparkle rewards-scene__sparkle--three">✦</span>
        <span className="rewards-scene__sparkle rewards-scene__sparkle--four">✧</span>
        <span className="rewards-scene__hill rewards-scene__hill--far" />
        <span className="rewards-scene__hill rewards-scene__hill--near" />
      </div>
      <WorldNavigation active="rewards" />

      {state === "loading" && (
        <main className="rewards-main">
          <RewardsHeader nickname="" />
          <div className="rewards-skeleton-panel" role="status">
            <span className="rewards-sr-only">Loading your rewards…</span>
            <span className="rewards-skeleton-line rewards-skeleton-line--title" />
            <span className="rewards-skeleton-line rewards-skeleton-line--bar" />
            <span className="rewards-skeleton-line rewards-skeleton-line--row" />
            <span className="rewards-skeleton-line rewards-skeleton-line--row" />
          </div>
        </main>
      )}

      {state === "signed-out" && (
        <main className="rewards-main">
          <RewardsHeader nickname="" />
          <section className="rewards-state-card" aria-live="polite">
            <span className="rewards-state-icon" aria-hidden="true">{REWARD_STAT_ICONS.stars}</span>
            <h2>Sign in to open the trophy room</h2>
            <p>
              Rewards belong to a learning profile. Ask a grown-up to sign in and choose the
              profile on the Family page — every star and badge will wait for you right here.
            </p>
            <div className="rewards-state-actions">
              <Link href="/account" className="rewards-primary">Open the Family page</Link>
              <Link href="/typing" className="rewards-secondary">Try Typing Academy <span aria-hidden="true">→</span></Link>
            </div>
          </section>
        </main>
      )}

      {state === "no-children" && (
        <main className="rewards-main">
          <RewardsHeader nickname="" />
          <section className="rewards-state-card" aria-live="polite">
            <span className="rewards-state-icon rewards-state-icon--level" aria-hidden="true">{REWARD_STAT_ICONS.level}</span>
            <h2>Add a learning profile</h2>
            <p>
              Every child gets a nickname profile. Add one on the Family page and all the stars,
              XP and badges earned in Typing Academy, English World and Games World will appear
              here.
            </p>
            <div className="rewards-state-actions">
              <Link href="/account" className="rewards-primary">Open the Family page</Link>
            </div>
          </section>
        </main>
      )}

      {state === "error" && (
        <main className="rewards-main">
          <RewardsHeader nickname="" />
          <section className="rewards-state-card rewards-enter" aria-live="polite">
            <h2>Oh, the trophy shelf is being shy</h2>
            <p>{error}</p>
            <div className="rewards-state-actions">
              <button type="button" className="rewards-primary" disabled={retrying} onClick={handleRetry}>
                {retrying ? "Trying again…" : "Try again"}
              </button>
              <Link href="/account" className="rewards-secondary">Manage profiles</Link>
            </div>
          </section>
        </main>
      )}

      {state === "ready" && summary && (
        <main className="rewards-main">
          <RewardsHeader nickname={nickname} level={level} stars={summary.stars} />

          {isEmpty && (
            <div className="rewards-empty rewards-enter" style={{ marginBottom: 18 }}>
              <strong>Hi {nickname || "friend"}! Your treasure shelf is empty for now.</strong>
              Play your first typing round, English activity or game level — every finished step
              drops stars, XP and badges right here.
              <div className="rewards-empty-links">
                <Link href="/typing">⌨ Typing Academy</Link>
                <Link href="/english">▣ English World</Link>
                <Link href="/games">✣ Games World</Link>
              </div>
            </div>
          )}

          <RewardsSummary stats={stats} />

          <section className="rewards-section" aria-label="Level progress">
            <LevelProgress totalXp={summary.xp} />
          </section>

          <AchievementBadges entries={summary.achievement_progress} />

          <div className="rewards-split">
            <DailyChallenges />
            <CollectionShelf />
          </div>

          <section className="rewards-section" aria-labelledby="rewards-activity-title">
            <div className="rewards-section-head">
              <div>
                <h2 id="rewards-activity-title" className="rewards-section-title">Recent activity</h2>
                <p className="rewards-section-hint">The latest entries from the reward ledger.</p>
              </div>
              <span className="rewards-section-side">server verified</span>
            </div>
            <RecentActivity transactions={summary.recent_rewards} />
          </section>

          <p className="rewards-tail">
            Keep exploring — <Link href="/typing">Typing Academy</Link>,{" "}
            <Link href="/english">English World</Link> and <Link href="/games">Games World</Link>{" "}
            are always adding stars to this room. ✦
          </p>
        </main>
      )}
    </div>
  );
}
