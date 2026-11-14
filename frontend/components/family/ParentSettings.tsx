"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { api, type CurrentAccount } from "@/lib/api";

type ParentSettingsProps = {
  account: CurrentAccount;
  onAccountChanged: (account: CurrentAccount, message: string) => void;
  onSignedOut: (message: string) => void;
  onAccountDeleted: () => void;
};

function SettingIcon({ children }: { children: ReactNode }) {
  return (
    <span className="family-setting-icon" aria-hidden="true">
      {children}
    </span>
  );
}

export default function ParentSettings({ account, onAccountChanged, onSignedOut, onAccountDeleted }: ParentSettingsProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(account.user.first_name);
  const [settingsNote, setSettingsNote] = useState<{ kind: "ok" | "error" | "info"; text: string } | null>(null);
  const [nameBusy, setNameBusy] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordNote, setPasswordNote] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteAcknowledged, setDeleteAcknowledged] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function saveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNameBusy(true);
    try {
      const updated = await api<CurrentAccount>("auth/me/", {
        method: "PATCH",
        body: JSON.stringify({ first_name: nameDraft.trim() }),
      });
      onAccountChanged(updated, "Parent name saved.");
      setEditingName(false);
    } catch (caught) {
      setSettingsNote({
        kind: "error",
        text: caught instanceof Error ? caught.message : "Could not save the name.",
      });
    } finally {
      setNameBusy(false);
    }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newPassword.length > 0 && newPassword.length < 8) {
      setPasswordNote({ kind: "error", text: "New passwords use at least 8 characters." });
      return;
    }
    setPasswordBusy(true);
    setPasswordNote(null);
    try {
      await api("auth/change-password/", {
        method: "POST",
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      setCurrentPassword("");
      setNewPassword("");
      setPasswordNote({ kind: "ok", text: "Password updated. You stay signed in on this device." });
    } catch (caught) {
      setPasswordNote({
        kind: "error",
        text: caught instanceof Error ? caught.message : "Could not change the password.",
      });
    } finally {
      setPasswordBusy(false);
    }
  }

  async function resendVerification() {
    setSettingsNote(null);
    try {
      const response = await api<{ detail: string }>("auth/verification-resend/", {
        method: "POST",
        body: JSON.stringify({ email: account.user.email }),
      });
      setSettingsNote({ kind: "info", text: response.detail });
    } catch (caught) {
      setSettingsNote({
        kind: "error",
        text: caught instanceof Error ? caught.message : "Could not request a verification link.",
      });
    }
  }

  async function signOut() {
    try {
      await api("auth/logout/", { method: "POST" });
    } finally {
      onSignedOut("Signed out. See you next time!");
    }
  }

  async function deleteAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDeleteBusy(true);
    setDeleteError(null);
    try {
      await api<void>("auth/me/delete/", {
        method: "DELETE",
        body: JSON.stringify({ password: deletePassword, confirm_email: account.user.email }),
      });
      onAccountDeleted();
    } catch (caught) {
      setDeleteError(caught instanceof Error ? caught.message : "Could not delete the account.");
      setDeleteBusy(false);
    }
  }

  const noteClass = (kind: string) =>
    `family-form-note${kind === "ok" ? " family-form-note--ok" : kind === "error" ? " family-form-note--error" : ""}`;

  return (
    <div className="family-settings-grid">
      <div className="family-panel">
        <div className="family-setting-row">
          <SettingIcon>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8.4" r="3.6" /><path d="M4.6 20.4c1.4-3.6 4.2-5.4 7.4-5.4s6 1.8 7.4 5.4" strokeLinecap="round" /></svg>
          </SettingIcon>
          <div className="family-setting-row__copy">
            <p className="family-setting-row__label">Parent name</p>
            {!editingName ? (
              <p className="family-setting-row__value" style={{ display: "flex", alignItems: "center", gap: 9 }}>
                {account.user.first_name.trim() || "Set a name"}
                <button type="button" className="family-mini-btn" style={{ padding: "4px 9px" }} onClick={() => { setNameDraft(account.user.first_name); setEditingName(true); }}>
                  ✎ Edit
                </button>
              </p>
            ) : (
              <form className="family-name-edit" onSubmit={saveName} style={{ marginTop: 6 }}>
                <input
                  className="family-input"
                  value={nameDraft}
                  onChange={(event) => setNameDraft(event.target.value)}
                  maxLength={60}
                  aria-label="Parent name"
                  placeholder="e.g. Amina"
                  autoFocus
                />
                <button type="submit" className="family-mini-btn" disabled={nameBusy}>{nameBusy ? "Saving…" : "Save"}</button>
                <button type="button" className="family-mini-btn" onClick={() => { setEditingName(false); setSettingsNote(null); }}>Cancel</button>
              </form>
            )}
          </div>
        </div>

        <div className="family-setting-row">
          <SettingIcon>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3.4" y="5.4" width="17.2" height="13.2" rx="2.6" /><path d="m4 6.8 8 5.6 8-5.6" /></svg>
          </SettingIcon>
          <div className="family-setting-row__copy">
            <p className="family-setting-row__label">Email address</p>
            <p className="family-setting-row__value" style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              {account.user.email}
              {account.user.email_verified ? (
                <span className="family-verified">✓ Verified</span>
              ) : (
                <span className="family-verified family-verified--no">Pending</span>
              )}
            </p>
          </div>
          {!account.user.email_verified && (
            <button type="button" className="family-mini-btn" onClick={resendVerification}>Resend link</button>
          )}
        </div>

        <div className="family-setting-row">
          <SettingIcon>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="5" y="10.6" width="14" height="9" rx="2.4" /><path d="M8.4 10.4V7.8a3.6 3.6 0 0 1 7.2 0v2.6" strokeLinecap="round" /></svg>
          </SettingIcon>
          <div className="family-setting-row__copy">
            <p className="family-setting-row__label">Account security</p>
            <p className="family-setting-row__value" style={{ fontSize: 12.5, color: "#557089", fontWeight: 650 }}>
              Sign-ins use a secure session cookie — KiddoWorld never sees or stores your password anywhere else.
            </p>
          </div>
          <button type="button" className="family-mini-btn" onClick={signOut}><span aria-hidden="true">⏻</span> Sign out</button>
        </div>

        {settingsNote && <p className={noteClass(settingsNote.kind)} role="status">{settingsNote.text}</p>}
      </div>

      <div className="family-stack">
        <div className="family-panel">
          <h3 className="family-panel-title">Change password</h3>
          <form className="family-password-form" onSubmit={changePassword}>
            <label>
              Current password
              <input
                className="family-input"
                type="password"
                autoComplete="current-password"
                required
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
            </label>
            <label>
              New password
              <input
                className="family-input"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </label>
            {passwordNote && <p className={noteClass(passwordNote.kind)} role="status">{passwordNote.text}</p>}
            <div className="family-form-row">
              <button type="submit" className="family-primary" disabled={passwordBusy}>
                {passwordBusy ? "Updating…" : "Update password"}
              </button>
            </div>
          </form>
        </div>

        <div className="family-danger-zone">
          <h3>Danger zone</h3>
          <p>
            Deleting the account permanently removes every child profile, their reward ledger and all learning history.
            This cannot be undone.
          </p>
          <button type="button" className="family-mini-btn family-mini-btn--danger" onClick={() => { setDeleteError(null); setDeleteAcknowledged(false); setDeletePassword(""); setDeleteOpen(true); }}>
            ✕ Delete family account
          </button>
        </div>
      </div>

      {deleteOpen && (
        <div className="family-modal-backdrop">
          <form
            className="family-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="family-delete-title"
            onSubmit={deleteAccount}
          >
            <h2 id="family-delete-title">Delete the family account?</h2>
            <p>
              Everything linked to <b>{account.user.email}</b> — {account.children.length} child profile
              {account.children.length === 1 ? "" : "s"}, rewards, badges and history — will be erased for good.
            </p>
            <div className="family-password-form">
              <label>
                Your password
                <input
                  className="family-input"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={deletePassword}
                  onChange={(event) => setDeletePassword(event.target.value)}
                  autoFocus
                />
              </label>
              <label className="family-consent">
                <input
                  type="checkbox"
                  checked={deleteAcknowledged}
                  onChange={(event) => setDeleteAcknowledged(event.target.checked)}
                  required
                />
                <span>I understand this permanently deletes the account and all child data.</span>
              </label>
              {deleteError && <p className="family-form-note family-form-note--error" role="alert">{deleteError}</p>}
            </div>
            <div className="family-form-row" style={{ marginTop: 14 }}>
              <button type="button" className="family-ghost" onClick={() => setDeleteOpen(false)} disabled={deleteBusy}>
                Keep my account
              </button>
              <button type="submit" className="family-primary" style={{ background: "linear-gradient(135deg, #f5a08d, #e2705b)", boxShadow: "0 5px 0 rgba(160, 66, 45, .32)", color: "#fff8f2" }} disabled={deleteBusy || !deleteAcknowledged}>
                {deleteBusy ? "Deleting…" : "Delete forever"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
