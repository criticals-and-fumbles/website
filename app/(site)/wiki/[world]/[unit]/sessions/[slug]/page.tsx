import { notFound } from "next/navigation";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { WORLD_UNIT_SESSION_QUERY } from "@/sanity/lib/queries";
import type { SessionLog } from "@/sanity/lib/types";
import { wikiSiblingHref } from "@/lib/wikiLinks";
import { Badge } from "@/components/ui/Badge";
import { WikiEntryMetaPanel } from "@/components/wiki/WikiEntryMetaPanel";
import { Renderer } from "@/components/portable-text/Renderer";
import { Footer } from "@/components/layout/Footer";

export const revalidate = 300;

export default async function UnitSessionLogPage({
  params,
}: PageProps<"/wiki/[world]/[unit]/sessions/[slug]">) {
  const { unit: unitSlug, slug } = await params;
  const session = await client.fetch<SessionLog | null>(WORLD_UNIT_SESSION_QUERY, {
    unitSlug,
    slug,
  });

  if (!session) notFound();

  return (
    <>
      <div className="mx-auto max-w-5xl px-4 py-16 md:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_240px] lg:items-start">
          <article>
            <div className="flex flex-wrap items-center gap-3">
              {session.sessionNumber && (
                <span className="font-ui text-xs text-text-muted">
                  Session {session.sessionNumber}
                </span>
              )}
              {session.tone && <Badge variant="magenta">{session.tone}</Badge>}
            </div>
            <h1 className="mt-3 font-display text-5xl text-text">{session.title}</h1>
            <div className="mt-3 flex flex-wrap gap-3 font-ui text-xs text-text-muted">
              {session.dm && (
                <Link href={`/team/${session.dm.slug}`} className="hover:text-emerald">
                  DM: {session.dm.handle}
                </Link>
              )}
              {session.sessionDate && (
                <span>{new Date(session.sessionDate).toLocaleDateString()}</span>
              )}
            </div>

            {session.players && session.players.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {session.players.map((player) => (
                  <Link
                    key={player._id}
                    href={`/team/${player.slug}`}
                    className="rounded-full border border-border px-3 py-1 font-ui text-xs text-text hover:border-emerald hover:text-emerald"
                  >
                    {player.handle}
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-10 space-y-10">
              {session.fullRecap && session.fullRecap.length > 0 && (
                <div>
                  <h2 className="font-display text-2xl text-text">Recap</h2>
                  <Renderer value={session.fullRecap} />
                </div>
              )}
              {session.notableMoments && session.notableMoments.length > 0 && (
                <div>
                  <h2 className="font-display text-2xl text-text">Notable Moments</h2>
                  <Renderer value={session.notableMoments} />
                </div>
              )}
              {session.loreUpdates && session.loreUpdates.length > 0 && (
                <div>
                  <h2 className="font-display text-2xl text-text">Lore Updates</h2>
                  <Renderer value={session.loreUpdates} />
                </div>
              )}
              {session.npcStatusChanges && session.npcStatusChanges.length > 0 && (
                <div>
                  <h2 className="font-display text-2xl text-text">NPC Status Changes</h2>
                  <Renderer value={session.npcStatusChanges} />
                </div>
              )}
            </div>

            {session.nextSession && (
              <p className="mt-10 border-t border-border pt-6 font-ui text-sm text-text-muted">
                Next session: {session.nextSession}
              </p>
            )}
          </article>

          {session._createdAt && session._updatedAt && (
            <WikiEntryMetaPanel
              typeLabel="Session Log"
              ownerHandle={session.dm?.handle}
              createdAt={session._createdAt}
              updatedAt={session._updatedAt}
              lastEditedByHandle={session.lastEditedBy?.handle}
              siblingsHeading="In this unit"
              siblings={(session.siblingEntries ?? []).map((s) => ({
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
