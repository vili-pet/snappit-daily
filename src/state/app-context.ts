import { createContext } from "react";
import type { GeofenceTransition } from "../lib/geofence";
import type {
  Clip,
  ClipSource,
  Coord,
  Montage,
  Place,
  RangePreset,
  Settings,
  UnlockedAchievement,
} from "../lib/types";

export type Toast = { id: string; message: string };

export type SaveClipInput = {
  blob: Blob;
  mimeType: string;
  durationMs: number;
  source: ClipSource;
  isDemo?: boolean;
};

export type AppContextValue = {
  ready: boolean;
  clips: Clip[];
  places: Place[];
  settings: Settings;
  achievements: UnlockedAchievement[];
  montages: Montage[];
  currentPlace: Place | null;
  prompt: GeofenceTransition | null;
  justUnlocked: UnlockedAchievement[];
  toasts: Toast[];
  saveClip: (input: SaveClipInput) => Promise<void>;
  removeClip: (id: string) => Promise<void>;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
  toggleDemoData: (enabled: boolean) => Promise<void>;
  upsertPlace: (place: Place) => Promise<void>;
  removePlace: (id: string) => Promise<void>;
  resetDemoPlaces: () => Promise<void>;
  setMockedLocation: (coord: Coord | null) => Promise<void>;
  dismissPrompt: () => void;
  createMontage: (preset: RangePreset) => Promise<Montage>;
  dismissUnlock: () => void;
  dismissToast: (id: string) => void;
};

export const AppContext = createContext<AppContextValue | null>(null);
