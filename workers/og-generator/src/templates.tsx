/**
 * Ported 1:1 from app/og-default/route.tsx and
 * app/(site)/events/[slug]/opengraph-image.tsx in the main site — same
 * visual output, just rendered here (via a webhook, ahead of time) instead
 * of on every request inside the main site's Worker.
 */

export function defaultImageElement() {
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
