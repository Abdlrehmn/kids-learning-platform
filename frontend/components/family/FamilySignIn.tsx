"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { api, type CurrentAccount } from "@/lib/api";
import DriftCloud from "@/components/family/DriftCloud";
import { SkyBadge } from "@/components/family/SkyIsland";

type FamilySignInProps = {
  onAuthenticated: (account: CurrentAccount) => void;
};

type SignInMode = "login" | "register";

const ICON_CLASS = "family-field__icon-svg";

function MailIcon() {
  return (
    <svg className={ICON_CLASS} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3.4" y="5.4" width="17.2" height="13.2" rx="3" /><path d="m4.4 7 7.6 5.4L19.6 7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className={ICON_CLASS} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="5" y="10.6" width="14" height="9" rx="2.6" /><path d="M8.4 10.4V7.8a3.6 3.6 0 0 1 7.2 0v2.6" strokeLinecap="round" /><circle cx="12" cy="15" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg className={ICON_CLASS} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.8" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className={ICON_CLASS} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" /><path d="M4.5 19.5 19.5 4.5" strokeLinecap="round" /><circle cx="12" cy="12" r="2.8" />
    </svg>
  );
}

function AlertIcon({ kind }: { kind: "ok" | "error" | "info" }) {
  const glyphs: Record<typeof kind, ReactNode> = {
    ok: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="12" cy="12" r="9" /><path d="m8 12.4 2.8 2.8L16.6 9" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    error: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="12" cy="12" r="9" /><path d="M12 7.6v6M12 16.4v.4" strokeLinecap="round" /></svg>,
    info: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="12" cy="12" r="9" /><path d="M12 11v5.4M12 7.4v.6" strokeLinecap="round" /></svg>,
  };
  return <span className="family-alert__icon" aria-hidden="true">{glyphs[kind]}</span>;
}

/** Guardian sign-in / registration card — same APIs and validation as before. */
export default function FamilySignIn({ onAuthenticated }: FamilySignInProps) {
  const [mode, setMode] = useState<SignInMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRevealed, setPasswordRevealed] = useState(false);
  const [guardianConfirmed, setGuardianConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error" | "info"; text: string } | null>(null);

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setBusy(true);
    try {
      if (mode === "register") {
        await api("auth/register/", {
          method: "POST",
          body: JSON.stringify({ email, password, guardian_confirmed: guardianConfirmed }),
        });
        setMessage({
          kind: "ok",
          text: "Check your email for a verification link. Once verified, come back here to sign in.",
        });
      } else {
        await api("auth/login/", { method: "POST", body: JSON.stringify({ email, password }) });
        const current = await api<CurrentAccount>("auth/me/");
        onAuthenticated(current);
      }
    } catch (caught) {
      setMessage({
        kind: "error",
        text: caught instanceof Error ? caught.message : "Something went wrong. Please try again.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function requestPasswordReset() {
    if (!email) {
      setMessage({ kind: "info", text: "Enter your email address first." });
      return;
    }
    setBusy(true);
    try {
      const response = await api<{ detail: string }>("auth/password-reset/", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setMessage({ kind: "info", text: response.detail });
    } catch (caught) {
      setMessage({
        kind: "error",
        text: caught instanceof Error ? caught.message : "Could not request a reset link.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function resendVerification() {
    if (!email) {
      setMessage({ kind: "info", text: "Enter the account email first." });
      return;
    }
    setBusy(true);
    try {
      const response = await api<{ detail: string }>("auth/verification-resend/", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setMessage({ kind: "info", text: response.detail });
    } catch (caught) {
      setMessage({
        kind: "error",
        text: caught instanceof Error ? caught.message : "Could not request a verification link.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="family-section family-auth-stage" aria-label="Guardian sign in">
      <DriftCloud variant={2} travel={false} className="family-auth-cloud family-auth-cloud--left" />
      <DriftCloud variant={1} travel={false} flip className="family-auth-cloud family-auth-cloud--right" />
      <DriftCloud variant={3} travel={false} className="family-auth-cloud family-auth-cloud--top" />

      <div className="family-auth-card family-enter">
        <span className="family-auth-badge" aria-hidden="true"><SkyBadge /></span>
        <h1 className="family-auth-title">
          {mode === "login" ? "Welcome Back, Family!" : "Create Your Family Account"}
        </h1>
        <p className="family-auth-sub">
          {mode === "login"
            ? "Your little learner's adventure is waiting."
            : "Start a wonderful learning journey together."}
        </p>

        <div className="family-auth-tabs" aria-label="Account options">
          <button type="button" aria-pressed={mode === "login"} onClick={() => { setMode("login"); setMessage(null); setPasswordRevealed(false); }}>
            Sign in
          </button>
          <button type="button" aria-pressed={mode === "register"} onClick={() => { setMode("register"); setMessage(null); }}>
            Create account
          </button>
        </div>

        <form className="family-auth-form" onSubmit={submitAuth}>
          <div className="family-field">
            <label className="family-field__label" htmlFor="family-email">Email address</label>
            <div className="family-field__box">
              <MailIcon />
              <input
                id="family-email"
                className="family-input family-input--field"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          </div>

          <div className="family-field">
            <label className="family-field__label" htmlFor="family-password">Password</label>
            <div className="family-field__box">
              <LockIcon />
              <input
                id="family-password"
                className="family-input family-input--field"
                type={passwordRevealed ? "text" : "password"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={8}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                className="family-field__reveal"
                onClick={() => setPasswordRevealed((revealed) => !revealed)}
                aria-label={passwordRevealed ? "Hide password" : "Show password"}
                aria-pressed={passwordRevealed}
              >
                {passwordRevealed ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {mode === "register" && (
            <label className="family-consent">
              <input
                type="checkbox"
                checked={guardianConfirmed}
                onChange={(event) => setGuardianConfirmed(event.target.checked)}
                required
              />
              <span>I am the parent or guardian creating this account for a child.</span>
            </label>
          )}

          <button type="submit" className="family-primary family-primary--full" disabled={busy}>
            {busy && <span className="family-spinner" aria-hidden="true" />}
            {mode === "login" ? "Sign in" : "Create guardian account"}
            {!busy && <span className="family-primary__arrow" aria-hidden="true">→</span>}
          </button>

          {mode === "login" && (
            <div className="family-auth-links">
              <button type="button" className="family-link-button" onClick={requestPasswordReset} disabled={busy}>
                🔑 Forgot password?
              </button>
              <button type="button" className="family-link-button" onClick={resendVerification} disabled={busy}>
                ✉ Resend verification
              </button>
            </div>
          )}
        </form>

        {message && (
          <p className={`family-alert family-alert--${message.kind}`} role="status">
            <AlertIcon kind={message.kind} />
            {message.text}
          </p>
        )}

        <p className="family-auth-note">
          Child profiles use a nickname and learning settings — they never need passwords of their own.
        </p>
      </div>
    </section>
  );
}
