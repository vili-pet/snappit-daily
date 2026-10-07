import { useEffect, useState } from "react";
import { AppHeader } from "./components/AppHeader";
import { BottomNav } from "./components/BottomNav";
import { Overlays } from "./components/Overlays";
import { useHashRoute } from "./hooks/useHashRoute";
import { useTheme } from "./hooks/useTheme";
import { useApp } from "./hooks/useApp";
import { AppProvider } from "./state/AppState";
import { CaptureView } from "./views/CaptureView";
import { HomeView } from "./views/HomeView";
import { MemoriesView } from "./views/MemoriesView";
import { MontagesView } from "./views/MontagesView";
import { SettingsView } from "./views/SettingsView";
import { checkForUpdate, openLatestApk, type UpdateCheck } from "./lib/updater";

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
  const [update, setUpdate] = useState<UpdateCheck | null>(null);
  useTheme(settings.theme);

  useEffect(() => {
    if (!ready) return;
    void checkForUpdate().then(setUpdate);
  }, [ready]);

  return (
    <div className="app-frame">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="app-shell">
        {update?.status === "available" || update?.status === "dev-build" ? (
          <button
            type="button"
            className="update-banner"
            onClick={() => openLatestApk()}
          >
            Update available (1.0.{update.build}) — tap to update
          </button>
        ) : null}
        {settings.demoDataEnabled ? (
          <p className="demo-banner" role="status">
            Demo data is visible. It is marked and can be removed in Settings.
          </p>
        ) : null}
        <AppHeader route={route} onNavigate={navigate} />
        <main id="main">
          {!ready ? (
            <p className="loading">Opening your diary…</p>
          ) : route.view === "home" ? (
            <HomeView onNavigate={navigate} />
          ) : route.view === "capture" ? (
            <CaptureView onNavigate={navigate} />
          ) : route.view === "memories" ? (
            <MemoriesView route={route} onNavigate={navigate} />
          ) : route.view === "montages" ? (
            <MontagesView />
          ) : (
            <SettingsView update={update} onCheck={() => void checkForUpdate().then(setUpdate)} />
          )}
        </main>
        <BottomNav route={route} onNavigate={navigate} />
      </div>
      <Overlays onNavigate={navigate} />
    </div>
  );
}
