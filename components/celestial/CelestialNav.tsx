"use client";

import { useState } from "react";
import Link from "next/link";

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

function NavLink({ link, onClick }: { link: (typeof NAV_LINKS)[number]; onClick?: () => void }) {
  if (link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className="text-gray-300 hover:text-gold-300 transition-colors py-1"
      >
        {link.label.toUpperCase()}
      </a>
    );
  }
  return (
    <Link href={link.href} onClick={onClick} className="text-gray-300 hover:text-gold-300 transition-colors py-1">
      {link.label.toUpperCase()}
    </Link>
  );
}

export function CelestialNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full pt-1 sticky top-3 z-40">
      <div className="w-full max-w-[1460px] mx-auto relative rounded-full bg-[#040b12]/90 backdrop-blur-md border border-[#d4af37]/40 px-6 py-2.5 shadow-[0_4px_25px_rgba(0,0,0,0.85)] flex items-center justify-between">
        <div className="absolute inset-[3px] rounded-full border border-[#d4af37]/20 pointer-events-none" />

        <Link href="/celestial" className="flex items-center gap-3.5 group">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <svg
              className="w-full h-full text-[#eab308] fill-none stroke-current stroke-[1.4] transition-transform duration-500 group-hover:rotate-45"
              viewBox="0 0 40 40"
              aria-hidden="true"
            >
              <circle cx="20" cy="20" opacity="0.75" r="16" strokeWidth="1.2" />
              <circle cx="20" cy="20" opacity="0.6" r="11" strokeDasharray="2 2" strokeWidth="0.8" />
              <path d="M20 2 L23 17 L38 20 L23 23 L20 38 L17 23 L2 20 L17 17 Z" fill="#d4af37" fillOpacity="0.3" stroke="#eab308" strokeWidth="1.2" />
              <circle cx="20" cy="20" fill="#fff" r="2.2" stroke="none" />
            </svg>
          </div>
          <span className="font-cinzel tracking-[0.24em] text-sm md:text-[15px] font-semibold text-gold-300 group-hover:text-yellow-200 transition-colors uppercase">
            Criticals &amp; Fumbles
          </span>
        </Link>

        <nav aria-label="Main Menu" className="hidden lg:flex items-center gap-6 xl:gap-9 font-cinzel text-xs tracking-[0.18em] font-medium">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.label} link={link} />
          ))}
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
          <div className="fixed top-0 right-0 z-50 flex h-full w-[280px] flex-col items-end gap-5 border-l border-[#d4af37]/30 bg-[#03080c] p-6">
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
          </div>
        </>
      )}
    </header>
  );
}
