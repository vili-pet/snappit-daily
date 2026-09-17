import { DEFAULT_SETTINGS } from "./types";
import type {
  Clip,
  Montage,
  Place,
  Settings,
  UnlockedAchievement,
} from "./types";

const DB_NAME = "snappit-daily";
const DB_VERSION = 1;

type KvKey = "settings" | "achievements";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB ei avautunut."));
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("clips")) {
        db.createObjectStore("clips", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("places")) {
        db.createObjectStore("places", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("montages")) {
        db.createObjectStore("montages", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("kv")) {
        db.createObjectStore("kv");
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

function reqToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onerror = () => reject(request.error ?? new Error("IndexedDB-virhe"));
    request.onsuccess = () => resolve(request.result);
  });
}

async function withStore<T>(
  storeName: "clips" | "places" | "montages" | "kv",
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => Promise<T> | T,
): Promise<T> {
  const db = await openDb();
  const tx = db.transaction(storeName, mode);
  const store = tx.objectStore(storeName);
  const result = await run(store);
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Transaktio epäonnistui"));
    tx.onabort = () => reject(tx.error ?? new Error("Transaktio keskeytettiin"));
  });
  db.close();
  return result;
}

export async function listClips(): Promise<Clip[]> {
  const clips = await withStore("clips", "readonly", (store) => reqToPromise(store.getAll()));
  return (clips as Clip[]).sort((a, b) => b.createdAt - a.createdAt);
}

export async function putClip(clip: Clip): Promise<void> {
  await withStore("clips", "readwrite", (store) => reqToPromise(store.put(clip)));
}

export async function deleteClip(id: string): Promise<void> {
  await withStore("clips", "readwrite", (store) => reqToPromise(store.delete(id)));
}

export async function deleteDemoClips(): Promise<void> {
  await withStore("clips", "readwrite", async (store) => {
    const all = (await reqToPromise(store.getAll())) as Clip[];
    await Promise.all(
      all.filter((clip) => clip.isDemo).map((clip) => reqToPromise(store.delete(clip.id))),
    );
  });
}

export async function listPlaces(): Promise<Place[]> {
  return withStore("places", "readonly", (store) => reqToPromise(store.getAll())) as Promise<Place[]>;
}

export async function putPlace(place: Place): Promise<void> {
  await withStore("places", "readwrite", (store) => reqToPromise(store.put(place)));
}

export async function deletePlace(id: string): Promise<void> {
  await withStore("places", "readwrite", (store) => reqToPromise(store.delete(id)));
}

export async function replacePlaces(places: Place[]): Promise<void> {
  await withStore("places", "readwrite", async (store) => {
    await reqToPromise(store.clear());
    await Promise.all(places.map((place) => reqToPromise(store.put(place))));
  });
}

export async function listMontages(): Promise<Montage[]> {
  const montages = await withStore("montages", "readonly", (store) => reqToPromise(store.getAll()));
  return (montages as Montage[]).sort((a, b) => b.createdAt - a.createdAt);
}

export async function putMontage(montage: Montage): Promise<void> {
  await withStore("montages", "readwrite", (store) => reqToPromise(store.put(montage)));
}

export async function loadSettings(): Promise<Settings> {
  const stored = await withStore("kv", "readonly", (store) =>
    reqToPromise(store.get("settings" satisfies KvKey)),
  );
  return { ...DEFAULT_SETTINGS, ...(stored as Partial<Settings> | undefined) };
}

export async function saveSettings(settings: Settings): Promise<void> {
  await withStore("kv", "readwrite", (store) =>
    reqToPromise(store.put(settings, "settings" satisfies KvKey)),
  );
}

export async function loadAchievements(): Promise<UnlockedAchievement[]> {
  const stored = await withStore("kv", "readonly", (store) =>
    reqToPromise(store.get("achievements" satisfies KvKey)),
  );
  return (stored as UnlockedAchievement[] | undefined) ?? [];
}

export async function saveAchievements(items: UnlockedAchievement[]): Promise<void> {
  await withStore("kv", "readwrite", (store) =>
    reqToPromise(store.put(items, "achievements" satisfies KvKey)),
  );
}
