import Image from "next/image";
import Link from "next/link";
import type { TeamMemberBlurb } from "@/sanity/lib/types";
import { urlForImage } from "@/sanity/lib/image";
import { TEAM_MEMBER_ROLES } from "@/sanity/schemas/constants";

const ROLE_LABELS: Record<string, string> = Object.fromEntries(
  TEAM_MEMBER_ROLES.map((r) => [r.value, r.title]),
);

/**
 * "About the author" (articles) / "About the DM" (events) blurb. Shows the
 * team member's real-world `bio`, falling back to their in-character
 * `backstory` so cards aren't empty before bios are written. Renders
 * nothing useful-less: if there's no text at all it still shows avatar,
 * handle and the profile link.
 */
export function AboutBlurb({
  member,
  heading,
  id,
}: {
  member: TeamMemberBlurb;
  heading: string;
  id?: string;
}) {
  const avatarUrl = urlForImage(member.avatar)
    ?.width(160)
    .height(160)
    .auto("format")
    .url();
  const text = member.bio ?? member.backstory;
  const subtitle = [
    ...(member.roles ?? []).map((r) => ROLE_LABELS[r] ?? r),
    ...[member.dndClass, member.race].filter(Boolean),
  ].join(" · ");

  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-heading` : undefined}
      className="rounded-lg border border-border bg-surface/75 p-5"
    >
      <h2
        id={id ? `${id}-heading` : undefined}
        className="font-ui text-sm uppercase tracking-wider text-text-muted"
      >
        {heading}
      </h2>
      <div className="mt-4 flex items-start gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-bg-forest ring-2 ring-border">
          {avatarUrl && (
            <Image src={avatarUrl} alt="" fill className="object-cover" />
          )}
        </div>
        <div className="min-w-0">
          <Link
            href={`/team/${member.slug}`}
            className="font-display text-2xl text-text hover:text-emerald"
          >
            {member.handle}
          </Link>
          {subtitle && (
            <p className="mt-0.5 font-ui text-xs text-text-muted">{subtitle}</p>
          )}
        </div>
      </div>
      {text && (
        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-text-muted">
          {text}
        </p>
      )}
      <Link
        href={`/team/${member.slug}`}
        className="mt-4 inline-block font-ui text-sm text-emerald hover:underline"
      >
        View {member.handle}&rsquo;s profile →
      </Link>
    </section>
  );
}
