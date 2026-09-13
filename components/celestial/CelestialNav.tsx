"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FacebookIcon, InstagramIcon, DiscordIcon, WhatsAppIcon } from "@/components/icons/SocialIcons";
import { CelestialThemeToggle } from "@/components/celestial/CelestialThemeToggle";

/**
 * Floating pill nav — a genuinely different SHAPE from the sitewide
 * Nav.tsx (rounded-full floating bar vs. full-width bordered header),
 * not just a re-colour, so this is a dedicated component for this one
 * preview rather than a theme variant of Nav.tsx (see this session's
 * review: Part B's "reuse Nav.tsx" guidance applied to the old /lobby
 * preview, which only needed re-colouring — this mockup's nav shape
 * itself is a structural change that can't be done via CSS variables
 * alone). Real routes, not the mockup's anchor links, except FEED which
 * legitimately points at this same page's own Live Grimoire section.
 * Search/account icons from the mockup are dropped — neither has a real
 * feature behind it on this site (no global search, no user accounts).
 *
 * The mockup itself had no mobile nav at all (just the same link row,
 * unresponsive) — added a basic drawer here since shipping zero mobile
 * navigation would be a real regression, not a faithful port of a gap
 * the mockup never addressed.
 */
const NAV_LINKS = [
  { label: "Home", href: "/celestial" },
  { label: "Campaigns", href: "https://campaigns.criticalsandfumbles.com", external: true },
  { label: "Events", href: "/events" },
  { label: "Chronicles", href: "/articles" },
  { label: "Feed", href: "#living-grimoire" },
  { label: "Worlds", href: "/wiki" },
  { label: "About", href: "/about" },
];

const SOCIAL_ICONS = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  discord: DiscordIcon,
  whatsapp: WhatsAppIcon,
} as const;

/** Same 4 platforms Nav.tsx's own SocialLinks shows, same real
 * siteSettings/discordUrl data — just restyled (gold, smaller) to match
 * this pill nav rather than reusing that component's markup, since
 * CelestialNav is already a from-scratch component (see file header). */
function CelestialSocialLinks({
  facebookUrl,
  instagramUrl,
  discordUrl,
  whatsappUrl,
  className = "",
}: {
  facebookUrl?: string;
  instagramUrl?: string;
  discordUrl?: string;
  whatsappUrl?: string;
  className?: string;
}) {
  const links = [
    { platform: "facebook" as const, url: facebookUrl, label: "Facebook" },
    { platform: "instagram" as const, url: instagramUrl, label: "Instagram" },
    { platform: "discord" as const, url: discordUrl, label: "Discord" },
    { platform: "whatsapp" as const, url: whatsappUrl, label: "WhatsApp Community" },
  ].filter((l) => l.url);

  if (links.length === 0) return null;

  return (
    <div className={`flex items-center gap-3.5 ${className}`}>
      {links.map(({ platform, url, label }) => {
        const Icon = SOCIAL_ICONS[platform];
        return (
          <a
            key={platform}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="h-4 w-4 text-[var(--celestial-gold-400-80)] transition-colors hover:text-gold-200"
          >
            <Icon />
          </a>
        );
      })}
    </div>
  );
}

function NavLink({ link, onClick }: { link: (typeof NAV_LINKS)[number]; onClick?: () => void }) {
  if (link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className="text-[var(--celestial-ink-muted)] hover:text-gold-500 transition-colors py-1"
      >
        {link.label.toUpperCase()}
      </a>
    );
  }
  return (
    <Link href={link.href} onClick={onClick} className="text-[var(--celestial-ink-muted)] hover:text-gold-500 transition-colors py-1">
      {link.label.toUpperCase()}
    </Link>
  );
}

export function CelestialNav({
  facebookUrl,
  instagramUrl,
  discordUrl,
  whatsappUrl,
}: {
  facebookUrl?: string;
  instagramUrl?: string;
  discordUrl?: string;
  whatsappUrl?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full pt-1 sticky top-3 z-40">
      <div className="w-full max-w-[1460px] mx-auto relative rounded-full bg-[var(--celestial-surface-90)] backdrop-blur-md border border-[#d4af37]/40 px-6 py-2.5 shadow-[0_4px_25px_rgba(0,0,0,0.85)] flex items-center justify-between">
        <div className="absolute inset-[3px] rounded-full border border-[#d4af37]/20 pointer-events-none" />

        <Link href="/celestial" className="flex items-center gap-3.5 group">
          <Image
            src="/logo.png"
            alt="Criticals and Fumbles logo"
            width={32}
            height={32}
            className="h-8 w-auto"
            priority
          />
          <span className="font-cinzel tracking-[0.24em] text-sm md:text-[15px] font-semibold text-gold-300 group-hover:text-yellow-200 transition-colors uppercase">
            Criticals &amp; Fumbles
          </span>
        </Link>

        <nav aria-label="Main Menu" className="hidden lg:flex items-center gap-6 xl:gap-9 font-cinzel text-xs tracking-[0.18em] font-medium">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.label} link={link} />
          ))}
          <CelestialSocialLinks
            facebookUrl={facebookUrl}
            instagramUrl={instagramUrl}
            discordUrl={discordUrl}
            whatsappUrl={whatsappUrl}
            className="border-l border-[var(--celestial-gold-500-30)] pl-5"
          />
          <CelestialThemeToggle className="border-l border-[var(--celestial-gold-500-30)] pl-5" />
        </nav>

        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="lg:hidden flex h-9 w-9 items-center justify-center text-gold-300"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
            <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/70"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed top-0 right-0 z-50 flex h-full w-[280px] flex-col items-end gap-5 border-l border-[#d4af37]/30 bg-[var(--celestial-surface)] p-6">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="mb-4 text-xl text-gold-300"
            >
              ✕
            </button>
            {NAV_LINKS.map((link) => (
              <NavLink key={link.label} link={link} onClick={() => setOpen(false)} />
            ))}
            <CelestialSocialLinks
              facebookUrl={facebookUrl}
              instagramUrl={instagramUrl}
              discordUrl={discordUrl}
              whatsappUrl={whatsappUrl}
              className="mt-4 border-t border-[var(--celestial-gold-500-20)] pt-5"
            />
            <CelestialThemeToggle className="mt-4" />
          </div>
        </>
      )}
    </header>
  );
}
