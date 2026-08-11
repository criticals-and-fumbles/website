/**
 * Simple inline SVG logos — no icon library per this project's convention
 * (see CLAUDE.md § Component conventions). Shared between Nav.tsx and any
 * Discord CTA that needs the icon (Hero, events page, etc.) so there's one
 * copy of each path, not several hand-typed variants drifting apart.
 */

export function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-full w-full">
      <path d="M22 12a10 10 0 1 0-11.6 9.87v-6.98H7.9V12h2.5V9.8c0-2.47 1.47-3.84 3.72-3.84 1.08 0 2.21.19 2.21.19v2.43h-1.24c-1.23 0-1.61.76-1.61 1.54V12h2.74l-.44 2.89h-2.3v6.98A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

export function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
      className="h-full w-full"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-full w-full">
      <path d="M19.27 5.33A18.27 18.27 0 0 0 14.85 4c-.2.36-.43.84-.59 1.23a16.9 16.9 0 0 0-4.52 0C9.58 4.84 9.34 4.36 9.14 4a18.2 18.2 0 0 0-4.42 1.33C2.05 8.9 1.38 12.36 1.7 15.77a18.4 18.4 0 0 0 5.51 2.75c.44-.6.84-1.24 1.18-1.92-.65-.24-1.27-.53-1.86-.88.16-.11.31-.23.46-.35a13.1 13.1 0 0 0 11 0c.15.13.3.24.46.35-.59.35-1.21.64-1.86.88.34.68.74 1.32 1.18 1.92a18.35 18.35 0 0 0 5.51-2.75c.38-3.94-.65-7.37-2.73-10.44ZM8.68 13.7c-.83 0-1.5-.75-1.5-1.68 0-.92.66-1.68 1.5-1.68s1.52.76 1.5 1.68c0 .93-.66 1.68-1.5 1.68Zm6.64 0c-.83 0-1.5-.75-1.5-1.68 0-.92.66-1.68 1.5-1.68s1.52.76 1.5 1.68c0 .93-.66 1.68-1.5 1.68Z" />
    </svg>
  );
}
