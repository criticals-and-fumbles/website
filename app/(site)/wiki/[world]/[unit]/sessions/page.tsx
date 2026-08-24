import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { WORLD_UNIT_QUERY, WORLD_UNIT_SESSIONS_QUERY } from "@/sanity/lib/queries";
import type { SessionLogCard, WorldUnit } from "@/sanity/lib/types";
import { WorldUnitNav } from "@/components/wiki/WorldUnitNav";
import { UnitSessionCard } from "@/components/wiki/UnitSessionCard";
import { Footer } from "@/components/layout/Footer";
import { buildMetadata } from "@/lib/metadata";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: PageProps<"/wiki/[world]/[unit]/sessions">): Promise<Metadata> {
  const { world: worldSlug, unit: unitSlug } = await params;
  const unit = await client.fetch<WorldUnit | null>(WORLD_UNIT_QUERY, {
    worldSlug,
    unitSlug,
  });
  if (!unit) return {};

  return buildMetadata({
    title: `${unit.name} — Session Logs`,
    description: `Session logs scoped to ${unit.name}, part of ${unit.world?.name ?? "Criticals and Fumbles"}.`,
    path: `/wiki/${worldSlug}/${unitSlug}/sessions`,
  });
}

export default async function UnitSessionsIndexPage({
  params,
}: PageProps<"/wiki/[world]/[unit]/sessions">) {
  const { world: worldSlug, unit: unitSlug } = await params;

  const unit = await client.fetch<WorldUnit | null>(WORLD_UNIT_QUERY, {
    worldSlug,
    unitSlug,
  });
  if (!unit) notFound();

  const sessions = await client.fetch<SessionLogCard[]>(WORLD_UNIT_SESSIONS_QUERY, {
    unitSlug,
  });

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <WorldUnitNav worldSlug={worldSlug} unitSlug={unitSlug} active="sessions" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <h1 className="font-display text-4xl text-text">{unit.name} — Session Logs</h1>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          {sessions.length === 0 ? (
            <p className="text-sm text-text-muted">
              No sessions scoped to {unit.name} yet.
            </p>
          ) : (
            sessions.map((session) => (
              <UnitSessionCard
                key={session._id}
                session={session}
                worldSlug={worldSlug}
                unitSlug={unitSlug}
              />
            ))
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
