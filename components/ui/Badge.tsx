import type { ReactNode } from "react";

const VARIANTS = {
  emerald: "border-emerald/50 bg-emerald/10 text-emerald",
  amber: "border-amber/50 bg-amber/10 text-amber",
  magenta: "border-magenta/50 bg-magenta/10 text-magenta",
  muted: "border-border bg-surface text-text-muted",
  surface: "border-border bg-surface text-text",
} as const;

export function Badge({
  children,
  variant = "muted",
  className = "",
}: {
  children: ReactNode;
  variant?: keyof typeof VARIANTS;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-ui text-sm ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
