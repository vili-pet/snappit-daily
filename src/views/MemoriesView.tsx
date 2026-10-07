import { useMemo, useState } from "react";
import { ClipCard } from "../components/ClipCard";
import { EmptyState } from "../components/EmptyState";
import { Icon } from "../components/Icon";
import { VideoThumb } from "../components/VideoThumb";
import {
  formatCardDateEN,
  formatMonthHeadingEN,
  groupClipsByDate,
  groupClipsByMonth,
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
  const { clips, removeClip } = useApp();
  const [openDay, setOpenDay] = useState<string | null>(route.dateKey ?? null);

  const months = useMemo(() => groupClipsByMonth(clips), [clips]);
  const groups = useMemo(() => groupClipsByDate(clips), [clips]);

  if (clips.length === 0) {
    return (
      <section className="view timeline-view">
        <header className="view-header">
          <h1>Your Timeline</h1>
          <p className="lede">Your daily Snappits, beautifully organized</p>
        </header>
        <EmptyState
          title="No Snappits yet"
          body="Capture your first 10-second moment and it will show up here."
          action={{ label: "Capture a Snappit", onClick: () => onNavigate({ view: "capture" }) }}
        />
      </section>
    );
  }

  return (
    <section className="view timeline-view">
      <header className="view-header">
        <h1>Your Timeline</h1>
        <p className="lede">Your daily Snappits, beautifully organized</p>
      </header>

      {months.map((month) => (
        <section key={month.key} className="month-group">
          <h2 className="month-heading">
            <Icon name="calendar" />
            <span>{formatMonthHeadingEN(month.year, month.month)}</span>
          </h2>
          <div className="day-grid">
            {[...new Set(month.clips.map((clip) => clip.dateKey))].map((dateKey) => {
              const dayClips = month.clips.filter((clip) => clip.dateKey === dateKey);
              return (
                <button
                  key={dateKey}
                  type="button"
                  className={openDay === dateKey ? "day-card is-open" : "day-card"}
                  onClick={() => setOpenDay(openDay === dateKey ? null : dateKey)}
                >
                  <span className="day-card-media">
                    <VideoThumb clip={dayClips[0]} />
                    <span className="day-card-play">
                      <Icon name="play" />
                    </span>
                    {dayClips.length > 1 ? (
                      <span className="day-card-count">×{dayClips.length}</span>
                    ) : null}
                  </span>
                  <span className="day-card-caption">{formatCardDateEN(dateKey)}</span>
                </button>
              );
            })}
          </div>
          {openDay && month.clips.some((clip) => clip.dateKey === openDay) ? (
            <div className="day-detail">
              <h3>{formatCardDateEN(openDay)}</h3>
              <div className="clip-grid">
                {(groups.get(openDay) ?? []).map((clip) => (
                  <ClipCard key={clip.id} clip={clip} onDelete={(id) => void removeClip(id)} />
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ))}
    </section>
  );
}
