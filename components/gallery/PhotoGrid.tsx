"use client";

import { useState } from "react";
import Image from "next/image";
import type { GalleryPhoto } from "@/sanity/lib/types";
import { urlForImage } from "@/sanity/lib/image";
import { Lightbox } from "./Lightbox";

export function PhotoGrid({ photos }: { photos: GalleryPhoto[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (!photos.length) {
    return (
      <p className="py-12 text-center text-sm text-text-muted">
        No photos here yet.
      </p>
    );
  }

  const activePhoto = activeIndex !== null ? photos[activeIndex] : null;

  return (
    <>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {photos.map((photo, index) => {
          const url = urlForImage(photo.image)
            ?.width(600)
            .auto("format")
            .url();
          if (!url) return null;

          return (
            <button
              key={photo._id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className="mb-4 block w-full break-inside-avoid overflow-hidden rounded-lg border border-border"
            >
              <Image
                src={url}
                alt={photo.caption ?? ""}
                width={600}
                height={400}
                loading="lazy"
                className="h-auto w-full object-cover transition-opacity hover:opacity-90"
              />
            </button>
          );
        })}
      </div>

      {activePhoto && (
        <Lightbox
          photo={activePhoto}
          onClose={() => setActiveIndex(null)}
          onPrev={() =>
            setActiveIndex((i) => (i === null ? null : (i - 1 + photos.length) % photos.length))
          }
          onNext={() =>
            setActiveIndex((i) => (i === null ? null : (i + 1) % photos.length))
          }
        />
      )}
    </>
  );
}
