import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import {
  ARTICLES_BY_MEMBER_QUERY,
  TEAM_MEMBER_BY_SLUG_QUERY,
} from "@/sanity/lib/queries";
import { urlForImage } from "@/sanity/lib/image";
import type { ArticleCard, TeamMember } from "@/sanity/lib/types";
import { TEAM_MEMBER_ROLES } from "@/sanity/schemas/constants";
import { buildMetadata } from "@/lib/metadata";
import { Badge } from "@/components/ui/Badge";
import { StatBar } from "@/components/team/StatBar";
import { ArticleGrid } from "@/components/content/ArticleGrid";
import { Footer } from "@/components/layout/Footer";

const ROLE_LABELS: Record<string, string> = Object.fromEntries(
  TEAM_MEMBER_ROLES.map((r) => [r.value, r.title]),
);

export const revalidate = 300;

export async function generateMetadata({
  params,
}: PageProps<"/team/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const member = await client.fetch<TeamMember | null>(TEAM_MEMBER_BY_SLUG_QUERY, {
    slug,
  });
  if (!member) return {};

  return buildMetadata({
    title: member.realName ? `${member.handle} (${member.realName})` : member.handle,
    description:
      member.backstory ??
      `${member.handle} is part of Criticals and Fumbles, Singapore's tabletop RPG community.`,
    path: `/team/${slug}`,
    image: urlForImage(member.avatar)?.width(1200).height(630).url(),
  });
}

export default async function TeamMemberPage({
  params,
}: PageProps<"/team/[slug]">) {
  const { slug } = await params;
  const member = await client.fetch<TeamMember | null>(
    TEAM_MEMBER_BY_SLUG_QUERY,
    { slug },
  );

  if (!member) notFound();

  const articles = await client.fetch<ArticleCard[]>(ARTICLES_BY_MEMBER_QUERY, {
    memberId: member._id,
  });

  const avatarUrl = urlForImage(member.avatar)
    ?.width(320)
    .height(320)
    .auto("format")
    .url();

  return (
    <>
      <div className="mx-auto max-w-4xl px-4 py-16 md:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative h-32 w-32 overflow-hidden rounded-full bg-bg-forest ring-4 ring-emerald">
            {avatarUrl && (
              <Image src={avatarUrl} alt={member.handle} fill className="object-cover" />
            )}
          </div>
          <h1 className="font-display text-5xl text-text">{member.handle}</h1>
          {member.realName && <p className="text-text-muted">{member.realName}</p>}
          {member.roles && member.roles.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1">
              {member.roles.map((role) => (
                <Badge key={role} variant="surface">
                  {ROLE_LABELS[role] ?? role}
                </Badge>
              ))}
            </div>
          )}
          <p className="font-ui text-sm text-text-muted">
            {[member.dndClass, member.race, member.alignment].filter(Boolean).join(" · ")}
          </p>
        </div>

        {member.stats && (
          <div className="mx-auto mt-10 flex max-w-xs flex-col gap-2">
            <StatBar label="CHA" value={member.stats.charisma} />
            <StatBar label="WIS" value={member.stats.wisdom} />
            <StatBar label="INT" value={member.stats.intelligence} />
            <StatBar label="LCK" value={member.stats.luck} />
          </div>
        )}

        {member.backstory && (
          <div className="mx-auto mt-10 max-w-2xl">
            <h2 className="font-display text-2xl text-text">Backstory</h2>
            <p className="mt-3 whitespace-pre-line text-text-muted">
              {member.backstory}
            </p>
          </div>
        )}

        {member.signatureMove && (
          <p className="mx-auto mt-6 max-w-2xl text-center text-sm italic text-text-muted">
            &ldquo;{member.signatureMove}&rdquo;
          </p>
        )}

        {member.worlds && member.worlds.length > 0 && (
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {member.worlds.map((world) => (
              <Badge key={world._id} variant="muted">
                {world.name}
              </Badge>
            ))}
          </div>
        )}

        {member.socialLinks && member.socialLinks.length > 0 && (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {member.socialLinks.map((link) => (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-border px-3 py-1 font-ui text-xs text-text-muted hover:border-emerald hover:text-emerald"
              >
                {link.platform}
              </a>
            ))}
          </div>
        )}

        {articles.length > 0 && (
          <section className="mt-16 border-t border-border pt-10">
            <h2 className="mb-6 font-display text-3xl text-text">
              Articles by {member.handle}
            </h2>
            <ArticleGrid articles={articles} />
          </section>
        )}
      </div>

      <Footer pageFooterCTA={member.pageFooterCTA} />
    </>
  );
}
