// Coarse relative-time label ("2h ago", "3d ago") — no date library
// needed over a handful of buckets. Ported verbatim from the campaigns
// Worker's CampaignCard.jsx (same function, same buckets) since the
// campaigns directory page now lives here and needs identical output.
export function timeAgo(iso?: string): string {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  const month = Math.floor(day / 30);
  if (month < 12) return `${month}mo ago`;
  return `${Math.floor(month / 12)}y ago`;
}
