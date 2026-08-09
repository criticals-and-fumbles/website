import Image from "next/image";
import Link from "next/link";
import type { World } from "@/sanity/lib/types";
import { urlForImage } from "@/sanity/lib/image";

export function WorldCard({ world }: { world: World }) {
  const imageUrl = urlForImage(world.coverImage)
    ?.width(800)
    .height(450)
    .auto("format")
    .url();
  const accent = world.colourAccent ?? "var(--emerald)";

  return (
    <Link
      href={`/wiki/${world.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border-2 bg-surface transition-transform hover:-translate-y-1"
      style={{ borderColor: accent }}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-bg-forest">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={world.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-6">
        <h3 className="font-display text-3xl" style={{ color: accent }}>
          {world.name}
        </h3>
        {world.dms && world.dms.length > 0 && (
          <p className="font-ui text-xs text-text-muted">
            DM{world.dms.length > 1 ? "s" : ""}:{" "}
            {world.dms.map((d) => d.handle).join(", ")}
          </p>
        )}
        {world.tagline && <p className="text-sm text-text-muted">{world.tagline}</p>}
        {(world.sessionCount || world.loreCount) && (
          <p className="mt-auto font-ui text-xs text-text-muted">
            {world.loreCount ?? 0} lore entries · {world.sessionCount ?? 0} sessions
          </p>
        )}
        <span className="font-ui text-sm" style={{ color: accent }}>
          Enter World →
        </span>
      </div>
    </Link>
  );
}
