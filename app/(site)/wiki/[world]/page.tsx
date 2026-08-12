import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import {
  WORLD_BY_SLUG_QUERY,
  WORLD_RECENT_LORE_QUERY,
  WORLD_RECENT_SESSIONS_QUERY,
  WORLD_UNITS_QUERY,
} from "@/sanity/lib/queries";
import type {
  LoreEntryCard,
  SessionLogCard,
  World,
  WorldUnitCard as WorldUnitCardData,
} from "@/sanity/lib/types";
import { buildMetadata, plainTextFromBlocks } from "@/lib/metadata";
import { urlForImage } from "@/sanity/lib/image";
import { WorldNav } from "@/components/wiki/WorldNav";
import { LoreCard } from "@/components/wiki/LoreCard";
import { SessionCard } from "@/components/wiki/SessionCard";
import { WorldUnitCard } from "@/components/wiki/WorldUnitCard";
import { Renderer } from "@/components/portable-text/Renderer";
import { Footer } from "@/components/layout/Footer";

export const revalidate = 300;

/** "Territory" → "Territories", "City" → "Cities", "District" →
 * "Districts". Handles the common consonant+y case; not a full
 * pluralization library, but covers realistic unitLabel values. */
function pluralize(label: string): string {
  if (/[^aeiou]y$/i.test(label)) return `${label.slice(0, -1)}ies`;
  return `${label}s`;
}

export async function generateMetadata({
  params,
}: PageProps<"/wiki/[world]">): Promise<Metadata> {
  const { world: worldSlug } = await params;
  const world = await client.fetch<World | null>(WORLD_BY_SLUG_QUERY, {
    slug: worldSlug,
  });
  if (!world) return {};

  return buildMetadata({
    title: world.name,
    description:
      world.tagline ??
      plainTextFromBlocks(world.description) ??
      `Explore ${world.name}, a Criticals and Fumbles campaign setting.`,
    path: `/wiki/${worldSlug}`,
    image: urlForImage(world.coverImage)?.width(1200).height(630).url(),
  });
}

export default async function WorldHomePage({
  params,
}: PageProps<"/wiki/[world]">) {
  const { world: worldSlug } = await params;
  const world = await client.fetch<World | null>(WORLD_BY_SLUG_QUERY, {
    slug: worldSlug,
  });

  if (!world) notFound();

  const [recentLore, recentSessions, units] = await Promise.all([
    client.fetch<LoreEntryCard[]>(WORLD_RECENT_LORE_QUERY, { worldSlug }),
    client.fetch<SessionLogCard[]>(WORLD_RECENT_SESSIONS_QUERY, { worldSlug }),
    client.fetch<WorldUnitCardData[]>(WORLD_UNITS_QUERY, { worldSlug }),
  ]);

  const unitLabel = world.unitLabel ?? "Territory";

  const accent = world.colourAccent ?? "var(--emerald)";

  return (
    <>
      <section className="border-b-2 px-4 py-16 md:px-8" style={{ borderColor: accent }}>
        <div className="mx-auto max-w-6xl">
          <h1 className="font-display text-6xl" style={{ color: accent }}>
            {world.name}
          </h1>
          {world.tagline && <p className="mt-3 text-lg text-text-muted">{world.tagline}</p>}
          {world.dms && world.dms.length > 0 && (
            <p className="mt-2 font-ui text-xs text-text-muted">
              DM{world.dms.length > 1 ? "s" : ""}:{" "}
              {world.dms.map((d) => d.handle).join(", ")}
            </p>
          )}
          {world.description && (
            <div className="mt-6 max-w-2xl">
              <Renderer value={world.description} />
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <WorldNav worldSlug={world.slug} />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <div className="mb-10 flex flex-wrap gap-8 font-ui text-sm text-text-muted">
          <span>{world.sessionCount ?? 0} sessions logged</span>
          <span>{world.loreCount ?? 0} lore entries</span>
        </div>

        {units.length > 0 && (
          <section className="mb-14">
            <h2 className="mb-6 font-display text-3xl text-text">
              Explore {pluralize(unitLabel)}
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {units.map((unit) => (
                <WorldUnitCard key={unit._id} unit={unit} worldSlug={world.slug} />
              ))}
            </div>
          </section>
        )}

        {recentLore.length > 0 && (
          <section className="mb-14">
            <h2 className="mb-6 font-display text-3xl text-text">Recent Lore</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recentLore.map((entry) => (
                <LoreCard key={entry._id} entry={entry} worldSlug={world.slug} />
              ))}
            </div>
          </section>
        )}

        {recentSessions.length > 0 && (
          <section>
            <h2 className="mb-6 font-display text-3xl text-text">
              Recent Sessions
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {recentSessions.map((session) => (
                <SessionCard key={session._id} session={session} worldSlug={world.slug} />
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </>
  );
}
