import { useEffect, useState } from "react";
import { usePermissions } from "../hooks/usePermissions";
import { DEMO_OUTSIDE, DEMO_PLACES } from "../lib/geofence";
import { createId } from "../lib/id";
import { ACHIEVEMENTS } from "../lib/achievements";
import { useApp, useProgress } from "../hooks/useApp";
import { BUILD_NUMBER, openLatestApk, type UpdateCheck } from "../lib/updater";
import type { Place } from "../lib/types";

export function SettingsView({
  update,
  onCheck,
}: {
  update?: UpdateCheck | null;
  onCheck?: () => void;
}) {
  const {
    settings,
    updateSettings,
    toggleDemoData,
    places,
    upsertPlace,
    removePlace,
    resetDemoPlaces,
    setMockedLocation,
    achievements,
    currentPlace,
  } = useApp();
  const { streak, progress } = useProgress();
  const { camera, location, support } = usePermissions();
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftRadius, setDraftRadius] = useState(120);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const saveCurrentAsPlace = async () => {
    const coord = settings.mockedLocation;
    if (!coord || !draftName.trim()) return;
    const place: Place = {
      id: createId("place"),
      name: draftName.trim(),
      lat: coord.lat,
      lng: coord.lng,
      radiusM: draftRadius,
      kind: "custom",
    };
    await upsertPlace(place);
    setDraftName("");
  };

  return (
    <section className="view settings-view">
      <header className="view-header">
        <p className="kicker">Profile</p>
        <h1>Settings</h1>
        <p className="lede">A private, ad-free daily diary. All data stays on your device.</p>
        <div className="stat-row">
          <span className="chip">{streak.current} day streak</span>
          <span className="chip">{progress.xp} XP</span>
          <span className="chip">Level {progress.level}</span>
        </div>
        <div className="xp-bar" aria-label={`Level progress ${progress.xpIntoLevel} / ${progress.xpForLevel}`}>
          <span style={{ width: `${progress.xpIntoLevel}%` }} />
        </div>
      </header>

      <section className="card">
        <h2>Achievements</h2>
        <ul className="achievement-list">
          {ACHIEVEMENTS.map((item) => {
            const unlocked = achievements.some((entry) => entry.id === item.id);
            return (
              <li key={item.id} className={unlocked ? "is-on" : undefined}>
                <strong>{item.title}</strong>
                <span>{item.description}</span>
                <em>{unlocked ? "Unlocked" : "Locked"}</em>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card">
        <h2>Appearance</h2>
        <fieldset className="segment">
          <legend className="sr-only">Theme</legend>
          {(["system", "light", "dark"] as const).map((theme) => (
            <button
              key={theme}
              type="button"
              className={settings.theme === theme ? "is-active" : undefined}
              onClick={() => void updateSettings({ theme })}
            >
              {theme === "system" ? "System" : theme === "light" ? "Light" : "Dark"}
            </button>
          ))}
        </fieldset>
      </section>

      <section className="card">
        <h2>Demo data</h2>
        <p>Show pre-made demo clips without using the camera or location.</p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => void toggleDemoData(!settings.demoDataEnabled)}
        >
          {settings.demoDataEnabled ? "Remove demo data" : "Enable demo data"}
        </button>
      </section>

      <section className="card">
        <h2>Places and geofence</h2>
        <p>
          Tracking only works while the app is open. Browsers do not offer reliable background
          location, even in an installed PWA.
        </p>
        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.geofenceEnabled}
            onChange={(event) => void updateSettings({ geofenceEnabled: event.target.checked })}
          />
          <span>Follow places while the app is open</span>
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.demoLocationMode}
            onChange={(event) => void updateSettings({ demoLocationMode: event.target.checked })}
          />
          <span>Demo location (testable transitions)</span>
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.attachPlaceLabels}
            onChange={(event) => void updateSettings({ attachPlaceLabels: event.target.checked })}
          />
          <span>Attach place names to new clips</span>
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.showExactLocation}
            onChange={(event) => void updateSettings({ showExactLocation: event.target.checked })}
          />
          <span>Show exact coordinates (off by default)</span>
        </label>
        <p className="muted">
          Now: {currentPlace?.name ?? "not at any place"}
          {settings.showExactLocation && settings.mockedLocation
            ? ` · ${settings.mockedLocation.lat.toFixed(4)}, ${settings.mockedLocation.lng.toFixed(4)}`
            : ""}
        </p>
        <div className="row wrap">
          <button type="button" className="btn btn-ghost" onClick={() => void setMockedLocation(DEMO_PLACES[0])}>
            Arrive home
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => void setMockedLocation(DEMO_OUTSIDE)}>
            Leave home
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => void setMockedLocation(DEMO_PLACES[1])}>
            Arrive at café
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => void setMockedLocation(DEMO_PLACES[2])}>
            Arrive at work
          </button>
        </div>
        <ul className="place-list">
          {places.map((place) => (
            <li key={place.id}>
              <div>
                <strong>{place.name}</strong>
                <span>
                  {place.kind === "home" ? "Home" : "Custom place"} · about {place.radiusM} m
                </span>
                {settings.showExactLocation ? (
                  <span className="muted">
                    {place.lat.toFixed(4)}, {place.lng.toFixed(4)}
                  </span>
                ) : null}
              </div>
              {place.kind !== "home" ? (
                <button type="button" className="text-btn" onClick={() => void removePlace(place.id)}>
                  Delete
                </button>
              ) : null}
            </li>
          ))}
        </ul>
        <div className="row">
          <label className="field grow">
            <span>New place (from demo point)</span>
            <input value={draftName} onChange={(event) => setDraftName(event.target.value)} placeholder="Name" />
          </label>
          <label className="field">
            <span>Radius (m)</span>
            <input
              type="number"
              min={30}
              max={500}
              value={draftRadius}
              onChange={(event) => setDraftRadius(Number(event.target.value))}
            />
          </label>
        </div>
        <div className="row">
          <button type="button" className="btn btn-ghost" onClick={() => void saveCurrentAsPlace()}>
            Save place
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => void resetDemoPlaces()}>
            Restore example places
          </button>
        </div>
      </section>

      <section className="card">
        <h2>Permissions and privacy</h2>
        <ul className="kv">
          <li>
            <span>Camera</span>
            <strong>{labelPermission(camera, support.getUserMedia)}</strong>
          </li>
          <li>
            <span>Location</span>
            <strong>{labelPermission(location, "geolocation" in navigator)}</strong>
          </li>
          <li>
            <span>MediaRecorder</span>
            <strong>{support.mediaRecorder ? "Supported" : "Not supported"}</strong>
          </li>
        </ul>
        <p>
          Snappit never uploads clips, location or identifiers to a server. Places are stored
          locally; the UI shows names, never a map.
        </p>
      </section>

      <section className="card">
        <h2>Updates</h2>
        <p>
          This build: {BUILD_NUMBER > 0 ? `1.0.${BUILD_NUMBER}` : "local dev build"}. New builds
          are published automatically on every push to GitHub.
        </p>
        <p className="muted">
          {update?.status === "available" || update?.status === "dev-build"
            ? `Version 1.0.${update.build} is available.`
            : update?.status === "up-to-date"
              ? "You are on the latest build."
              : update?.status === "offline"
                ? "Could not reach GitHub just now."
                : "Checking…"}
        </p>
        <div className="row">
          <button type="button" className="btn btn-ghost" onClick={onCheck}>
            Check now
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => openLatestApk()}
          >
            Download latest APK
          </button>
        </div>
      </section>

      <section className="card">
        <h2>Install</h2>
        <p>Installable PWA. iOS: Share → Add to Home Screen.</p>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!installEvent}
          onClick={() => void installEvent?.prompt()}
        >
          {installEvent ? "Install app" : "Use the browser menu to install"}
        </button>
      </section>
    </section>
  );
}

function labelPermission(state: string, supported: boolean): string {
  if (!supported) return "Not supported";
  if (state === "granted") return "Allowed";
  if (state === "denied") return "Denied";
  return "Not asked";
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}
