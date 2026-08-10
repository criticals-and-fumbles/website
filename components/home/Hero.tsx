import Image from "next/image";
import Link from "next/link";
import type { ArticleCard as ArticleCardData, MajorEventCardData } from "@/sanity/lib/types";
import { urlForImage } from "@/sanity/lib/image";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CountdownTimer } from "@/components/events/CountdownTimer";

const STATUS_LABELS: Record<string, string> = {
  "watch-this-space": "Watch This Space",
  "coming-soon": "Coming Soon",
  "registration-open": "Registration Open",
  full: "Full",
};

export function Hero({
  nextEvent,
  fallbackArticle,
}: {
  nextEvent: MajorEventCardData | null;
  fallbackArticle: ArticleCardData | null;
}) {
  const rightImage = urlForImage(
    nextEvent?.splashImage ?? nextEvent?.coverImage ?? fallbackArticle?.coverImage,
  )
    ?.width(900)
    .height(900)
    .auto("format")
    .url();

  return (
    <section className="container grid grid-cols-1 !px-0 md:grid-cols-2">
      <div className="flex flex-col justify-center gap-6 bg-bg px-6 py-20 md:px-12 md:py-32">
        <h1 className="font-display text-6xl leading-none md:text-7xl lg:text-8xl">
          <span className="text-emerald">Criticals</span>{" "}
          <span className="text-amber">&amp;</span>{" "}
          <span className="text-magenta">Fumbles</span>
        </h1>
        <p className="max-w-md text-lg text-text-muted">
          Good Players Make Good Tables. Good Tables Make Good Stories.
        </p>
        <div>
          <LinkButton href="/articles" variant="primary">
            Explore the Archive
          </LinkButton>
        </div>
      </div>

      <div className="relative flex flex-col justify-center overflow-hidden bg-bg-forest px-6 py-20 md:px-12 md:py-32">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 top-1/2 -translate-y-1/2 select-none font-display text-[16rem] leading-none text-white/5"
        >
          20
        </span>

        {nextEvent ? (
          <Link href={`/events/${nextEvent.slug}`} className="relative z-10 flex flex-col gap-4">
            {rightImage && (
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
                <Image src={rightImage} alt={nextEvent.title} fill className="object-cover" />
              </div>
            )}
            <Badge variant="amber">
              {STATUS_LABELS[nextEvent.status] ?? nextEvent.status}
            </Badge>
            <h2 className="font-display text-3xl text-on-forest">{nextEvent.title}</h2>
            {nextEvent.eventDate && (
              <p className="font-ui text-sm text-on-forest-muted">{nextEvent.eventDate}</p>
            )}
            {nextEvent.startDate && <CountdownTimer target={nextEvent.startDate} />}
          </Link>
        ) : fallbackArticle ? (
          <Link
            href={`/articles/${fallbackArticle.slug}`}
            className="relative z-10 flex flex-col gap-4"
          >
            {rightImage && (
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
                <Image
                  src={rightImage}
                  alt={fallbackArticle.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <Badge variant="emerald">Latest Roll</Badge>
            <h2 className="font-display text-3xl text-on-forest">{fallbackArticle.title}</h2>
            {fallbackArticle.excerpt && (
              <p className="text-sm text-on-forest-muted">{fallbackArticle.excerpt}</p>
            )}
          </Link>
        ) : (
          <p className="relative z-10 font-ui text-sm text-on-forest-muted">
            Watch this space — something is brewing.
          </p>
        )}
      </div>
    </section>
  );
}
