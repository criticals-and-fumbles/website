import type { Metadata } from "next";
import { Bebas_Neue, Crimson_Pro, Space_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider, THEME_INIT_SCRIPT } from "@/components/layout/ThemeProvider";
import { Nav } from "@/components/layout/Nav";
import { ToastHost } from "@/components/ui/Toast";

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
  title: "Criticals and Fumbles",
  description: "Singapore's most chaotic tabletop RPG community.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${crimsonPro.variable} ${spaceMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Runs before hydration to avoid a flash of the wrong theme. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-bg text-text" suppressHydrationWarning>
        <ThemeProvider>
          <Nav />
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
