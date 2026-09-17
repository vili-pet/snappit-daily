import { useMemo, useState } from "react";
import { SequencePlayer } from "../components/SequencePlayer";
import { EmptyState } from "../components/EmptyState";
import { useObjectUrl } from "../hooks/useObjectUrl";
import { montagePlan, summarizeMontage } from "../lib/montage";
import type { RangePreset } from "../lib/types";
import { useApp } from "../hooks/useApp";

const PRESETS: { id: RangePreset; label: string }[] = [
  { id: "week", label: "Viikko" },
  { id: "month", label: "Kuukausi" },
  { id: "year", label: "Vuosi" },
];

export function MontagesView() {
  const { clips, montages, createMontage } = useApp();
  const [busy, setBusy] = useState<RangePreset | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const plans = useMemo(
    () =>
      PRESETS.map((preset) => ({
        ...preset,
        plan: montagePlan(clips, preset.id, new Date()),
      })),
    [clips],
  );

  const run = async (preset: RangePreset) => {
    setError(null);
    setBusy(preset);
    setProgress(0.15);
    try {
      const tick = window.setInterval(() => {
        setProgress((value) => Math.min(0.9, value + 0.08));
      }, 240);
      await createMontage(preset);
      window.clearInterval(tick);
      setProgress(1);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Koosteen luonti epäonnistui.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="view montages-view">
      <header className="view-header">
        <p className="kicker">Koosteet</p>
        <h1>Viikko, kuukausi, vuosi</h1>
        <p className="lede">
          Selain yrittää koodata klipit yhdeksi tiedostoksi (canvas + MediaRecorder). Jos se ei
          onnistu, saat rehellisen peräkkäisen esikatselun — ei tekaistua onnistumista.
        </p>
      </header>

      <div className="preset-grid">
        {plans.map(({ id, label, plan }) => (
          <article key={id} className="card">
            <h2>{label}</h2>
            <p>
              {plan.range.startDateKey} – {plan.range.endDateKey}
            </p>
            <p className="muted">{plan.clips.length} klippiä</p>
            <button
              type="button"
              className="btn btn-primary"
              disabled={busy !== null || plan.clips.length === 0}
              onClick={() => void run(id)}
            >
              {busy === id ? "Kootaan…" : "Koosta"}
            </button>
            {plan.clips.length > 0 ? (
              <SequencePlayer clips={plan.clips} title={`${label} · esikatselu`} />
            ) : (
              <p className="muted">Ei klippejä tällä jaksolla.</p>
            )}
          </article>
        ))}
      </div>

      {busy ? (
        <div className="progress-line" role="status" aria-live="polite">
          <span style={{ width: `${Math.round(progress * 100)}%` }} />
          <p>Koodataan parhaillaan… {Math.round(progress * 100)} %</p>
        </div>
      ) : null}
      {error ? (
        <p className="callout danger" role="alert">
          {error}
        </p>
      ) : null}

      <h2 className="section-title">Tallennetut koosteet</h2>
      {montages.length === 0 ? (
        <EmptyState
          title="Ei tallennettuja koostetta"
          body="Luo viikko-, kuukausi- tai vuosikooste, kun klippejä on kertynyt."
        />
      ) : (
        <ul className="montage-list">
          {montages.map((montage) => (
            <li key={montage.id} className="card">
              <h3>{montage.title}</h3>
              <p className={montage.status === "encoded" ? "ok" : "muted"}>
                {montage.status === "encoded" ? "Koodattu tiedosto" : "Vain esikatselu"}
              </p>
              <p>{summarizeMontage(montage)}</p>
              <MontageResult montageId={montage.id} />
            </li>
          ))}
        </ul>
      )}

      <aside className="note">
        <p>
          Laajennuskohta: korvaa <code>composeMontage</code> ffmpeg.wasm- tai palvelinkoodauksella,
          jos tarvitset tarkkaa leikkausta, ääntä ja vakaita kontteja. Tämä MVP ei väitä
          tuottaneensa tiedostoa, ellei MediaRecorder oikeasti palauta blobia.
        </p>
      </aside>
    </section>
  );
}

function MontageResult({ montageId }: { montageId: string }) {
  const { montages, clips } = useApp();
  const montage = montages.find((item) => item.id === montageId);
  const url = useObjectUrl(montage?.blob);
  const selected = clips
    .filter((clip) => montage?.clipIds.includes(clip.id))
    .sort((a, b) => a.createdAt - b.createdAt);

  if (!montage) return null;
  if (montage.status === "encoded" && url) {
    return <video src={url} controls playsInline className="montage-video" />;
  }
  return <SequencePlayer clips={selected} title="Peräkkäinen esikatselu" />;
}
