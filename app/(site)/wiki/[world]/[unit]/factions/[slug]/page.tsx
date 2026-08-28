import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { FACTION_QUERY } from "@/sanity/lib/queries";
import type { Faction } from "@/sanity/lib/types";
import { urlForImage } from "@/sanity/lib/image";
import { wikiSiblingHref } from "@/lib/wikiLinks";
import { Badge } from "@/components/ui/Badge";
import { WikiEntryMetaPanel } from "@/components/wiki/WikiEntryMetaPanel";
import { Renderer } from "@/components/portable-text/Renderer";
import { Footer } from "@/components/layout/Footer";
import { buildMetadata, plainTextFromBlocks } from "@/lib/metadata";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: PageProps<"/wiki/[world]/[unit]/factions/[slug]">): Promise<Metadata> {
  const { world: worldSlug, unit: unitSlug, slug } = await params;
  const faction = await client.fetch<Faction | null>(FACTION_QUERY, {
    slug,
    worldSlug,
    unitSlug,
  });
  if (!faction) return {};

  return buildMetadata({
    title: faction.name,
    description:
      plainTextFromBlocks(faction.description) ??
      `${faction.name}, a faction of ${faction.unit?.name ?? faction.world?.name ?? "Criticals and Fumbles"}.`,
    path: `/wiki/${worldSlug}/${unitSlug}/factions/${slug}`,
    image: urlForImage(faction.banner)?.width(1200).height(630).url(),
  });
}

export default async function FactionPage({
  params,
}: PageProps<"/wiki/[world]/[unit]/factions/[slug]">) {
  const { world: worldSlug, unit: unitSlug, slug } = await params;
  const faction = await client.fetch<Faction | null>(FACTION_QUERY, {
    slug,
    worldSlug,
    unitSlug,
  });

  if (!faction) notFound();

  const bannerUrl = urlForImage(faction.banner)
    ?.width(300)
    .height(300)
    .auto("format")
    .url();

  return (
    <>
      <div className="mx-auto max-w-5xl px-4 py-16 md:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_240px] lg:items-start">
          <article>
            <div className="flex items-center gap-4">
              {bannerUrl && (
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded bg-bg-forest">
                  <Image src={bannerUrl} alt={faction.name} fill className="object-cover" />
                </div>
              )}
              <div>
                {faction.factionType && <Badge variant="muted">{faction.factionType}</Badge>}
                <h1 className="mt-2 font-display text-5xl text-text">{faction.name}</h1>
                <h2 className="sr-only">Faction</h2>
              </div>
            </div>

            {faction.description && (
              <div className="mt-10">
                <Renderer value={faction.description} />
              </div>
            )}

            {faction.members && faction.members.length > 0 && (
              <aside className="mt-10 border-t border-border pt-6">
                <h2 className="font-ui text-sm uppercase tracking-wider text-text-muted">
                  Known Members
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {faction.members.map((member) => (
                    <Link
                      key={member._id}
                      href={`/wiki/${worldSlug}/${unitSlug}/figures/${member.slug}`}
                      className="rounded-full border border-border px-3 py-1.5 font-ui text-xs text-text hover:border-emerald hover:text-emerald"
                    >
                      {member.name}
                    </Link>
                  ))}
                </div>
              </aside>
            )}
          </article>

          {faction._createdAt && faction._updatedAt && (
            <WikiEntryMetaPanel
              title={faction.name}
              image={faction.banner}
              typeLabel="Faction"
              createdAt={faction._createdAt}
              updatedAt={faction._updatedAt}
              lastEditedByHandle={faction.lastEditedBy?.handle}
              parentLink={{
                label: faction.unit?.name ?? unitSlug,
                href: `/wiki/${worldSlug}/${unitSlug}`,
              }}
              siblingsHeading={faction.unit ? "In this unit" : "In this world"}
              siblings={(faction.siblingEntries ?? []).map((s) => ({
                title: s.title,
                href: wikiSiblingHref(s),
              }))}
            />
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
