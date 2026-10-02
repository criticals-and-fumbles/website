"use client";

import { useMemo, useState } from "react";
import type { EventListItem } from "@/sanity/lib/types";
import { RECOMMENDED_FOR } from "@/sanity/schemas/constants";
import { EventListCard, isRecruiting } from "./EventListCard";

/** Filter chip UI + client-side filtering for the combined /events list.
 * Sorting (Recruiting first, then by _updatedAt) happens once, server-
 * side, in app/(site)/events/page.tsx — this component only narrows
 * which already-sorted items show, it never reorders them, so the
 * "Recruiting on top" guarantee holds regardless of which filters are
 * active. Client-side (not URL params / a server round-trip) because
 * the event count here is small — see this project's established
 * pattern for similarly small, already-fetched lists. */
export function EventsList({ events }: { events: EventListItem[] }) {
  const [recruitingOnly, setRecruitingOnly] = useState(false);
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const filtered = useMemo(() => {
    return events.filter((event) => {
      if (recruitingOnly && !isRecruiting(event)) return false;
      if (activeTags.length > 0) {
        const tags = event.recommendedFor ?? [];
        if (!activeTags.some((tag) => tags.includes(tag))) return false;
      }
      return true;
    });
  }, [events, recruitingOnly, activeTags]);

  function toggleTag(tag: string) {
    setActiveTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  const chipBase =
    "rounded-full border px-3 py-1.5 font-ui text-xs transition-colors min-h-[32px]";
  const chipOn = "border-emerald bg-emerald/10 text-emerald";
  const chipOff = "border-border bg-surface text-text-muted hover:border-emerald/50 hover:text-text";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setRecruitingOnly((v) => !v)}
          className={`${chipBase} ${recruitingOnly ? chipOn : chipOff}`}
          aria-pressed={recruitingOnly}
        >
          Recruiting
        </button>
        <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />
        {RECOMMENDED_FOR.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => toggleTag(tag)}
            className={`${chipBase} ${activeTags.includes(tag) ? chipOn : chipOff}`}
            aria-pressed={activeTags.includes(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="flex flex-col gap-6">
          {filtered.map((event) => (
            <EventListCard key={event._id} event={event} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-muted">
          No events match the selected filters — try clearing one.
        </p>
      )}
    </div>
  );
}
