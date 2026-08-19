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

export function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-full w-full">
      <path d="M17.47 14.38c-.29-.15-1.7-.84-1.97-.93-.26-.1-.46-.15-.65.15-.2.29-.75.93-.92 1.12-.17.2-.34.22-.63.08-.29-.15-1.22-.45-2.33-1.44-.86-.77-1.44-1.71-1.61-2-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.2-.29.29-.49.1-.2.05-.37-.02-.51-.08-.15-.65-1.58-.9-2.16-.24-.57-.48-.49-.65-.5h-.56c-.2 0-.51.07-.78.37-.26.29-1.02 1-1.02 2.43s1.04 2.82 1.19 3.01c.15.2 2.05 3.14 4.98 4.4.69.3 1.24.48 1.66.61.7.22 1.33.19 1.84.12.56-.08 1.7-.7 1.95-1.37.24-.68.24-1.26.17-1.38-.07-.12-.26-.2-.55-.35Z" />
      <path d="M12.02 2C6.5 2 2 6.48 2 12c0 1.83.5 3.6 1.42 5.15L2 22l4.98-1.36A9.98 9.98 0 0 0 12.02 22C17.53 22 22 17.52 22 12S17.53 2 12.02 2Zm0 18.13c-1.6 0-3.16-.43-4.52-1.24l-.32-.19-3.09.84.83-3.01-.21-.32A8.13 8.13 0 1 1 20.14 12a8.12 8.12 0 0 1-8.12 8.13Z" />
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
