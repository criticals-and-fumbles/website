import Image from "next/image";
import Link from "next/link";
import type { CampaignCardData } from "@/sanity/lib/types";
import { urlForImage } from "@/sanity/lib/image";
import { Badge } from "@/components/ui/Badge";
import { timeAgo } from "@/lib/timeAgo";

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  recruiting: "Recruiting",
  hiatus: "On Hiatus",
  concluded: "Concluded",
};

// "recruiting" gets the loudest treatment (amber) since the directory's
// own intro copy specifically points visitors at recruiting campaigns —
// same emphasis the campaigns Worker's original status-badge styling
// used (see that repo's directory/styles.js .status-badge.status-* rules,
// which this ports from).
const STATUS_VARIANTS: Record<string, "emerald" | "amber" | "muted"> = {
  active: "emerald",
  recruiting: "amber",
  hiatus: "muted",
  concluded: "muted",
};

export function CampaignCard({ campaign }: { campaign: CampaignCardData }) {
  const imageUrl = urlForImage(campaign.heroImage)
    ?.width(400)
    .height(300)
    .fit("max")
    .ignoreImageParams()
    .auto("format")
    .url();
  const status = campaign.status ? STATUS_LABELS[campaign.status] ?? campaign.status : undefined;
  const statusVariant = campaign.status ? STATUS_VARIANTS[campaign.status] ?? "muted" : "muted";

  return (
    // Dossiers themselves stay on the campaigns Worker (genre-themed,
    // deliberately not sharing this site's chrome — see CampaignCard's
    // link target) — only the directory listing lives here.
    <Link
      href={`https://campaigns.criticalsandfumbles.com/${encodeURIComponent(campaign.slug)}`}
      className="group flex overflow-hidden rounded-lg border border-border bg-surface/75 transition-colors hover:border-emerald"
    >
      {/* object-contain, not cover — see ArticleCard.tsx's identical
          comment; a campaign's hero image can be any aspect ratio a GM
          uploaded. .fit("max").ignoreImageParams() on the urlForImage
          chain above is required alongside this, not optional — see
          that same file's comment for why. */}
      <div className="relative aspect-[4/3] w-1/4 min-w-[120px] max-w-[180px] flex-shrink-0 overflow-hidden bg-bg-forest">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex flex-wrap items-center gap-2">
          {campaign.genre && <Badge variant="surface">{campaign.genre}</Badge>}
          {status && <Badge variant={statusVariant}>{status}</Badge>}
        </div>
        <h2 className="font-display text-2xl text-text">{campaign.title}</h2>
        {campaign.hook && <p className="card-description line-clamp-2 text-text-muted">{campaign.hook}</p>}
        <div className="mt-auto flex items-center justify-between font-ui text-xs text-text-muted">
          <span>{campaign.system}</span>
          <span>Updated {timeAgo(campaign.lastActivity)}</span>
        </div>
      </div>
    </Link>
  );
}
