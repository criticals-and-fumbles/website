/**
 * Ported 1:1 from app/og-default/route.tsx and
 * app/(site)/events/[slug]/opengraph-image.tsx in the main site — same
 * visual output, just rendered here (via a webhook, ahead of time) instead
 * of on every request inside the main site's Worker.
 */

/**
 * logoDataUri: the mascot logo (public/logo.png, resized + base64-inlined
 * by index.ts — satori has no network access, so <img src> must already
 * be a data URI). Shown instead of the old plain-text wordmark: Google's
 * SERP thumbnail crops this 1200x630 image to a near-square centered
 * region, which used to clip the leading/trailing letters of a
 * full-width text lockup — the logo is square and naturally sits inside
 * that crop with margin to spare.
 */
export function defaultImageElement(logoDataUri: string) {
  return (
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
      <img src={logoDataUri} width={340} height={341} />
      <div
        style={{
          marginTop: 20,
          fontSize: 24,
          color: "#F0EAE0",
          fontFamily: "monospace",
        }}
      >
        Singapore&apos;s Tabletop RPG Community
      </div>
    </div>
  );
}

export function eventImageElement({
  title,
  photoUrl,
}: {
  title: string;
  photoUrl?: string;
}) {
  if (photoUrl) {
    return <img src={photoUrl} width={1200} height={630} alt="" style={{ objectFit: "cover" }} />;
  }

  return (
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
      <div style={{ fontSize: 64, color: "#F0EAE0", fontWeight: 700, lineHeight: 1.1 }}>
        {title}
      </div>
    </div>
  );
}
