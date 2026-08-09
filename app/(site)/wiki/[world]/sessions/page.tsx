import { notFound } from "next/navigation";
import { client } from "@/sanity/lib/client";
import { SESSION_LOGS_QUERY, WORLD_BY_SLUG_QUERY } from "@/sanity/lib/queries";
import type { SessionLogCard, World } from "@/sanity/lib/types";
import { WorldNav } from "@/components/wiki/WorldNav";
import { SessionCard } from "@/components/wiki/SessionCard";
import { Footer } from "@/components/layout/Footer";

export const revalidate = 300;

export default async function SessionLogIndexPage({
  params,
  searchParams,
}: PageProps<"/wiki/[world]/sessions">) {
  const { world: worldSlug } = await params;
  const { campaignName } = await searchParams;

  const world = await client.fetch<World | null>(WORLD_BY_SLUG_QUERY, {
    slug: worldSlug,
  });
  if (!world) notFound();

  const activeCampaign =
    typeof campaignName === "string" ? campaignName : undefined;

  const sessions = await client.fetch<SessionLogCard[]>(SESSION_LOGS_QUERY, {
    worldSlug,
    campaignName: activeCampaign ?? null,
  });

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <WorldNav worldSlug={worldSlug} active="sessions" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <h1 className="font-display text-4xl text-text">
          {world.name} — Session Logs
        </h1>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          {sessions.length === 0 ? (
            <p className="text-sm text-text-muted">No sessions logged yet.</p>
          ) : (
            sessions.map((session) => (
              <SessionCard key={session._id} session={session} worldSlug={worldSlug} />
            ))
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
