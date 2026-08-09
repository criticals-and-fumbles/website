import Image from "next/image";
import type { Resource } from "@/sanity/lib/types";
import { urlForImage } from "@/sanity/lib/image";
import { Badge } from "@/components/ui/Badge";

const CATEGORY_LABELS: Record<string, string> = {
  pdf: "PDF",
  digital: "Digital Product",
  book: "Book",
  link: "Link",
  tool: "Tool",
  guide: "Guide",
};

const DIVISION_LABELS: Record<string, string> = {
  "dm-story": "DM & Story Group",
  "project-wing": "Project Wing",
  "art-house": "Art House",
  general: "General",
};

export function ResourceCard({ resource }: { resource: Resource }) {
  const imageUrl = urlForImage(resource.thumbnail)
    ?.width(500)
    .height(300)
    .auto("format")
    .url();

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface">
      <div className="relative aspect-[5/3] w-full overflow-hidden bg-bg-forest">
        {imageUrl && (
          <Image src={imageUrl} alt={resource.title} fill className="object-cover" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex flex-wrap gap-2">
          {resource.category && (
            <Badge variant="amber">
              {CATEGORY_LABELS[resource.category] ?? resource.category}
            </Badge>
          )}
          {resource.division && (
            <Badge variant="muted">
              {DIVISION_LABELS[resource.division] ?? resource.division}
            </Badge>
          )}
          {resource.accessLevel === "free" && <Badge variant="emerald">Free</Badge>}
        </div>
        <h3 className="font-display text-2xl text-text">{resource.title}</h3>
        {resource.description && (
          <p className="card-description line-clamp-3 flex-1 text-text-muted">
            {resource.description}
          </p>
        )}
        {resource.downloadUrl && (
          <a
            href={resource.downloadUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex min-h-[44px] items-center justify-center rounded-md bg-emerald px-4 py-2 font-ui text-sm text-bg transition-opacity hover:opacity-90"
          >
            Download →
          </a>
        )}
      </div>
    </div>
  );
}
