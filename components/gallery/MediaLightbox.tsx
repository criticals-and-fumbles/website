"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import type { FlatGalleryItem } from "@/sanity/lib/types";
import { urlForImage } from "@/sanity/lib/image";

// Generalized from the original event-only Lightbox (2026-09-16) —
// same shape, just reading from FlatGalleryItem's merged field names
// instead of GalleryPhoto's event-specific ones. Only ever opened for
// kind === "image" tiles (see MediaGrid) — audio/video render inline
// in the grid instead, so this doesn't need its own audio/video path.
export function MediaLightbox({
  item,
  onClose,
  onPrev,
  onNext,
}: {
  item: FlatGalleryItem;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onPrev();
      if (event.key === "ArrowRight") onNext();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext]);

  const url = urlForImage(item.image)?.width(1600).fit("max").ignoreImageParams().auto("format").url();

  return (
    <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black/90 p-4">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center text-text"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-7 w-7"
        >
          <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous"
        className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-text md:left-6"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={onNext}
        aria-label="Next"
        className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-text md:right-6"
      >
        ›
      </button>

      <div className="relative max-h-[75vh] w-full max-w-4xl">
        {url && (
          <Image
            src={url}
            alt={item.caption ?? ""}
            width={1600}
            height={1000}
            className="h-auto max-h-[75vh] w-full object-contain"
          />
        )}
      </div>

      <div className="mt-4 text-center font-ui text-xs text-text-muted">
        {item.caption && <p className="text-text">{item.caption}</p>}
        <p className="mt-1">
          {[item.credit, ...(item.sourceTitle ? [item.sourceTitle] : [])].filter(Boolean).join(" · ")}
        </p>
        <Link href={item.sourceHref} className="mt-1 inline-block text-emerald hover:underline">
          View source →
        </Link>
      </div>
    </div>
  );
}
