"use client";

import { FacebookIcon, InstagramIcon, DiscordIcon, WhatsAppIcon } from "@/components/icons/SocialIcons";
import { showToast } from "@/components/ui/Toast";

/**
 * Same share row the campaigns repo's dossier pages already have
 * (src/templates/dossier.js's shareButtonsHtml/SHARE_JS) — ported here
 * rather than shared code, since that's a separate Hono app with no
 * build step to import a React component from. Same button set/
 * behavior: Facebook and WhatsApp use real share-intent URLs (no JS
 * needed beyond the link itself); Discord has no share API, Instagram
 * has none except the OS-level Web Share sheet on mobile — both fall
 * back to "copy the link" with a toast explaining where to paste it.
 * Uses this project's existing Toast (components/ui/Toast.tsx) instead
 * of the dossier's own hand-rolled one — this app already has one
 * mounted sitewide via <ToastHost /> in the root layout.
 */

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" className="h-full w-full">
      <path d="M10 13a5 5 0 0 0 7.07 0l2-2a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
      <path d="M14 11a5 5 0 0 0-7.07 0l-2 2a5 5 0 0 0 7.07 7.07l1.5-1.5" />
    </svg>
  );
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Clipboard API can be unavailable (older browsers, insecure
    // context) — same fallback the dossier's own SHARE_JS uses.
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch {
      // Nothing more to fall back to — the user can still select and
      // copy the visible link text themselves.
    }
    document.body.removeChild(ta);
  }
}

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const waText = `${title} ${url}`;

  const btnClass =
    "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-muted transition-colors hover:border-emerald hover:text-emerald";
  const iconClass = "h-[18px] w-[18px]";

  return (
    <div className="flex items-center gap-2">
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        title="Share on Facebook"
        className={btnClass}
      >
        <span className={iconClass}>
          <FacebookIcon />
        </span>
      </a>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(waText)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        title="Share on WhatsApp"
        className={btnClass}
      >
        <span className={iconClass}>
          <WhatsAppIcon />
        </span>
      </a>
      <button
        type="button"
        aria-label="Copy link for Discord"
        title="Copy link for Discord"
        className={btnClass}
        onClick={async () => {
          await copyText(url);
          showToast("Link copied — paste it in Discord for a preview");
        }}
      >
        <span className={iconClass}>
          <DiscordIcon />
        </span>
      </button>
      <button
        type="button"
        aria-label="Share to Instagram"
        title="Share to Instagram"
        className={btnClass}
        onClick={async () => {
          if (navigator.share) {
            try {
              await navigator.share({ title, url });
            } catch {
              // User cancelled the share sheet — not an error to surface.
            }
          } else {
            await copyText(url);
            showToast("Link copied — paste it into Instagram");
          }
        }}
      >
        <span className={iconClass}>
          <InstagramIcon />
        </span>
      </button>
      <button
        type="button"
        aria-label="Copy link"
        title="Copy link"
        className={btnClass}
        onClick={async () => {
          await copyText(url);
          showToast("Link copied");
        }}
      >
        <span className={iconClass}>
          <LinkIcon />
        </span>
      </button>
    </div>
  );
}
