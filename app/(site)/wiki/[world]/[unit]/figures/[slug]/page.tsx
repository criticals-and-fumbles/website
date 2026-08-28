import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { KEY_FIGURE_QUERY } from "@/sanity/lib/queries";
import type { KeyFigure } from "@/sanity/lib/types";
import { urlForImage } from "@/sanity/lib/image";
import { wikiSiblingHref } from "@/lib/wikiLinks";
import { Badge } from "@/components/ui/Badge";
import { StatBlockCard } from "@/components/wiki/StatBlockCard";
import { WikiEntryMetaPanel } from "@/components/wiki/WikiEntryMetaPanel";
import { Renderer } from "@/components/portable-text/Renderer";
import { Footer } from "@/components/layout/Footer";
import { buildMetadata, plainTextFromBlocks } from "@/lib/metadata";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: PageProps<"/wiki/[world]/[unit]/figures/[slug]">): Promise<Metadata> {
  const { world: worldSlug, unit: unitSlug, slug } = await params;
  const figure = await client.fetch<KeyFigure | null>(KEY_FIGURE_QUERY, {
    slug,
    worldSlug,
    unitSlug,
  });
  if (!figure) return {};

  return buildMetadata({
    title: figure.name,
    description:
      plainTextFromBlocks(figure.description) ??
      `${figure.name}${figure.role ? `, ${figure.role}` : ""} — a key figure of ${figure.unit?.name ?? figure.world?.name ?? "Criticals and Fumbles"}.`,
    path: `/wiki/${worldSlug}/${unitSlug}/figures/${slug}`,
    image: urlForImage(figure.portrait)?.width(1200).height(630).url(),
  });
}

const THREAT_VARIANT: Record<string, "emerald" | "amber" | "magenta" | "muted"> = {
  friendly: "emerald",
  neutral: "muted",
  cautious: "amber",
  dangerous: "amber",
  deadly: "magenta",
};

const STATUS_LABEL: Record<string, string> = {
  alive: "Alive",
  dead: "Dead",
  unknown: "Unknown",
  missing: "Missing",
};

export default async function KeyFigurePage({
  params,
}: PageProps<"/wiki/[world]/[unit]/figures/[slug]">) {
  const { world: worldSlug, unit: unitSlug, slug } = await params;
  const figure = await client.fetch<KeyFigure | null>(KEY_FIGURE_QUERY, {
    slug,
    worldSlug,
    unitSlug,
  });

  if (!figure) notFound();

  const portraitUrl = urlForImage(figure.portrait)
    ?.width(400)
    .height(400)
    .auto("format")
    .url();

  return (
    <>
      <div className="mx-auto max-w-5xl px-4 py-16 md:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_240px] lg:items-start">
          <article>
            <div className="flex flex-col items-center gap-3 text-center">
              {portraitUrl && (
                <div className="relative h-32 w-32 overflow-hidden rounded-full bg-bg-forest">
                  <Image src={portraitUrl} alt={figure.name} fill className="object-cover" />
                </div>
              )}
              <h1 className="font-display text-5xl text-text">{figure.name}</h1>
              <h2 className="sr-only">Key Figure</h2>
              {figure.alsoKnownAs && (
                <p className="text-sm italic text-text-muted">
                  Also known as {figure.alsoKnownAs}
                </p>
              )}
              <div className="flex flex-wrap justify-center gap-2">
                {figure.role && <Badge variant="muted">{figure.role}</Badge>}
                {figure.status && (
                  <Badge variant="muted">{STATUS_LABEL[figure.status] ?? figure.status}</Badge>
                )}
                {figure.threatLevel && (
                  <Badge variant={THREAT_VARIANT[figure.threatLevel] ?? "muted"}>
                    {figure.threatLevel}
                  </Badge>
                )}
                {figure.faction && (
                  <Badge variant="muted">{figure.faction.name}</Badge>
                )}
              </div>
            </div>

            {figure.description && (
              <div className="mt-10">
                <Renderer value={figure.description} />
              </div>
            )}

            {figure.hasStatBlock && figure.statBlock && (
              <div className="mt-10">
                <StatBlockCard name={figure.name} statBlock={figure.statBlock} />
              </div>
            )}

            <div className="mt-10 flex flex-wrap gap-3 border-t border-border pt-6 font-ui text-xs text-text-muted">
              {figure.world && (
                <Link href={`/wiki/${figure.world.slug}`} className="hover:text-emerald">
                  {figure.world.name}
                </Link>
              )}
              {figure.unit && (
                <Link
                  href={`/wiki/${figure.world?.slug}/${figure.unit.slug}`}
                  className="hover:text-emerald"
                >
                  {figure.unit.name}
                </Link>
              )}
            </div>
          </article>

          {figure._createdAt && figure._updatedAt && (
            <WikiEntryMetaPanel
              title={figure.name}
              image={figure.portrait}
              typeLabel="Key Figure"
              statusChip={
                figure.threatLevel
                  ? {
                      label: figure.threatLevel,
                      variant: THREAT_VARIANT[figure.threatLevel] ?? "muted",
                    }
                  : undefined
              }
              createdAt={figure._createdAt}
              updatedAt={figure._updatedAt}
              lastEditedByHandle={figure.lastEditedBy?.handle}
              parentLink={{
                label: figure.unit?.name ?? unitSlug,
                href: `/wiki/${worldSlug}/${unitSlug}`,
              }}
              siblingsHeading={figure.unit ? "In this unit" : "In this world"}
              siblings={(figure.siblingEntries ?? []).map((s) => ({
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
