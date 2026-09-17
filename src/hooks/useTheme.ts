import { useEffect } from "react";
import type { ThemePreference } from "../lib/types";

export function useTheme(theme: ThemePreference) {
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const resolved = theme === "system" ? (prefersDark ? "dark" : "light") : theme;
      root.dataset.theme = resolved;
      const color = resolved === "dark" ? "#161310" : "#f6f1e8";
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", color);
    };
    apply();
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);
}
