import { Icon } from "./Icon";
import type { Route } from "../lib/route";

const ITEMS: { route: Route; label: string; icon: "capture" | "memories" | "montages" | "settings" }[] = [
  { route: { view: "capture" }, label: "Kuvaa", icon: "capture" },
  { route: { view: "memories", mode: "list" }, label: "Muistot", icon: "memories" },
  { route: { view: "montages" }, label: "Koosteet", icon: "montages" },
  { route: { view: "settings" }, label: "Asetukset", icon: "settings" },
];

export function BottomNav({
  route,
  onNavigate,
}: {
  route: Route;
  onNavigate: (route: Route) => void;
}) {
  return (
    <nav className="bottom-nav" aria-label="Päänavigaatio">
      {ITEMS.map((item) => {
        const active =
          item.route.view === "memories"
            ? route.view === "memories"
            : route.view === item.route.view;
        return (
          <button
            key={item.label}
            type="button"
            className={active ? "nav-item is-active" : "nav-item"}
            aria-current={active ? "page" : undefined}
            onClick={() => onNavigate(item.route)}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
