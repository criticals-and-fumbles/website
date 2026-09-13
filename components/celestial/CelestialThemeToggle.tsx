"use client";

import { useCelestialTheme } from "@/components/celestial/CelestialThemeProvider";

/** Sun/moon icon button — same box size as the social icon anchors
 * (h-4 w-4, SVG fills it via h-full w-full) so it sits at matching
 * size in the nav. Sizing lives on the button itself; `className` only
 * ever carries divider/spacing classes from CelestialNav (see that
 * file) — keeping those separate matters here: an earlier version had
 * them merged onto this same fixed-width element, and the divider's
 * padding-left ate the button's entire border-box width budget,
 * silently collapsing the icon to 0px wide. */
export function CelestialThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useCelestialTheme();

  return (
    <div className={className}>
      <button
        type="button"
        onClick={toggleTheme}
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
