import { ImageResponse } from "next/og";
import { client } from "@/sanity/lib/client";
import { MAJOR_EVENT_BY_SLUG_QUERY } from "@/sanity/lib/queries";
import { urlForImage } from "@/sanity/lib/image";
import type { MajorEvent } from "@/sanity/lib/types";

// No explicit `runtime` export — Edge Runtime is deprecated in this
// Next.js version; ImageResponse works fine on the default (nodejs) runtime.
export const alt = "Criticals and Fumbles Event";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await client.fetch<MajorEvent | null>(MAJOR_EVENT_BY_SLUG_QUERY, {
    slug,
  });

  // Prefer a real splash/cover image over the generated fallback, if set.
  const photoUrl = urlForImage(event?.splashImage ?? event?.coverImage)
    ?.width(size.width)
    .height(size.height)
    .url();

  if (photoUrl) {
    return new ImageResponse(
      (
        <img
          src={photoUrl}
          width={size.width}
          height={size.height}
          alt=""
          style={{ objectFit: "cover" }}
        />
      ),
      { ...size },
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: "#111111",
          padding: "60px",
        }}
      >
        <div
          style={{
            fontSize: 20,
            color: "#2EC56B",
            fontFamily: "monospace",
            marginBottom: 16,
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          Criticals & Fumbles Event
        </div>
        <div
          style={{
            fontSize: 64,
            color: "#F0EAE0",
            fontWeight: 700,
            lineHeight: 1.1,
          }}
        >
          {event?.title ?? "Event"}
        </div>
      </div>
    ),
    { ...size },
  );
}
