import { uniqueDateKeys } from "./dates";
import type { Clip } from "./types";

export const XP_PER_CLIP = 10;
export const XP_DAILY_BONUS = 5;
export const XP_PER_LEVEL = 100;

export type ProgressStats = {
  xp: number;
  level: number;
  xpIntoLevel: number;
  xpForLevel: number;
  clipCount: number;
  dayCount: number;
};

export function computeProgress(clips: Clip[]): ProgressStats {
  const clipCount = clips.length;
  const dayCount = uniqueDateKeys(clips).length;
  const xp = clipCount * XP_PER_CLIP + dayCount * XP_DAILY_BONUS;
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpIntoLevel = xp % XP_PER_LEVEL;
  return {
    xp,
    level,
    xpIntoLevel,
    xpForLevel: XP_PER_LEVEL,
    clipCount,
    dayCount,
  };
}
