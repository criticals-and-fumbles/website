export function OrganizationStructuredData({ sameAs }: { sameAs: string[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Criticals and Fumbles",
    alternateName: "C&F",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    logo: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
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
