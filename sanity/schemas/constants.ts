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

export const TEAM_MEMBER_ROLES = [
  // Existing — unchanged, do not alter
  { title: "Dungeon Keeper", value: "dungeon-keeper" },
  { title: "World Builder", value: "world-builder" },
  { title: "Lore Master", value: "lore-master" },
  { title: "Lore Keeper", value: "lore-keeper" },
  { title: "Sage", value: "sage" },
  { title: "Journeyman", value: "journeyman" },
  { title: "Chronicler", value: "chronicler" },
  { title: "Artisan", value: "artisan" },
  { title: "Architect", value: "architect" },
  // New — additive only
  { title: "Narrator", value: "narrator" },
  { title: "Storyteller", value: "storyteller" },
  { title: "Loremaster", value: "loremaster" },
  { title: "Apprentice", value: "apprentice" },
  { title: "Curator", value: "curator" },
  { title: "Maestro", value: "maestro" },
  { title: "Crafter", value: "crafter" },
  { title: "Smith", value: "smith" },
];
