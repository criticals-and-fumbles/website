import { client } from "@/sanity/lib/client";
import { WIKI_SEARCH_INDEX_QUERY, WORLDS_QUERY } from "@/sanity/lib/queries";
import type { World } from "@/sanity/lib/types";
import { WorldCard } from "@/components/wiki/WorldCard";
import { GlobalWikiSearch } from "@/components/wiki/GlobalWikiSearch";
import { Footer } from "@/components/layout/Footer";

export const revalidate = 300;

interface SearchIndex {
  lore: { _id: string; title: string; slug: string; worldSlug: string }[];
  sessions: { _id: string; title: string; slug: string; worldSlug: string }[];
}

export default async function WikiPage() {
  const [worlds, searchIndex] = await Promise.all([
    client.fetch<World[]>(WORLDS_QUERY),
    client.fetch<SearchIndex>(WIKI_SEARCH_INDEX_QUERY),
  ]);

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <h1 className="text-center font-display text-5xl text-text">Wiki</h1>
        <p className="mx-auto mt-4 max-w-xl text-center text-text-muted">
          Four worlds, shaped session by session. Pick one to start exploring.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {worlds.map((world) => (
            <WorldCard key={world._id} world={world} />
          ))}
        </div>

        <div className="mt-16">
          <GlobalWikiSearch lore={searchIndex.lore} sessions={searchIndex.sessions} />
        </div>
      </div>

      <Footer />
    </>
  );
}
