import { Badge } from "./Badge";

const CANON_LABELS: Record<string, string> = {
  canon: "Canon",
  homebrew: "Homebrew",
  disputed: "Disputed",
  rumour: "Rumour",
  retconned: "Retconned",
  "dm-eyes-only": "DM Eyes Only",
};

const CANON_VARIANTS: Record<
  string,
  "emerald" | "amber" | "magenta" | "muted"
> = {
  canon: "emerald",
  homebrew: "amber",
  disputed: "magenta",
  rumour: "muted",
  retconned: "muted",
  "dm-eyes-only": "muted",
};

export function CanonBadge({ status }: { status?: string }) {
  if (!status) return null;
  return (
    <Badge variant={CANON_VARIANTS[status] ?? "muted"}>
      {CANON_LABELS[status] ?? status}
    </Badge>
  );
}
