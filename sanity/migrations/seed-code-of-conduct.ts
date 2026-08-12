/**
 * One-off seed: creates the singleton `codeOfConduct` document (fixed
 * _id: "codeOfConduct", same pattern as `philosophy`/`siteSettings` in
 * sanity/seed.ts). Content is sourced verbatim from an existing C&F
 * document, not generated — see CLAUDE.md. Idempotent: skips if the
 * document already exists rather than overwriting it, so it's safe to
 * re-run.
 *
 * Usage:
 *   npx tsx sanity/migrations/seed-code-of-conduct.ts            # dry run
 *   DRY_RUN=false npx tsx sanity/migrations/seed-code-of-conduct.ts  # live
 */
process.loadEnvFile(".env.local");

import { createClient } from "next-sanity";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-06-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const codeOfConductDoc = {
  _id: "codeOfConduct",
  _type: "codeOfConduct",
  introTagline: "How we play together, every session.",
  tableExpectations: [
    {
      _type: "expectation",
      _key: "present-prepared",
      number: 1,
      title: "Be Present & Prepared",
      points: [
        "Arrive on time.",
        "Learn your character — we're happy to help if you're new.",
        "Keep your character sheet updated.",
      ],
    },
    {
      _type: "expectation",
      _key: "share-spotlight",
      number: 2,
      title: "Share the Spotlight",
      points: [
        "Everyone gets a moment to shine.",
        "Encourage others.",
        "Let's tell the story together.",
      ],
    },
    {
      _type: "expectation",
      _key: "minimize-distractions",
      number: 3,
      title: "Minimize Distractions",
      points: [
        "Use phones only for character sheets and rule references.",
        "No social media or side conversations during play.",
      ],
    },
    {
      _type: "expectation",
      _key: "work-with-party",
      number: 4,
      title: "Work With the Party",
      points: [
        "This is a team game.",
        "Create characters with a reason to work together.",
        "No party sabotage.",
      ],
    },
    {
      _type: "expectation",
      _key: "respect-table",
      number: 5,
      title: "Respect the Table",
      points: [
        "Be kind and supportive.",
        "Leave real-world conflict outside the game.",
        "No harassment, discrimination, or bullying — zero tolerance.",
      ],
    },
    {
      _type: "expectation",
      _key: "dm-final-arbiter",
      number: 6,
      title: "DM Is Final Arbiter",
      points: [
        "DM rulings keep the game moving.",
        "Rules discussions after the session or privately.",
        "Temporary rulings keep the game moving.",
      ],
    },
    {
      _type: "expectation",
      _key: "avoid-metagaming",
      number: 7,
      title: "Avoid Metagaming",
      points: [
        "Use only what your character knows.",
        "No stat blocks, future plot information, or outside knowledge.",
        'Ask: "Would my character know this?"',
      ],
    },
    {
      _type: "expectation",
      _key: "actions-have-consequences",
      number: 8,
      title: "Actions Have Consequences",
      points: [
        "Alignments and themes are agreed upon during Session 0.",
        "Evil acts need approval.",
        "Choices shape the story.",
      ],
    },
    {
      _type: "expectation",
      _key: "no-retconning",
      number: 9,
      title: "No Retconning",
      points: [
        "What happens, happens.",
        "Honest mistakes may be clarified in the moment.",
        "No takebacks after outcomes.",
      ],
    },
    {
      _type: "expectation",
      _key: "be-curious",
      number: 10,
      title: "Be Curious, Ask Questions!",
      points: [
        "No question is too small.",
        "We're here to help each other learn and play.",
      ],
    },
  ],
  safetyComfort: {
    heading: "Safety & Comfort",
    introText:
      "Your comfort comes first. Always. Player comfort always outweighs narrative consistency.",
    tools: ["Pause", "Time-out", "Break", "Fade-to-Black", "Redirection", "Retcon", "Step Out"],
    points: [
      "Speak up anytime.",
      "No explanation is needed in the moment.",
      "Respect topics and boundaries.",
      "Respect names, pronouns, and personal space.",
      "Player comfort always outweighs narrative consistency.",
    ],
  },
  diceRules: [
    {
      _type: "rule",
      _key: "let-dice-decide",
      number: 11,
      title: "Let the Dice Decide",
      points: [
        "The dice are king.",
        "Once a roll is made, the result stands.",
        "Success and failure both create stories.",
        "Embrace every Critical and every Fumble!",
      ],
    },
    {
      _type: "rule",
      _key: "announced-rolls-only",
      number: 12,
      title: "Announced Rolls Only",
      points: [
        "Describe your action.",
        "Wait for the DM to call for a roll.",
        "Unannounced rolls do not count.",
      ],
    },
    {
      _type: "rule",
      _key: "optional-house-rules",
      number: 13,
      title: "Optional House Rules",
      points: [
        "Rule of Cool — big ideas are awesome (with risk!).",
        "PvP needs consent from everyone.",
        "One Last Action — a hero's final moment.",
      ],
    },
    {
      _type: "rule",
      _key: "have-fun",
      number: 14,
      title: "Have Fun",
      points: [
        "We're here to tell stories, roll dice, and have a blast.",
        "Don't take bad rolls personally.",
        "We play with each other, not against each other.",
      ],
    },
  ],
};

async function seedCodeOfConduct(dryRun: boolean) {
  const existing = await client.getDocument("codeOfConduct");

  console.log(dryRun ? "--- DRY RUN — no changes written ---" : "--- LIVE RUN — writing changes to Sanity ---");

  if (existing) {
    console.log('[SKIP] "codeOfConduct" document already exists — not overwriting');
    console.log("--- Done ---");
    return;
  }

  console.log(`${dryRun ? "[DRY]" : "[CREATE]"} codeOfConduct:`);
  console.log(`  introTagline: "${codeOfConductDoc.introTagline}"`);
  console.log(`  tableExpectations: ${codeOfConductDoc.tableExpectations.length} entries (numbered 1-${codeOfConductDoc.tableExpectations.length})`);
  console.log(`  safetyComfort.tools: ${codeOfConductDoc.safetyComfort.tools.join(", ")}`);
  console.log(`  diceRules: ${codeOfConductDoc.diceRules.length} entries (numbered ${codeOfConductDoc.diceRules[0].number}-${codeOfConductDoc.diceRules[codeOfConductDoc.diceRules.length - 1].number})`);

  if (!dryRun) {
    await client.createIfNotExists(codeOfConductDoc);
    console.log("✓ created codeOfConduct");
  }

  console.log("--- Done ---");
}

const isDryRun = process.env.DRY_RUN !== "false";
seedCodeOfConduct(isDryRun);
