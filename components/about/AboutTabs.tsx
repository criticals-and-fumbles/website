"use client";

import { useEffect, useState, type ReactNode } from "react";

export interface AboutTabSection {
  id: string;
  label: string;
  content: ReactNode;
}

/**
 * Renders all 5 sections' content into the DOM (server-fetched, passed in
 * as `content` from the async page component) and toggles visibility via
 * a CSS class — not conditional mounting. Keeps every tab's content
 * crawlable by bots that don't execute JS, at the cost of a larger
 * initial HTML payload than lazy-mounting would produce.
 *
 * Tab state is hash-based (`/about#philosophy`), not `?tab=` search
 * params — matches the one pre-existing internal link
 * (PhilosophyStrip.tsx → /about#philosophy) without needing to change
 * it, and avoids a Next.js navigation round-trip just to switch tabs.
 */
export function AboutTabs({ sections }: { sections: AboutTabSection[] }) {
  const [activeTab, setActiveTab] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    // Reads a browser-only API (the URL hash) not available during SSR,
    // so this can't be computed during render — a genuine one-time sync
    // from external state on mount, not a derived-state anti-pattern.
    const hash = window.location.hash.replace("#", "");
    if (sections.some((section) => section.id === hash)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab(hash);
    }
  }, [sections]);

  function selectTab(id: string) {
    setActiveTab(id);
    window.history.replaceState(null, "", `#${id}`);
  }

  return (
    <div>
      <div className="border-b border-border">
        <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 md:px-8">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => selectTab(section.id)}
              aria-current={activeTab === section.id}
              className={`shrink-0 whitespace-nowrap border-b-2 px-4 py-3 font-ui text-sm transition-colors ${
                activeTab === section.id
                  ? "border-emerald text-emerald"
                  : "border-transparent text-text-muted hover:text-text"
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {sections.map((section) => (
        <div
          key={section.id}
          id={section.id}
          className={
            activeTab === section.id
              ? "px-4 py-16 md:px-8"
              : "hidden px-4 py-16 md:px-8"
          }
        >
          {section.content}
        </div>
      ))}
    </div>
  );
}
