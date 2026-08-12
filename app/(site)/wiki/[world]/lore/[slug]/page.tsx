import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { LORE_ENTRY_BY_SLUG_QUERY } from "@/sanity/lib/queries";
import type { LoreEntry } from "@/sanity/lib/types";
import { urlForImage } from "@/sanity/lib/image";
import { buildMetadata } from "@/lib/metadata";
import { wikiSiblingHref } from "@/lib/wikiLinks";
import { Badge } from "@/components/ui/Badge";
import { CanonBadge } from "@/components/ui/CanonBadge";
import { WikiEntryMetaPanel } from "@/components/wiki/WikiEntryMetaPanel";
import { Renderer } from "@/components/portable-text/Renderer";
import { Footer } from "@/components/layout/Footer";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: PageProps<"/wiki/[world]/lore/[slug]">): Promise<Metadata> {
  const { world: worldSlug, slug } = await params;
  const entry = await client.fetch<LoreEntry | null>(LORE_ENTRY_BY_SLUG_QUERY, {
    worldSlug,
    slug,
  });
  if (!entry) return {};

  return buildMetadata({
    title: entry.title,
    description:
      entry.summary ??
      `${entry.title} — lore from Criticals and Fumbles' wiki.`,
    path: `/wiki/${worldSlug}/lore/${slug}`,
    image: urlForImage(entry.coverImage)?.width(1200).height(630).url(),
  });
}

export default async function LoreEntryPage({
  params,
}: PageProps<"/wiki/[world]/lore/[slug]">) {
  const { world: worldSlug, slug } = await params;
  const entry = await client.fetch<LoreEntry | null>(LORE_ENTRY_BY_SLUG_QUERY, {
    worldSlug,
    slug,
  });

  if (!entry) notFound();

  const issueTitle = encodeURIComponent(`Suggest an edit: ${entry.title}`);

  return (
    <>
      <div className="mx-auto max-w-5xl px-4 py-16 md:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_240px] lg:items-start">
          <article>
            <div className="flex flex-wrap gap-2">
              {entry.category && <Badge variant="amber">{entry.category}</Badge>}
              <CanonBadge status={entry.canonStatus} />
            </div>
            <h1 className="mt-4 font-display text-5xl text-text">{entry.title}</h1>
            {entry.alsoKnownAs && (
              <p className="mt-1 text-sm italic text-text-muted">
                Also known as {entry.alsoKnownAs}
              </p>
            )}

            <div className="mt-10">
              <Renderer value={entry.body} />
            </div>

            {entry.relatedEntries && entry.relatedEntries.length > 0 && (
              <aside className="mt-10 border-t border-border pt-6">
                <h2 className="font-ui text-sm uppercase tracking-wider text-text-muted">
                  Related Entries
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {entry.relatedEntries.map((related) => (
                    <Link
                      key={related._id}
                      href={`/wiki/${worldSlug}/lore/${related.slug}`}
                      className="rounded-full border border-border px-3 py-1.5 font-ui text-xs text-text hover:border-emerald hover:text-emerald"
                    >
                      {related.title}
                    </Link>
                  ))}
                </div>
              </aside>
            )}

            <div className="mt-10 flex flex-wrap items-center justify-end gap-4 border-t border-border pt-6 font-ui text-xs text-text-muted">
              <a
                href={`https://github.com/criticals-and-fumbles/website/issues/new?title=${issueTitle}`}
                target="_blank"
                rel="noreferrer"
                className="text-emerald hover:underline"
              >
                Suggest an edit
              </a>
            </div>
          </article>

          {entry._createdAt && entry._updatedAt && (
            <WikiEntryMetaPanel
              typeLabel="Lore Entry"
              createdAt={entry._createdAt}
              updatedAt={entry._updatedAt}
              lastEditedByHandle={entry.lastEditedBy?.handle}
              siblingsHeading="In this world"
              siblings={(entry.siblingEntries ?? []).map((s) => ({
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
