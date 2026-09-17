import { addDays, toDateKey, uniqueDateKeys } from "./dates";
import type { Clip } from "./types";

export type StreakStats = {
  current: number;
  longest: number;
  lastActiveDateKey: string | null;
  activeToday: boolean;
};

export function computeStreak(dateKeys: string[], today: Date): StreakStats {
  const unique = [...new Set(dateKeys)].sort();
  if (unique.length === 0) {
    return { current: 0, longest: 0, lastActiveDateKey: null, activeToday: false };
  }

  const todayKey = toDateKey(today);
  const yesterdayKey = toDateKey(addDays(today, -1));
  const set = new Set(unique);
  const lastActiveDateKey = unique[unique.length - 1] ?? null;
  const activeToday = set.has(todayKey);

  let cursor: string | null = null;
  if (set.has(todayKey)) cursor = todayKey;
  else if (set.has(yesterdayKey)) cursor = yesterdayKey;

  let current = 0;
  while (cursor && set.has(cursor)) {
    current += 1;
    cursor = toDateKey(addDays(parseKey(cursor), -1));
  }

  let longest = 1;
  let run = 1;
  for (let i = 1; i < unique.length; i += 1) {
    const prev = unique[i - 1];
    const next = unique[i];
    if (toDateKey(addDays(parseKey(prev), 1)) === next) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }

  return { current, longest, lastActiveDateKey, activeToday };
}

export function streakFromClips(clips: Clip[], today: Date): StreakStats {
  return computeStreak(uniqueDateKeys(clips), today);
}

function parseKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}
