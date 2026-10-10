import { useCallback, useState } from "react";

// index.html sets data-theme before first paint; this hook keeps it in sync.
export function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || "dark");

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem("theme", next);
      } catch {
        // Storage unavailable (private mode); the theme still applies for this visit.
      }
      return next;
    });
  }, []);

  return [theme, toggle];
}
