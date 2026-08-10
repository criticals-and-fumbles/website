import type { PinnedEvent, RssFeedItem } from "@/sanity/lib/types";
import { LinkButton } from "@/components/ui/Button";
import { HeroRightPanel } from "@/components/home/HeroRightPanel";

export function Hero({
  pinnedEvent,
  rssFeed,
}: {
  pinnedEvent: PinnedEvent | null;
  rssFeed: RssFeedItem[];
}) {
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

      <HeroRightPanel pinnedEvent={pinnedEvent} rssFeed={rssFeed} />
    </section>
  );
}
