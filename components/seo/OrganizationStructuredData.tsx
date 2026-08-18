export function OrganizationStructuredData({ sameAs }: { sameAs: string[] }) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Criticals and Fumbles",
    alternateName: "C&F",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: "Singapore's tabletop RPG community since 2016.",
    foundingDate: "2016",
    sameAs,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
