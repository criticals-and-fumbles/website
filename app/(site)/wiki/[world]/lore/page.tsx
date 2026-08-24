import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { LORE_ENTRIES_QUERY, WORLD_BY_SLUG_QUERY } from "@/sanity/lib/queries";
import { LORE_CATEGORIES, CANON_STATUSES } from "@/sanity/schemas/constants";
import type { LoreEntryCard, World } from "@/sanity/lib/types";
import { WorldNav } from "@/components/wiki/WorldNav";
import { LoreCard } from "@/components/wiki/LoreCard";
import { Footer } from "@/components/layout/Footer";
import { buildMetadata } from "@/lib/metadata";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: PageProps<"/wiki/[world]/lore">): Promise<Metadata> {
  const { world: worldSlug } = await params;
  const world = await client.fetch<World | null>(WORLD_BY_SLUG_QUERY, {
    slug: worldSlug,
  });
  if (!world) return {};

  return buildMetadata({
    title: `${world.name} — Lore`,
    description: `Browse lore entries from ${world.name}, a Criticals and Fumbles campaign setting.`,
    path: `/wiki/${worldSlug}/lore`,
  });
}

function filterLink(
  worldSlug: string,
  params: { category?: string; canonStatus?: string },
) {
  const search = new URLSearchParams();
  if (params.category) search.set("category", params.category);
  if (params.canonStatus) search.set("canonStatus", params.canonStatus);
  const qs = search.toString();
  return `/wiki/${worldSlug}/lore${qs ? `?${qs}` : ""}`;
}

export default async function LoreIndexPage({
  params,
  searchParams,
}: PageProps<"/wiki/[world]/lore">) {
  const { world: worldSlug } = await params;
  const { category, canonStatus } = await searchParams;

  const world = await client.fetch<World | null>(WORLD_BY_SLUG_QUERY, {
    slug: worldSlug,
  });
  if (!world) notFound();

  const activeCategory = typeof category === "string" ? category : undefined;
  const activeCanon = typeof canonStatus === "string" ? canonStatus : undefined;

  const entries = await client.fetch<LoreEntryCard[]>(LORE_ENTRIES_QUERY, {
    worldSlug,
    category: activeCategory ?? null,
    canonStatus: activeCanon ?? null,
  });

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <WorldNav worldSlug={worldSlug} active="lore" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <h1 className="font-display text-4xl text-text">{world.name} — Lore</h1>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href={filterLink(worldSlug, { canonStatus: activeCanon })}
            className={`rounded-full border px-3 py-1.5 font-ui text-xs ${
              !activeCategory
                ? "border-emerald text-emerald"
                : "border-border text-text-muted hover:border-emerald"
            }`}
          >
            All Categories
          </Link>
          {LORE_CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={filterLink(worldSlug, { category: cat, canonStatus: activeCanon })}
              className={`rounded-full border px-3 py-1.5 font-ui text-xs ${
                activeCategory === cat
                  ? "border-emerald text-emerald"
                  : "border-border text-text-muted hover:border-emerald"
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={filterLink(worldSlug, { category: activeCategory })}
            className={`rounded-full border px-3 py-1.5 font-ui text-xs ${
              !activeCanon
                ? "border-amber text-amber"
                : "border-border text-text-muted hover:border-amber"
            }`}
          >
            All Canon Status
          </Link>
          {CANON_STATUSES.map((status) => (
            <Link
              key={status.value}
              href={filterLink(worldSlug, {
                category: activeCategory,
                canonStatus: status.value,
              })}
              className={`rounded-full border px-3 py-1.5 font-ui text-xs ${
                activeCanon === status.value
                  ? "border-amber text-amber"
                  : "border-border text-text-muted hover:border-amber"
              }`}
            >
              {status.title}
            </Link>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {entries.length === 0 ? (
            <p className="col-span-full text-sm text-text-muted">
              No lore entries match these filters yet.
            </p>
          ) : (
            entries.map((entry) => (
              <LoreCard key={entry._id} entry={entry} worldSlug={worldSlug} />
            ))
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
