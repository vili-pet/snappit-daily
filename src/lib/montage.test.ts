import { describe, expect, it } from "vitest";
import { montagePlan, selectClipsInRange } from "./montage";
import type { Clip } from "./types";

function clip(dateKey: string): Clip {
  return {
    id: dateKey,
    createdAt: new Date(`${dateKey}T09:00:00`).getTime(),
    dateKey,
    durationMs: 1000,
    blob: new Blob(),
    mimeType: "video/webm",
    source: "camera",
    isDemo: false,
  };
}

describe("montage range selection", () => {
  const clips = [
    clip("2026-03-30"),
    clip("2026-04-06"),
    clip("2026-04-10"),
    clip("2026-04-30"),
    clip("2026-05-01"),
  ];

  it("selects inclusive date ranges in chronological order", () => {
    const selected = selectClipsInRange(clips, {
      startDateKey: "2026-04-06",
      endDateKey: "2026-04-30",
    });
    expect(selected.map((item) => item.id)).toEqual([
      "2026-04-06",
      "2026-04-10",
      "2026-04-30",
    ]);
  });

  it("builds a week plan from the current date", () => {
    const plan = montagePlan(clips, "week", new Date(2026, 3, 10));
    expect(plan.range).toEqual({ startDateKey: "2026-04-06", endDateKey: "2026-04-12" });
    expect(plan.clips.map((item) => item.id)).toEqual(["2026-04-06", "2026-04-10"]);
    expect(plan.title).toMatch(/Viikko/);
  });

  it("builds a month plan", () => {
    const plan = montagePlan(clips, "month", new Date(2026, 3, 10));
    expect(plan.clips).toHaveLength(3);
  });

  it("builds a year plan", () => {
    const plan = montagePlan(clips, "year", new Date(2026, 3, 10));
    expect(plan.clips).toHaveLength(5);
    expect(plan.title).toBe("Vuosi 2026");
  });

  it("returns an empty selection when nothing falls in range", () => {
    expect(
      selectClipsInRange(clips, { startDateKey: "2025-01-01", endDateKey: "2025-12-31" }),
    ).toEqual([]);
  });
});
