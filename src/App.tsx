import { BottomNav } from "./components/BottomNav";
import { Overlays } from "./components/Overlays";
import { useHashRoute } from "./hooks/useHashRoute";
import { useTheme } from "./hooks/useTheme";
import { useApp } from "./hooks/useApp";
import { AppProvider } from "./state/AppState";
import { CaptureView } from "./views/CaptureView";
import { MemoriesView } from "./views/MemoriesView";
import { MontagesView } from "./views/MontagesView";
import { SettingsView } from "./views/SettingsView";

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}

function Shell() {
  const { ready, settings } = useApp();
  const { route, navigate } = useHashRoute();
  useTheme(settings.theme);

  return (
    <div className="app-frame">
      <a className="skip-link" href="#main">
        Siirry sisältöön
      </a>
      <div className="app-shell">
        <main id="main">
          {!ready ? (
            <p className="loading">Avataan päiväkirjaa…</p>
          ) : route.view === "capture" ? (
            <CaptureView />
          ) : route.view === "memories" ? (
            <MemoriesView route={route} onNavigate={navigate} />
          ) : route.view === "montages" ? (
            <MontagesView />
          ) : (
            <SettingsView />
          )}
        </main>
        <BottomNav route={route} onNavigate={navigate} />
      </div>
      <Overlays onNavigate={navigate} />
    </div>
  );
}
