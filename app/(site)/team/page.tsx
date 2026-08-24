import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { TEAM_MEMBERS_QUERY } from "@/sanity/lib/queries";
import type { TeamMember } from "@/sanity/lib/types";
import { CharacterCard } from "@/components/team/CharacterCard";
import { Footer } from "@/components/layout/Footer";
import { buildMetadata } from "@/lib/metadata";

export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: "Team",
  description:
    "Meet the Horsemen, DM Council, Uncle's League, and Critical Fumblers who run Criticals and Fumbles, Singapore's tabletop RPG community.",
  path: "/team",
});

export default async function TeamPage() {
  const members = await client.fetch<TeamMember[]>(TEAM_MEMBERS_QUERY);

  const horsemen = members.filter((m) => m.tier === "Horsemen");
  const dmCouncil = members.filter((m) => m.tier === "DMCouncil");
  const unclesLeague = members.filter((m) => m.tier === "UnclesLeague");
  const criticalFumblers = members.filter((m) => m.tier === "CriticalFumblers");

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <h1 className="font-display text-5xl text-text">Team</h1>
        <p className="mt-4 max-w-2xl text-text-muted">
          Every member of C&amp;F is a guardian of this space — Your Seat, Your
          Party, Your Campaign.
        </p>

        {horsemen.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-6 font-display text-3xl text-text">Horsemen</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {horsemen.map((member) => (
                <CharacterCard key={member._id} member={member} />
              ))}
            </div>
          </section>
        )}

        {dmCouncil.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-6 font-display text-3xl text-text">DM Council</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {dmCouncil.map((member) => (
                <CharacterCard key={member._id} member={member} />
              ))}
            </div>
          </section>
        )}

        {unclesLeague.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-6 font-display text-3xl text-text">
              Uncle&apos;s League
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {unclesLeague.map((member) => (
                <CharacterCard key={member._id} member={member} compact />
              ))}
            </div>
          </section>
        )}

        {criticalFumblers.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-6 font-display text-3xl text-text">
              Critical Fumblers
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {criticalFumblers.map((member) => (
                <CharacterCard key={member._id} member={member} compact />
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </>
  );
}
