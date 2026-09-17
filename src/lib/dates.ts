import type { Clip, DateRange, RangePreset } from "./types";

const WEEKDAY_SHORT_FI = ["ma", "ti", "ke", "to", "pe", "la", "su"] as const;
const MONTHS_FI = [
  "tammikuu",
  "helmikuu",
  "maaliskuu",
  "huhtikuu",
  "toukokuu",
  "kesäkuu",
  "heinäkuu",
  "elokuu",
  "syyskuu",
  "lokakuu",
  "marraskuu",
  "joulukuu",
] as const;

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function startOfWeek(date: Date): Date {
  const next = startOfDay(date);
  const weekday = next.getDay();
  const mondayOffset = weekday === 0 ? 6 : weekday - 1;
  next.setDate(next.getDate() - mondayOffset);
  return next;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function startOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1);
}

export function endOfWeek(date: Date): Date {
  return addDays(startOfWeek(date), 6);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function endOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 11, 31);
}

export function rangeForPreset(preset: RangePreset, now: Date): DateRange {
  if (preset === "week") {
    return {
      startDateKey: toDateKey(startOfWeek(now)),
      endDateKey: toDateKey(endOfWeek(now)),
    };
  }
  if (preset === "month") {
    return {
      startDateKey: toDateKey(startOfMonth(now)),
      endDateKey: toDateKey(endOfMonth(now)),
    };
  }
  return {
    startDateKey: toDateKey(startOfYear(now)),
    endDateKey: toDateKey(endOfYear(now)),
  };
}

export function isDateKeyInRange(dateKey: string, range: DateRange): boolean {
  return dateKey >= range.startDateKey && dateKey <= range.endDateKey;
}

export function groupClipsByDate(clips: Clip[]): Map<string, Clip[]> {
  const groups = new Map<string, Clip[]>();
  const sorted = [...clips].sort((a, b) => b.createdAt - a.createdAt);
  for (const clip of sorted) {
    const list = groups.get(clip.dateKey) ?? [];
    list.push(clip);
    groups.set(clip.dateKey, list);
  }
  return groups;
}

export function uniqueDateKeys(clips: Clip[]): string[] {
  return [...new Set(clips.map((clip) => clip.dateKey))].sort();
}

export function monthGrid(year: number, monthIndex: number): (string | null)[] {
  const first = new Date(year, monthIndex, 1);
  const daysInMonth = endOfMonth(first).getDate();
  const mondayOffset = first.getDay() === 0 ? 6 : first.getDay() - 1;
  const cells: (string | null)[] = Array.from({ length: mondayOffset }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(toDateKey(new Date(year, monthIndex, day)));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

export function heatmapLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count === 3) return 3;
  return 4;
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("fi-FI", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateHeading(dateKey: string, now = new Date()): string {
  const today = toDateKey(now);
  const yesterday = toDateKey(addDays(now, -1));
  if (dateKey === today) return "Tänään";
  if (dateKey === yesterday) return "Eilen";
  const date = parseDateKey(dateKey);
  return date.toLocaleDateString("fi-FI", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function formatMonthTitle(year: number, monthIndex: number): string {
  return `${MONTHS_FI[monthIndex]} ${year}`;
}

export function weekdayLabels(): readonly string[] {
  return WEEKDAY_SHORT_FI;
}

export function compareDateKeys(a: string, b: string): number {
  return a.localeCompare(b);
}
