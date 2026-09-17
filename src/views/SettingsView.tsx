import { useEffect, useState } from "react";
import { usePermissions } from "../hooks/usePermissions";
import { DEMO_OUTSIDE, DEMO_PLACES } from "../lib/geofence";
import { createId } from "../lib/id";
import { ACHIEVEMENTS } from "../lib/achievements";
import { useApp, useProgress } from "../hooks/useApp";
import type { Place } from "../lib/types";

export function SettingsView() {
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
        <p className="kicker">Profiili</p>
        <h1>Snappit</h1>
        <p className="lede">Vili-Petterin mainokseton päiväkirja. Kaikki data pysyy laitteella.</p>
        <div className="stat-row">
          <span className="chip">{streak.current} päivän putki</span>
          <span className="chip">{progress.xp} XP</span>
          <span className="chip">Taso {progress.level}</span>
        </div>
        <div className="xp-bar" aria-label={`Tason edistyminen ${progress.xpIntoLevel} / ${progress.xpForLevel}`}>
          <span style={{ width: `${progress.xpIntoLevel}%` }} />
        </div>
      </header>

      <section className="card">
        <h2>Saavutukset</h2>
        <ul className="achievement-list">
          {ACHIEVEMENTS.map((item) => {
            const unlocked = achievements.some((entry) => entry.id === item.id);
            return (
              <li key={item.id} className={unlocked ? "is-on" : undefined}>
                <strong>{item.title}</strong>
                <span>{item.description}</span>
                <em>{unlocked ? "Avattu" : "Lukittu"}</em>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card">
        <h2>Ulkoasu</h2>
        <fieldset className="segment">
          <legend className="sr-only">Teema</legend>
          {(["system", "light", "dark"] as const).map((theme) => (
            <button
              key={theme}
              type="button"
              className={settings.theme === theme ? "is-active" : undefined}
              onClick={() => void updateSettings({ theme })}
            >
              {theme === "system" ? "Järjestelmä" : theme === "light" ? "Vaalea" : "Tumma"}
            </button>
          ))}
        </fieldset>
      </section>

      <section className="card">
        <h2>Demodata</h2>
        <p>Näytä valmiit merkitty klipit ilman kameraa tai sijaintia.</p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => void toggleDemoData(!settings.demoDataEnabled)}
        >
          {settings.demoDataEnabled ? "Poista demodata" : "Käytä demodataa"}
        </button>
      </section>

      <section className="card">
        <h2>Paikat ja geofence</h2>
        <p>
          Seuranta toimii vain sovelluksen ollessa auki. Selain ei tarjoa luotettavaa
          taustapaikannusta asennetussakaan PWA:ssa.
        </p>
        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.geofenceEnabled}
            onChange={(event) => void updateSettings({ geofenceEnabled: event.target.checked })}
          />
          <span>Seuraa paikkoja kun sovellus on auki</span>
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.demoLocationMode}
            onChange={(event) => void updateSettings({ demoLocationMode: event.target.checked })}
          />
          <span>Demopaikannus (testattavat siirtymät)</span>
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.attachPlaceLabels}
            onChange={(event) => void updateSettings({ attachPlaceLabels: event.target.checked })}
          />
          <span>Liitä paikkanimi uusiin klippeihin</span>
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.showExactLocation}
            onChange={(event) => void updateSettings({ showExactLocation: event.target.checked })}
          />
          <span>Näytä tarkat koordinaatit (ei oletuksena)</span>
        </label>
        <p className="muted">
          Nyt: {currentPlace?.name ?? "ei paikassa"}
          {settings.showExactLocation && settings.mockedLocation
            ? ` · ${settings.mockedLocation.lat.toFixed(4)}, ${settings.mockedLocation.lng.toFixed(4)}`
            : ""}
        </p>
        <div className="row wrap">
          <button type="button" className="btn btn-ghost" onClick={() => void setMockedLocation(DEMO_PLACES[0])}>
            Saavun kotiin
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => void setMockedLocation(DEMO_OUTSIDE)}>
            Lähden kotoa
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => void setMockedLocation(DEMO_PLACES[1])}>
            Saavun kahvilaan
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => void setMockedLocation(DEMO_PLACES[2])}>
            Saavun töihin
          </button>
        </div>
        <ul className="place-list">
          {places.map((place) => (
            <li key={place.id}>
              <div>
                <strong>{place.name}</strong>
                <span>
                  {place.kind === "home" ? "Koti" : "Oma paikka"} · noin {place.radiusM} m
                </span>
                {settings.showExactLocation ? (
                  <span className="muted">
                    {place.lat.toFixed(4)}, {place.lng.toFixed(4)}
                  </span>
                ) : null}
              </div>
              {place.kind !== "home" ? (
                <button type="button" className="text-btn" onClick={() => void removePlace(place.id)}>
                  Poista
                </button>
              ) : null}
            </li>
          ))}
        </ul>
        <div className="row">
          <label className="field grow">
            <span>Uusi paikka (demopisteestä)</span>
            <input value={draftName} onChange={(event) => setDraftName(event.target.value)} placeholder="Nimi" />
          </label>
          <label className="field">
            <span>Säde (m)</span>
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
            Tallenna paikka
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => void resetDemoPlaces()}>
            Palauta esimerkkipaikat
          </button>
        </div>
      </section>

      <section className="card">
        <h2>Luvat ja yksityisyys</h2>
        <ul className="kv">
          <li>
            <span>Kamera</span>
            <strong>{labelPermission(camera, support.getUserMedia)}</strong>
          </li>
          <li>
            <span>Sijainti</span>
            <strong>{labelPermission(location, "geolocation" in navigator)}</strong>
          </li>
          <li>
            <span>MediaRecorder</span>
            <strong>{support.mediaRecorder ? "Tuettu" : "Ei tukea"}</strong>
          </li>
        </ul>
        <p>
          Snappit ei lähetä klippejä, sijaintia tai tunnisteita palvelimelle. Paikat
          tallennetaan paikallisesti; käyttöliittymä näyttää nimet, ei karttaa.
        </p>
      </section>

      <section className="card">
        <h2>Asenna</h2>
        <p>Asennettava PWA. iOS: Jaa → Lisää Koti-valikkoon.</p>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!installEvent}
          onClick={() => void installEvent?.prompt()}
        >
          {installEvent ? "Asenna sovellus" : "Asennusvalmis selaimen valikosta"}
        </button>
      </section>
    </section>
  );
}

function labelPermission(state: string, supported: boolean): string {
  if (!supported) return "Ei tukea";
  if (state === "granted") return "Sallittu";
  if (state === "denied") return "Evätty";
  return "Ei kysytty";
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}
