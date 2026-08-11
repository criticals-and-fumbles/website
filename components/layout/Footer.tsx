import Image from "next/image";
import Link from "next/link";
import type { PortableTextBlock } from "sanity";
import { client } from "@/sanity/lib/client";
import { SITE_SETTINGS_QUERY } from "@/sanity/lib/queries";
import { Renderer } from "@/components/portable-text/Renderer";

const QUICK_NAV = [
  { label: "About", href: "/about" },
  { label: "Events", href: "/events" },
  { label: "Wiki", href: "/wiki" },
  { label: "Team", href: "/team" },
  { label: "Resources", href: "/resources" },
  { label: "Gallery", href: "/gallery" },
];

interface SocialLink {
  platform: string;
  url: string;
}

interface SiteSettings {
  title?: string;
  shortDescription?: string;
  discordUrl?: string;
  discordServerName?: string;
  contactEmail?: string;
  socialLinks?: SocialLink[];
  copyrightLine?: string;
  footerNavLinks?: { label: string; url: string }[];
}

export async function Footer({
  pageFooterCTA,
}: {
  pageFooterCTA?: PortableTextBlock[] | null;
}) {
  const settings = await client.fetch<SiteSettings | null>(
    SITE_SETTINGS_QUERY,
  );

  return (
    <>
      {pageFooterCTA && pageFooterCTA.length > 0 && (
        <section className="bg-bg-forest px-4 py-16 text-on-forest md:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Renderer value={pageFooterCTA} />
          </div>
        </section>
      )}

      <footer className="border-t border-border bg-bg px-4 py-12 md:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Criticals and Fumbles logo"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
              <span className="font-ui text-sm text-text">
                {settings?.title ?? "Criticals and Fumbles"}
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-text-muted">
              {settings?.shortDescription}
            </p>
            <p className="mt-4 font-ui text-xs">
              <span className="text-emerald">Community</span>
              {" · "}
              <span className="text-amber">Collaboration</span>
              {" · "}
              <span className="text-magenta">Sincerity</span>
            </p>
          </div>

          <div>
            <h3 className="font-ui text-sm uppercase tracking-wider text-text-muted">
              Quick Nav
            </h3>
            <ul className="mt-4 space-y-2">
              {QUICK_NAV.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text transition-colors hover:text-emerald"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {settings?.footerNavLinks?.map((link) => (
                <li key={link.url}>
                  <Link
                    href={link.url}
                    className="text-sm text-text transition-colors hover:text-emerald"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="https://cnf-website.sanity.studio"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-text-muted transition-colors hover:text-emerald"
                >
                  Studio
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-ui text-sm uppercase tracking-wider text-text-muted">
              Connect
            </h3>
            {settings?.discordUrl && (
              <a
                href={settings.discordUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex min-h-[44px] items-center rounded-md bg-emerald px-4 py-2 font-ui text-sm text-bg transition-opacity hover:opacity-90"
              >
                Join us on Discord
              </a>
            )}
            {settings?.socialLinks && settings.socialLinks.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {settings.socialLinks.map((link) => (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-border px-3 py-1 font-ui text-xs text-text-muted transition-colors hover:border-emerald hover:text-emerald"
                  >
                    {link.platform}
                  </a>
                ))}
              </div>
            )}
            {/* contactEmail intentionally not rendered here — Discord is
                the funnel's actual conversion point (see CLAUDE.md § Site
                purpose). The field, and its value in Sanity, are untouched;
                this is a display-only change. */}
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-2 border-t border-border pt-6 text-xs text-text-muted md:flex-row md:justify-between">
          <span>
            {settings?.copyrightLine ??
              `© ${new Date().getFullYear()} Criticals and Fumbles. All rights reserved.`}
          </span>
          <span>Built with 🎲 by C&amp;F</span>
        </div>
      </footer>
    </>
  );
}
