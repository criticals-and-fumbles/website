"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "celestial-theme";
type Theme = "dark" | "light";

/** Kept in sync with this file's own anti-flash script usage in
 * app/celestial/layout.tsx — same "read before paint" reasoning as the
 * sitewide ThemeProvider's THEME_INIT_SCRIPT, just scoped to this
 * route's own `celestial-light` class instead of the sitewide
 * `dark`/`light` ones (this route isn't wrapped in the real
 * ThemeProvider — see layout.tsx's header comment for why). Default is
 * dark, matching the original code.html mockup's own design intent;
 * light is the toggle-to option, not the default. */
export const CELESTIAL_THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("${STORAGE_KEY}");
    if (stored === "light") {
      document.documentElement.classList.add("celestial-light");
    }
  } catch (e) {}
})();
`;

const CelestialThemeContext = createContext<{ theme: Theme; toggleTheme: () => void } | undefined>(
  undefined,
);

/**
 * Wraps the whole themed subtree (backdrop + nav + page content — see
 * app/celestial/layout.tsx) and remounts it, via a `key={theme}` on the
 * inner div, every time the theme changes — this is a real fix, not a
 * workaround like the previous reload-based toggle was.
 *
 * Root cause (found via direct testing, both in `next dev` and a
 * production build): adding/removing a class on <html> updates every
 * --celestial-* custom property's own computed value correctly at
 * every level (confirmed via getComputedStyle on ancestors AND the
 * affected element itself) — but an EXISTING element whose background/
 * border comes from a Tailwind arbitrary-value class referencing one
 * of those properties doesn't repaint; it stays frozen at whatever
 * value it resolved on first paint. Proven two ways: (1) toggling an
 * unrelated class on that SAME element (forcing Chromium to recompute
 * its style) immediately shows the correct new colour, and (2) a
 * BRAND NEW element created fresh after the toggle, with the exact
 * same class, renders with the correct colour immediately — no nudge
 * needed. That's a Chromium style-invalidation gap specific to
 * ancestor-triggered custom-property changes reaching var()-in-
 * arbitrary-value declarations on existing nodes; it doesn't reproduce
 * in a minimal test page with only a handful of rules, only in this
 * route's real stylesheet, and forcing a reflow (even on every element
 * on the page) does not fix it — only creating fresh DOM does. Since
 * remounting via `key` is exactly "throw away the old DOM, create it
 * fresh," it sidesteps the bug entirely rather than working around it
 * with a full page reload.
 */
export function CelestialThemeProvider({ children }: { children: ReactNode }) {
  // Starts "dark" to match the server-rendered markup (no `celestial-light`
  // class until the anti-flash script or this effect runs) — avoids a
  // hydration mismatch, then syncs to whatever the anti-flash script
  // already applied on mount, same pattern as the sitewide ThemeProvider.
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const isLight = document.documentElement.classList.contains("celestial-light");
    // Syncing from the DOM class the anti-flash script already applied,
    // unavailable during SSR — same reasoning/precedent as the sitewide
    // ThemeProvider.tsx's own mount-time sync.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(isLight ? "light" : "dark");
  }, []);

  function toggleTheme() {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("celestial-light", next === "light");
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // localStorage can throw in private-browsing/blocked-storage
        // contexts — the toggle still works for this page view, it just
        // won't persist across a real reload.
      }
      return next;
    });
  }

  return (
    <CelestialThemeContext.Provider value={{ theme, toggleTheme }}>
      <div key={theme}>{children}</div>
    </CelestialThemeContext.Provider>
  );
}

export function useCelestialTheme() {
  const ctx = useContext(CelestialThemeContext);
  if (!ctx) throw new Error("useCelestialTheme must be used within CelestialThemeProvider");
  return ctx;
}
