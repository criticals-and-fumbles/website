import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { FACTION_QUERY } from "@/sanity/lib/queries";
import type { Faction } from "@/sanity/lib/types";
import { urlForImage } from "@/sanity/lib/image";
import { Badge } from "@/components/ui/Badge";
import { Renderer } from "@/components/portable-text/Renderer";
import { Footer } from "@/components/layout/Footer";

export const revalidate = 300;

export default async function FactionPage({
  params,
}: PageProps<"/wiki/[world]/[unit]/factions/[slug]">) {
  const { world: worldSlug, unit: unitSlug, slug } = await params;
  const faction = await client.fetch<Faction | null>(FACTION_QUERY, { slug });

  if (!faction) notFound();

  const bannerUrl = urlForImage(faction.banner)
    ?.width(300)
    .height(300)
    .auto("format")
    .url();

  return (
    <>
      <article className="mx-auto max-w-3xl px-4 py-16 md:px-8">
        <div className="flex items-center gap-4">
          {bannerUrl && (
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded bg-bg-forest">
              <Image src={bannerUrl} alt={faction.name} fill className="object-cover" />
            </div>
          )}
          <div>
            {faction.factionType && <Badge variant="muted">{faction.factionType}</Badge>}
            <h1 className="mt-2 font-display text-5xl text-text">{faction.name}</h1>
          </div>
        </div>

        {faction.description && (
          <div className="mt-10">
            <Renderer value={faction.description} />
          </div>
        )}

        {faction.members && faction.members.length > 0 && (
          <aside className="mt-10 border-t border-border pt-6">
            <h2 className="font-ui text-sm uppercase tracking-wider text-text-muted">
              Known Members
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {faction.members.map((member) => (
                <Link
                  key={member._id}
                  href={`/wiki/${worldSlug}/${unitSlug}/figures/${member.slug}`}
                  className="rounded-full border border-border px-3 py-1.5 font-ui text-xs text-text hover:border-emerald hover:text-emerald"
                >
                  {member.name}
                </Link>
              ))}
            </div>
          </aside>
        )}
      </article>

      <Footer />
    </>
  );
}
