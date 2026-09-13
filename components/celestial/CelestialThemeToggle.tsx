"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "celestial-theme";

/** Kept in sync with the inline anti-flash script in app/celestial/
 * layout.tsx — same "read before paint" reasoning as the sitewide
 * ThemeProvider's THEME_INIT_SCRIPT, just scoped to this one route's
 * own `celestial-light` class instead of the sitewide `dark`/`light`
 * classes (this route isn't wrapped in the real ThemeProvider — see
 * app/celestial/layout.tsx's header comment for why). Default is dark,
 * matching the original code.html mockup's own design intent; light is
 * the toggle-to option, not the default. */
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

export function CelestialThemeToggle({ className = "" }: { className?: string }) {
  // Starts "dark" to match the server-rendered markup (no `celestial-light`
  // class until the anti-flash script or this effect runs) — avoids a
  // hydration mismatch, then syncs to whatever the anti-flash script
  // already applied on mount, same pattern as ThemeProvider.tsx.
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const isLight = document.documentElement.classList.contains("celestial-light");
    // Syncing from the DOM class the anti-flash script already applied,
    // unavailable during SSR — same reasoning/precedent as
    // ThemeProvider.tsx's own mount-time sync.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(isLight ? "light" : "dark");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    // A live in-place class toggle was the first approach here, and it's
    // how the sitewide dark/light toggle actually works — but it doesn't
    // work for THIS route. Tested and confirmed (both in `next dev` and
    // a production build): every element whose background/border comes
    // from a Tailwind arbitrary-value class referencing one of this
    // route's --celestial-* custom properties (bg-[var(--celestial-
    // surface-95)] etc.) freezes at whatever value it had on first
    // paint and never repaints when `celestial-light` is added/removed
    // on <html> later — even though the custom property's own computed
    // value updates correctly at every level, confirmed via
    // getComputedStyle. A full reload doesn't have this problem (see
    // the CELESTIAL_THEME_INIT_SCRIPT anti-flash script below, which
    // runs before paint) — so that's what this does, rather than
    // shipping a toggle that only visibly updates SOME of the page.
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Falls through to the reload regardless — the class won't
      // persist, but this page view still reflects the new theme.
    }
    window.location.reload();
  }

  // Sizing lives on the button itself (h-4 w-4, matching the social
  // icon anchors exactly); `className` only ever carries the divider/
  // spacing classes from CelestialNav — those used to be merged onto
  // this SAME element, and `pl-5`'s padding-left ate the entire
  // border-box width budget of a fixed w-4 button, silently collapsing
  // the SVG to 0px wide (invisible, not just small). Splitting them
  // into a wrapping div fixes that the same way CelestialSocialLinks
  // already does it — the divider/padding go on the wrapper, sizing
  // stays on the icon.
  return (
    <div className={className}>
      <button
        type="button"
        onClick={toggle}
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        className="h-4 w-4 text-[var(--celestial-ink-muted)] transition-colors hover:text-gold-500"
      >
        {theme === "dark" ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-full w-full" aria-hidden="true">
            <circle cx="12" cy="12" r="4.5" />
            <path strokeLinecap="round" d="M12 2.5v2.5M12 19v2.5M4.4 4.4l1.8 1.8M17.8 17.8l1.8 1.8M2.5 12H5M19 12h2.5M4.4 19.6l1.8-1.8M17.8 6.2l1.8-1.8" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-full w-full">
            <path d="M20.5 14.5a8.5 8.5 0 1 1-9-11.9 7 7 0 0 0 9 11.9Z" />
          </svg>
        )}
      </button>
    </div>
  );
}
