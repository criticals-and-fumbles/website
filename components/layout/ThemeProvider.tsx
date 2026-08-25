"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "cnf-theme";
// localStorage is strictly origin-scoped (campaigns.criticalsandfumbles.com
// can't read www's localStorage even with a matching key), so a shared
// theme choice needs a cookie scoped to the parent domain instead — this
// is what campaigns' server-rendered pages read to pick their initial
// data-theme attribute. Same key name as STORAGE_KEY for clarity, but
// they're two different mechanisms kept in sync, not the same store.
const COOKIE_NAME = "cnf-theme";
const COOKIE_DOMAIN = "criticalsandfumbles.com";

/** Kept in sync with the inline anti-flash script in app/layout.tsx. */
export const THEME_INIT_SCRIPT = `
(function () {
  try {
    var cookieMatch = document.cookie.match(/(?:^|; )${COOKIE_NAME}=(dark|light)/);
    var stored = (cookieMatch && cookieMatch[1]) || localStorage.getItem("${STORAGE_KEY}");
    var theme = stored || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(theme);
  } catch (e) {}
})();
`;

function applyThemeClass(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  root.classList.add(theme);
}

/** Shared with campaigns.criticalsandfumbles.com via the parent-domain
 * cookie scope — Secure is dropped automatically by the browser over
 * plain http (local dev), degrading gracefully to localStorage-only. */
function writeThemeCookie(theme: Theme) {
  document.cookie = `${COOKIE_NAME}=${theme}; domain=.${COOKIE_DOMAIN}; path=/; max-age=31536000; SameSite=Lax; Secure`;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const cookieMatch = document.cookie.match(
      new RegExp(`(?:^|; )${COOKIE_NAME}=(dark|light)`),
    );
    const stored =
      (cookieMatch?.[1] as Theme | undefined) ??
      (window.localStorage.getItem(STORAGE_KEY) as Theme | null) ??
      undefined;
    const initial =
      stored ??
      (window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark");
    // Syncing from localStorage/matchMedia, both unavailable during SSR — an
    // initial-render lazy state initializer would mismatch the server HTML
    // and trigger a hydration error instead. This one extra render on mount
    // is the correct tradeoff.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(initial);
    applyThemeClass(initial);
    // Backfills the shared cookie for visitors who already had a
    // localStorage preference from before cross-subdomain sync existed —
    // otherwise campaigns wouldn't see their choice until they toggled
    // again here.
    if (!cookieMatch) writeThemeCookie(initial);
  }, []);

  function toggleTheme() {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      window.localStorage.setItem(STORAGE_KEY, next);
      writeThemeCookie(next);
      applyThemeClass(next);
      return next;
    });
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
