"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

interface SearchItem {
  _id: string;
  title: string;
  slug: string;
  worldSlug: string;
}

export function GlobalWikiSearch({
  lore,
  sessions,
}: {
  lore: SearchItem[];
  sessions: SearchItem[];
}) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (query.trim().length < 2) return [];
    const q = query.toLowerCase();
    const loreMatches = lore
      .filter((item) => item.title.toLowerCase().includes(q))
      .map((item) => ({ ...item, type: "Lore" as const, href: `/wiki/${item.worldSlug}/lore/${item.slug}` }));
    const sessionMatches = sessions
      .filter((item) => item.title.toLowerCase().includes(q))
      .map((item) => ({
        ...item,
        type: "Session" as const,
        href: `/wiki/${item.worldSlug}/sessions/${item.slug}`,
      }));
    return [...loreMatches, ...sessionMatches].slice(0, 20);
  }, [query, lore, sessions]);

  return (
    <div className="mx-auto max-w-xl">
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search lore and sessions across every world…"
        className="min-h-[44px] w-full rounded-md border border-border bg-surface px-4 text-sm text-text placeholder:text-text-muted focus:border-emerald focus:outline-none"
      />
      {results.length > 0 && (
        <ul className="mt-3 divide-y divide-border rounded-md border border-border bg-surface">
          {results.map((result) => (
            <li key={`${result.type}-${result._id}`}>
              <Link
                href={result.href}
                className="flex items-center justify-between px-4 py-3 text-sm text-text hover:text-emerald"
              >
                <span>{result.title}</span>
                <span className="font-ui text-xs text-text-muted">
                  {result.type}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
