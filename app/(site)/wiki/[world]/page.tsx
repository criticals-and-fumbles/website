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
import { WikiEntryMetaPanel } from "@/components/wiki/WikiEntryMetaPanel";
import { Renderer } from "@/components/portable-text/Renderer";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";

/** "The Making of the Continent" -> "the-making-of-the-continent" —
 * anchor id for a section heading. Not a general slugify utility, just
 * enough for this page's own headings. */
function headingId(heading: string): string {
  return heading
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const revalidate = 300;

const STATUS_BADGE: Record<
  string,
  { label: string; variant: "amber" | "emerald" | "magenta" | "muted" } | undefined
> = {
  active: { label: "Active", variant: "emerald" },
  hiatus: { label: "Hiatus", variant: "amber" },
  concluded: { label: "Concluded", variant: "muted" },
};

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
          {/* Fallback so the page always has a real h2 even when this
              world has no units/lore/sessions yet to trigger one of the
              conditional headings below — confirmed missing in practice
              via a Screaming Frog audit, 2026-08-25. */}
          <h2 className="sr-only">World Overview</h2>
          {world.tagline && <p className="mt-3 text-lg text-text-muted">{world.tagline}</p>}
          {world.dms && world.dms.length > 0 && (
            <p className="mt-2 font-ui text-xs text-text-muted">
              DM{world.dms.length > 1 ? "s" : ""}:{" "}
              {world.dms.map((d) => d.handle).join(", ")}
            </p>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_280px] lg:items-start">
          <div>
            {world.sections && world.sections.length > 0 ? (
              <>
                {world.sections.length > 1 && (
                  <nav
                    aria-label="Contents"
                    className="mb-8 rounded-md border border-border bg-surface p-4"
                  >
                    <span className="font-ui text-xs uppercase tracking-wider text-text-muted">
                      Contents
                    </span>
                    <ol className="mt-2 flex flex-col gap-1.5">
                      {world.sections.map((section, i) => (
                        <li key={section._key}>
                          <a
                            href={`#${headingId(section.heading)}`}
                            className="text-emerald underline decoration-emerald/40 underline-offset-2 transition-colors hover:decoration-emerald"
                          >
                            {i + 1}. {section.heading}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </nav>
                )}

                {world.sections.map((section) => (
                  <section key={section._key} id={headingId(section.heading)} className="scroll-mt-24">
                    <h2 className="mt-8 mb-3 font-display text-3xl text-text">
                      {section.heading}
                    </h2>
                    <Renderer value={section.body} />
                  </section>
                ))}
              </>
            ) : (
              world.description && <Renderer value={world.description} />
            )}

            {((world.relatedArticles && world.relatedArticles.length > 0) ||
              (world.relatedDossiers && world.relatedDossiers.length > 0)) && (
              <aside className="mt-12 border-t border-border pt-6">
                <h2 className="font-ui text-sm uppercase tracking-wider text-text-muted">
                  Related Reading
                </h2>
                <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                  {world.relatedArticles && world.relatedArticles.length > 0 && (
                    <div>
                      <span className="font-ui text-xs uppercase tracking-wider text-text-muted">
                        Articles
                      </span>
                      <ul className="mt-1.5 flex flex-col gap-1.5">
                        {world.relatedArticles.map((article) => (
                          <li key={article._id}>
                            <Link
                              href={`/articles/${article.slug}`}
                              className="text-emerald underline decoration-emerald/40 underline-offset-2 transition-colors hover:decoration-emerald"
                            >
                              {article.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {world.relatedDossiers && world.relatedDossiers.length > 0 && (
                    <div>
                      <span className="font-ui text-xs uppercase tracking-wider text-text-muted">
                        Campaign Dossiers
                      </span>
                      <ul className="mt-1.5 flex flex-col gap-1.5">
                        {world.relatedDossiers.map((dossier) =>
                          dossier.campaignSlug ? (
                            <li key={dossier._id}>
                              <a
                                href={`https://campaigns.criticalsandfumbles.com/${dossier.campaignSlug}/${dossier.code}`}
                                className="text-emerald underline decoration-emerald/40 underline-offset-2 transition-colors hover:decoration-emerald"
                              >
                                {dossier.title}
                              </a>
                            </li>
                          ) : null,
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </aside>
            )}
          </div>

          {world._createdAt && world._updatedAt && (
            <WikiEntryMetaPanel
              title={world.name}
              image={world.coverImage}
              typeLabel="World"
              statusChip={world.status ? STATUS_BADGE[world.status] : undefined}
              ownerHandle={world.dms?.[0]?.handle}
              createdAt={world._createdAt}
              updatedAt={world._updatedAt}
              lastEditedByHandle={world.lastEditedBy?.handle}
              siblingsHeading={pluralize(unitLabel)}
              siblings={units.slice(0, 4).map((unit) => ({
                title: unit.name,
                href: `/wiki/${world.slug}/${unit.slug}`,
              }))}
            />
          )}
        </div>
      </div>

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
