/**
 * Idempotent seed script for initial Criticals and Fumbles content.
 * Run with `npm run seed`. Safe to re-run — every document is checked
 * for existence (by fixed _id for singletons, by slug for everything else)
 * before being created.
 */
process.loadEnvFile(".env.local");

import { createClient } from "next-sanity";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-06-01",
  token: process.env.SANITY_API_READ_TOKEN,
  useCdn: false,
});

async function upsertSingleton(
  id: string,
  type: string,
  data: Record<string, unknown>,
) {
  const existing = await client.getDocument(id);
  if (existing) {
    console.log(`↳ ${type} already exists — skipping`);
    return existing;
  }
  const doc = await client.createIfNotExists({ _id: id, _type: type, ...data });
  console.log(`✓ created ${type}`);
  return doc;
}

async function upsertBySlug(
  type: string,
  slug: string,
  data: Record<string, unknown>,
) {
  const existing = await client.fetch(
    `*[_type == $type && slug.current == $slug][0]`,
    { type, slug },
  );
  if (existing) {
    console.log(`↳ ${type} "${slug}" already exists — skipping`);
    return existing;
  }
  const doc = await client.create({
    _type: type,
    slug: { _type: "slug", current: slug },
    ...data,
  });
  console.log(`✓ created ${type} "${slug}"`);
  return doc;
}

const PLACEHOLDER_BACKSTORY = "PLACEHOLDER — fill this in via Studio at cnf.sg/studio";

