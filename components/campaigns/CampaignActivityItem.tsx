import Link from "next/link";
import type { CampaignActivityItem as CampaignActivityItemData } from "@/sanity/lib/types";
import { timeAgo } from "@/lib/timeAgo";

// Styled to match CelestialHero's "Live Realm Dispatches" item cards
// exactly (same classes) — see app/(site)/campaigns/page.tsx's sidebar
// comment for why.
export function CampaignActivityItem({ item }: { item: CampaignActivityItemData }) {
  return (
    <Link
      href={`https://campaigns.criticalsandfumbles.com/${encodeURIComponent(item.campaignSlug)}/${encodeURIComponent(item.code)}`}
      className="group block rounded border border-[var(--celestial-gold-500-15)] bg-[var(--celestial-card)] p-2 transition-all hover:border-[var(--celestial-gold-400-60)]"
    >
      <div className="mb-1 flex items-center justify-between font-mono text-[10px]">
        <span className="rounded border border-teal-400/40 px-1.5 py-0.5 font-cinzel text-[9px] font-semibold uppercase tracking-wider text-teal-300">
          Session
        </span>
        <span className="text-[10px] text-[var(--celestial-ink-muted)]">{timeAgo(item._updatedAt)}</span>
      </div>
      <div className="flex items-center justify-between gap-1">
        <h5 className="line-clamp-1 font-serif text-xs font-medium text-[var(--celestial-ink)] transition-colors group-hover:text-gold-600">
          {item.sessionLabel || item.code} — {item.title}
        </h5>
        <span className="text-xs text-gold-400 opacity-60 transition-all group-hover:translate-x-0.5 group-hover:opacity-100">
          →
        </span>
      </div>
      <p className="mt-0.5 truncate text-[10px] text-[var(--celestial-ink-muted)]">{item.campaignTitle}</p>
    </Link>
  );
}
