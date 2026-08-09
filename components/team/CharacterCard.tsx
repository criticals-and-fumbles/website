import Image from "next/image";
import Link from "next/link";
import type { TeamMember } from "@/sanity/lib/types";
import { urlForImage } from "@/sanity/lib/image";
import { Badge } from "@/components/ui/Badge";
import { StatBar } from "./StatBar";

const GOOD_ALIGNMENTS = ["Lawful Good", "Neutral Good", "Chaotic Good"];
const EVIL_ALIGNMENTS = ["Lawful Evil", "Neutral Evil", "Chaotic Evil"];

function alignmentRingClass(alignment?: string) {
  if (!alignment) return "ring-border";
  if (GOOD_ALIGNMENTS.includes(alignment)) return "ring-emerald";
  if (EVIL_ALIGNMENTS.includes(alignment)) return "ring-magenta";
  if (alignment === "Unaligned") return "ring-border";
  return "ring-amber";
}

export function CharacterCard({
  member,
  compact = false,
}: {
  member: TeamMember;
  compact?: boolean;
}) {
  const avatarUrl = urlForImage(member.avatar)
    ?.width(200)
    .height(200)
    .auto("format")
    .url();

  return (
    <Link
      href={`/team/${member.slug}`}
      className="flex flex-col items-center gap-3 rounded-lg border border-border bg-surface p-5 text-center transition-colors hover:border-emerald"
    >
      <div
        className={`relative h-20 w-20 overflow-hidden rounded-full bg-bg-forest ring-2 ${alignmentRingClass(member.alignment)}`}
      >
        {avatarUrl && (
          <Image src={avatarUrl} alt={member.handle} fill className="object-cover" />
        )}
      </div>

      <div>
        <h3 className="font-display text-2xl text-text">{member.handle}</h3>
        {member.realName && (
          <p className="text-xs text-text-muted">{member.realName}</p>
        )}
      </div>

      {member.role && <Badge variant="emerald">{member.role}</Badge>}

      <p className="font-ui text-xs text-text-muted">
        {[member.dndClass, member.race, member.alignment].filter(Boolean).join(" · ")}
      </p>

      {!compact && (
        <>
          {member.stats && (
            <div className="flex flex-col gap-1 self-stretch">
              <StatBar label="CHA" value={member.stats.charisma} />
              <StatBar label="WIS" value={member.stats.wisdom} />
              <StatBar label="INT" value={member.stats.intelligence} />
              <StatBar label="LCK" value={member.stats.luck} />
            </div>
          )}

          {member.backstory && (
            <p className="line-clamp-3 text-left text-sm text-text-muted">
              {member.backstory}
            </p>
          )}

          {member.signatureMove && (
            <p className="text-xs italic text-text-muted">
              &ldquo;{member.signatureMove}&rdquo;
            </p>
          )}

          {member.worlds && member.worlds.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1">
              {member.worlds.map((world) => (
                <Badge key={world._id} variant="muted">
                  {world.name}
                </Badge>
              ))}
            </div>
          )}
        </>
      )}
    </Link>
  );
}
