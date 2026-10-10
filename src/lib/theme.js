import { useCallback, useState } from "react";
import { THEMES } from "../terminal/commands";

const current = () => {
  const t = document.documentElement.dataset.theme;
  return THEMES.includes(t) ? t : THEMES[0];
};

// index.html sets data-theme before first paint; this hook keeps it in sync.
export function useTheme() {
  const [theme, setThemeState] = useState(current);

  const setTheme = useCallback((next) => {
    document.documentElement.dataset.theme = next;
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      "content",
      getComputedStyle(document.documentElement).getPropertyValue("--bg").trim()
    );
    try {
      sessionStorage.setItem("theme", next);
    } catch {
      // Storage unavailable (private mode); the theme still applies for this visit.
    }
    setThemeState(next);
  }, []);

  return [theme, setTheme];
}
