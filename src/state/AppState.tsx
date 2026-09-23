import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { evaluateAchievements, newlyUnlocked } from "../lib/achievements";
import { createDemoClips } from "../lib/demo-data";
import { ensureLocationPermission } from "../lib/native";
import {
  deleteClip as dbDeleteClip,
  deleteDemoClips,
  deletePlace as dbDeletePlace,
  listClips,
  listMontages,
  listPlaces,
  loadAchievements,
  loadSettings,
  putClip,
  putMontage,
  putPlace,
  replacePlaces,
  saveAchievements,
  saveSettings,
} from "../lib/db";
import {
  DEMO_PLACES,
  detectTransition,
  matchPlace,
  type GeofenceTransition,
} from "../lib/geofence";
import { toDateKey } from "../lib/dates";
import { createId } from "../lib/id";
import { composeMontage } from "../lib/media";
import { montagePlan } from "../lib/montage";
import { streakFromClips } from "../lib/streaks";
import { DEFAULT_SETTINGS, type Clip, type Coord, type Montage, type Place, type RangePreset, type Settings, type UnlockedAchievement } from "../lib/types";
import { AppContext, type AppContextValue, type SaveClipInput, type Toast } from "./app-context";

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [clips, setClips] = useState<Clip[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [achievements, setAchievements] = useState<UnlockedAchievement[]>([]);
  const [montages, setMontages] = useState<Montage[]>([]);
  const [currentPlace, setCurrentPlace] = useState<Place | null>(null);
  const [prompt, setPrompt] = useState<GeofenceTransition | null>(null);
  const [justUnlocked, setJustUnlocked] = useState<UnlockedAchievement[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const previousPlaceId = useRef<string | null>(null);
  const placesRef = useRef<Place[]>([]);
  const settingsRef = useRef(settings);

  useEffect(() => {
    placesRef.current = places;
  }, [places]);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const pushToast = useCallback((message: string) => {
    const id = createId("toast");
    setToasts((current) => [...current, { id, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4200);
  }, []);

  const syncAchievements = useCallback(
    async (nextClips: Clip[]) => {
      const streak = streakFromClips(nextClips, new Date());
      const nextIds = evaluateAchievements(nextClips, streak);
      setAchievements((previous) => {
        const fresh = newlyUnlocked(previous, nextIds);
        if (fresh.length === 0) return previous;
        const merged = [...previous, ...fresh];
        void saveAchievements(merged);
        setJustUnlocked(fresh);
        return merged;
      });
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [storedClips, storedPlaces, storedSettings, storedAchievements, storedMontages] =
        await Promise.all([
          listClips(),
          listPlaces(),
          loadSettings(),
          loadAchievements(),
          listMontages(),
        ]);
      if (cancelled) return;
      let nextPlaces = storedPlaces;
      if (nextPlaces.length === 0) {
        nextPlaces = DEMO_PLACES;
        await replacePlaces(DEMO_PLACES);
      }
      setClips(storedClips);
      setPlaces(nextPlaces);
      setSettings(storedSettings);
      setAchievements(storedAchievements);
      setMontages(storedMontages);
      await syncAchievements(storedClips);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [syncAchievements]);

  const applyCoord = useCallback((coord: Coord) => {
    const next = matchPlace(coord, placesRef.current, previousPlaceId.current);
    const previous =
      placesRef.current.find((place) => place.id === previousPlaceId.current) ?? null;
    const transition = detectTransition(previous, next);
    previousPlaceId.current = next?.id ?? null;
    setCurrentPlace(next);
    if (transition) setPrompt(transition);
  }, []);

  useEffect(() => {
    if (!settings.geofenceEnabled) {
      setCurrentPlace(null);
      previousPlaceId.current = null;
      return;
    }
    if (settings.demoLocationMode) {
      if (settings.mockedLocation) applyCoord(settings.mockedLocation);
      return;
    }
    if (!navigator.geolocation) return undefined;
    let cancelled = false;
    let watchId: number | null = null;
    void ensureLocationPermission()
      .then((granted) => {
        if (cancelled) return;
        if (!granted) {
          pushToast("Sijaintilupa puuttuu. Käytä demopaikannusta testaukseen.");
          return;
        }
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            applyCoord({ lat: position.coords.latitude, lng: position.coords.longitude });
          },
          () => {
            pushToast("Sijaintia ei saatu. Käytä demopaikannusta testaukseen.");
          },
          { enableHighAccuracy: false, maximumAge: 15_000, timeout: 12_000 },
        );
      })
      .catch(() => {
        if (cancelled) return;
        pushToast("Sijaintilupa puuttuu. Käytä demopaikannusta testaukseen.");
      });
    return () => {
      cancelled = true;
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [
    applyCoord,
    pushToast,
    settings.demoLocationMode,
    settings.geofenceEnabled,
    settings.mockedLocation,
  ]);

  const saveClip = useCallback(
    async (input: SaveClipInput) => {
      const now = new Date();
      const place = settingsRef.current.attachPlaceLabels ? currentPlace : null;
      const clip: Clip = {
        id: createId("clip"),
        createdAt: now.getTime(),
        dateKey: toDateKey(now),
        durationMs: input.durationMs,
        blob: input.blob,
        mimeType: input.mimeType,
        source: input.source,
        isDemo: Boolean(input.isDemo),
        placeId: place?.id,
        placeLabel: place?.name,
      };
      await putClip(clip);
      const next = [clip, ...clips];
      setClips(next);
      await syncAchievements(next);
      pushToast("Hetki tallennettu laitteellesi.");
    },
    [clips, currentPlace, pushToast, syncAchievements],
  );

  const removeClip = useCallback(async (id: string) => {
    await dbDeleteClip(id);
    setClips((current) => current.filter((clip) => clip.id !== id));
  }, []);

  const updateSettings = useCallback(async (patch: Partial<Settings>) => {
    const next = { ...settingsRef.current, ...patch };
    setSettings(next);
    await saveSettings(next);
  }, []);

  const toggleDemoData = useCallback(
    async (enabled: boolean) => {
      if (enabled) {
        const demoClips = await createDemoClips();
        await Promise.all(demoClips.map((clip) => putClip(clip)));
        const next = [...demoClips, ...clips.filter((clip) => !clip.isDemo)].sort(
          (a, b) => b.createdAt - a.createdAt,
        );
        setClips(next);
        await updateSettings({ demoDataEnabled: true });
        await syncAchievements(next);
        pushToast("Demodata päällä. Merkitty selvästi aikajanalla.");
        return;
      }
      await deleteDemoClips();
      const next = clips.filter((clip) => !clip.isDemo);
      setClips(next);
      await updateSettings({ demoDataEnabled: false });
      pushToast("Demodata poistettu. Omat klipit säilyivät.");
    },
    [clips, pushToast, syncAchievements, updateSettings],
  );

  const upsertPlace = useCallback(async (place: Place) => {
    await putPlace(place);
    setPlaces((current) => {
      const exists = current.some((item) => item.id === place.id);
      return exists ? current.map((item) => (item.id === place.id ? place : item)) : [...current, place];
    });
  }, []);

  const removePlace = useCallback(async (id: string) => {
    await dbDeletePlace(id);
    setPlaces((current) => current.filter((place) => place.id !== id));
  }, []);

  const resetDemoPlaces = useCallback(async () => {
    await replacePlaces(DEMO_PLACES);
    setPlaces(DEMO_PLACES);
  }, []);

  const setMockedLocation = useCallback(
    async (coord: Coord | null) => {
      await updateSettings({ mockedLocation: coord, demoLocationMode: true, geofenceEnabled: true });
      if (coord) applyCoord(coord);
    },
    [applyCoord, updateSettings],
  );

  const createMontage = useCallback(
    async (preset: RangePreset) => {
      const plan = montagePlan(clips, preset, new Date());
      const result = await composeMontage(plan.clips);
      const montage: Montage = {
        id: createId("montage"),
        createdAt: Date.now(),
        title: plan.title,
        startDateKey: plan.range.startDateKey,
        endDateKey: plan.range.endDateKey,
        clipIds: plan.clips.map((clip) => clip.id),
        status: result.status,
        reason: result.status === "preview-only" ? result.reason : undefined,
        blob: result.status === "encoded" ? result.blob : undefined,
        mimeType: result.status === "encoded" ? result.mimeType : undefined,
      };
      await putMontage(montage);
      setMontages((current) => [montage, ...current]);
      return montage;
    },
    [clips],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      ready,
      clips,
      places,
      settings,
      achievements,
      montages,
      currentPlace,
      prompt,
      justUnlocked,
      toasts,
      saveClip,
      removeClip,
      updateSettings,
      toggleDemoData,
      upsertPlace,
      removePlace,
      resetDemoPlaces,
      setMockedLocation,
      dismissPrompt: () => setPrompt(null),
      createMontage,
      dismissUnlock: () => setJustUnlocked((current) => current.slice(1)),
      dismissToast: (id) => setToasts((current) => current.filter((toast) => toast.id !== id)),
    }),
    [
      achievements,
      clips,
      createMontage,
      currentPlace,
      justUnlocked,
      montages,
      places,
      prompt,
      ready,
      removeClip,
      removePlace,
      resetDemoPlaces,
      saveClip,
      setMockedLocation,
      settings,
      toasts,
      toggleDemoData,
      updateSettings,
      upsertPlace,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
