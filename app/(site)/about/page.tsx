import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import {
  ORGANISATIONS_QUERY,
  PHILOSOPHY_QUERY,
  SITE_SETTINGS_QUERY,
} from "@/sanity/lib/queries";
import type { Organisation, Philosophy, SiteSettings } from "@/sanity/lib/types";
import { buildMetadata } from "@/lib/metadata";
import { Timeline } from "@/components/about/Timeline";
import { PillarsTier, BehavioursTier } from "@/components/about/PhilosophyTier";
import { DivisionCard } from "@/components/about/DivisionCard";
import { Footer } from "@/components/layout/Footer";
import { LinkButton } from "@/components/ui/Button";

export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: "About Us | Criticals and Fumbles Singapore",
  description:
    "Learn about Singapore's tabletop RPG community — our history, values, " +
    "and how to get involved in D&D and TTRPG games near you.",
  path: "/about",
});

export default async function AboutPage() {
  const [settings, philosophy, organisations] = await Promise.all([
    client.fetch<SiteSettings | null>(SITE_SETTINGS_QUERY),
    client.fetch<Philosophy | null>(PHILOSOPHY_QUERY),
    client.fetch<Organisation[]>(ORGANISATIONS_QUERY),
  ]);

  return (
    <>
      <section className="px-4 py-20 text-center md:px-8">
        <h1 className="font-display text-6xl text-text">About</h1>
        <p className="mt-4">{settings?.tagline}</p>
        <p className="mx-auto mt-2 max-w-2xl text-text-muted">
          {settings?.shortDescription}
        </p>
      </section>

      {(settings?.visionStatement || settings?.missionStatement) && (
        <section id="vision-mission" className="px-4 py-16 md:px-8">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 md:grid-cols-2">
            {settings.visionStatement && (
              <div>
                <h2 className="font-display text-3xl text-emerald">Vision</h2>
                <p className="mt-3 text-text-muted">{settings.visionStatement}</p>
              </div>
            )}
            {settings.missionStatement && (
              <div>
                <h2 className="font-display text-3xl text-amber">Mission</h2>
                <p className="mt-3 text-text-muted">{settings.missionStatement}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {settings?.historyTimeline && settings.historyTimeline.length > 0 && (
        <section id="history" className="bg-surface px-4 py-16 md:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-10 font-display text-4xl text-text">History</h2>
            <Timeline entries={settings.historyTimeline} />
          </div>
        </section>
      )}

      {philosophy && (
        <section id="philosophy" className="px-4 py-16 md:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-2 text-center font-display text-4xl text-text">
              Philosophy
            </h2>
            {philosophy.tagline && (
              <p className="mx-auto mb-12 max-w-xl text-center text-text-muted">
                {philosophy.tagline}
              </p>
            )}

            {philosophy.pillars && philosophy.pillars.length > 0 && (
              <div className="mb-14">
                <h3 className="mb-6 font-ui text-sm uppercase tracking-wider text-emerald">
                  Tier I — Values
                </h3>
                <PillarsTier pillars={philosophy.pillars} />
              </div>
            )}

            {philosophy.behaviours && philosophy.behaviours.length > 0 && (
              <div className="mb-14">
                <h3 className="mb-6 font-ui text-sm uppercase tracking-wider text-amber">
                  Tier II — Feelings
                </h3>
                <BehavioursTier items={philosophy.behaviours} tier={2} />
              </div>
            )}

            {philosophy.outcomes && philosophy.outcomes.length > 0 && (
              <div>
                <h3 className="mb-6 font-ui text-sm uppercase tracking-wider text-magenta">
                  Tier III — Outcomes
                </h3>
                <BehavioursTier items={philosophy.outcomes} tier={3} />
              </div>
            )}
          </div>
        </section>
      )}

      {settings?.activities && settings.activities.length > 0 && (
        <section id="activities" className="bg-surface px-4 py-16 md:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-8 font-display text-4xl text-text">Activities</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {settings.activities.map((activity) => (
                <span
                  key={activity}
                  className="rounded-full border border-border px-4 py-2 font-ui text-xs text-text"
                >
                  {activity}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="divisions" className="px-4 py-16 md:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-center font-display text-4xl text-text">
            Divisions
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <DivisionCard
              icon="⚔️"
              name="DM & Story Group"
              description="World-building & RPG Sessions"
            />
            <DivisionCard
              icon="🛠️"
              name="Project Wing"
              description="Product Development"
            />
            <DivisionCard
              icon="🎨"
              name="Art House"
              description="Podcasts & Miniature Painting"
            />
          </div>
        </div>
      </section>

      {organisations.length > 0 && (
        <section id="organisations" className="bg-surface px-4 py-16 md:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-10 text-center font-display text-4xl text-text">
              Organisations &amp; Partners
            </h2>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
              {organisations.map((org) => (
                <div
                  key={org._id}
                  className="flex flex-col items-center gap-2 rounded-lg border border-border p-4 text-center"
                >
                  <span className="font-ui text-sm text-text">{org.name}</span>
                  {org.orgType && (
                    <span className="text-xs text-text-muted">{org.orgType}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {settings?.discordUrl && (
        <section className="bg-bg-forest px-4 py-16 text-center md:px-8">
          <h2 className="font-display text-3xl text-on-forest">
            Want to roll with us?
          </h2>
          <div className="mt-6">
            <LinkButton href={settings.discordUrl} external variant="primary">
              Join the Discord
            </LinkButton>
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}
