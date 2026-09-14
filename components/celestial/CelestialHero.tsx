import Link from "next/link";
import type { PinnedEvent, RssFeedItem, SiteSettings } from "@/sanity/lib/types";
import { itemHref, timeAgo, TYPE_BADGE } from "@/components/celestial/feedHelpers";
import { PinnedEventCard } from "@/components/home/HeroRightPanel";

/**
 * Part D-equivalent for this preview — left column identity/CTA block +
 * right column astrolabe halo + "Live Realm Dispatches" widget (the
 * mockup's own name for this same panel; reuses the real merged RSS
 * feed, same as every other homepage-preview in this project has).
 *
 * The mockup's headline ("Every Roll Tells a Story.") and subheading
 * copy don't correspond to any existing siteSettings field — kept as
 * hardcoded marketing copy, flagged as a candidate for a future
 * siteSettings.heroHeadline field rather than invented as a permanent
 * fixture. The brand wordmark itself stays in the nav, matching the
 * mockup's own layout (headline is themed tagline copy, not the brand
 * name repeated).
 *
 * TODO(sanity): the eyebrow line below ("Singapore's home for...") is
 * also hardcoded, same as the headline — add a siteSettings.heroEyebrow
 * (or similar) field so this is editable from Studio without a code
 * change, per the 2026-09-13 request. Not added this session.
 *
 * 2026-09-15: gained an optional `pinnedEvent` prop when this became the
 * real homepage's hero (not just the /celestial preview) — reuses
 * HeroRightPanel's existing PinnedEventCard unchanged (it already reads
 * colour through sitewide tokens, not celestial-only ones, so it drops
 * in above the Live Realm Dispatches panel with no restyling needed).
 */
