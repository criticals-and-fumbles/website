import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { KEY_FIGURE_QUERY } from "@/sanity/lib/queries";
import type { KeyFigure } from "@/sanity/lib/types";
import { urlForImage } from "@/sanity/lib/image";
import { Badge } from "@/components/ui/Badge";
import { StatBlockCard } from "@/components/wiki/StatBlockCard";
import { Renderer } from "@/components/portable-text/Renderer";
import { Footer } from "@/components/layout/Footer";

export const revalidate = 300;

const THREAT_VARIANT: Record<string, "emerald" | "amber" | "magenta" | "muted"> = {
  friendly: "emerald",
  neutral: "muted",
  cautious: "amber",
  dangerous: "amber",
  deadly: "magenta",
};

const STATUS_LABEL: Record<string, string> = {
  alive: "Alive",
  dead: "Dead",
  unknown: "Unknown",
  missing: "Missing",
};

export default async function KeyFigurePage({
  params,
}: PageProps<"/wiki/[world]/[unit]/figures/[slug]">) {
  const { slug } = await params;
  const figure = await client.fetch<KeyFigure | null>(KEY_FIGURE_QUERY, { slug });

  if (!figure) notFound();

  const portraitUrl = urlForImage(figure.portrait)
    ?.width(400)
    .height(400)
    .auto("format")
    .url();

  return (
    <>
      <article className="mx-auto max-w-3xl px-4 py-16 md:px-8">
        <div className="flex flex-col items-center gap-3 text-center">
          {portraitUrl && (
            <div className="relative h-32 w-32 overflow-hidden rounded-full bg-bg-forest">
              <Image src={portraitUrl} alt={figure.name} fill className="object-cover" />
            </div>
          )}
          <h1 className="font-display text-5xl text-text">{figure.name}</h1>
          {figure.alsoKnownAs && (
            <p className="text-sm italic text-text-muted">
              Also known as {figure.alsoKnownAs}
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-2">
            {figure.role && <Badge variant="muted">{figure.role}</Badge>}
            {figure.status && (
              <Badge variant="muted">{STATUS_LABEL[figure.status] ?? figure.status}</Badge>
            )}
            {figure.threatLevel && (
              <Badge variant={THREAT_VARIANT[figure.threatLevel] ?? "muted"}>
                {figure.threatLevel}
              </Badge>
            )}
            {figure.faction && (
              <Badge variant="muted">{figure.faction.name}</Badge>
            )}
          </div>
        </div>

        {figure.description && (
          <div className="mt-10">
            <Renderer value={figure.description} />
          </div>
        )}

        {figure.hasStatBlock && figure.statBlock && (
          <div className="mt-10">
            <StatBlockCard name={figure.name} statBlock={figure.statBlock} />
          </div>
        )}

        <div className="mt-10 flex flex-wrap gap-3 border-t border-border pt-6 font-ui text-xs text-text-muted">
          {figure.world && (
            <Link href={`/wiki/${figure.world.slug}`} className="hover:text-emerald">
              {figure.world.name}
            </Link>
          )}
          {figure.unit && (
            <Link
              href={`/wiki/${figure.world?.slug}/${figure.unit.slug}`}
              className="hover:text-emerald"
            >
              {figure.unit.name}
            </Link>
          )}
        </div>
      </article>

      <Footer />
    </>
  );
}
