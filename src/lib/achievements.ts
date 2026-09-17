import type { StreakStats } from "./streaks";
import type { AchievementId, Clip, UnlockedAchievement } from "./types";

export type AchievementDef = {
  id: AchievementId;
  title: string;
  description: string;
};

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first-snappit",
    title: "1st Snappit",
    description: "Tallenna ensimmäinen 10 sekunnin hetki.",
  },
  {
    id: "streak-starter",
    title: "Streak Starter",
    description: "Pidä kolmen päivän putki.",
  },
  {
    id: "week-keeper",
    title: "Viikon kertoja",
    description: "Pidä seitsemän päivän putki.",
  },
  {
    id: "ten-clips",
    title: "Kymmenen hetkeä",
    description: "Tallenna kymmenen klippiä.",
  },
];

export function evaluateAchievements(
  clips: Clip[],
  streak: StreakStats,
): AchievementId[] {
  const unlocked: AchievementId[] = [];
  if (clips.length >= 1) unlocked.push("first-snappit");
  if (streak.current >= 3 || streak.longest >= 3) unlocked.push("streak-starter");
  if (streak.current >= 7 || streak.longest >= 7) unlocked.push("week-keeper");
  if (clips.length >= 10) unlocked.push("ten-clips");
  return unlocked;
}

export function newlyUnlocked(
  previously: UnlockedAchievement[],
  nextIds: AchievementId[],
  now = Date.now(),
): UnlockedAchievement[] {
  const have = new Set(previously.map((item) => item.id));
  return nextIds
    .filter((id) => !have.has(id))
    .map((id) => ({ id, unlockedAt: now }));
}

export function achievementById(id: AchievementId): AchievementDef {
  const found = ACHIEVEMENTS.find((item) => item.id === id);
  if (!found) {
    throw new Error(`Unknown achievement: ${id}`);
  }
  return found;
}
