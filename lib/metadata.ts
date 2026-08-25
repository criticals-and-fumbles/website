import type { Metadata } from "next";
import type { PortableTextBlock } from "sanity";

const SITE_NAME = "Criticals and Fumbles";
// Google truncates SERP titles around this length — long Sanity entity
// names (unit/member names, etc.) combined with the " | Criticals and
// Fumbles" suffix can otherwise exceed it. Only the entity-supplied part
// gets trimmed, never the site-name suffix, so search results still show
// which site a truncated title belongs to.
const MAX_TITLE_LENGTH = 60;
// Google's SERP snippet truncation point for descriptions.
const MAX_DESCRIPTION_LENGTH = 155;
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.criticalsandfumbles.com").replace(/\/$/, "");
// Dynamically generated (app/og-default/route.tsx via ImageResponse) —
// not a static /public file, no image-generation tool available to
// produce one directly.
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default`;

interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article" | "event";
}

function buildFullTitle(title: string): string {
  if (title.includes(SITE_NAME)) return title;
  const suffix = ` | ${SITE_NAME}`;
  const budget = MAX_TITLE_LENGTH - suffix.length;
  const entityTitle = title.length > budget ? `${title.slice(0, budget - 1).trimEnd()}…` : title;
  return `${entityTitle}${suffix}`;
}

function truncateDescription(description: string): string {
  if (description.length <= MAX_DESCRIPTION_LENGTH) return description;
  return `${description.slice(0, MAX_DESCRIPTION_LENGTH - 1).trimEnd()}…`;
}

export function buildMetadata({
  title,
  description,
  path,
  image,
  type = "website",
}: PageMetadataInput): Metadata {
  const url = `${SITE_URL}${path}`;
  const ogImage = image ?? DEFAULT_OG_IMAGE;
  const fullTitle = buildFullTitle(title);
  const fullDescription = truncateDescription(description);

  return {
    title: fullTitle,
    description: fullDescription,
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      url,
      siteName: SITE_NAME,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      locale: "en_SG",
      // Open Graph doesn't have an "event" type — schema.org Event
      // structured data (see components/seo/EventStructuredData.tsx)
      // carries the actual event semantics; OG just gets "website".
      type: type === "event" ? "website" : type,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: fullDescription,
      images: [ogImage],
    },
    alternates: { canonical: url },
  };
}

/** First span of text from a Portable Text body — used as a metadata
 * description fallback when no dedicated excerpt/summary field is set. */
export function plainTextFromBlocks(blocks?: PortableTextBlock[]): string | undefined {
  const block = blocks?.find((b) => b._type === "block");
  if (!block) return undefined;
  const text = (block.children as { text?: string }[] | undefined)
    ?.map((child) => child.text ?? "")
    .join("");
  return text || undefined;
}