async function main() {
  console.log("Seeding Criticals and Fumbles content...\n");

  await upsertSingleton("siteSettings", "siteSettings", {
    title: "Criticals and Fumbles",
    tagline: "Good Players Make Good Tables. Good Tables Make Good Stories.",
    shortDescription: "Singapore's most chaotic tabletop RPG community.",
    foundedYear: 2018,
    basedIn: "Singapore",
    contactEmail: "cnfsg.info@gmail.com",
    discordUrl: "https://discord.gg/3qjFqAqx",
    discordServerName: "Criticals and Fumbles",
    visionStatement: "PLACEHOLDER — fill this in via Studio at cnf.sg/studio",
    missionStatement: "PLACEHOLDER — fill this in via Studio at cnf.sg/studio",
    activities: [
      "Multi-system RPG Campaigns",
      "Annual RPG Events",
      "One-shots",
      "World-building",
      "Live Streaming & Podcasts",
      "Miniature Painting",
      "Learn To Series",
      "NLB Monthly Sessions",
    ],
    copyrightLine: "© 2026 Criticals and Fumbles. All rights reserved.",
    historyTimeline: [
      {
        _type: "historyEntry",
        _key: "session-zero",
        year: 2016,
        displayTitle: "Session Zero",
        description:
          "Four friends discover D&D after years of board gaming. A fateful first campaign begins.",
        tag: "Origin",
      },
      {
        _type: "historyEntry",
        _key: "uncles-league",
        year: 2017,
        displayTitle: "The Uncles League",
        description:
          "A regular game night grows by word of mouth — no ads, no algorithm. Just good sessions and better stories.",
        tag: "Community",
      },
      {
        _type: "historyEntry",
        _key: "cnf-born",
        year: 2018,
        displayTitle: "Criticals & Fumbles Is Born",
        description:
          "As demand outgrows supply of DMs, C&F forms to train more hosts and support a growing player community.",
        tag: "Founded",
      },
      {
        _type: "historyEntry",
        _key: "online-arc",
        year: 2020,
        displayTitle: "The Online Arc",
        description:
          "In-person games pause. C&F pivots to smaller satellite games and online play — and discovers the table has no borders.",
        tag: "Pivot",
      },
      {
        _type: "historyEntry",
        _key: "first-public-event",
        year: 2021,
        displayTitle: "First Public Event",
        description:
          "C&F runs its first D&D event for Xpidemix — taking the game beyond the living room for the first time.",
        tag: "Milestone",
      },
      {
        _type: "historyEntry",
        _key: "expanding-party",
        year: 2022,
        displayTitle: "Expanding the Party",
        description:
          "Merger talks with The Charlie Bravo Squad broaden C&F's direction. The \"Learn To\" series launches.",
        tag: "Growth",
      },
      {
        _type: "historyEntry",
        _key: "nlb-partnership",
        year: 2023,
        displayTitle: "NLB Partnership",
        description:
          "Monthly sessions with the National Library Board bring tabletop RPGs to new audiences across Singapore.",
        tag: "Partnership",
      },
      {
        _type: "historyEntry",
        _key: "mass-event-nlb",
        year: 2024,
        displayTitle: "Mass Event with NLB",
        description:
          "Collaborating with other RPG providers for a major mass event in June — C&F's largest public event to date.",
        tag: "Landmark",
      },
      {
        _type: "historyEntry",
        _key: "worldbuilding-arc",
        year: 2025,
        displayTitle: "The World-Building Arc",
        description:
          "Focus turns inward — building an integrated world-building and story group. The lore deepens. The worlds take shape.",
        tag: "Current",
      },
    ],
  });

  await upsertSingleton("philosophy", "philosophy", {
    tagline: "Good Players Make Good Tables. Good Tables Make Good Stories.",
    pillars: [
      {
        _type: "pillar",
        _key: "community",
        romanNumeral: "I",
        name: "Community",
        tagline: "Everyone's welcome at this table",
        values: ["Inclusiveness", "Trust", "Empathy", "Respect"],
        description:
          "We don't care if you've never held a d20. We care that you show up, treat people well, and leave the table better than you found it.",
      },
      {
        _type: "pillar",
        _key: "collaboration",
        romanNumeral: "II",
        name: "Collaboration",
        tagline: "Better stories need better parties",
        values: ["Commitment", "Contribution", "Support"],
        description:
          "The best moments happen when everyone's invested. Show up. Contribute. Back each other up. The DM can't do it alone — and neither can you.",
      },
      {
        _type: "pillar",
        _key: "sincerity",
        romanNumeral: "III",
        name: "Sincerity",
        tagline: "No metagaming life",
        values: ["Integrity", "Honesty", "Transparency", "Emotionally Invested"],
        description:
          "Be real. Say what you mean. Care genuinely. The table is a safe space precisely because everyone here is actually trying — not performing trying.",
      },
    ],
    behaviours: [
      {
        _type: "behaviour",
        _key: "your-seat",
        name: "Your Seat",
        title: "Identity — \"Everyone has a seat. This one's yours.\"",
        description:
          "You have a specific place at this table — your weirdness is a feature, not a bug.",
        flavourLine: "Everyone has a seat. This one's yours.",
      },
      {
        _type: "behaviour",
        _key: "your-party",
        name: "Your Party",
        title: "Belonging — \"A good party watches each other's backs.\"",
        description:
          "You're not a guest here. You're part of the party. That means looking out for each other — at the table and after the session ends.",
        flavourLine: "A good party watches each other's backs.",
      },
      {
        _type: "behaviour",
        _key: "your-campaign",
        name: "Your Campaign",
        title: "Place — \"The story only works because you're in it.\"",
        description:
          "You're not just attending. You're part of the story being written.",
        flavourLine: "The story only works because you're in it.",
      },
    ],
    outcomes: [
      {
        _type: "outcome",
        _key: "guild-runs-itself",
        name: "A Guild That Runs Itself",
        title: "Still rolling, years later.",
        description:
          "When the culture is strong enough, no single person holds it together. New members become old members. Old members become legends.",
        flavourLine: "Still rolling, years later.",
      },
      {
        _type: "outcome",
        _key: "worlds-worth-returning",
        name: "Worlds Worth Returning To",
        title: "The homebrew so good it becomes canon.",
        description:
          "When DMs build on each other's work, you get worlds with weight — places people actually want to explore, revisit, and protect.",
        flavourLine: "The homebrew so good it becomes canon.",
      },
      {
        _type: "outcome",
        _key: "friends-know-alignment",
        name: "Friends Who Know Your Alignment",
        title: "They've seen you roll a nat 1 and stayed anyway.",
        description:
          "The friendships that started over a character sheet and turned into something that fits in your actual life — not just your Thursday nights.",
        flavourLine: "They've seen you roll a nat 1 and stayed anyway.",
      },
    ],
  });

  const worldsData = [
    {
      slug: "titans-gate",
      name: "Titan's Gate",
      status: "active",
      colourAccent: "#8B2FC9",
      tagline: "PLACEHOLDER — fill this in via Studio",
      description: [
        {
          _type: "block",
          _key: "desc",
          children: [{ _type: "span", _key: "span", text: PLACEHOLDER_BACKSTORY }],
        },
      ],
    },
    {
      slug: "temasek-tales",
      name: "Temasek Tales",
      status: "active",
      colourAccent: "#C4692A",
      tagline: "PLACEHOLDER — fill this in via Studio",
      description: [
        {
          _type: "block",
          _key: "desc",
          children: [{ _type: "span", _key: "span", text: PLACEHOLDER_BACKSTORY }],
        },
      ],
    },
    {
      slug: "singaporez",
      name: "SingaporeZ",
      status: "active",
      colourAccent: "#2C5F8A",
      tagline: "PLACEHOLDER — fill this in via Studio",
      description: [
        {
          _type: "block",
          _key: "desc",
          children: [{ _type: "span", _key: "span", text: PLACEHOLDER_BACKSTORY }],
        },
      ],
    },
    {
      slug: "shattered-tales",
      name: "Shattered Tales",
      status: "active",
      colourAccent: "#6B3FA0",
      tagline: "PLACEHOLDER — fill this in via Studio",
      description: [
        {
          _type: "block",
          _key: "desc",
          children: [{ _type: "span", _key: "span", text: PLACEHOLDER_BACKSTORY }],
        },
      ],
    },
  ];

  const worldRefs: Record<string, { _id: string }> = {};
  for (const world of worldsData) {
    const { slug, ...rest } = world;
    const doc = await upsertBySlug("world", slug, rest);
    worldRefs[slug] = doc;
  }

  await upsertBySlug("teamMember", "founder", {
    handle: "Founder",
    tier: "Horsemen",
    roles: ["architect"],
    dndClass: "Wizard",
    backstory: PLACEHOLDER_BACKSTORY,
    active: true,
  });

  await upsertBySlug("teamMember", "dm-01", {
    handle: "DM_01",
    tier: "DMCouncil",
    roles: ["dungeon-keeper"],
    dndClass: "Dungeon Master (DM)",
    backstory: PLACEHOLDER_BACKSTORY,
    worlds: Object.values(worldRefs).map((w) => ({
      _type: "reference",
      _ref: w._id,
      _key: w._id,
    })),
    active: true,
  });

  await upsertBySlug("teamMember", "player-01", {
    handle: "Player_01",
    tier: "UnclesLeague",
    dndClass: "Rogue",
    backstory: PLACEHOLDER_BACKSTORY,
    active: true,
  });

  await upsertBySlug("majorEvent", "critcon-2027", {
    title: "CritCon 2027 — Watch This Space",
    status: "watch-this-space",
    eventDate: "Q3 2027",
    watchThisSpaceTeaser: [
      {
        _type: "block",
        _key: "teaser",
        children: [
          {
            _type: "span",
            _key: "span",
            text: "Something big is coming. The dice have been cast. The worlds are aligning. Watch this space.",
          },
        ],
      },
    ],
  });

  const articleSeeds = [
    { slug: "placeholder-campaign-craft", category: "Campaign Craft" },
    { slug: "placeholder-dm-advice", category: "DM Advice" },
    { slug: "placeholder-community", category: "Community" },
  ];

  for (const article of articleSeeds) {
    await upsertBySlug("article", article.slug, {
      title: "PLACEHOLDER — Write your first article via Sanity Studio",
      excerpt: "This is a placeholder article. Log into cnf.sg/studio to write real content.",
      category: article.category,
      status: "draft",
      publishedAt: new Date().toISOString(),
    });
  }

  console.log("\nDone. Draft/placeholder content is ready to edit at /studio.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