export function CelestialHero({
  siteSettings,
  rssFeed,
  pinnedEvent,
}: {
  siteSettings: SiteSettings | null;
  rssFeed: RssFeedItem[];
  pinnedEvent?: PinnedEvent | null;
}) {

  return (
    <section className="min-h-[calc(100vh-140px)] flex flex-col justify-between py-6 sm:py-10">
      <main className="relative w-full my-auto py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* LEFT: headline, tagline, CTAs */}
        <section className="lg:col-span-6 xl:col-span-5 flex flex-col items-start z-20 max-w-xl lg:max-w-none pt-2 sm:pt-6">
          <div className="flex items-center gap-3 text-[var(--celestial-gold-400-90)] font-cinzel text-xs tracking-[0.1em] mb-4">
            <span className="inline-flex items-center gap-1 text-gold-500">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
              <span className="w-1 h-1 rotate-45 border border-gold-400" />
              <span className="w-6 h-[1px] bg-gradient-to-r from-transparent to-gold-400" />
            </span>
            <span className="inline-flex items-center gap-2 font-medium text-[var(--celestial-gold-300-90)]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
                aria-hidden="true"
                className="h-3.5 w-3.5 flex-shrink-0 text-gold-400"
              >
                <path d="M12 2 21 7.5v9L12 22 3 16.5v-9L12 2Z" />
                <path d="M12 2v20M3 7.5l9 5 9-5M3 16.5l9-5 9 5" />
              </svg>
              Singapore&apos;s home for new tabletop RPG players &amp; lifelong game masters
            </span>
            <span className="inline-flex items-center gap-1 text-gold-500">
              <span className="w-6 h-[1px] bg-gradient-to-l from-transparent to-gold-400" />
              <span className="w-1 h-1 rotate-45 border border-gold-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
            </span>
          </div>
          <h1 className="font-serif text-5xl sm:text-6xl xl:text-7xl font-semibold leading-[1.08] text-[var(--celestial-ink)] mb-6 drop-shadow-lg">
            Every Roll Tells
            <br />a <span className="italic font-normal text-[var(--celestial-ink)]">Story.</span>
          </h1>
          <p className="text-[var(--celestial-ink-muted)] font-sans text-sm sm:text-base leading-relaxed tracking-wide mb-8 max-w-md opacity-90">
            {siteSettings?.shortDescription ??
              "Original adventures. Familiar systems. Unexpected worlds. Join our community for immersive TTRPG campaigns, creative encounters, and unforgettable moments at the table."}
          </p>
          <div className="flex flex-col items-start gap-4">
            <a
              href="https://campaigns.criticalsandfumbles.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center justify-between gap-6 px-7 py-3.5 bg-[#0a3532]/90 hover:bg-[#0d4541] border border-[var(--celestial-gold-400-70)] rounded-md transition-all duration-300 shadow-[0_0_20px_rgba(0,180,150,0.2)] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)]"
            >
              <div className="absolute inset-[3px] border border-[var(--celestial-gold-500-40)] rounded-sm pointer-events-none" />
              <span className="font-cinzel tracking-[0.2em] text-xs sm:text-sm font-bold text-gold-200 group-hover:text-yellow-100">
                ENTER THE CAMPAIGN
              </span>
              <svg className="w-4 h-4 text-gold-300 transform group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
            <div className="w-full flex justify-start pl-3 pt-1">
              <Link
                href="/articles"
                className="inline-flex items-center gap-3 text-[var(--celestial-gold-400-80)] hover:text-gold-600 transition-colors font-cinzel text-[11px] tracking-[0.24em] uppercase group"
              >
                <span className="text-gold-500 group-hover:-translate-x-1 transition-transform">←</span>
                <span className="border-b border-[var(--celestial-gold-500-40)] pb-[2px] group-hover:border-gold-300">EXPLORE THE ARCHIVE</span>
                <span className="text-gold-500 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* RIGHT: astrolabe halo + Live Realm Dispatches */}
        <section className="lg:col-span-6 xl:col-span-7 relative flex items-center justify-center">
          <div className="relative w-full min-h-[420px] lg:min-h-[520px] flex items-end justify-end pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-full max-w-[480px] aspect-square rounded-full border border-[var(--celestial-gold-500-20)] bg-gradient-to-tr from-transparent via-[#081f2c]/30 to-transparent blur-[1px] relative flex items-center justify-center">
                <div className="w-3/4 aspect-square rounded-full border border-teal-400/20" />
                <div className="absolute w-40 h-40 rounded-full bg-[radial-gradient(circle_at_center,_rgba(0,229,200,0.18)_0%,_transparent_70%)] blur-xl" />
              </div>
            </div>

            <div className="relative z-30 w-full max-w-[340px] xl:max-w-[360px] pointer-events-auto flex flex-col gap-4">
              {pinnedEvent && (
                <div className="ornate-card corner-notch rounded-lg bg-[var(--celestial-surface-95)] backdrop-blur-md border border-[var(--celestial-gold-500-30)] shadow-[0_4px_25px_rgba(0,0,0,0.85)]">
                  <PinnedEventCard event={pinnedEvent} />
                </div>
              )}
              <div className="ornate-card corner-notch rounded-lg p-4 bg-[var(--celestial-surface-95)] backdrop-blur-md border border-[var(--celestial-gold-500-30)] shadow-[0_4px_25px_rgba(0,0,0,0.85)]">
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[var(--celestial-gold-500-20)]">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-300" />
                    </span>
                    <span className="font-cinzel text-[10px] font-bold tracking-[0.18em] text-gold-300 uppercase">
                      Live Realm Dispatches
                    </span>
                  </div>
                  <a href="#living-grimoire" className="font-mono text-[10px] text-[var(--celestial-teal-90)] hover:text-[var(--celestial-teal-hi)] transition-colors flex items-center gap-1 tracking-wider">
                    <span>Feed</span>
                    <span className="text-gold-400">↓</span>
                  </a>
                </div>
                <div className="space-y-2">
                  {rssFeed.slice(0, 4).map((item) => {
                    const href = itemHref(item);
                    if (!href) return null;
                    const badge = TYPE_BADGE[item._type];
                    return (
                      <Link
                        key={`${item._type}-${item._id}`}
                        href={href}
                        className="group block p-2 rounded bg-[var(--celestial-card-70)] hover:bg-[var(--celestial-card)] border border-[var(--celestial-gold-500-15)] hover:border-[var(--celestial-gold-400-60)] transition-all"
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                          <span className={`px-1.5 py-0.5 rounded border text-[9px] font-cinzel font-semibold uppercase tracking-wider ${badge.classes}`}>
                            {badge.label}
                          </span>
                          <span className="text-[var(--celestial-ink-muted)] text-[10px]">{timeAgo(item.date)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <h5 className="font-serif text-xs font-medium text-[var(--celestial-ink)] group-hover:text-gold-600 transition-colors line-clamp-1">
                            {item.title}
                          </h5>
                          <span className="text-gold-400 text-xs opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">→</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                <div className="pt-2.5 mt-2.5 border-t border-[var(--celestial-gold-500-20)] flex items-center justify-between text-[10px]">
                  <span className="text-[var(--celestial-ink-muted)] font-mono">The Grimoire • Live</span>
                  <a href="#living-grimoire" className="font-cinzel text-gold-300 hover:text-gold-700 tracking-wider transition-colors flex items-center gap-1 group">
                    <span>Explore All Updates</span>
                    <span className="text-gold-400 group-hover:translate-y-0.5 transition-transform">↓</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <div className="w-full pt-6 pb-2 z-20">
        <FeatureCards />
      </div>
    </section>
  );
}

function FeatureCards() {
  const cards = [
    {
      href: "https://campaigns.criticalsandfumbles.com",
      external: true,
      title: "Campaigns",
      desc: "Ongoing adventures, epic storylines, and living worlds.",
      gradient: "from-[#031c1a]/80 to-[#042422]/80",
    },
    {
      href: "/events",
      title: "Events",
      desc: "Live sessions, convention one-shots, and gathering archives for every kind of player.",
      gradient: "from-[#210915]/80 to-[#2c0d1c]/80",
    },
    {
      href: "/wiki",
      title: "Worlds",
      desc: "Unique settings, homebrew realms, and community creations.",
      gradient: "from-[#071625]/80 to-[#0a1e33]/80",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-7 max-w-[1500px] mx-auto">
      {cards.map((card) => {
        const cardClasses = `ornate-card corner-notch rounded-md px-5 py-4 bg-gradient-to-r ${card.gradient} backdrop-blur-md flex items-center justify-between group border-[var(--celestial-gold-500-40)] hover:border-gold-400`;
        const inner = (
          <>
            <div className="flex flex-col">
              <h3 className="font-cinzel text-sm sm:text-base font-bold tracking-[0.16em] text-gold-300 uppercase">
                {card.title}
              </h3>
              <p className="font-sans text-xs text-[var(--celestial-ink-muted)] leading-tight mt-1 line-clamp-2 max-w-[260px]">
                {card.desc}
              </p>
            </div>
            <div className="text-gold-400 text-lg group-hover:translate-x-1.5 transition-transform duration-300 pl-2">→</div>
          </>
        );
        return card.external ? (
          <a key={card.title} href={card.href} target="_blank" rel="noopener noreferrer" className={cardClasses}>
            {inner}
          </a>
        ) : (
          <Link key={card.title} href={card.href} className={cardClasses}>
            {inner}
          </Link>
        );
      })}
    </div>
  );
}
