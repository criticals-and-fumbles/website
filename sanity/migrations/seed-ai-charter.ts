/**
 * One-off seed: creates the singleton `aiCharter` document (fixed
 * _id: "aiCharter", same pattern as `codeOfConduct`/`philosophy` in
 * sanity/seed.ts and sanity/migrations/seed-code-of-conduct.ts). Content
 * is sourced verbatim as provided, not generated. Idempotent: skips if
 * the document already exists rather than overwriting it, so it's safe
 * to re-run.
 *
 * Usage:
 *   npx tsx sanity/migrations/seed-ai-charter.ts            # dry run
 *   DRY_RUN=false npx tsx sanity/migrations/seed-ai-charter.ts  # live
 */
process.loadEnvFile(".env.local");

import { randomBytes } from "node:crypto";
import { createClient } from "next-sanity";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-06-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

function key(): string {
  return randomBytes(6).toString("hex");
}

function block(text: string) {
  return {
    _type: "block",
    _key: key(),
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: key(), text, marks: [] }],
  };
}

const principlesInput = [
  {
    title: "People first, always",
    pullQuote: "What is good for the people playing?",
    body: "Community, collaboration, and sincerity come before any tool we use. Technology should support the people at the table and help us create better experiences together. Every decision starts with a simple question: What is good for the people playing? What a tool can do matters less than whether it adds something meaningful to the experience.",
  },
  {
    title: "AI is a tool",
    pullQuote: "Faster prep, not fewer people.",
    body: "We use AI in several ways, from designing posters and building our website to developing worlds, shaping ideas, and preparing sessions. It helps us work faster, explore more possibilities, and spend more time on the parts of the hobby we enjoy most. AI can help us build the world, but it is the people around the table who bring that world to life. If a tool does not ultimately serve the table or the community, then it has little value to us.",
  },
  {
    title: "At the table, the story is still yours",
    pullQuote: "AI can help you prepare. You still make the choices.",
    body: "This principle applies to players too. If AI helps you brainstorm a backstory, develop a character idea, organise your notes, or prepare for a session, that is entirely up to you. What matters to us is that the choices, conversations, surprises, and memorable moments at the table still come from the people playing. The story matters because you are part of it.",
  },
  {
    title: "We recognise its limits",
    pullQuote: "AI can suggest. People still decide.",
    body: "AI can be useful, but it is not infallible. It can make mistakes, misunderstand context, reproduce bias, and sometimes produce information that sounds convincing even when it is incorrect. It also needs to be used carefully when personal or sensitive information is involved. We therefore treat AI-generated material as a starting point, not a final answer. We also take care with personal information, including names, contact details, and personal stories, and aim to handle such information responsibly and in line with applicable privacy requirements.",
  },
  {
    title: "We stand behind what we publish",
    pullQuote: "Human judgement is the final step before anything goes out under our name.",
    body: "Whatever tools are used in the creative process, responsibility for the final work remains with the person or organisation publishing it. If something goes out under the Criticals & Fumbles name, we stand behind it, whether AI helped with the idea, image, wording, design, or not at all. We do not currently label every piece of work that has involved AI assistance. That reflects where we stand today, and it may evolve as technology, expectations, and community norms change.",
  },
  {
    title: "Different views are welcome",
    pullQuote: "Nobody needs to share the same view of AI to share a table with us.",
    body: "Some of us are excited about AI. Some are cautious about it. Others may prefer not to use it at all. All of those perspectives are welcome. We would rather make room for respectful conversation than let differences over technology become a barrier to enjoying the hobby together. If you have a concern about how we use AI, or simply see things differently, talk to us. Our Discord and community spaces are there for those conversations too. That is what helps keep this a compass rather than a wall.",
  },
  {
    title: "This is who we are trying to be",
    pullQuote: "Good players make good tables. Good tables make good stories.",
    body: "This charter is not a policy binder or a final word on AI. It is a statement of intent, something we will revisit as the technology changes, our community grows, and our own thinking develops. The tools will change. The hobby will change. But the things that make tabletop gaming special remain simple.",
  },
];

const aiCharterDoc = {
  _id: "aiCharter",
  _type: "aiCharter",
  intro: [
    block("AI is a topic people feel differently about, and that is understandable."),
    block(
      "At Criticals & Fumbles, we are not here to tell anyone what they should think about AI. We simply want to be open about how we use it, what matters to us, and the principles that guide our choices.",
    ),
    block("This isn't a rulebook. It's a compass."),
  ],
  principles: principlesInput.map((p, i) => ({
    _type: "principle",
    _key: key(),
    number: i + 1,
    title: p.title,
    pullQuote: p.pullQuote,
    body: [block(p.body)],
  })),
  closingStatement: [
    block("Good players make good tables."),
    block("Good tables make good stories."),
    block(
      "That was true before AI, and we believe it will remain true whatever comes next.",
    ),
  ],
};

async function seedAiCharter(dryRun: boolean) {
  const existing = await client.getDocument("aiCharter");

  console.log(dryRun ? "--- DRY RUN — no changes written ---" : "--- LIVE RUN — writing changes to Sanity ---");

  if (existing) {
    console.log('[SKIP] "aiCharter" document already exists — not overwriting');
    console.log("--- Done ---");
    return;
  }

  console.log(`${dryRun ? "[DRY]" : "[CREATE]"} aiCharter:`);
  console.log(`  intro: ${aiCharterDoc.intro.length} paragraph block(s)`);
  console.log(`  principles: ${aiCharterDoc.principles.length} entries (numbered 1-${aiCharterDoc.principles.length})`);
  for (const p of aiCharterDoc.principles) {
    console.log(`    ${p.number}. "${p.title}" — pullQuote: "${p.pullQuote}"`);
  }
  console.log(`  closingStatement: ${aiCharterDoc.closingStatement.length} paragraph block(s)`);

  if (!dryRun) {
    await client.createIfNotExists(aiCharterDoc);
    console.log("✓ created aiCharter");
  }

  console.log("--- Done ---");
}

const isDryRun = process.env.DRY_RUN !== "false";
seedAiCharter(isDryRun);
