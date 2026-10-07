import { Icon } from "./Icon";
import type { Route } from "../lib/route";

export function AppHeader({
  route,
  onNavigate,
}: {
  route: Route;
  onNavigate: (route: Route) => void;
}) {
  const onSettings = route.view === "settings";
  return (
    <header className="app-header">
      <div className="brand">
        <span className="brand-logo">
          <Icon name="video" label="Snappit" />
        </span>
        <span className="brand-name">Snappit</span>
      </div>
      <div className="header-actions">
        <button
          type="button"
          className="upgrade-pill"
          onClick={() => onNavigate({ view: "settings" })}
        >
          <Icon name="crown" />
          <span>Upgrade</span>
        </button>
        <button
          type="button"
          className={onSettings ? "gear-btn is-active" : "gear-btn"}
          aria-label="Settings"
          onClick={() => onNavigate({ view: "settings" })}
        >
          <Icon name="gear" />
        </button>
      </div>
    </header>
  );
}
