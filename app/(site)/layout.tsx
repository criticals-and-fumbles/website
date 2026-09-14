import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Cinzel, EB_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { client } from "@/sanity/lib/client";
import { SITE_SETTINGS_QUERY } from "@/sanity/lib/queries";
import type { SiteSettings } from "@/sanity/lib/types";
import { buildMetadata } from "@/lib/metadata";
import { ThemeProvider, THEME_INIT_SCRIPT } from "@/components/layout/ThemeProvider";
import { Nav } from "@/components/layout/Nav";
import { ToastHost } from "@/components/ui/Toast";
import { OrganizationStructuredData } from "@/components/seo/OrganizationStructuredData";

// 2026-09-15: switched from Bebas Neue/Crimson Pro/Space Mono to the
// celestial design system's fonts (see docs/design-system.md) — this
// is now the sitewide default, not just /celestial's own preview
// route. next/font/google bakes these into the build output at build
// time (no runtime request to fonts.googleapis.com), so this needs no
// self-hosting workaround despite the CSP that blocks a direct Google
// Fonts <link> — same reason the previous 3 fonts never needed one
// either. --font-bebas-neue/--font-crimson-pro/--font-space-mono are
// kept as the CSS variable NAMES (globals.css's @theme inline block
// still maps font-display/font-body/font-ui through these) to avoid
// touching that indirection for no functional reason; only the actual
// font loaded into each variable — and which role it fills — changed.
// Role mapping matches /celestial's own usage: EB Garamond for
// headings (font-display), Plus Jakarta Sans for body copy (the
// default body font), Cinzel for nav links/badges/buttons/small UI
// labels (font-ui) — NOT the reverse; Cinzel is a decorative caps
// face suited to short label text, not paragraph headings.
const ebGaramond = EB_Garamond({
  variable: "--font-bebas-neue",
  weight: ["400", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-crimson-pro",
  weight: ["300", "400", "500"],
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-space-mono",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
  ...buildMetadata({
    title: "Criticals and Fumbles",
    description:
      "Singapore's tabletop RPG community since 2016. Find games, campaigns, " +
      "and a table that feels like home.",
    path: "/",
  }),
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const siteSettings = await client.fetch<SiteSettings | null>(SITE_SETTINGS_QUERY);
  const sameAs = [
    ...(siteSettings?.socialLinks
      ?.filter((link) => link.url)
      .map((link) => link.url) ?? []),
    ...(siteSettings?.discordUrl ? [siteSettings.discordUrl] : []),
  ];
  const facebookUrl = siteSettings?.socialLinks?.find(
    (l) => l.platform === "Facebook",
  )?.url;
  const instagramUrl = siteSettings?.socialLinks?.find(
    (l) => l.platform === "Instagram",
  )?.url;
  const whatsappUrl = siteSettings?.socialLinks?.find(
    (l) => l.platform === "WhatsApp",
  )?.url;

  return (
    <html
      lang="en"
      className={`${ebGaramond.variable} ${plusJakartaSans.variable} ${cinzel.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Runs before hydration to avoid a flash of the wrong theme. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <OrganizationStructuredData sameAs={sameAs} />
      </head>
      <body className="min-h-full flex flex-col bg-bg text-text" suppressHydrationWarning>
        <ThemeProvider>
          <Nav
            facebookUrl={facebookUrl}
            instagramUrl={instagramUrl}
            discordUrl={siteSettings?.discordUrl}
            whatsappUrl={whatsappUrl}
          />
          {/* Each page renders its own <Footer> at the end of its JSX (see
              components/layout/Footer.tsx) so it can pass that page's
              Sanity-driven `pageFooterCTA` content through. */}
          <main className="flex-1 flex flex-col">{children}</main>
          <ToastHost />
        </ThemeProvider>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID ?? "G-JS983LB341"} />
      </body>
    </html>
  );
}
