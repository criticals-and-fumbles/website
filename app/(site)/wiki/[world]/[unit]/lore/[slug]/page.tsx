import { notFound } from "next/navigation";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { WORLD_UNIT_LORE_ENTRY_QUERY } from "@/sanity/lib/queries";
import type { LoreEntry } from "@/sanity/lib/types";
import { Badge } from "@/components/ui/Badge";
import { CanonBadge } from "@/components/ui/CanonBadge";
import { Renderer } from "@/components/portable-text/Renderer";
import { Footer } from "@/components/layout/Footer";

export const revalidate = 300;

export default async function UnitLoreEntryPage({
  params,
}: PageProps<"/wiki/[world]/[unit]/lore/[slug]">) {
  const { world: worldSlug, unit: unitSlug, slug } = await params;
  const entry = await client.fetch<LoreEntry | null>(WORLD_UNIT_LORE_ENTRY_QUERY, {
    unitSlug,
    slug,
  });

  if (!entry) notFound();

  const issueTitle = encodeURIComponent(`Suggest an edit: ${entry.title}`);

  return (
    <>
      <article className="mx-auto max-w-3xl px-4 py-16 md:px-8">
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
                  href={`/wiki/${worldSlug}/${unitSlug}/lore/${related.slug}`}
                  className="rounded-full border border-border px-3 py-1.5 font-ui text-xs text-text hover:border-emerald hover:text-emerald"
                >
                  {related.title}
                </Link>
              ))}
            </div>
          </aside>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 font-ui text-xs text-text-muted">
          {entry.lastEditedBy && <span>Last edited by {entry.lastEditedBy.handle}</span>}
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

      <Footer />
    </>
  );
}
