"use client";

import { useTheme } from "@/components/layout/ThemeProvider";
import { CelestialBackdrop } from "@/components/celestial/CelestialBackdrop";

/**
 * Sitewide entry point for the "full effect" decorative treatment (the
 * astrolabe backdrop + outer ornate frame, ported from /celestial — see
 * docs/design-system.md for which pages qualify as full-effect vs the
 * subtler tier). Reuses CelestialBackdrop verbatim rather than a second
 * copy — it already reads colour through the --celestial-* custom
 * properties, which now resolve under the sitewide .dark/.light classes
 * too (see globals.css), so it renders correctly here without any
 * changes to that component itself.
 *
 * The `key={theme}` remount is required, not decorative: CelestialBackdrop
 * (and every full-effect page that uses bg-[var(--celestial-*)]-style
 * arbitrary-bracket Tailwind classes) hits the same Chromium
 * style-invalidation gap documented in CelestialThemeProvider.tsx — an
 * ancestor class toggle (.dark <-> .light) does NOT repaint an existing
 * node's arbitrary-bracket var() background/border, only fresh DOM does.
 * The sitewide ThemeProvider's toggle mechanism was previously proven
 * safe for the REST of the site (docs/design-system.md's Theme
 * switching section) specifically because the rest of the site only
 * used named-token utilities (bg-bg/95 etc.), not raw var()-in-brackets.
 * These new full-effect components reintroduce that pattern, so they
 * need the same remount workaround /celestial itself already uses.
 *
 * tier="subtle" is a placeholder — no subtler background exists yet
 * (the user is supplying one separately for detail/slug pages); it
 * renders nothing for now rather than guessing at a design.
 */
export function PageBackdrop({ tier }: { tier: "full" | "subtle" }) {
  const { theme } = useTheme();

  if (tier === "subtle") return null;

  return (
    <div key={theme}>
      <CelestialBackdrop />
    </div>
  );
}
