import { isDateKeyInRange, rangeForPreset } from "./dates";
import type { Clip, DateRange, Montage, RangePreset } from "./types";

export function selectClipsInRange(clips: Clip[], range: DateRange): Clip[] {
  return clips
    .filter((clip) => isDateKeyInRange(clip.dateKey, range))
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function montagePlan(
  clips: Clip[],
  preset: RangePreset,
  now: Date,
): { range: DateRange; clips: Clip[]; title: string } {
  const range = rangeForPreset(preset, now);
  const selected = selectClipsInRange(clips, range);
  return {
    range,
    clips: selected,
    title: montageTitle(preset, now),
  };
}

export function montageTitle(preset: RangePreset, now: Date): string {
  if (preset === "week") return `Viikko ${weekNumber(now)}`;
  if (preset === "month") {
    return now.toLocaleDateString("fi-FI", { month: "long", year: "numeric" });
  }
  return `Vuosi ${now.getFullYear()}`;
}

export function canAttemptEncode(clips: Clip[]): boolean {
  return clips.some((clip) => clip.blob.size > 0 && clip.mimeType.startsWith("video/"));
}

export function previewOnlyReason(clips: Clip[]): string | undefined {
  if (clips.length === 0) {
    return "Valitulla jaksolla ei ole klippejä.";
  }
  if (!canAttemptEncode(clips)) {
    return "Klippien mediatiedostot ovat esikatselupaikkoja, joten selain ei voi koodata yhtenäistä tiedostoa.";
  }
  return undefined;
}

export function summarizeMontage(montage: Montage): string {
  if (montage.status === "encoded") {
    return `${montage.clipIds.length} klippiä koodattu yhdeksi videoksi.`;
  }
  return montage.reason ?? "Kooste toistetaan peräkkäin ilman uutta koodausta.";
}

function weekNumber(date: Date): number {
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7));
  const week1 = new Date(target.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((target.getTime() - week1.getTime()) / 86_400_000 - 3 + ((week1.getDay() + 6) % 7)) / 7,
    )
  );
}
