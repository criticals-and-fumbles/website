import type { Metadata } from "next";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { RESOURCES_QUERY } from "@/sanity/lib/queries";
import type { Resource } from "@/sanity/lib/types";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { Footer } from "@/components/layout/Footer";
import { buildMetadata } from "@/lib/metadata";

export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: "Resources",
  description:
    "Guides, tools, and shared materials from the DM & Story Group, Project Wing, and Art House divisions of Criticals and Fumbles.",
  path: "/resources",
});

const DIVISION_FILTERS = [
  { label: "DM & Story Group", value: "dm-story" },
  { label: "Project Wing", value: "project-wing" },
  { label: "Art House", value: "art-house" },
];

export default async function ResourcesPage({
  searchParams,
}: PageProps<"/resources">) {
  const { division, filter } = await searchParams;
  const activeDivision = typeof division === "string" ? division : undefined;
  const showFreeOnly = filter === "free";

  const resources = await client.fetch<Resource[]>(RESOURCES_QUERY, {
    division: activeDivision ?? null,
  });

  const visible = showFreeOnly
    ? resources.filter((r) => r.accessLevel === "free")
    : resources;

  function tabHref(next: { filter?: string; division?: string }) {
    const search = new URLSearchParams();
    if (next.filter) search.set("filter", next.filter);
    if (next.division) search.set("division", next.division);
    const qs = search.toString();
    return `/resources${qs ? `?${qs}` : ""}`;
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <h1 className="font-display text-5xl text-text">Resources</h1>
        <p className="mt-2 max-w-prose text-text-muted">
          Everything we&apos;ve made, gathered, and want to share.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          <Link
            href="/resources"
            className={`rounded-full border px-4 py-2 font-ui text-xs ${
              !showFreeOnly && !activeDivision
                ? "border-emerald text-emerald"
                : "border-border text-text-muted hover:border-emerald"
            }`}
          >
            All
          </Link>
          <Link
            href={tabHref({ filter: "free" })}
            className={`rounded-full border px-4 py-2 font-ui text-xs ${
              showFreeOnly
                ? "border-emerald text-emerald"
                : "border-border text-text-muted hover:border-emerald"
            }`}
          >
            Free
          </Link>
          {DIVISION_FILTERS.map((div) => (
            <Link
              key={div.value}
              href={tabHref({ division: div.value })}
              className={`rounded-full border px-4 py-2 font-ui text-xs ${
                activeDivision === div.value
                  ? "border-emerald text-emerald"
                  : "border-border text-text-muted hover:border-emerald"
              }`}
            >
              {div.label}
            </Link>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.length === 0 ? (
            <p className="col-span-full text-sm text-text-muted">
              No resources here yet.
            </p>
          ) : (
            visible.map((resource) => (
              <ResourceCard key={resource._id} resource={resource} />
            ))
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
