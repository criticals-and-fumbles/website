import { notFound } from "next/navigation";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { WORLD_UNIT_QUERY, UNIT_RECENT_ENTRIES_QUERY } from "@/sanity/lib/queries";
import type { RecentUnitEntry, WorldUnit } from "@/sanity/lib/types";
import { urlForImage } from "@/sanity/lib/image";
import { wikiSiblingHref } from "@/lib/wikiLinks";
import { Badge } from "@/components/ui/Badge";
import { WorldUnitNav } from "@/components/wiki/WorldUnitNav";
import { WikiEntryMetaPanel } from "@/components/wiki/WikiEntryMetaPanel";
import { Renderer } from "@/components/portable-text/Renderer";
import { Footer } from "@/components/layout/Footer";

export const revalidate = 300;

const STATUS_BADGE: Record<
  string,
  { label: string; variant: "amber" | "emerald" | "magenta" | "muted" } | undefined
> = {
  draft: { label: "Draft", variant: "muted" },
  "in-progress": { label: "In Progress", variant: "amber" },
  established: { label: "Established", variant: "emerald" },
  canonical: { label: "Canonical", variant: "magenta" },
};

const RECENT_ENTRY_HREF: Record<RecentUnitEntry["_type"], string> = {
  keyFigure: "figures",
  notablePlace: "places",
  magicItem: "items",
  faction: "factions",
};

const RECENT_ENTRY_META: Record<RecentUnitEntry["_type"], (e: RecentUnitEntry) => string | undefined> = {
  keyFigure: (e) => e.role,
  notablePlace: (e) => e.placeType,
  magicItem: (e) => e.rarity,
  faction: (e) => e.factionType,
};

export default async function WorldUnitPage({
  params,
}: PageProps<"/wiki/[world]/[unit]">) {
  const { world: worldSlug, unit: unitSlug } = await params;

  const unit = await client.fetch<WorldUnit | null>(WORLD_UNIT_QUERY, {
    worldSlug,
    unitSlug,
  });

  if (!unit) notFound();

  const recentEntries = await client.fetch<RecentUnitEntry[]>(
    UNIT_RECENT_ENTRIES_QUERY,
    { unitSlug },
  );

  const accent = unit.colourAccent ?? "var(--emerald)";
  const badge = unit.developmentStatus ? STATUS_BADGE[unit.developmentStatus] : undefined;
  const coverUrl = urlForImage(unit.coverImage)?.width(1400).height(500).auto("format").url();
  const mapUrl = urlForImage(unit.mapImage)?.width(1200).auto("format").url();

  return (
    <>
      <section
        className="relative overflow-hidden border-b-2 px-4 py-16 md:px-8"
        style={{ borderColor: accent }}
      >
        {coverUrl && (
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url(${coverUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}
        <div className="relative mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-6xl" style={{ color: accent }}>
              {unit.name}
            </h1>
            {badge && <Badge variant={badge.variant}>{badge.label}</Badge>}
          </div>
          {unit.dmOwner && (
            <p className="mt-2 font-ui text-xs text-text-muted">
              DM: {unit.dmOwner.handle}
            </p>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_280px] lg:items-start">
          <div>{unit.overview && <Renderer value={unit.overview} />}</div>

          {unit._createdAt && unit._updatedAt && (
            <WikiEntryMetaPanel
              title={unit.name}
              image={unit.coverImage}
              typeLabel={unit.world?.unitLabel ?? "Territory"}
              counts={
                unit.counts
                  ? [
                      { label: "Key Figures", value: unit.counts.keyFigures },
                      { label: "Notable Places", value: unit.counts.notablePlaces },
                      { label: "Magic Items", value: unit.counts.magicItems },
                      { label: "Factions", value: unit.counts.factions },
                      { label: "Lore Entries", value: unit.counts.loreEntries },
                      { label: "Session Logs", value: unit.counts.sessionLogs },
                    ].filter((c) => c.value > 0)
                  : undefined
              }
              ownerHandle={unit.dmOwner?.handle}
              createdAt={unit._createdAt}
              updatedAt={unit._updatedAt}
              lastEditedByHandle={unit.lastEditedBy?.handle}
              categoryLinks={[
                { label: "Lore", href: `/wiki/${worldSlug}/${unitSlug}/lore` },
                { label: "Key Figures", href: `/wiki/${worldSlug}/${unitSlug}/figures` },
                { label: "Notable Places", href: `/wiki/${worldSlug}/${unitSlug}/places` },
                { label: "Magic Items", href: `/wiki/${worldSlug}/${unitSlug}/items` },
                { label: "Factions", href: `/wiki/${worldSlug}/${unitSlug}/factions` },
              ]}
              siblingsHeading="In this world"
              siblings={(unit.siblingEntries ?? []).map((s) => ({
                title: s.title,
                href: wikiSiblingHref(s),
              }))}
            />
          )}
        </div>
      </div>

      {(mapUrl || unit.mapImageUrl) && (
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
          <h2 className="mb-4 font-display text-2xl text-text">Map</h2>
          {mapUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mapUrl} alt={`${unit.name} map`} className="w-full rounded-lg" />
          ) : (
            // Large/high-res maps hosted externally on R2 — rendered as a
            // plain <img>, not next/image, since the domain isn't (and
            // shouldn't be) whitelisted in next.config.ts remotePatterns.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={unit.mapImageUrl}
              alt={`${unit.name} map`}
              className="w-full rounded-lg"
            />
          )}
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <WorldUnitNav worldSlug={worldSlug} unitSlug={unitSlug} />
      </div>

      {recentEntries.length > 0 && (
        <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
          <h2 className="mb-6 font-display text-3xl text-text">Recent Entries</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {recentEntries.map((entry) => {
              const meta = RECENT_ENTRY_META[entry._type](entry);
              return (
                <Link
                  key={`${entry._type}-${entry._id}`}
                  href={`/wiki/${worldSlug}/${unitSlug}/${RECENT_ENTRY_HREF[entry._type]}/${entry.slug}`}
                  className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-emerald"
                >
                  <span className="font-ui text-xs uppercase tracking-wider text-text-muted">
                    {entry._type}
                  </span>
                  <span className="font-display text-xl text-text">{entry.name}</span>
                  {meta && <span className="text-xs text-text-muted">{meta}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <Footer pageFooterCTA={unit.pageFooterCTA} />
    </>
  );
}
