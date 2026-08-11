interface EventStructuredDataProps {
  event: {
    title: string;
    tagline?: string;
    startDate?: string;
    eventDate?: string;
    location?: string;
    registrationUrl?: string;
  };
}

export function EventStructuredData({ event }: EventStructuredDataProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description:
      event.tagline ?? `${event.title} — a Criticals and Fumbles event in Singapore.`,
    startDate: event.startDate,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: event.location ?? "Singapore",
      address: {
        "@type": "PostalAddress",
        addressCountry: "SG",
      },
    },
    organizer: {
      "@type": "Organization",
      name: "Criticals and Fumbles",
      url: process.env.NEXT_PUBLIC_SITE_URL,
    },
    offers: event.registrationUrl
      ? {
          "@type": "Offer",
          url: event.registrationUrl,
          availability: "https://schema.org/InStock",
        }
      : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
