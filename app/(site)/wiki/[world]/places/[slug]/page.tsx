import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { NOTABLE_PLACE_QUERY } from "@/sanity/lib/queries";
import type { NotablePlace } from "@/sanity/lib/types";
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
}: PageProps<"/wiki/[world]/places/[slug]">): Promise<Metadata> {
  const { world: worldSlug, slug } = await params;
  const place = await client.fetch<NotablePlace | null>(NOTABLE_PLACE_QUERY, { slug, worldSlug });
  if (!place) return {};

  return buildMetadata({
    title: place.name,
    description:
      plainTextFromBlocks(place.description) ??
      `${place.name}${place.placeType ? `, a ${place.placeType}` : ""} in ${place.unit?.name ?? place.world?.name ?? "Criticals and Fumbles"}.`,
    path: `/wiki/${worldSlug}/places/${slug}`,
    image: urlForImage(place.images?.[0])?.width(1200).height(630).url(),
  });
}

const DANGER_VARIANT: Record<string, "emerald" | "amber" | "magenta" | "muted"> = {
  safe: "emerald",
  "low-risk": "muted",
  dangerous: "amber",
  deadly: "magenta",
};

export default async function WorldNotablePlacePage({
  params,
}: PageProps<"/wiki/[world]/places/[slug]">) {
  const { world: worldSlug, slug } = await params;
  const place = await client.fetch<NotablePlace | null>(NOTABLE_PLACE_QUERY, { slug, worldSlug });

  if (!place) notFound();

  return (
    <>
      <div className="mx-auto max-w-5xl px-4 py-16 md:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_240px] lg:items-start">
          <article>
            <div className="flex flex-wrap gap-2">
              {place.placeType && <Badge variant="muted">{place.placeType}</Badge>}
              {place.dangerLevel && (
                <Badge variant={DANGER_VARIANT[place.dangerLevel] ?? "muted"}>
                  {place.dangerLevel}
                </Badge>
              )}
            </div>
            <h1 className="mt-4 font-display text-5xl text-text">{place.name}</h1>

            {place.description && (
              <div className="mt-10">
                <Renderer value={place.description} />
              </div>
            )}

            {place.images && place.images.length > 0 && (
              <div className="mt-10 grid grid-cols-2 gap-3">
                {place.images.map((img, i) => {
                  const url = urlForImage(img)?.width(600).height(400).auto("format").url();
                  if (!url) return null;
                  return (
                    <div
                      key={i}
                      className="relative aspect-[3/2] overflow-hidden rounded-lg bg-bg-forest"
                    >
                      <Image src={url} alt={place.name} fill className="object-cover" />
                    </div>
                  );
                })}
              </div>
            )}

            {place.keyFigures && place.keyFigures.length > 0 && (
              <aside className="mt-10 border-t border-border pt-6">
                <h2 className="font-ui text-sm uppercase tracking-wider text-text-muted">
                  Associated Key Figures
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {place.keyFigures.map((figure) => (
                    <Link
                      key={figure._id}
                      href={`/wiki/${worldSlug}/figures/${figure.slug}`}
                      className="rounded-full border border-border px-3 py-1.5 font-ui text-xs text-text hover:border-emerald hover:text-emerald"
                    >
                      {figure.name}
                    </Link>
                  ))}
                </div>
              </aside>
            )}

            {place.items && place.items.length > 0 && (
              <aside className="mt-6">
                <h2 className="font-ui text-sm uppercase tracking-wider text-text-muted">
                  Associated Items
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {place.items.map((item) => (
                    <Link
                      key={item._id}
                      href={`/wiki/${worldSlug}/items/${item.slug}`}
                      className="rounded-full border border-border px-3 py-1.5 font-ui text-xs text-text hover:border-emerald hover:text-emerald"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </aside>
            )}
          </article>

          {place._createdAt && place._updatedAt && (
            <WikiEntryMetaPanel
              title={place.name}
              image={place.images?.[0]}
              typeLabel="Notable Place"
              statusChip={
                place.dangerLevel
                  ? {
                      label: place.dangerLevel,
                      variant: DANGER_VARIANT[place.dangerLevel] ?? "muted",
                    }
                  : undefined
              }
              createdAt={place._createdAt}
              updatedAt={place._updatedAt}
              lastEditedByHandle={place.lastEditedBy?.handle}
              siblingsHeading={place.unit ? "In this unit" : "In this world"}
              siblings={(place.siblingEntries ?? []).map((s) => ({
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
