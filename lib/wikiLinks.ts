import type { WikiSiblingEntry } from "@/sanity/lib/types";

/** Builds the correct URL for a wiki-entry-meta-panel sibling item, given
 * its _type and the world/unit slugs the GROQ query already resolved. */
export function wikiSiblingHref(entry: WikiSiblingEntry): string {
  switch (entry._type) {
    case "worldUnit":
      return `/wiki/${entry.worldSlug}/${entry.slug}`;
    case "loreEntry":
      return entry.unitSlug
        ? `/wiki/${entry.worldSlug}/${entry.unitSlug}/lore/${entry.slug}`
        : `/wiki/${entry.worldSlug}/lore/${entry.slug}`;
    case "sessionLog":
      return entry.unitSlug
        ? `/wiki/${entry.worldSlug}/${entry.unitSlug}/sessions/${entry.slug}`
        : `/wiki/${entry.worldSlug}/sessions/${entry.slug}`;
    case "keyFigure":
      return `/wiki/${entry.worldSlug}/${entry.unitSlug}/figures/${entry.slug}`;
    case "notablePlace":
      return `/wiki/${entry.worldSlug}/${entry.unitSlug}/places/${entry.slug}`;
    case "magicItem":
      return `/wiki/${entry.worldSlug}/${entry.unitSlug}/items/${entry.slug}`;
    case "faction":
      return `/wiki/${entry.worldSlug}/${entry.unitSlug}/factions/${entry.slug}`;
  }
}
