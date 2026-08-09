import { client } from "@/sanity/lib/client";
import { TEAM_MEMBERS_QUERY } from "@/sanity/lib/queries";
import type { TeamMember } from "@/sanity/lib/types";
import { CharacterCard } from "@/components/team/CharacterCard";
import { Footer } from "@/components/layout/Footer";

export const revalidate = 300;

export default async function TeamPage() {
  const members = await client.fetch<TeamMember[]>(TEAM_MEMBERS_QUERY);

  const leadership = members.filter((m) => m.tier === "Leadership");
  const dmCouncil = members.filter((m) => m.tier === "DMCouncil");
  const regularPlayers = members.filter((m) => m.tier === "RegularPlayer");

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <h1 className="font-display text-5xl text-text">Team</h1>
        <p className="mt-4 max-w-2xl text-text-muted">
          Every member of C&amp;F is a guardian of this space — Your Seat, Your
          Party, Your Campaign.
        </p>

        {leadership.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-6 font-display text-3xl text-text">Leadership</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {leadership.map((member) => (
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

        {regularPlayers.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-6 font-display text-3xl text-text">
              Regular Players
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {regularPlayers.map((member) => (
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
