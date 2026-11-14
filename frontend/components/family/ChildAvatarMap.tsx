"use client";

import type { CSSProperties } from "react";
import { AVATAR_TILES, AVATARS, avatarOf, type AvatarId } from "@/lib/family";

/** Stable pastel per avatar id so the same child keeps the same tile color. */
function tileFor(avatarId: string): string {
  const ids = Object.keys(AVATARS);
  const index = ids.indexOf(avatarId in AVATARS ? avatarId : "default");
  return AVATAR_TILES[(index === -1 ? 0 : index) % AVATAR_TILES.length];
}

export function ChildAvatar({
  avatarId,
  size = 58,
}: {
  avatarId: string;
  size?: number;
}) {
  const { glyph, label } = avatarOf(avatarId);
  return (
    <span
      className="family-avatar"
      aria-label={`${label} avatar`}
      style={{ width: size, height: size, fontSize: size * 0.5, background: tileFor(avatarId) }}
    >
      {glyph}
    </span>
  );
}

/** Avatar picker used by the add/edit child forms. */
export function AvatarPicker({
  value,
  onChange,
}: {
  value: AvatarId;
  onChange: (avatarId: AvatarId) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Choose an avatar" className="family-avatar-picker">
      {(Object.keys(AVATARS) as AvatarId[]).map((avatarId, index) => (
        <button
          key={avatarId}
          type="button"
          role="radio"
          aria-checked={value === avatarId}
          className={`family-avatar-option${value === avatarId ? " is-chosen" : ""}`}
          onClick={() => onChange(avatarId)}
          style={{ "--avatar-delay": `${index * 40}ms` } as CSSProperties}
        >
          <span className="family-avatar" aria-hidden="true" style={{ width: 44, height: 44, fontSize: 22, background: tileFor(avatarId) }}>
            {AVATARS[avatarId].glyph}
          </span>
          <small>{AVATARS[avatarId].label}</small>
        </button>
      ))}
    </div>
  );
}
