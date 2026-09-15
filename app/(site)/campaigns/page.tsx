import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import {
  ALL_CAMPAIGNS_QUERY,
  CAMPAIGN_RECENT_ACTIVITY_QUERY,
  SITE_SETTINGS_QUERY,
} from "@/sanity/lib/queries";
import type { CampaignCardData, CampaignActivityItem, SiteSettings } from "@/sanity/lib/types";
import { CampaignCard } from "@/components/campaigns/CampaignCard";
import { CampaignActivityItem as ActivityItem } from "@/components/campaigns/CampaignActivityItem";
import { LinkButton } from "@/components/ui/Button";
import { Footer } from "@/components/layout/Footer";
import { PageBackdrop } from "@/components/layout/PageBackdrop";
import { buildMetadata } from "@/lib/metadata";

// Ported from the campaigns Worker's own directory route (src/routes/
// dossier.jsx GET "/"). This is now the canonical, real implementation —
// campaigns.criticalsandfumbles.com/ just 308-redirects here (see that
// repo's dossier.jsx), rather than this app trying to serve content
// under that subdomain itself. An earlier version of this did exactly
// that via a Cloudflare Route + host-based middleware rewrite — reverted
// (see git history) because a relative-URL nav click from that subdomain
// (e.g. clicking "Events" in the shared Nav) would still be on
// campaigns.criticalsandfumbles.com afterward, 404ing on every other
// page the campaigns Worker doesn't itself serve. A redirect avoids that
// entirely: once you land here, you're truly on this site's own domain,
// so every other link just works. Everything downstream of a campaign
// (its session index and the dossier page itself) stays on the
// campaigns Worker, genre-themed and deliberately not sharing this
// site's chrome — see CampaignCard's link target.
export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: "Campaign Logs",
  description:
    "Catch up on Criticals & Fumbles' ongoing campaigns, or find one that's still recruiting.",
  path: "/campaigns",
});

export default async function CampaignsDirectoryPage() {
  const [campaigns, recent, siteSettings] = await Promise.all([
    client.fetch<CampaignCardData[]>(ALL_CAMPAIGNS_QUERY),
    client.fetch<CampaignActivityItem[]>(CAMPAIGN_RECENT_ACTIVITY_QUERY),
    client.fetch<SiteSettings | null>(SITE_SETTINGS_QUERY),
  ]);

  const whatsappUrl = siteSettings?.socialLinks?.find((l) => l.platform === "WhatsApp")?.url;

  return (
    <>
      <PageBackdrop tier="full" />
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <h1 className="font-display text-5xl text-text">Campaign Logs</h1>
        <p className="mt-2 max-w-prose text-text-muted">
          Catch up on our games here. Please reach out to us if you are interested in any games
          that are still recruiting.
        </p>

        {(siteSettings?.discordUrl || whatsappUrl) && (
          <div className="mt-6 flex flex-wrap gap-3">
            {siteSettings?.discordUrl && (
              <LinkButton href={siteSettings.discordUrl} external variant="primary">
                Join us on Discord
              </LinkButton>
            )}
            {whatsappUrl && (
              <LinkButton href={whatsappUrl} external variant="secondary">
                Join our WhatsApp Community
              </LinkButton>
            )}
          </div>
        )}

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
          <ul className="flex flex-col gap-4">
            {campaigns.length === 0 ? (
              <p className="text-text-muted">No campaigns published yet.</p>
            ) : (
              campaigns.map((campaign) => <CampaignCard key={campaign._id} campaign={campaign} />)
            )}
          </ul>

          {/* Same "Live Realm Dispatches" treatment as the homepage's
              CelestialHero — ornate-card corner-notch, gold hairline
              border, pulsing live dot — rather than this page's own
              plain surface-border card, per explicit request to match
              that widget's style specifically. */}
          <aside className="ornate-card corner-notch sticky top-24 self-start rounded-lg bg-[var(--celestial-surface)] p-4 backdrop-blur-md border border-[var(--celestial-gold-500-30)] shadow-[0_4px_25px_rgba(0,0,0,0.85)]">
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[var(--celestial-gold-500-20)]">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-300" />
                </span>
                <span className="font-cinzel text-[10px] font-bold tracking-[0.18em] text-gold-300 uppercase">
                  Recent Updates
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {recent.length === 0 ? (
                <p className="text-sm text-[var(--celestial-ink-muted)]">No sessions published yet.</p>
              ) : (
                recent.map((item) => (
                  <ActivityItem key={`${item.campaignSlug}-${item.code}`} item={item} />
                ))
              )}
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </>
  );
}
