import { ImageResponse } from "next/og";

// No explicit `runtime` export — Edge Runtime is deprecated in this
// Next.js version; ImageResponse works fine on the default (nodejs)
// runtime, which is also what @opennextjs/cloudflare expects.
/**
 * Branded fallback OG image, served at /og-default and referenced by
 * lib/metadata.ts's DEFAULT_OG_IMAGE. Not a static /public/og-default.png
 * (no image-generation tool available to produce one) — generated
 * on-the-fly instead, same approach as the per-event opengraph-image.tsx.
 */
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#111111",
        }}
      >
        <div style={{ display: "flex", fontSize: 80, fontWeight: 700 }}>
          <span style={{ color: "#2EC56B" }}>Criticals</span>
          <span style={{ color: "#C8893A", margin: "0 20px" }}>&amp;</span>
          <span style={{ color: "#D946A8" }}>Fumbles</span>
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 28,
            color: "#F0EAE0",
            fontFamily: "monospace",
          }}
        >
          Singapore&apos;s Tabletop RPG Community
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
