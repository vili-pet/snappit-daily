import { useContext } from "react";
import { ACHIEVEMENTS } from "../lib/achievements";
import { streakFromClips } from "../lib/streaks";
import { computeProgress } from "../lib/xp";
import { AppContext } from "../state/app-context";

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp must be used within AppProvider");
  return value;
}

export function useProgress() {
  const { clips } = useApp();
  return {
    streak: streakFromClips(clips, new Date()),
    progress: computeProgress(clips),
    catalog: ACHIEVEMENTS,
  };
}
