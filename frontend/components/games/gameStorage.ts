import { games, type GameId } from "@/components/games/gameCatalog";

export const GAME_STORAGE_KEY = "kiddoworld-games-progress-v1";

export type GameRecord = { level: number; bestScore: number; levelsCompleted: number };
export type GameProgress = { xp: number; gamesPlayed: number; records: Partial<Record<GameId, GameRecord>> };

export const EMPTY_PROGRESS: GameProgress = { xp: 0, gamesPlayed: 0, records: {} };

export function readProgress(value: string | null): GameProgress {
  if (!value) return EMPTY_PROGRESS;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object") return EMPTY_PROGRESS;
    const candidate = parsed as Partial<GameProgress>;
    const records: Partial<Record<GameId, GameRecord>> = {};
    for (const game of games) {
      const saved = candidate.records?.[game.id];
      if (!saved || typeof saved !== "object") continue;
      const level = Number(saved.level);
      const bestScore = Number(saved.bestScore);
      const levelsCompleted = Number(saved.levelsCompleted);
      if ([level, bestScore, levelsCompleted].every(Number.isFinite)) {
        records[game.id] = {
          level: Math.max(1, Math.floor(level)),
          bestScore: Math.max(0, Math.floor(bestScore)),
          levelsCompleted: Math.max(0, Math.floor(levelsCompleted)),
        };
      }
    }
    return {
      xp: Number.isFinite(candidate.xp) && Number(candidate.xp) >= 0 ? Number(candidate.xp) : 0,
      gamesPlayed: Number.isFinite(candidate.gamesPlayed) && Number(candidate.gamesPlayed) >= 0
        ? Math.floor(Number(candidate.gamesPlayed))
        : Object.values(records).reduce((total, record) => total + (record?.levelsCompleted ?? 0), 0),
      records,
    };
  } catch {
    return EMPTY_PROGRESS;
  }
}

export function saveProgress(progress: GameProgress) {
  try {
    window.localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Progress still works in memory when storage is unavailable.
  }
}
