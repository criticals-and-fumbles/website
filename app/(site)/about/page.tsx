import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import {
  AI_CHARTER_QUERY,
  CODE_OF_CONDUCT_QUERY,
  DIVISIONS_QUERY,
  ORGANISATIONS_QUERY,
  PHILOSOPHY_QUERY,
  SITE_SETTINGS_QUERY,
} from "@/sanity/lib/queries";
import type {
  AiCharter as AiCharterData,
  CodeOfConduct as CodeOfConductData,
  Division,
  Organisation,
  Philosophy,
  SiteSettings,
} from "@/sanity/lib/types";
import { buildMetadata } from "@/lib/metadata";
import { AboutTabs, type AboutTabSection } from "@/components/about/AboutTabs";
import { AboutIntro } from "@/components/about/AboutIntro";
import { PillarsTier, BehavioursTier } from "@/components/about/PhilosophyTier";
import { DivisionsGrid } from "@/components/about/DivisionsGrid";
import { CodeOfConduct } from "@/components/about/CodeOfConduct";
import { AiCharter } from "@/components/about/AiCharter";
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
  const [settings, philosophy, codeOfConduct, organisations, divisions, aiCharter] =
    await Promise.all([
      client.fetch<SiteSettings | null>(SITE_SETTINGS_QUERY),
      client.fetch<Philosophy | null>(PHILOSOPHY_QUERY),
      client.fetch<CodeOfConductData | null>(CODE_OF_CONDUCT_QUERY),
      client.fetch<Organisation[]>(ORGANISATIONS_QUERY),
      client.fetch<Division[]>(DIVISIONS_QUERY),
      client.fetch<AiCharterData | null>(AI_CHARTER_QUERY),
    ]);

  const sections: AboutTabSection[] = [
    {
      id: "about",
      label: "About",
      content: (
        <AboutIntro
          visionStatement={settings?.visionStatement}
          missionStatement={settings?.missionStatement}
          historyTimeline={settings?.historyTimeline}
          activities={settings?.activities}
          organisations={organisations}
        />
      ),
    },
    {
      id: "philosophy",
      label: "Philosophy",
      content: philosophy && (
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
                {/* Display label only — underlying Sanity field/schema key
                    stays "behaviours", do not rename it to match this text. */}
                Tier II — Feelings & Behaviours
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
      ),
    },
    {
      id: "divisions",
      label: "Divisions",
      content: <DivisionsGrid divisions={divisions} />,
    },
    {
      id: "code-of-conduct",
      label: "Code of Conduct",
      content: codeOfConduct && <CodeOfConduct data={codeOfConduct} />,
    },
    {
      id: "ai-charter",
      label: "AI Charter",
      content: aiCharter && <AiCharter data={aiCharter} />,
    },
  ];

  return (
    <>
      <section className="px-4 py-20 text-center md:px-8">
        <h1 className="font-display text-6xl text-text">About</h1>
        <p className="mt-4">{settings?.tagline}</p>
        <p className="mx-auto mt-2 max-w-2xl text-text-muted">
          {settings?.shortDescription}
        </p>
      </section>

      <AboutTabs sections={sections} />

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
