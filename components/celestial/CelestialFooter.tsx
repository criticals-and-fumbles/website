"use client";

import { useState } from "react";
import Link from "next/link";
import type { SiteSettings } from "@/sanity/lib/types";
import { showToast } from "@/components/ui/Toast";

const NAV_LINKS = [
  { label: "Home", href: "/celestial" },
  { label: "Events", href: "/events" },
  { label: "Worlds", href: "/wiki" },
  { label: "Chronicles", href: "/articles" },
  { label: "About", href: "/about" },
];

/** Footer — reuses real siteSettings (newsletterName/Description,
 * socialLinks, discordUrl, footerNavLinks, copyrightLine). The
 * newsletter form follows the exact same pattern as the site's existing
 * (currently-hidden) NewsletterStrip component: shows a "coming soon"
 * toast instead of pretending to submit anywhere, since this project
 * has no email-list backend yet (see CLAUDE.md — "No newsletter/email
 * integrations yet"). Not an import from NewsletterStrip itself (kept
 * this preview self-contained), just the same honest behaviour. */
export function CelestialFooter({ siteSettings }: { siteSettings: SiteSettings | null }) {
  const [email, setEmail] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    showToast("Coming soon — newsletter signup isn't live yet!");
    setEmail("");
  }

  const socialEntries = (siteSettings?.socialLinks ?? []).filter((l) => l.url);
  const discordUrl = siteSettings?.discordUrl;

  return (
    <footer className="w-full pt-16 pb-8 border-t border-gold-500/20 text-[var(--celestial-ink-muted)] relative mt-10">
      <div className="max-w-[1460px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-gold-500/15">
        <div className="md:col-span-6 flex flex-col items-start pr-0 md:pr-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 text-gold-400">
              <svg className="w-full h-full fill-none stroke-current stroke-[1.6]" viewBox="0 0 40 40" aria-hidden="true">
                <circle cx="20" cy="20" r="16" />
                <path d="M20 2 L23 17 L38 20 L23 23 L20 38 L17 23 L2 20 L17 17 Z" fill="#d4af37" fillOpacity="0.3" />
              </svg>
            </div>
            <span className="font-cinzel tracking-[0.22em] text-base font-bold text-gold-300 uppercase">
              Criticals &amp; Fumbles
            </span>
          </div>
          <p className="font-serif text-base text-[var(--celestial-ink-muted)]/80 mb-6 max-w-md leading-relaxed">
            {siteSettings?.shortDescription ??
              "An indie TTRPG collective weaving cosmic wonder, grounded roleplay, and community-driven storytelling into living campaign universes."}
          </p>
          <form onSubmit={handleSubmit} className="w-full max-w-md">
            <label className="block font-cinzel text-xs tracking-[0.18em] text-gold-300 uppercase mb-2">
              {siteSettings?.newsletterName ?? "Subscribe to the Celestial Astrolabe"}
            </label>
            <div className="flex items-center relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your arcane email..."
                className="w-full bg-[var(--celestial-surface)] border border-gold-500/40 rounded px-4 py-2.5 text-xs text-[var(--celestial-ink)] placeholder-gray-500 font-sans focus:outline-none focus:border-gold-400 pr-28"
              />
              <button
                type="submit"
                className="absolute right-1.5 px-3.5 py-1.5 bg-[#0b332d] hover:bg-[#0e423a] text-gold-300 font-cinzel text-[10px] tracking-widest font-semibold uppercase rounded border border-gold-400/60 transition-colors"
              >
                Transmit
              </button>
            </div>
          </form>
        </div>

        <div className="md:col-span-3">
          <h5 className="font-cinzel text-xs tracking-[0.24em] font-semibold text-gold-400 uppercase mb-4">Navigation</h5>
          <ul className="space-y-2.5 font-cinzel text-xs tracking-[0.16em] text-[var(--celestial-ink-muted)]">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="hover:text-gold-300 transition-colors">
                  {link.label.toUpperCase()}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <h5 className="font-cinzel text-xs tracking-[0.24em] font-semibold text-gold-400 uppercase mb-4">Guild Archives</h5>
          <ul className="space-y-2.5 font-cinzel text-xs tracking-[0.16em] text-[var(--celestial-ink-muted)]">
            {discordUrl && (
              <li>
                <a href={discordUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gold-300 transition-colors flex items-center gap-2">
                  <span>Discord Sanctum</span> <span className="text-teal-400 text-[10px]">●</span>
                </a>
              </li>
            )}
            {socialEntries.map((l) => (
              <li key={l.platform}>
                <a href={l.url} target="_blank" rel="noopener noreferrer" className="hover:text-gold-300 transition-colors">
                  {l.platform.toUpperCase()}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="max-w-[1460px] mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[var(--celestial-ink-muted)]">
        <div>{siteSettings?.copyrightLine ?? `© ${new Date().getFullYear()} Criticals & Fumbles Collective. All rolls respected.`}</div>
      </div>
    </footer>
  );
}
