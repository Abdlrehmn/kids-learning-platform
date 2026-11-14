/**
 * KiddoWorld XP level path.
 *
 * Levels are not stored in the backend; they are a friendly view of the real
 * XP balance from the reward ledger (`children/<id>/summary/`). The thresholds
 * are defined here and used by the Rewards page so every screen shows the
 * same numbers:
 *
 *   Level 1 needs 0 XP.
 *   Reaching Level 2 needs 100 XP in total.
 *   Every level after that adds one more 150 XP slice.
 *
 *   Example: Level 5 starts at 100 + 150 * 3 = 550 XP.
 */

export const FIRST_LEVEL_UP_XP = 100;
export const LEVEL_STEP_XP = 150;
export const HIGHEST_LEVEL = 40;

/** Total XP a child must have earned to reach `level` (level starts at 1). */
export function xpToReachLevel(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level));
  if (safeLevel === 1) return 0;
  return FIRST_LEVEL_UP_XP + (safeLevel - 2) * LEVEL_STEP_XP;
}

export type RewardLevelInfo = {
  /** Level the child is currently on. */
  level: number;

  /** Total XP earned, straight from the backend ledger. */
  totalXp: number;

  /** XP earned inside the current level band. */
  xpIntoLevel: number;

  /** XP required to complete the current level band. */
  xpForNextLevel: number;

  /** How full the current level band is, from 0 to 1. */
  progress: number;

  /** Total XP needed to reach the next level. */
  totalXpForNextLevel: number;

  /** True when the maximum level has been reached. */
  maxed: boolean;
};

/** Build the level view from a real XP balance. */
export function rewardLevelInfo(totalXp: number): RewardLevelInfo {
  const xp = Math.max(0, totalXp);

  let level = 1;
  while (level < HIGHEST_LEVEL && xp >= xpToReachLevel(level + 1)) {
    level += 1;
  }

  const maxed = level >= HIGHEST_LEVEL;
  const bandStart = xpToReachLevel(level);
  const bandEnd = maxed ? bandStart : xpToReachLevel(level + 1);
  const xpIntoLevel = xp - bandStart;
  const xpForNextLevel = maxed ? bandEnd - bandStart : bandEnd - bandStart;
  const progress = maxed ? 1 : xpIntoLevel / Math.max(1, bandEnd - bandStart);

  return {
    level,
    totalXp: xp,
    xpIntoLevel,
    xpForNextLevel,
    progress: Math.max(0, Math.min(1, progress)),
    totalXpForNextLevel: bandEnd,
    maxed,
  };
}
