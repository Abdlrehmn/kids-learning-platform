"use client";

import { useState, type FormEvent } from "react";
import { AvatarPicker } from "@/components/family/ChildAvatarMap";
import { api, type ChildProfile } from "@/lib/api";
import { AGE_BANDS, AVATARS, type AvatarId } from "@/lib/family";

type AddChildCardProps = {
  mode: "add" | "edit";
  child?: ChildProfile;
  onSaved: (child: ChildProfile, mode: "add" | "edit") => void;
  onCancel: () => void;
};

const deviceTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

/**
 * Add / edit a child profile through the existing `auth/children/` API.
 * Nickname, age group and avatar are validated before saving; a child profile
 * always belongs to the signed-in guardian's family (never a log-in).
 *
 * The parent passes a stable `key` so switching between children resets the
 * form state without effects.
 */
export default function AddChildCard({ mode, child, onSaved, onCancel }: AddChildCardProps) {
  const [nickname, setNickname] = useState(child?.nickname ?? "");
  const [ageBand, setAgeBand] = useState<string>(child?.age_band ?? "");
  const [avatarId, setAvatarId] = useState<AvatarId>(() => {
    const saved = child?.avatar_id ?? "";
    return saved in AVATARS ? (saved as AvatarId) : "default";
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validate(): string | null {
    const clean = nickname.trim();
    if (!clean) return "Add a nickname so everyone knows whose progress it is.";
    if (clean.length > 32) return "Nicknames stay under 32 characters.";
    if (!AGE_BANDS.some((band) => band.id === ageBand)) {
      return "Choose the age group so the right activities show up.";
    }
    return null;
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    setError(null);
    const payload = {
      nickname: nickname.trim(),
      avatar_id: avatarId,
      age_band: ageBand,
      timezone: child?.timezone || deviceTimezone(),
    };
    try {
      const saved =
        mode === "add"
          ? await api<ChildProfile>("auth/children/", { method: "POST", body: JSON.stringify(payload) })
          : await api<ChildProfile>(`auth/children/${child!.id}/`, { method: "PATCH", body: JSON.stringify(payload) });
      onSaved(saved, mode);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save the profile. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      className="family-form"
      onSubmit={save}
      aria-label={mode === "add" ? "Add a child profile" : `Edit ${child?.nickname ?? ""}'s profile`}
    >
      <label>
        Nickname
        <input
          className="family-input"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          maxLength={32}
          required
          placeholder="e.g. Smoky"
          autoComplete="off"
        />
      </label>

      <div>
        <p style={{ margin: "0 0 6px", color: "#3d5a80", fontSize: "12.5px", fontWeight: 850 }}>Age group</p>
        <div role="radiogroup" aria-label="Age group" className="family-band-picker">
          {AGE_BANDS.map((band) => (
            <button
              key={band.id}
              type="button"
              role="radio"
              aria-checked={ageBand === band.id}
              className="family-band-option"
              onClick={() => setAgeBand(band.id)}
            >
              {band.label}
              <small style={{ color: "#7d91a8", fontSize: 9.5, fontWeight: 750 }}>{band.hint}</small>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p style={{ margin: "0 0 6px", color: "#3d5a80", fontSize: "12.5px", fontWeight: 850 }}>Avatar</p>
        <AvatarPicker value={avatarId} onChange={setAvatarId} />
      </div>

      <p className="family-form-note">
        {mode === "add"
          ? "Profiles use a nickname only and belong to your family account — children never get their own passwords."
          : "Nickname, age group and avatar can be updated any time. Learning rewards stay safely with the profile."}
      </p>

      {error && <p className="family-form-note family-form-note--error" role="alert">{error}</p>}

      <div className="family-form-row">
        <button type="button" className="family-ghost" onClick={onCancel} disabled={busy}>Cancel</button>
        <button type="submit" className="family-primary" disabled={busy}>
          {busy ? "Saving…" : mode === "add" ? "Add child profile" : "Save profile"}
        </button>
      </div>
    </form>
  );
}
