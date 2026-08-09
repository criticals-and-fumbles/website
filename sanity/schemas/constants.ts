/**
 * Plain constant arrays shared between Sanity schema definitions and app
 * pages/components. Deliberately has NO import from "sanity" — app pages
 * import category/status lists from here, not from the schema files
 * themselves, because importing a schema file pulls in the entire `sanity`
 * package (including Studio-only React code) into the server/RSC bundle.
 */

export const ARTICLE_CATEGORIES = [
  "Campaign Craft",
  "Classes",
  "Combat",
  "Reviews",
  "World Building",
  "Player Tips",
  "DM Advice",
  "Lore & Theory",
  "Indie TTRPGs",
  "Community",
];

export const LORE_CATEGORIES = [
  "Location",
  "Faction",
  "NPC",
  "History",
  "Creature",
  "Artefact",
  "Magic",
  "Pantheon",
  "Culture",
];

export const CANON_STATUSES = [
  { title: "Canon", value: "canon" },
  { title: "Homebrew", value: "homebrew" },
  { title: "Disputed", value: "disputed" },
  { title: "Rumour", value: "rumour" },
  { title: "Retconned", value: "retconned" },
  { title: "DM Eyes Only", value: "dm-eyes-only" },
];

export const SESSION_TONES = [
  "Epic",
  "Comedic",
  "Tragic",
  "Tense",
  "Investigative",
  "Social",
  "Combat-Heavy",
  "Mixed",
];
