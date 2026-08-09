"use client";

import { useEffect } from "react";
import Image from "next/image";
import type { GalleryPhoto } from "@/sanity/lib/types";
import { urlForImage } from "@/sanity/lib/image";

export function Lightbox({
  photo,
  onClose,
  onPrev,
  onNext,
}: {
  photo: GalleryPhoto;
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

  const url = urlForImage(photo.image)?.width(1600).auto("format").url();

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
        aria-label="Previous photo"
        className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-text md:left-6"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={onNext}
        aria-label="Next photo"
        className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-text md:right-6"
      >
        ›
      </button>

      <div className="relative max-h-[75vh] w-full max-w-4xl">
        {url && (
          <Image
            src={url}
            alt={photo.caption ?? ""}
            width={1600}
            height={1000}
            className="h-auto max-h-[75vh] w-full object-contain"
          />
        )}
      </div>

      <div className="mt-4 text-center font-ui text-xs text-text-muted">
        {photo.caption && <p className="text-text">{photo.caption}</p>}
        <p className="mt-1">
          {[photo.photographer, photo.event?.title].filter(Boolean).join(" · ")}
        </p>
      </div>
    </div>
  );
}
