import { describe, expect, it } from "vitest";
import { computeProgress } from "./xp";
import { computeStreak, streakFromClips } from "./streaks";
import { evaluateAchievements } from "./achievements";
import type { Clip } from "./types";

const today = new Date(2026, 3, 10, 12);

function clip(dateKey: string, id = dateKey): Clip {
  return {
    id,
    createdAt: new Date(`${dateKey}T08:00:00`).getTime(),
    dateKey,
    durationMs: 10_000,
    blob: new Blob(),
    mimeType: "video/webm",
    source: "camera",
    isDemo: false,
  };
}

describe("computeStreak", () => {
  it("returns zeros without clips", () => {
    expect(computeStreak([], today)).toEqual({
      current: 0,
      longest: 0,
      lastActiveDateKey: null,
      activeToday: false,
    });
  });

  it("counts a streak ending today", () => {
    const stats = computeStreak(["2026-04-08", "2026-04-09", "2026-04-10"], today);
    expect(stats.current).toBe(3);
    expect(stats.longest).toBe(3);
    expect(stats.activeToday).toBe(true);
  });

  it("keeps yesterday's streak if today is empty", () => {
    const stats = computeStreak(["2026-04-08", "2026-04-09"], today);
    expect(stats.current).toBe(2);
    expect(stats.activeToday).toBe(false);
  });

  it("breaks when a day is missed before yesterday", () => {
    const stats = computeStreak(["2026-04-06", "2026-04-07"], today);
    expect(stats.current).toBe(0);
    expect(stats.longest).toBe(2);
  });

  it("derives streak and XP from saved clips", () => {
    const clips = [clip("2026-04-09"), clip("2026-04-10"), clip("2026-04-10", "second")];
    const streak = streakFromClips(clips, today);
    const progress = computeProgress(clips);
    expect(streak.current).toBe(2);
    expect(progress.clipCount).toBe(3);
    expect(progress.dayCount).toBe(2);
    expect(progress.xp).toBe(3 * 10 + 2 * 5);
    expect(progress.level).toBe(1);
  });

  it("unlocks 1st Snappit and Streak Starter from real clip history", () => {
    const clips = [clip("2026-04-08"), clip("2026-04-09"), clip("2026-04-10")];
    const streak = streakFromClips(clips, today);
    expect(evaluateAchievements(clips, streak)).toEqual([
      "first-snappit",
      "streak-starter",
    ]);
  });
});
