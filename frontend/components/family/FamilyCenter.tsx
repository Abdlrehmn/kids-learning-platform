"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import WorldNavigation from "@/components/WorldNavigation";
import ChildCard from "@/components/family/ChildCard";
import ChildProgress from "@/components/family/ChildProgress";
import { ChildAvatar } from "@/components/family/ChildAvatarMap";
import DriftCloud from "@/components/family/DriftCloud";
import { SkyIsland } from "@/components/family/SkyIsland";
import FamilyTimeline from "@/components/family/FamilyTimeline";
import FamilySignIn from "@/components/family/FamilySignIn";
import AddChildCard from "@/components/family/AddChildCard";
import ParentSettings from "@/components/family/ParentSettings";
import { api, type ChildProfile, type CurrentAccount } from "@/lib/api";
import { fetchRewardSummary, type RewardSummary } from "@/lib/rewards";

type ToastNote = { kind: "ok" | "error" | "info"; text: string };
type FamilyMode = "add" | "edit";
const ACTIVE_CHILD_KEY = "kiddoworld-active-child-id";

/** Parent dashboard hub: loads real family data, wires every section. */
export default function FamilyCenter() {
  const [account, setAccount] = useState<CurrentAccount | null>(null);
  const [booted, setBooted] = useState(false);
  const [summaries, setSummaries] = useState<Record<string, RewardSummary | null>>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [formMode, setFormMode] = useState<{ kind: FamilyMode; child?: ChildProfile } | null>(null);
  const [removeTarget, setRemoveTarget] = useState<ChildProfile | null>(null);
  const [removeBusy, setRemoveBusy] = useState(false);
  const [toast, setToast] = useState<ToastNote | null>(null);
  const progressRef = useRef<HTMLElement>(null);

  const children = account?.children ?? [];

  const loadSummaries = useCallback(async (roster: ChildProfile[]) => {
    const results = await Promise.allSettled(roster.map((child) => fetchRewardSummary(child.id)));
    const next: Record<string, RewardSummary | null> = {};
    roster.forEach((child, index) => {
      const result = results[index];
      next[String(child.id)] = result.status === "fulfilled" ? result.value : null;
    });
    setSummaries(next);
  }, []);

  /** Store a fresh account payload, load every child's ledger, restore the saved learner. */
  const adoptAccount = useCallback((current: CurrentAccount) => {
    setAccount(current);
    void loadSummaries(current.children);
    const saved = window.localStorage.getItem(ACTIVE_CHILD_KEY);
    const valid = current.children.some((child) => String(child.id) === saved);
    const nextId = valid ? Number(saved) : (current.children[0]?.id ?? null);
    setSelectedId(nextId);
    if (nextId !== null) window.localStorage.setItem(ACTIVE_CHILD_KEY, String(nextId));
    else window.localStorage.removeItem(ACTIVE_CHILD_KEY);
  }, [loadSummaries]);

  const loadAccount = useCallback(async () => {
    try {
      const current = await api<CurrentAccount>("auth/me/");
      adoptAccount(current);
    } catch {
      setAccount(null);
    }
  }, [adoptAccount]);

  useEffect(() => {
    void Promise.resolve().then(loadAccount).finally(() => setBooted(true));
  }, [loadAccount]);

  function notify(kind: ToastNote["kind"], text: string) {
    setToast({ kind, text });
  }

  function focusProgress() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    requestAnimationFrame(() => {
      progressRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  }

  function switchProfile(child: ChildProfile) {
    window.localStorage.setItem(ACTIVE_CHILD_KEY, String(child.id));
    setSelectedId(child.id);
    notify("ok", `${child.nickname} is now the active learner on this device.`);
  }

  function handleSaved(child: ChildProfile, mode: FamilyMode) {
    setAccount((current) =>
      current
        ? {
            ...current,
            children:
              mode === "add"
                ? [...current.children, child]
                : current.children.map((entry) => (entry.id === child.id ? child : entry)),
          }
        : current,
    );
    setFormMode(null);
    if (mode === "add") {
      setSelectedId(child.id);
      window.localStorage.setItem(ACTIVE_CHILD_KEY, String(child.id));
      void loadSummaries([...children, child]);
      notify("ok", `${child.nickname}'s profile is ready to play!`);
    } else {
      notify("ok", "Profile details saved.");
    }
  }

  async function confirmRemove() {
    if (!removeTarget) return;
    setRemoveBusy(true);
    try {
      await api<void>(`auth/children/${removeTarget.id}/`, { method: "DELETE" });
      const remaining = children.filter((child) => child.id !== removeTarget.id);
      setAccount((current) => (current ? { ...current, children: remaining } : current));
      setSummaries((current) => {
        const next = { ...current };
        delete next[String(removeTarget.id)];
        return next;
      });
      if (selectedId === removeTarget.id) {
        const nextId = remaining[0]?.id ?? null;
        setSelectedId(nextId);
        if (nextId !== null) window.localStorage.setItem(ACTIVE_CHILD_KEY, String(nextId));
        else window.localStorage.removeItem(ACTIVE_CHILD_KEY);
      }
      notify("info", `${removeTarget.nickname}'s profile and learning history were deleted.`);
    } catch (caught) {
      notify("error", caught instanceof Error ? caught.message : "Could not delete the profile. Please try again.");
    } finally {
      setRemoveBusy(false);
      setRemoveTarget(null);
    }
  }

  const bootedLoading = !booted;
  const selectedChild = children.find((child) => child.id === selectedId) ?? children[0] ?? null;
  const selectedSummary = selectedChild ? (summaries[String(selectedChild.id)] ?? null) : null;

  return (
    <div className="family-page">
      <div className="family-scene" aria-hidden="true">
        <span className="family-scene__tint" />
        {/* far layer — small, faint, very slow */}
        <DriftCloud variant={2} className="family-sky-cloud--far-1" />
        <DriftCloud variant={3} flip className="family-sky-cloud--far-2" />
        <DriftCloud variant={3} className="family-sky-cloud--far-3" />
        {/* middle layer — medium puffs, moderate drift */}
        <DriftCloud variant={1} className="family-sky-cloud--mid-1" />
        <DriftCloud variant={2} flip className="family-sky-cloud--mid-2" />
        <DriftCloud variant={1} className="family-sky-cloud--mid-3" />
        {/* foreground layer — large detailed clouds, faster drift */}
        <DriftCloud variant={1} className="family-sky-cloud--near-1" />
        <DriftCloud variant={2} flip className="family-sky-cloud--near-2" />
        <span className="family-scene__sparkle family-scene__sparkle--one">✦</span>
        <span className="family-scene__sparkle family-scene__sparkle--two">✦</span>
        <span className="family-scene__sparkle family-scene__sparkle--three">✦</span>
        <span className="family-scene__sparkle family-scene__sparkle--four">✦</span>
      </div>

      <WorldNavigation active="account" />

      <main className="family-main">
        {bootedLoading ? (
          <div className="family-state-card" aria-live="polite">
            <div className="family-state-art family-island"><SkyIsland /></div>
            <h2>Opening the family folder…</h2>
            <p>Checking the guardian session and loading your children&apos;s latest progress.</p>
          </div>
        ) : !account ? (
          <FamilySignIn onAuthenticated={adoptAccount} />
        ) : (
          <>
            <section className="family-panel family-overview" aria-label="Family overview">
              <div className="family-overview__copy">
                <span className="family-kicker"><span aria-hidden="true">✦</span> GROWN-UP CORNER</span>
                <h1>My Family</h1>
                <p className="family-overview__sub">
                  Manage your family&apos;s learning journey: add profiles, follow each child&apos;s progress
                  and keep the account tidy — all from one friendly dashboard.
                </p>
                <div className="family-overview__row">
                  <span className="family-guardian-chip">
                    <span className="family-guardian-chip__badge" aria-hidden="true">
                      {(account.user.first_name.trim() || account.user.email.charAt(0)).toUpperCase()}
                    </span>
                    <span className="family-guardian-chip__copy">
                      <small>Guardian</small>
                      <b>{account.user.first_name.trim() || account.user.email.split("@")[0]}</b>
                    </span>
                  </span>
                  <span className={`family-status-chip ${account.user.email_verified ? "family-status-chip--ok" : "family-status-chip--pending"}`}>
                    {account.user.email_verified ? "✓ Guardian email verified" : "⏳ Email verification pending"}
                  </span>
                </div>
                <div className="family-counter-card">
                  <span className="family-counter-card__num" aria-hidden="true">{children.length}</span>
                  <span className="family-counter-card__copy">
                    <b>{children.length === 1 ? "little learner" : "little learners"}</b>
                    <span className="family-counter-card__avatars">
                      {children.length === 0
                        ? <small>None yet — add your first child below</small>
                        : children.slice(0, 5).map((child) => (
                          <ChildAvatar key={child.id} avatarId={child.avatar_id} size={26} />
                        ))}
                    </span>
                  </span>
                </div>
              </div>
              <div className="family-overview__art">
                <DriftCloud variant={3} travel={false} className="family-overview__art-cloud family-overview__art-cloud--one" />
                <DriftCloud variant={2} travel={false} flip className="family-overview__art-cloud family-overview__art-cloud--two" />
                <div className="family-island"><SkyIsland /></div>
              </div>
            </section>

            <section className="family-section" aria-label="My children">
              <div className="family-section-head">
                <div>
                  <h2 className="family-section-title">My children</h2>
                  <p className="family-section-hint">Each profile is a nickname-only learner of this family account.</p>
                </div>
                <span className="family-section-side">{children.length} profile{children.length === 1 ? "" : "s"}</span>
              </div>

              <div className="family-children-grid">
                {children.map((child) => (
                  <ChildCard
                    key={child.id}
                    child={child}
                    summary={summaries[String(child.id)] ?? null}
                    isCurrent={child.id === selectedId}
                    onView={() => { setSelectedId(child.id); focusProgress(); }}
                    onEdit={() => setFormMode({ kind: "edit", child })}
                    onSwitch={() => switchProfile(child)}
                    onRemove={() => setRemoveTarget(child)}
                  />
                ))}

                {account.user.email_verified && (
                  <button type="button" className="family-add-card" onClick={() => setFormMode((current) => (current?.kind === "add" ? null : { kind: "add" }))} aria-expanded={formMode?.kind === "add"}>
                    <span className="family-add-card__plus" aria-hidden="true">＋</span>
                    <strong>{children.length === 0 ? "Add your first child" : "Add a child"}</strong>
                    <small>Nickname · age group · avatar</small>
                  </button>
                )}
              </div>

              {formMode && (
                <div className="family-panel family-enter" style={{ marginTop: 14 }}>
                  <AddChildCard
                    key={formMode.kind === "edit" ? `edit-${formMode.child!.id}` : "add"}
                    mode={formMode.kind}
                    child={formMode.child}
                    onSaved={handleSaved}
                    onCancel={() => setFormMode(null)}
                  />
                </div>
              )}

              {!account.user.email_verified && (
                <p className="family-empty" style={{ marginTop: 12 }}>
                  <strong>One step left.</strong>
                  Verify the guardian email from your mailbox (or the sign-in card below) to start adding profiles.
                </p>
              )}
            </section>

            <section className="family-section" aria-label="Child learning progress" ref={progressRef}>
              <div className="family-section-head">
                <div>
                  <h2 className="family-section-title">Learning progress</h2>
                  <p className="family-section-hint">Real numbers from each child&apos;s reward ledger — games, English and typing.</p>
                </div>
                {children.length > 1 && selectedChild && (
                  <span className="family-section-side">Showing {selectedChild.nickname}</span>
                )}
              </div>
              <div className="family-panel">
                {selectedChild ? (
                  <ChildProgress child={selectedChild} summary={selectedSummary} />
                ) : (
                  <p className="family-empty">
                    <strong>No profile selected yet.</strong>
                    Add a child profile to start following their learning journey.
                  </p>
                )}
              </div>
            </section>

            <section className="family-section" aria-label="Family activity">
              <div className="family-section-head">
                <div>
                  <h2 className="family-section-title">Family activity</h2>
                  <p className="family-section-hint">The latest recorded moments across every child.</p>
                </div>
                <span className="family-section-side">Newest first</span>
              </div>
              <div className="family-panel">
                <FamilyTimeline roster={children} summaries={summaries} />
              </div>
            </section>

            <section className="family-section" aria-label="Parent account settings">
              <div className="family-section-head">
                <div>
                  <h2 className="family-section-title">Parent settings</h2>
                  <p className="family-section-hint">Name, password, email verification and account safety.</p>
                </div>
              </div>
              <ParentSettings
                account={account}
                onAccountChanged={(updated, message) => { setAccount(updated); notify("ok", message); }}
                onSignedOut={(message) => { setAccount(null); window.localStorage.removeItem(ACTIVE_CHILD_KEY); notify("info", message); }}
                onAccountDeleted={() => {
                  setAccount(null);
                  window.localStorage.removeItem(ACTIVE_CHILD_KEY);
                  notify("info", "The family account was deleted.");
                }}
              />
            </section>
          </>
        )}

        {toast && (
          <p className={`${toast.kind === "ok" ? "family-form-note family-form-note--ok" : toast.kind === "error" ? "family-form-note family-form-note--error" : "family-form-note"} family-toast family-enter`} role="status">
            {toast.text}
          </p>
        )}

        {removeTarget && (
          <div className="family-modal-backdrop">
            <div className="family-modal" role="dialog" aria-modal="true" aria-labelledby="family-remove-title">
              <h2 id="family-remove-title">Remove {removeTarget.nickname}&apos;s profile?</h2>
              <p>
                This deletes the profile together with all of its XP, stars, badges and activity history. It cannot be
                undone. {children.length - 1 === 0 ? "This is the only profile in the family." : ""}
              </p>
              <div className="family-form-row">
                <button type="button" className="family-ghost" onClick={() => setRemoveTarget(null)} disabled={removeBusy}>
                  Keep profile
                </button>
                <button
                  type="button"
                  className="family-primary"
                  style={{ background: "linear-gradient(135deg, #f5a08d, #e2705b)", boxShadow: "0 5px 0 rgba(160, 66, 45, .32)", color: "#fff8f2" }}
                  onClick={() => void confirmRemove()}
                  disabled={removeBusy}
                >
                  {removeBusy ? "Removing…" : "Remove profile"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
