import Link from "next/link";
import type { PortableTextBlock } from "sanity";
import type { PinnedEvent, RssFeedItem } from "@/sanity/lib/types";
import { Badge } from "@/components/ui/Badge";

const PINNED_STATUS_LABELS: Record<string, string> = {
  "watch-this-space": "Watch This Space",
  "coming-soon": "Coming Soon",
  "registration-open": "Registration Open",
};

const PINNED_STATUS_VARIANT: Record<string, "amber" | "emerald" | "magenta"> = {
  "watch-this-space": "amber",
  "coming-soon": "emerald",
  "registration-open": "magenta",
};

const typeConfig: Record<
  RssFeedItem["_type"],
  { icon: string; label: string; colour: string }
> = {
  article: { icon: "✍️", label: "Article", colour: "var(--color-emerald)" },
  majorEvent: { icon: "🏆", label: "Event", colour: "var(--color-magenta)" },
  regularEvent: { icon: "🎲", label: "Event", colour: "var(--color-amber)" },
  loreEntry: { icon: "📖", label: "Lore", colour: "#8B2FC9" },
  sessionLog: { icon: "📜", label: "Campaign", colour: "var(--color-amber)" },
  teamMember: { icon: "⚔️", label: "Member", colour: "var(--color-emerald)" },
  worldUnit: { icon: "🗺️", label: "Territory", colour: "var(--color-emerald)" },
  keyFigure: { icon: "🧙", label: "NPC", colour: "var(--color-magenta)" },
  notablePlace: { icon: "🏰", label: "Place", colour: "var(--color-amber)" },
  magicItem: { icon: "💎", label: "Item", colour: "#8B2FC9" },
  faction: { icon: "🛡️", label: "Faction", colour: "var(--color-emerald)" },
};

// Returns null (never a string containing "undefined") when a required
// route part is missing — the query already filters these out at the
// source for unit-scoped types (see HOME_RSS_FEED_QUERY's keyFigures/
// notablePlaces/magicItems/factions subqueries), but this is a second,
// independent guard so a malformed link can never render regardless of
// how an item reached this component. See issue #16.
function itemHref(item: RssFeedItem): string | null {
  switch (item._type) {
    case "article":
      return item.slug ? `/articles/${item.slug}` : null;
    case "majorEvent":
      return item.slug ? `/events/${item.slug}` : null;
    case "regularEvent":
      return item.slug ? `/events/${item.slug}` : null;
    case "loreEntry":
      return item.worldSlug && item.slug ? `/wiki/${item.worldSlug}/lore/${item.slug}` : null;
    case "sessionLog":
      return item.worldSlug && item.slug
        ? `/wiki/${item.worldSlug}/sessions/${item.slug}`
        : null;
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

function timeAgo(date: string): string {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(date).toLocaleDateString("en-SG", {
    day: "numeric",
    month: "short",
  });
}

function plainTextFromBlocks(blocks?: PortableTextBlock[]): string | undefined {
  const block = blocks?.find((b) => b._type === "block");
  if (!block) return undefined;
  const text = (block.children as { text?: string }[] | undefined)
    ?.map((child) => child.text ?? "")
    .join("");
  return text || undefined;
}

function PinnedEventCard({ event }: { event: PinnedEvent }) {
  const teaser = event.tagline ?? plainTextFromBlocks(event.watchThisSpaceTeaser);

  return (
    <Link
      href={`/events/${event.slug}`}
      className="flex flex-col gap-2 border-t-[3px] border-emerald p-4"
    >
      <div className="flex items-center gap-2 font-ui text-xs uppercase tracking-wider text-text-muted">
        <span>📌 Pinned</span>
        <Badge variant={PINNED_STATUS_VARIANT[event.status]}>
          {PINNED_STATUS_LABELS[event.status]}
        </Badge>
      </div>
      <h2 className="font-display text-2xl text-text">{event.title}</h2>
      {teaser && <p className="line-clamp-1 text-sm text-text-muted">{teaser}</p>}
      <p className="font-ui text-xs text-text-muted">
        {[event.eventDate, event.location].filter(Boolean).join(" · ")}
      </p>
      <span className="font-ui text-xs text-emerald">View Event →</span>
    </Link>
  );
}

function RssItem({ item, hideOnMobile }: { item: RssFeedItem; hideOnMobile: boolean }) {
  const config = typeConfig[item._type];
  // worldUnit's display label varies per world ("Territory"/"District"/
  // etc., or whatever an editor renames it to) — use the live value from
  // the item's world rather than the static config label.
  const label = item._type === "worldUnit" ? (item.unitLabel ?? config.label) : config.label;
  const href = itemHref(item);
  if (!href) return null;
  return (
    <Link
      href={href}
      className={`flex flex-col gap-1 border-t border-border py-3 first:border-t-0 first:pt-0 ${
        hideOnMobile ? "hidden md:flex" : "flex"
      }`}
    >
      <span
        className="flex items-center gap-1.5 font-ui text-xs uppercase tracking-wider"
        style={{ color: config.colour }}
      >
        <span aria-hidden="true">{config.icon}</span>
        {label} · {timeAgo(item.date)}
      </span>
      <span className="line-clamp-1 text-text">{item.title}</span>
    </Link>
  );
}

export function HeroRightPanel({
  pinnedEvent,
  rssFeed,
}: {
  pinnedEvent: PinnedEvent | null;
  rssFeed: RssFeedItem[];
}) {
  return (
    <div className="hero-right-panel flex flex-col justify-center gap-4 border border-border px-6 py-20 md:px-12 md:py-32">
      {pinnedEvent && <PinnedEventCard event={pinnedEvent} />}

      <div className="flex flex-col">
        <div className="flex items-center border-b border-border pb-3 font-ui text-sm uppercase tracking-wider text-text-muted">
          Latest Updates
          <span className="live-dot" aria-hidden="true" />
        </div>

        {rssFeed.length > 0 ? (
          rssFeed.map((item, index) => (
            <RssItem
              key={`${item._type}-${item._id}`}
              item={item}
              hideOnMobile={index >= 3}
            />
          ))
        ) : (
          <p className="pt-3 font-ui text-sm text-text-muted">
            Watch this space — something is brewing.
          </p>
        )}
      </div>
    </div>
  );
}
