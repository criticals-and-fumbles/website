interface ArticleStructuredDataProps {
  article: {
    title: string;
    excerpt?: string;
    publishedAt?: string;
    author?: { handle: string };
    image?: string;
  };
}

export function ArticleStructuredData({ article }: ArticleStructuredDataProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    author: article.author
      ? { "@type": "Person", name: article.author.handle }
      : {
          "@type": "Organization",
          name: "Criticals and Fumbles",
        },
    publisher: {
      "@type": "Organization",
      name: "Criticals and Fumbles",
      url: process.env.NEXT_PUBLIC_SITE_URL,
    },
    image: article.image,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
