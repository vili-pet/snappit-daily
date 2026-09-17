import { describe, expect, it } from "vitest";
import {
  formatDateHeading,
  groupClipsByDate,
  heatmapLevel,
  monthGrid,
  rangeForPreset,
  startOfWeek,
  toDateKey,
} from "./dates";
import type { Clip } from "./types";

function clip(dateKey: string, createdAt: number): Clip {
  return {
    id: `${dateKey}-${createdAt}`,
    createdAt,
    dateKey,
    durationMs: 1000,
    blob: new Blob(),
    mimeType: "video/webm",
    source: "demo",
    isDemo: true,
  };
}

describe("date grouping", () => {
  it("uses local calendar dates", () => {
    expect(toDateKey(new Date(2026, 0, 5, 23, 30))).toBe("2026-01-05");
  });

  it("starts weeks on Monday", () => {
    const sunday = new Date(2026, 3, 12);
    expect(toDateKey(startOfWeek(sunday))).toBe("2026-04-06");
  });

  it("groups clips by date and keeps newest first", () => {
    const clips = [
      clip("2026-04-10", 20),
      clip("2026-04-09", 10),
      clip("2026-04-10", 40),
    ];
    const groups = groupClipsByDate(clips);
    expect([...groups.keys()]).toEqual(["2026-04-10", "2026-04-09"]);
    expect(groups.get("2026-04-10")?.map((item) => item.createdAt)).toEqual([40, 20]);
  });

  it("builds a Monday-first month grid", () => {
    const cells = monthGrid(2026, 3);
    expect(cells[0]).toBeNull();
    expect(cells[2]).toBe("2026-04-01");
    expect(cells.filter(Boolean)).toHaveLength(30);
  });

  it("maps clip counts to heatmap levels", () => {
    expect(heatmapLevel(0)).toBe(0);
    expect(heatmapLevel(1)).toBe(1);
    expect(heatmapLevel(4)).toBe(4);
  });

  it("labels today in Finnish", () => {
    expect(formatDateHeading("2026-04-10", new Date(2026, 3, 10))).toBe("Tänään");
  });

  it("creates week/month/year ranges", () => {
    const now = new Date(2026, 3, 10);
    expect(rangeForPreset("week", now)).toEqual({
      startDateKey: "2026-04-06",
      endDateKey: "2026-04-12",
    });
    expect(rangeForPreset("month", now)).toEqual({
      startDateKey: "2026-04-01",
      endDateKey: "2026-04-30",
    });
    expect(rangeForPreset("year", now)).toEqual({
      startDateKey: "2026-01-01",
      endDateKey: "2026-12-31",
    });
  });
});
