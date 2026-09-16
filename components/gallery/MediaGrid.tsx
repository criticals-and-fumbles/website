"use client";

import { useState } from "react";
import Image from "next/image";
import type { FlatGalleryItem } from "@/sanity/lib/types";
import { urlForImage } from "@/sanity/lib/image";
import { MediaLightbox } from "./MediaLightbox";

// Generalized from the original event-only PhotoGrid (2026-09-16) to
// handle every source type the site-wide gallery merges in, and every
// media kind (image/audio/video) mediaGalleryItem supports — see
// lib/gallery.ts's flattenGalleryMedia().
export function MediaGrid({ items }: { items: FlatGalleryItem[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (!items.length) {
    return (
      <p className="py-12 text-center text-sm text-text-muted">
        No media here yet.
      </p>
    );
  }

  const activeItem = activeIndex !== null ? items[activeIndex] : null;

  return (
    <>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {items.map((item, index) => (
          <MediaTile key={item.key} item={item} onOpen={() => setActiveIndex(index)} />
        ))}
      </div>

      {activeItem && (
        <MediaLightbox
          item={activeItem}
          onClose={() => setActiveIndex(null)}
          onPrev={() =>
            setActiveIndex((i) => (i === null ? null : (i - 1 + items.length) % items.length))
          }
          onNext={() => setActiveIndex((i) => (i === null ? null : (i + 1) % items.length))}
        />
      )}
    </>
  );
}

function MediaTile({ item, onOpen }: { item: FlatGalleryItem; onOpen: () => void }) {
  if (item.kind === "image") {
    const url = urlForImage(item.image)?.width(600).fit("max").ignoreImageParams().auto("format").url();
    if (!url) return null;
    return (
      <button
        type="button"
        onClick={onOpen}
        className="mb-4 block w-full break-inside-avoid overflow-hidden rounded-lg border border-border"
      >
        <Image
          src={url}
          alt={item.caption ?? ""}
          width={600}
          height={400}
          loading="lazy"
          className="h-auto w-full object-contain transition-opacity hover:opacity-90"
        />
      </button>
    );
  }

  // Audio/video — no natural grid thumbnail, so this renders as a
  // labeled card with an inline native player rather than a lightbox-
  // opening image tile. Still break-inside-avoid so it sits cleanly in
  // the same masonry columns as the image tiles around it.
  return (
    <div className="mb-4 flex flex-col gap-2 break-inside-avoid rounded-lg border border-border bg-surface/75 p-4">
      <span className="font-ui text-xs uppercase tracking-wide text-text-muted">
        {item.kind === "audio" ? "🎧 Audio" : "🎬 Video"} · {item.sourceTitle}
      </span>
      {item.fileUrl && item.kind === "audio" && (
        <audio controls src={item.fileUrl} className="w-full" />
      )}
      {item.fileUrl && item.kind === "video" && (
        <video controls src={item.fileUrl} className="w-full rounded" />
      )}
      {item.caption && <p className="text-sm text-text-muted">{item.caption}</p>}
    </div>
  );
}
