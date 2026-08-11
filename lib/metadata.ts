import type { Metadata } from "next";
import type { PortableTextBlock } from "sanity";

const SITE_NAME = "Criticals and Fumbles";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cnf.sg";
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

export function buildMetadata({
  title,
  description,
  path,
  image,
  type = "website",
}: PageMetadataInput): Metadata {
  const url = `${SITE_URL}${path}`;
  const ogImage = image ?? DEFAULT_OG_IMAGE;
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
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
      description,
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
