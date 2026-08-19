import type { Metadata } from "next";
import { Bebas_Neue, Crimson_Pro, Space_Mono } from "next/font/google";
import "./globals.css";
import { client } from "@/sanity/lib/client";
import { SITE_SETTINGS_QUERY } from "@/sanity/lib/queries";
import type { SiteSettings } from "@/sanity/lib/types";
import { buildMetadata } from "@/lib/metadata";
import { ThemeProvider, THEME_INIT_SCRIPT } from "@/components/layout/ThemeProvider";
import { Nav } from "@/components/layout/Nav";
import { ToastHost } from "@/components/ui/Toast";
import { OrganizationStructuredData } from "@/components/seo/OrganizationStructuredData";

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  weight: "400",
  subsets: ["latin"],
});

const crimsonPro = Crimson_Pro({
  variable: "--font-crimson-pro",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
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
      className={`${bebasNeue.variable} ${crimsonPro.variable} ${spaceMono.variable} dark h-full antialiased`}
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
      </body>
    </html>
  );
}
