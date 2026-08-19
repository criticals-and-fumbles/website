"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { FacebookIcon, InstagramIcon, DiscordIcon, WhatsAppIcon } from "@/components/icons/SocialIcons";

const NAV_LINKS = [
  { label: "About", href: "/about" },
  { label: "Events", href: "/events" },
  // Separate Worker/subsite (campaigns.criticalsandfumbles.com), not a
  // route in this app — external:true so it renders a plain <a> instead
  // of next/link (no client-side prefetch/routing across domains). See
  // that repo's CLAUDE.md for why it's a separate app at all.
  { label: "Campaigns", href: "https://campaigns.criticalsandfumbles.com", external: true },
  { label: "Wiki", href: "/wiki" },
  { label: "Team", href: "/team" },
  { label: "Resources", href: "/resources" },
];

const SOCIAL_ICONS = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  discord: DiscordIcon,
  whatsapp: WhatsAppIcon,
} as const;

function SocialLinks({
  facebookUrl,
  instagramUrl,
  discordUrl,
  whatsappUrl,
  className = "",
  iconSize = "h-[18px] w-[18px]",
}: {
  facebookUrl?: string;
  instagramUrl?: string;
  discordUrl?: string;
  whatsappUrl?: string;
  className?: string;
  iconSize?: string;
}) {
  const links = [
    { platform: "facebook" as const, url: facebookUrl, label: "Facebook" },
    { platform: "instagram" as const, url: instagramUrl, label: "Instagram" },
    { platform: "discord" as const, url: discordUrl, label: "Discord" },
    { platform: "whatsapp" as const, url: whatsappUrl, label: "WhatsApp Community" },
  ].filter((l) => l.url);

  if (links.length === 0) return null;

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {links.map(({ platform, url, label }) => {
        const Icon = SOCIAL_ICONS[platform];
        return (
          <a
            key={platform}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className={`${iconSize} text-text-muted transition-colors hover:text-emerald`}
          >
            <Icon />
          </a>
        );
      })}
    </div>
  );
}

export function Nav({
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
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setDrawerOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/95 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Criticals and Fumbles logo"
            width={36}
            height={36}
            className="h-9 w-auto"
            priority
          />
          <span className="hidden font-ui text-sm text-text md:inline">
            Criticals &amp; Fumbles
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                className="font-ui text-base text-text-muted transition-colors hover:text-emerald"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="font-ui text-base text-text-muted transition-colors hover:text-emerald"
              >
                {link.label}
              </Link>
            ),
          )}
        </div>

        <div className="hidden items-center gap-6 md:flex">
          <SocialLinks
            facebookUrl={facebookUrl}
            instagramUrl={instagramUrl}
            discordUrl={discordUrl}
            whatsappUrl={whatsappUrl}
          />
          <ThemeToggle />
        </div>

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="flex h-11 w-11 items-center justify-center text-text md:hidden"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-6 w-6"
          >
            <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>

      {drawerOpen && (
        <div className="md:hidden">
          {/* Dark backdrop behind the drawer — closes on click */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 z-[49] bg-black/70"
          />

          {/* Drawer — solid background, no transparency/blur */}
          <div className="fixed right-0 top-0 z-50 h-screen w-[280px] overflow-y-auto bg-bg p-[24px] opacity-100">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              className="absolute right-[16px] top-[16px] flex h-11 w-11 items-center justify-center text-text"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-6 w-6"
              >
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            <div className="mt-12 flex flex-col items-end gap-6">
              {NAV_LINKS.map((link) =>
                link.external ? (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setDrawerOpen(false)}
                    className="text-right font-display text-3xl text-text transition-colors hover:text-emerald"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setDrawerOpen(false)}
                    className="text-right font-display text-3xl text-text transition-colors hover:text-emerald"
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </div>

            <SocialLinks
              facebookUrl={facebookUrl}
              instagramUrl={instagramUrl}
              discordUrl={discordUrl}
              whatsappUrl={whatsappUrl}
              className="mt-8 justify-end"
            />

            <div className="mt-8 flex justify-end border-t border-border pt-6">
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
