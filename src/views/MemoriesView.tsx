import { useMemo, useState } from "react";
import { ClipCard } from "../components/ClipCard";
import { EmptyState } from "../components/EmptyState";
import {
  formatDateHeading,
  formatMonthTitle,
  groupClipsByDate,
  heatmapLevel,
  monthGrid,
  weekdayLabels,
} from "../lib/dates";
import type { Route } from "../lib/route";
import { useApp } from "../hooks/useApp";

export function MemoriesView({
  route,
  onNavigate,
}: {
  route: Extract<Route, { view: "memories" }>;
  onNavigate: (route: Route) => void;
}) {
  const { clips, removeClip, places } = useApp();
  const [placeFilter, setPlaceFilter] = useState("all");
  const [monthCursor, setMonthCursor] = useState(() => {
    const base = route.dateKey ? new Date(route.dateKey) : new Date();
    return { year: base.getFullYear(), month: base.getMonth() };
  });

  const filtered = clips.filter((clip) => placeFilter === "all" || clip.placeId === placeFilter);
  const groups = groupClipsByDate(filtered);
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const clip of clips) {
      map.set(clip.dateKey, (map.get(clip.dateKey) ?? 0) + 1);
    }
    return map;
  }, [clips]);

  const selectedDay = route.dateKey;
  const dayClips = selectedDay ? (groups.get(selectedDay) ?? []) : [];

  return (
    <section className="view memories-view">
      <header className="view-header">
        <p className="kicker">Muistot</p>
        <h1>Aikajana ja kalenteri</h1>
        <div className="segment" role="tablist" aria-label="Näkymä">
          <button
            type="button"
            role="tab"
            aria-selected={route.mode === "list"}
            className={route.mode === "list" ? "is-active" : undefined}
            onClick={() => onNavigate({ view: "memories", mode: "list", dateKey: route.dateKey })}
          >
            Aikajana
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={route.mode === "calendar"}
            className={route.mode === "calendar" ? "is-active" : undefined}
            onClick={() => onNavigate({ view: "memories", mode: "calendar", dateKey: route.dateKey })}
          >
            Kalenteri
          </button>
        </div>
        <label className="field">
          <span>Paikka</span>
          <select value={placeFilter} onChange={(event) => setPlaceFilter(event.target.value)}>
            <option value="all">Kaikki</option>
            {places.map((place) => (
              <option key={place.id} value={place.id}>
                {place.name}
              </option>
            ))}
          </select>
        </label>
      </header>

      {clips.length === 0 ? (
        <EmptyState
          title="Ei vielä klippejä"
          body="Kuvaa ensimmäinen 10 sekunnin hetki tai kytke demodata asetuksista."
          action={{ label: "Kuvaa", onClick: () => onNavigate({ view: "capture" }) }}
        />
      ) : route.mode === "calendar" ? (
        <div className="calendar">
          <div className="calendar-nav">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() =>
                setMonthCursor((current) =>
                  current.month === 0
                    ? { year: current.year - 1, month: 11 }
                    : { year: current.year, month: current.month - 1 },
                )
              }
            >
              Edellinen
            </button>
            <h2>{formatMonthTitle(monthCursor.year, monthCursor.month)}</h2>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() =>
                setMonthCursor((current) =>
                  current.month === 11
                    ? { year: current.year + 1, month: 0 }
                    : { year: current.year, month: current.month + 1 },
                )
              }
            >
              Seuraava
            </button>
          </div>
          <div className="weekday-row">
            {weekdayLabels().map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
          <div className="month-grid">
            {monthGrid(monthCursor.year, monthCursor.month).map((dateKey, index) =>
              dateKey ? (
                <button
                  key={dateKey}
                  type="button"
                  className={`day-cell level-${heatmapLevel(counts.get(dateKey) ?? 0)} ${
                    selectedDay === dateKey ? "is-selected" : ""
                  }`}
                  onClick={() => onNavigate({ view: "memories", mode: "calendar", dateKey })}
                >
                  <span>{Number(dateKey.slice(-2))}</span>
                  <span className="sr-only">{counts.get(dateKey) ?? 0} klippiä</span>
                </button>
              ) : (
                <span key={`empty-${index}`} className="day-cell is-empty" />
              ),
            )}
          </div>
          {selectedDay ? (
            <div className="day-sheet">
              <h3>{formatDateHeading(selectedDay)}</h3>
              {dayClips.length === 0 ? (
                <p className="muted">Ei klippejä tältä päivältä.</p>
              ) : (
                <div className="clip-grid">
                  {dayClips.map((clip) => (
                    <ClipCard key={clip.id} clip={clip} onDelete={(id) => void removeClip(id)} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="muted">Avaa päivä nähdäksesi sen klipit.</p>
          )}
        </div>
      ) : (
        <div className="timeline">
          {[...groups.entries()].map(([dateKey, dayClips]) => (
            <section key={dateKey} className="day-group">
              <h2>
                <button
                  type="button"
                  className="text-btn"
                  onClick={() => onNavigate({ view: "memories", mode: "calendar", dateKey })}
                >
                  {formatDateHeading(dateKey)}
                </button>
              </h2>
              <div className="clip-grid">
                {dayClips.map((clip) => (
                  <ClipCard key={clip.id} clip={clip} onDelete={(id) => void removeClip(id)} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
