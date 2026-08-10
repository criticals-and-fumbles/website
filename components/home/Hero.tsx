import Link from "next/link";
import type { HomeUpdateItem } from "@/sanity/lib/types";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const EVENT_STATUS_LABELS: Record<string, string> = {
  "watch-this-space": "Watch This Space",
  "coming-soon": "Coming Soon",
  "registration-open": "Registration Open",
  full: "Full",
  completed: "Completed",
};

function updateHref(item: HomeUpdateItem): string {
  switch (item._type) {
    case "majorEvent":
      return `/events/${item.slug}`;
    case "loreEntry":
      return `/wiki/${item.worldSlug}/lore/${item.slug}`;
    case "sessionLog":
      return `/wiki/${item.worldSlug}/sessions/${item.slug}`;
    case "article":
      return `/articles/${item.slug}`;
  }
}

function updateBadge(item: HomeUpdateItem): { label: string; variant: "amber" | "magenta" | "emerald" | "muted" } {
  switch (item._type) {
    case "majorEvent":
      return {
        label: EVENT_STATUS_LABELS[item.status ?? ""] ?? item.status ?? "Event",
        variant: "amber",
      };
    case "loreEntry":
      return { label: item.category ?? "Lore", variant: "magenta" };
    case "sessionLog":
      return {
        label: item.sessionNumber ? `Session ${item.sessionNumber}` : "Session",
        variant: "emerald",
      };
    case "article":
      return { label: "Article", variant: "muted" };
  }
}

function updateMeta(item: HomeUpdateItem): string | undefined {
  if (item._type === "majorEvent") return item.eventDate;
  if (item._type === "article") return item.excerpt;
  return undefined;
}

export function Hero({ updates }: { updates: HomeUpdateItem[] }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2">
      <div className="flex flex-col justify-center gap-6 bg-bg px-6 py-20 md:px-12 md:py-32">
        <h1 className="font-display text-6xl leading-none md:text-7xl lg:text-8xl">
          <span className="text-emerald">Criticals</span>{" "}
          <span className="text-amber">&amp;</span>{" "}
          <span className="text-magenta">Fumbles</span>
        </h1>
        <p className="max-w-md text-lg text-text-muted">
          Good Players Make Good Tables. Good Tables Make Good Stories.
        </p>
        <div>
          <LinkButton href="/articles" variant="primary">
            Explore the Archive
          </LinkButton>
        </div>
      </div>

      <div className="relative flex flex-col justify-center overflow-hidden bg-bg-forest px-6 py-20 md:px-12 md:py-32">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 top-1/2 -translate-y-1/2 select-none font-display text-[16rem] leading-none text-white/5"
        >
          20
        </span>

        <div className="relative z-10 flex flex-col gap-6">
          <span className="font-ui text-sm uppercase tracking-wider text-on-forest-muted">
            Latest Updates
          </span>

          {updates.length > 0 ? (
            updates.map((item) => {
              const badge = updateBadge(item);
              const meta = updateMeta(item);
              return (
                <Link
                  key={`${item._type}-${item.slug}`}
                  href={updateHref(item)}
                  className="flex flex-col gap-1 border-b border-white/10 pb-4 last:border-b-0 last:pb-0"
                >
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                  <h2 className="font-display text-2xl text-on-forest">{item.title}</h2>
                  {meta && (
                    <p className="line-clamp-1 font-ui text-sm text-on-forest-muted">{meta}</p>
                  )}
                </Link>
              );
            })
          ) : (
            <p className="font-ui text-sm text-on-forest-muted">
              Watch this space — something is brewing.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
