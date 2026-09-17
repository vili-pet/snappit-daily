import { useEffect, useState } from "react";
import { parseHash, toHash, type Route } from "../lib/route";

export function useHashRoute() {
  const [route, setRoute] = useState<Route>(() =>
    typeof window === "undefined" ? { view: "capture" } : parseHash(window.location.hash),
  );

  useEffect(() => {
    if (!window.location.hash) {
      window.location.hash = "#/";
    }
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return {
    route,
    navigate: (next: Route) => {
      window.location.hash = toHash(next);
    },
  };
}
