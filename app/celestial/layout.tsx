import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/app/(site)/globals.css";
import "./celestial.css";
import { client } from "@/sanity/lib/client";
import { SITE_SETTINGS_QUERY } from "@/sanity/lib/queries";
import type { SiteSettings } from "@/sanity/lib/types";
import { CelestialBackdrop } from "@/components/celestial/CelestialBackdrop";
import { CelestialNav } from "@/components/celestial/CelestialNav";
import {
  CELESTIAL_THEME_INIT_SCRIPT,
  CelestialThemeProvider,
} from "@/components/celestial/CelestialThemeProvider";

/**
 * Standalone root layout for the /celestial preview route — same
 * isolation pattern the earlier (now-scrapped) /lobby preview used: its
 * own <html>, not nested under app/(site)/layout.tsx, so this can't
 * affect the live homepage or any other route.
 *
 * Light/dark toggle (2026-09-14): NOT the sitewide ThemeProvider/
 * ThemeToggle — this route has its own `celestial-light` class instead
 * of the sitewide `dark`/`light` ones (see globals.css's `.celestial`
 * comment for why: those tokens hold this route's whole separate
 * palette, not an override of the site's own). CELESTIAL_THEME_INIT_SCRIPT
 * runs before hydration, same anti-flash reasoning as the sitewide
 * THEME_INIT_SCRIPT. CelestialThemeProvider wraps the backdrop + nav +
 * page content together and remounts that whole subtree on toggle — see
 * that file's own comment for the real Chromium invalidation bug this
 * works around (a live class toggle alone silently leaves existing
 * elements' colours frozen; fresh DOM doesn't have that problem).
 *
 * Fonts: self-hosted (public/fonts/*.woff2, downloaded from Google
 * Fonts' own CDN — this site's CSP blocks fonts.googleapis.com directly,
 * same constraint hit building the Wiki Restructure Kit pages). Each is
 * a genuine variable font (confirmed: Google served the identical woff2
 * URL for every requested weight of a given family), so one file per
 * family covers the whole weight range the mockup uses — except EB
 * Garamond, which needs a second file for italic (next/font/local's
 * `src` array handles both weight and style per file).
 */
const cinzel = localFont({
  src: "../../public/fonts/cinzel-variable.woff2",
  variable: "--font-celestial-cinzel",
  weight: "400 700",
  display: "swap",
});

const ebGaramond = localFont({
  src: [
    { path: "../../public/fonts/eb-garamond-variable.woff2", weight: "400 700", style: "normal" },
    { path: "../../public/fonts/eb-garamond-italic-variable.woff2", weight: "400 700", style: "italic" },
  ],
  variable: "--font-celestial-eb-garamond",
  display: "swap",
});

const plusJakartaSans = localFont({
  src: "../../public/fonts/plus-jakarta-sans-variable.woff2",
  variable: "--font-celestial-plus-jakarta",
  weight: "300 500",
  display: "swap",
});

const spaceGrotesk = localFont({
  src: "../../public/fonts/space-grotesk-variable.woff2",
  variable: "--font-celestial-space-grotesk",
  weight: "400 700",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Criticals and Fumbles — Celestial Preview",
  robots: { index: false, follow: false },
};

export default async function CelestialLayout({ children }: { children: React.ReactNode }) {
  const siteSettings = await client.fetch<SiteSettings | null>(SITE_SETTINGS_QUERY);
  const facebookUrl = siteSettings?.socialLinks?.find((l) => l.platform === "Facebook")?.url;
  const instagramUrl = siteSettings?.socialLinks?.find((l) => l.platform === "Instagram")?.url;
  const whatsappUrl = siteSettings?.socialLinks?.find((l) => l.platform === "WhatsApp")?.url;

  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${ebGaramond.variable} ${plusJakartaSans.variable} ${spaceGrotesk.variable} celestial h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: CELESTIAL_THEME_INIT_SCRIPT }} />
      </head>
      <body className="celestial-page min-h-full w-full relative overflow-x-hidden" suppressHydrationWarning>
        <CelestialThemeProvider>
          <CelestialBackdrop />
          <div className="relative z-10 min-h-screen flex flex-col justify-between px-5 sm:px-10 md:px-16 pt-6 pb-12 max-w-[1720px] mx-auto">
            <CelestialNav
              facebookUrl={facebookUrl}
              instagramUrl={instagramUrl}
              discordUrl={siteSettings?.discordUrl}
              whatsappUrl={whatsappUrl}
            />
            {children}
          </div>
        </CelestialThemeProvider>
      </body>
    </html>
  );
}
