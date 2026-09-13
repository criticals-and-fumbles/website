import Link from "next/link";
import type { ArticleCard } from "@/sanity/lib/types";
import { ScrollReveal } from "@/components/celestial/ScrollReveal";

/** "Chronicles & Lore" — reuses HOME_LATEST_ARTICLES_QUERY exactly (3
 * latest published articles), no new query. Category filter pills are
 * presentational only (the mockup's own filtering isn't backed by real
 * client-side logic here, matching this project's discipline of not
 * inventing a new capability the query doesn't support) — flagged as a
 * future enhancement if real per-category filtering is wanted here. */
export function ChroniclesGrid({ articles }: { articles: ArticleCard[] }) {
  return (
    <section className="relative w-full py-20 border-t border-gold-500/20 max-w-[1500px] mx-auto" id="chronicles">
      <SectionCrest label="Tales from the Archives" />
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="font-serif text-4xl sm:text-5xl font-semibold text-[var(--celestial-ink)] mb-3">Chronicles &amp; Lore</h2>
        <p className="text-[var(--celestial-ink-muted)]/90 font-serif text-lg italic leading-relaxed">
          Dispatches from our dungeon masters, deep system deep-dives, and arcane worldbuilding logs.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 mb-12">
        <button className="px-4 py-1.5 rounded-full text-xs font-cinzel tracking-[0.16em] uppercase bg-gold-500/20 text-gold-300 border border-gold-400/80 shadow-[0_0_12px_rgba(212,175,55,0.3)]">
          All Articles
        </button>
        {["DM Guides", "Worldbuilding", "Rule Systems"].map((label) => (
          <button
            key={label}
            className="px-4 py-1.5 rounded-full text-xs font-cinzel tracking-[0.16em] uppercase bg-[var(--celestial-card)]/80 text-[var(--celestial-ink-muted)] border border-gold-500/25"
          >
            {label}
          </button>
        ))}
      </div>

      <ScrollReveal className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        {articles.map((a) => (
          <Link
            key={a._id}
            href={`/articles/${a.slug}`}
            className="ornate-card corner-notch rounded-lg p-6 sm:p-7 bg-[var(--celestial-surface)]/85 backdrop-blur-md flex flex-col justify-between group hover:border-gold-400 transition-all duration-300"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-mono tracking-wider text-gold-400 mb-4 pb-3 border-b border-gold-500/20">
                {a.category && (
                  <span className="px-2.5 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-cinzel text-[11px] uppercase tracking-[0.15em]">
                    {a.category}
                  </span>
                )}
                <span className="text-[var(--celestial-ink-muted)] text-[11px]">
                  {[a.readTimeMinutes ? `${a.readTimeMinutes} MIN READ` : null].filter(Boolean).join(" • ")}
                </span>
              </div>
              <h3 className="font-serif text-2xl font-semibold text-[var(--celestial-ink)] group-hover:text-gold-600 transition-colors leading-snug mb-3">
                {a.title}
              </h3>
              {a.excerpt && (
                <p className="font-serif text-[var(--celestial-ink-muted)] text-base leading-relaxed mb-6 line-clamp-3">{a.excerpt}</p>
              )}
            </div>
            <div className="pt-4 border-t border-gold-500/20 flex items-center justify-between mt-auto">
              {a.author && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full border border-gold-500/60 bg-[var(--celestial-card)] flex items-center justify-center text-gold-300 font-cinzel text-xs font-bold shadow-[0_0_8px_rgba(212,175,55,0.3)]">
                    {a.author.handle.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs font-cinzel tracking-wider text-[var(--celestial-ink)]">{a.author.handle}</span>
                </div>
              )}
              <span className="inline-flex items-center gap-1.5 text-xs font-cinzel tracking-[0.18em] text-gold-300 group-hover:text-gold-700 group-hover:translate-x-1 transition-all uppercase">
                <span>Read</span>
                <span>→</span>
              </span>
            </div>
          </Link>
        ))}
      </ScrollReveal>
    </section>
  );
}

export function SectionCrest({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-4 mb-4 text-gold-400">
      <span className="w-16 h-[1px] bg-gradient-to-r from-transparent to-gold-400/80" />
      <span className="font-cinzel text-xs tracking-[0.3em] uppercase text-gold-300/90 flex items-center gap-2">
        <span className="text-gold-400">◆</span> {label} <span className="text-gold-400">◆</span>
      </span>
      <span className="w-16 h-[1px] bg-gradient-to-l from-transparent to-gold-400/80" />
    </div>
  );
}
