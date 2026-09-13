import Link from "next/link";
import type { RssFeedItem } from "@/sanity/lib/types";
import { itemHref, timeAgo, TYPE_BADGE } from "@/components/celestial/feedHelpers";
import { SectionCrest } from "@/components/celestial/ChroniclesGrid";
import { ScrollReveal } from "@/components/celestial/ScrollReveal";

/** "The Living Grimoire" — the mockup's full activity-feed section.
 * Reuses the same merged/sorted feed as the hero's Live Dispatches
 * widget (already fetched once in page.tsx), just showing all 5 items
 * instead of 4. The mockup's "Load More Transmissions" button has no
 * real backing page/endpoint to load more from — dropped rather than
 * shipped as a dead button; a real paginated activity feed would need a
 * dedicated page, out of scope for this preview. */
export function LivingGrimoireFeed({ items }: { items: RssFeedItem[] }) {
  return (
    <section className="relative w-full py-20 border-t border-gold-500/20 max-w-[1500px] mx-auto" id="living-grimoire">
      <div className="flex flex-col items-center justify-center gap-3 mb-6">
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#04161f]/90 border border-teal-400/50 shadow-[0_0_16px_rgba(0,229,200,0.25)]">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-300" />
          </span>
          <span className="font-mono text-[11px] font-semibold text-teal-300 tracking-[0.16em] uppercase">
            Live Grimoire Stream: Connected
          </span>
          <span className="text-gold-400/60 text-xs">|</span>
          <span className="font-cinzel text-[10px] text-gold-400 tracking-widest uppercase">The Living Grimoire</span>
        </div>
        <SectionCrest label="Real-Time Transmissions" />
      </div>

      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="font-serif text-4xl sm:text-5xl font-semibold text-[#f8f5ee] mb-3">
          Latest Updates Across the Realm
        </h2>
        <p className="text-gray-300/90 font-serif text-lg italic leading-relaxed">
          A synchronized stream of newly penned lore, upcoming events, world entries, and campaign updates
          directly from our celestial archives.
        </p>
      </div>

      <ScrollReveal className="space-y-4 max-w-4xl mx-auto">
        {items.length === 0 && (
          <p className="text-center font-serif text-gray-400 italic">Watch this space — something is brewing.</p>
        )}
        {items.map((item) => {
          const href = itemHref(item);
          if (!href) return null;
          const badge = TYPE_BADGE[item._type];
          return (
            <Link
              key={`${item._type}-${item._id}`}
              href={href}
              className="ornate-card rounded-md p-5 bg-[#09151e]/85 backdrop-blur-md hover:border-gold-400 transition-all duration-200 group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${badge.classes}`}>
                  <FeedTypeIcon type={item._type} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-cinzel font-bold uppercase tracking-wider border ${badge.classes}`}>
                      {badge.label}
                    </span>
                    <span className="text-[11px] font-mono text-teal-300/90 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400" /> Synced from the Grimoire
                    </span>
                  </div>
                  <h4 className="font-serif text-xl font-semibold text-gray-100 group-hover:text-gold-200 transition-colors">
                    {item.title}
                  </h4>
                  {item.subtitle && (
                    <p className="font-serif text-sm text-gray-300/85 mt-1 line-clamp-1">{item.subtitle}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 sm:flex-col sm:items-end flex-shrink-0">
                <span className="text-[11px] font-mono text-gray-400">{timeAgo(item.date)}</span>
                <span className="inline-flex items-center gap-1 text-xs font-cinzel tracking-wider text-gold-300 group-hover:translate-x-0.5 transition-all">
                  Inspect Entry →
                </span>
              </div>
            </Link>
          );
        })}
      </ScrollReveal>
    </section>
  );
}

function FeedTypeIcon({ type }: { type: RssFeedItem["_type"] }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, className: "w-5 h-5" } as const;
  switch (type) {
    case "majorEvent":
    case "regularEvent":
      return (
        <svg {...common} aria-hidden="true">
          <rect height="18" rx="2" width="18" x="3" y="4" />
          <line x1="16" x2="16" y1="2" y2="6" />
          <line x1="8" x2="8" y1="2" y2="6" />
          <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
      );
    case "sessionLog":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case "teamMember":
    case "keyFigure":
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="12" cy="7" r="4" />
          <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
        </svg>
      );
    case "article":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
          <line x1="16" x2="2" y1="8" y2="22" />
          <line x1="17.5" x2="9" y1="15" y2="15" />
        </svg>
      );
    default:
      return (
        <svg {...common} aria-hidden="true">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
  }
}
