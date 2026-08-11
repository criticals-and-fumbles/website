import type { PinnedEvent, RssFeedItem } from "@/sanity/lib/types";
import { LinkButton } from "@/components/ui/Button";
import { HeroRightPanel } from "@/components/home/HeroRightPanel";
import { DiscordIcon } from "@/components/icons/SocialIcons";

export function Hero({
  pinnedEvent,
  rssFeed,
  discordUrl,
}: {
  pinnedEvent: PinnedEvent | null;
  rssFeed: RssFeedItem[];
  discordUrl?: string;
}) {
  return (
    <section className="container grid grid-cols-1 !px-0 md:grid-cols-2">
      <div className="flex flex-col justify-center gap-6 bg-bg px-6 py-20 md:px-12 md:py-32">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
              aria-hidden="true"
              className="h-4 w-4 text-emerald"
            >
              <path d="M12 2 21 7.5v9L12 22 3 16.5v-9L12 2Z" />
              <path d="M12 2v20M3 7.5l9 5 9-5M3 16.5l9-5 9 5" />
            </svg>
            <span className="font-ui text-xs uppercase tracking-wider text-text-muted">
              Singapore&apos;s Tabletop RPG Community
            </span>
          </div>
          <h1 className="font-display text-6xl leading-none md:text-7xl lg:text-8xl">
            <span className="text-emerald">Criticals</span>{" "}
            <span className="text-amber">&amp;</span>{" "}
            <span className="text-magenta">Fumbles</span>
          </h1>
        </div>
        <p className="max-w-md text-lg text-text-muted">
          Good Players Make Good Tables. Good Tables Make Good Stories.
        </p>
        <div className="flex flex-wrap gap-3">
          <LinkButton href="/articles" variant="primary">
            Explore the Archive
          </LinkButton>
          {discordUrl && (
            <a
              href={discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-emerald px-5 py-2.5 font-ui text-sm text-bg transition-opacity hover:opacity-90"
            >
              <span className="h-[18px] w-[18px]">
                <DiscordIcon />
              </span>
              Join our Discord
            </a>
          )}
        </div>
      </div>

      <HeroRightPanel pinnedEvent={pinnedEvent} rssFeed={rssFeed} />
    </section>
  );
}
