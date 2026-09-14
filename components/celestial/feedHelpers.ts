import type { RssFeedItem } from "@/sanity/lib/types";

/**
 * Standalone copy of HeroRightPanel's itemHref/timeAgo (components/home/
 * HeroRightPanel.tsx) — not an import from it, since this preview must
 * not modify or depend on current-homepage components. Shared between
 * this route's two feed displays (the hero's Live Dispatches widget and
 * the full Living Grimoire timeline).
 */
export function itemHref(item: RssFeedItem): string | null {
  switch (item._type) {
    case "article":
      return item.slug ? `/articles/${item.slug}` : null;
    case "majorEvent":
    case "regularEvent":
      return item.slug ? `/events/${item.slug}` : null;
    case "loreEntry":
      return item.worldSlug && item.slug ? `/wiki/${item.worldSlug}/lore/${item.slug}` : null;
    case "sessionLog":
      return item.worldSlug && item.slug ? `/wiki/${item.worldSlug}/sessions/${item.slug}` : null;
    case "teamMember":
      return item.slug ? `/team/${item.slug}` : null;
    case "worldUnit":
      return item.worldSlug && item.slug ? `/wiki/${item.worldSlug}/${item.slug}` : null;
    case "keyFigure":
      return item.worldSlug && item.unitSlug && item.slug
        ? `/wiki/${item.worldSlug}/${item.unitSlug}/figures/${item.slug}`
        : null;
    case "notablePlace":
      return item.worldSlug && item.unitSlug && item.slug
        ? `/wiki/${item.worldSlug}/${item.unitSlug}/places/${item.slug}`
        : null;
    case "magicItem":
      return item.worldSlug && item.unitSlug && item.slug
        ? `/wiki/${item.worldSlug}/${item.unitSlug}/items/${item.slug}`
        : null;
    case "faction":
      return item.worldSlug && item.unitSlug && item.slug
        ? `/wiki/${item.worldSlug}/${item.unitSlug}/factions/${item.slug}`
        : null;
  }
}

export function timeAgo(date: string): string {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(date).toLocaleDateString("en-SG", { day: "numeric", month: "short" });
}

/** Maps each RssFeedItem type to the mockup's badge label + colour
 * classes (Tailwind's default palette shades, matching code.html's own
 * choices — not this site's --emerald/--amber/--magenta, since the
 * mockup's badges use plain Tailwind emerald/pink/cyan/purple/gold). */
// Text colours read through the --celestial-* accent custom properties
// (app/(site)/globals.css's .celestial / .celestial.celestial-light
// blocks) rather than a literal Tailwind shade — those translucent
// bg-*/20 chips composite very differently against a near-black vs.
// off-white page, so the text needs to flip with the light/dark toggle
// the same way the badge background's *contrast partner* does. gold-*
// doesn't need this treatment — that whole scale is ALREADY theme-
// reactive (see the @theme inline block), so text-gold-300 just works.
// bg-emerald-950/70 (ChroniclesGrid's own category badge) isn't
// affected either way — that's a near-opaque dark chip regardless of
// page background, so it keeps its static text-emerald-300.
export const TYPE_BADGE: Record<RssFeedItem["_type"], { label: string; classes: string }> = {
  article: { label: "Article", classes: "bg-[var(--celestial-gold-500-20)] text-gold-300 border-[var(--celestial-gold-500-40)]" },
  majorEvent: { label: "Event", classes: "bg-pink-500/20 text-[var(--celestial-magenta)] border-pink-500/40" },
  regularEvent: { label: "Event", classes: "bg-pink-500/20 text-[var(--celestial-magenta)] border-pink-500/40" },
  loreEntry: { label: "Wiki Entry", classes: "bg-cyan-500/20 text-[var(--celestial-cyan)] border-cyan-500/40" },
  sessionLog: { label: "Campaign", classes: "bg-emerald-500/20 text-[var(--celestial-emerald)] border-emerald-500/40" },
  teamMember: { label: "Dossier", classes: "bg-purple-500/20 text-[var(--celestial-purple)] border-purple-500/40" },
  worldUnit: { label: "Wiki Entry", classes: "bg-cyan-500/20 text-[var(--celestial-cyan)] border-cyan-500/40" },
  keyFigure: { label: "Dossier", classes: "bg-purple-500/20 text-[var(--celestial-purple)] border-purple-500/40" },
  notablePlace: { label: "Wiki Entry", classes: "bg-cyan-500/20 text-[var(--celestial-cyan)] border-cyan-500/40" },
  magicItem: { label: "Wiki Entry", classes: "bg-cyan-500/20 text-[var(--celestial-cyan)] border-cyan-500/40" },
  faction: { label: "Wiki Entry", classes: "bg-cyan-500/20 text-[var(--celestial-cyan)] border-cyan-500/40" },
};
