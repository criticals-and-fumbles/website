import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { NOTABLE_PLACE_QUERY } from "@/sanity/lib/queries";
import type { NotablePlace } from "@/sanity/lib/types";
import { urlForImage } from "@/sanity/lib/image";
import { Badge } from "@/components/ui/Badge";
import { Renderer } from "@/components/portable-text/Renderer";
import { Footer } from "@/components/layout/Footer";

export const revalidate = 300;

const DANGER_VARIANT: Record<string, "emerald" | "amber" | "magenta" | "muted"> = {
  safe: "emerald",
  "low-risk": "muted",
  dangerous: "amber",
  deadly: "magenta",
};

export default async function NotablePlacePage({
  params,
}: PageProps<"/wiki/[world]/[unit]/places/[slug]">) {
  const { world: worldSlug, unit: unitSlug, slug } = await params;
  const place = await client.fetch<NotablePlace | null>(NOTABLE_PLACE_QUERY, { slug });

  if (!place) notFound();

  return (
    <>
      <article className="mx-auto max-w-3xl px-4 py-16 md:px-8">
        <div className="flex flex-wrap gap-2">
          {place.placeType && <Badge variant="muted">{place.placeType}</Badge>}
          {place.dangerLevel && (
            <Badge variant={DANGER_VARIANT[place.dangerLevel] ?? "muted"}>
              {place.dangerLevel}
            </Badge>
          )}
        </div>
        <h1 className="mt-4 font-display text-5xl text-text">{place.name}</h1>

        {place.description && (
          <div className="mt-10">
            <Renderer value={place.description} />
          </div>
        )}

        {place.images && place.images.length > 0 && (
          <div className="mt-10 grid grid-cols-2 gap-3">
            {place.images.map((img, i) => {
              const url = urlForImage(img)?.width(600).height(400).auto("format").url();
              if (!url) return null;
              return (
                <div
                  key={i}
                  className="relative aspect-[3/2] overflow-hidden rounded-lg bg-bg-forest"
                >
                  <Image src={url} alt={place.name} fill className="object-cover" />
                </div>
              );
            })}
          </div>
        )}

        {place.keyFigures && place.keyFigures.length > 0 && (
          <aside className="mt-10 border-t border-border pt-6">
            <h2 className="font-ui text-sm uppercase tracking-wider text-text-muted">
              Associated Key Figures
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {place.keyFigures.map((figure) => (
                <Link
                  key={figure._id}
                  href={`/wiki/${worldSlug}/${unitSlug}/figures/${figure.slug}`}
                  className="rounded-full border border-border px-3 py-1.5 font-ui text-xs text-text hover:border-emerald hover:text-emerald"
                >
                  {figure.name}
                </Link>
              ))}
            </div>
          </aside>
        )}

        {place.items && place.items.length > 0 && (
          <aside className="mt-6">
            <h2 className="font-ui text-sm uppercase tracking-wider text-text-muted">
              Associated Items
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {place.items.map((item) => (
                <Link
                  key={item._id}
                  href={`/wiki/${worldSlug}/${unitSlug}/items/${item.slug}`}
                  className="rounded-full border border-border px-3 py-1.5 font-ui text-xs text-text hover:border-emerald hover:text-emerald"
                >
                  {item.name}
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
