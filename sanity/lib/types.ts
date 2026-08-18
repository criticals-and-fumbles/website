import type { PortableTextBlock } from "sanity";
import type { SanityImageSource } from "@sanity/image-url";

export type SanityImage = SanityImageSource & {
  alt?: string;
  asset?: { _ref: string };
};

export interface TeamMemberRef {
  _id: string;
  handle: string;
  slug: string;
  avatar?: SanityImage;
}

export interface WorldRef {
  _id: string;
  name: string;
  slug: string;
  colourAccent?: string;
}

export interface DivisionRef {
  name: string;
  slug: string;
  colourAccent?: string;
}

export interface ArticleCard {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  category?: string;
  publishedAt?: string;
  readTimeMinutes?: number;
  coverImage?: SanityImage;
  author?: TeamMemberRef;
}

export interface Article extends ArticleCard {
  body?: PortableTextBlock[];
  tags?: string[];
  featured?: boolean;
  status?: "draft" | "published";
  worlds?: WorldRef[];
  pageFooterCTA?: PortableTextBlock[];
}

export interface MajorEventCardData {
  _id: string;
  title: string;
  slug: string;
  tagline?: string;
  eventType?: string;
  status:
    | "watch-this-space"
    | "coming-soon"
    | "registration-open"
    | "full"
    | "completed"
    | "cancelled";
  eventDate?: string;
  startDate?: string;
  location?: string;
  coverImage?: SanityImage;
  splashImage?: SanityImage;
  registrationUrl?: string;
}

/** Hero right panel — pinned event banner. See HOME_PINNED_EVENT_QUERY. */
export interface PinnedEvent {
  _id: string;
  title: string;
  status: "watch-this-space" | "coming-soon" | "registration-open";
  eventDate?: string;
  startDate?: string;
  location?: string;
  tagline?: string;
  slug: string;
  splashImage?: SanityImage;
  coverImage?: SanityImage;
  watchThisSpaceTeaser?: PortableTextBlock[];
}

/**
 * Hero right panel — one entry in the merged RSS-style feed. Different
 * source types carry different optional fields; components branch on
 * `_type`. See HOME_RSS_FEED_QUERY.
 */
export interface RssFeedItem {
  _type:
    | "article"
    | "majorEvent"
    | "regularEvent"
    | "loreEntry"
    | "sessionLog"
    | "teamMember"
    | "worldUnit"
    | "keyFigure"
    | "notablePlace"
    | "magicItem"
    | "faction";
  _id: string;
  title: string;
  slug: string;
  date: string;
  category?: string;
  author?: string;
  subtitle?: string;
  worldSlug?: string;
  unitSlug?: string;
  campaignName?: string;
  roles?: string[];
  developmentStatus?: string;
  /** World's unitLabel (e.g. "Territory"/"District") — worldUnit items
   * only; used instead of a hardcoded label since it varies per world. */
  unitLabel?: string;
  role?: string;
  placeType?: string;
  rarity?: string;
  factionType?: string;
}

export interface RssFeedData {
  articles: RssFeedItem[];
  events: RssFeedItem[];
  lore: RssFeedItem[];
  sessions: RssFeedItem[];
  team: RssFeedItem[];
  worldUnits: RssFeedItem[];
  keyFigures: RssFeedItem[];
  notablePlaces: RssFeedItem[];
  magicItems: RssFeedItem[];
  factions: RssFeedItem[];
}

export interface MajorEvent extends MajorEventCardData {
  capacity?: number;
  ticketPrice?: string;
  description?: PortableTextBlock[];
  watchThisSpaceTeaser?: PortableTextBlock[];
  schedule?: PortableTextBlock[];
  dms?: TeamMemberRef[];
  pageFooterCTA?: PortableTextBlock[];
}

export interface RegularEvent {
  _id: string;
  title: string;
  slug: string;
  campaignName?: string;
  schedule?: string;
  system?: string;
  playerCount?: string;
  status?: string;
  dm?: TeamMemberRef;
  world?: WorldRef;
  registrationUrl?: string;
  /** Detail-page-only fields — undefined on the card-query shape above. */
  eventType?: string;
  frequency?: string;
  location?: string;
  description?: PortableTextBlock[];
  startedDate?: string;
  sessionCount?: number;
  coverImage?: SanityImage;
  pageFooterCTA?: PortableTextBlock[];
}

/**
 * Homepage "Upcoming Events" strip item — flattened union of majorEvent/
 * regularEvent fields tagged by `_type`, plus a computed `sortDate` used
 * only for the client-side merge in app/(site)/page.tsx. See
 * HOME_UPCOMING_EVENTS_QUERY.
 */
export interface HomeUpcomingEvent {
  _type: "majorEvent" | "regularEvent";
  _id: string;
  title: string;
  slug: string;
  sortDate: string;
  status?: string;
  coverImage?: SanityImage;
  registrationUrl?: string;
  /** majorEvent only */
  eventDate?: string;
  location?: string;
  /** regularEvent only */
  campaignName?: string;
  schedule?: string;
}

export interface HomeUpcomingEventsResult {
  major: (MajorEventCardData & { sortDate: string })[];
  regular: (Pick<RegularEvent, "_id" | "title" | "slug" | "campaignName" | "schedule" | "status" | "coverImage" | "registrationUrl"> & {
    sortDate: string;
  })[];
}

export interface TeamMember {
  _id: string;
  handle: string;
  slug: string;
  realName?: string;
  roles?: string[];
  tier: "Horsemen" | "DMCouncil" | "UnclesLeague" | "CriticalFumblers";
  dndClass?: string;
  race?: string;
  alignment?: string;
  stats?: {
    charisma?: number;
    wisdom?: number;
    intelligence?: number;
    luck?: number;
  };
  backstory?: string;
  signatureMove?: string;
  avatar?: SanityImage;
  socialLinks?: { platform: string; url: string }[];
  worlds?: WorldRef[];
  division?: DivisionRef;
}

/** See sanity/schemas/division.ts. */
export interface Division {
  _id: string;
  name: string;
  slug: string;
  logo?: SanityImage;
  blurb?: string;
  colourAccent?: string;
  order?: number;
  memberCount?: number;
}

export interface World {
  _id: string;
  name: string;
  slug: string;
  tagline?: string;
  description?: PortableTextBlock[];
  status?: string;
  system?: string;
  colourAccent?: string;
  coverImage?: SanityImage;
  mapImage?: SanityImage;
  sessionCount?: number;
  loreCount?: number;
  dms?: TeamMemberRef[];
  /** What this world calls its worldUnit subdivisions, e.g. "Territory". */
  unitLabel?: string;
  _createdAt?: string;
  _updatedAt?: string;
  lastEditedBy?: TeamMemberRef;
}

export interface WorldUnitRef {
  _id: string;
  name: string;
  slug: string;
}

export interface WorldUnitCard {
  _id: string;
  name: string;
  slug: string;
  developmentStatus?: "draft" | "in-progress" | "established" | "canonical";
  colourAccent?: string;
  coverImage?: SanityImage;
  dmOwner?: TeamMemberRef;
}

/**
 * Wiki entry meta panel (Phase 1.5) — "In this unit"/"In this world" list.
 * See sanity/lib/queries.ts's wikiSiblingEntries GROQ fragment.
 */
export interface WikiSiblingEntry {
  _type: "loreEntry" | "sessionLog" | "keyFigure" | "notablePlace" | "magicItem" | "faction" | "worldUnit";
  title: string;
  slug: string;
  worldSlug?: string;
  unitSlug?: string;
}

export interface WorldUnit extends WorldUnitCard {
  overview?: PortableTextBlock[];
  mapImage?: SanityImage;
  mapImageUrl?: string;
  world?: WorldRef & { unitLabel?: string };
  pageFooterCTA?: PortableTextBlock[];
  _createdAt?: string;
  _updatedAt?: string;
  lastEditedBy?: TeamMemberRef;
  siblingEntries?: WikiSiblingEntry[];
  counts?: {
    keyFigures: number;
    notablePlaces: number;
    magicItems: number;
    factions: number;
    loreEntries: number;
    sessionLogs: number;
  };
}

export interface LoreEntryCard {
  _id: string;
  title: string;
  slug: string;
  category?: string;
  canonStatus?: string;
  summary?: string;
  coverImage?: SanityImage;
}

export interface LoreEntry extends LoreEntryCard {
  alsoKnownAs?: string;
  body?: PortableTextBlock[];
  firstAppeared?: string;
  world?: WorldRef;
  relatedEntries?: LoreEntryCard[];
  lastEditedBy?: TeamMemberRef;
  tags?: string[];
  _createdAt?: string;
  _updatedAt?: string;
  siblingEntries?: WikiSiblingEntry[];
}

export interface SessionLogCard {
  _id: string;
  title: string;
  slug: string;
  sessionNumber?: number;
  campaignName?: string;
  sessionDate?: string;
  tone?: string;
  synopsis?: string;
  dm?: TeamMemberRef;
}

export interface SessionLog extends SessionLogCard {
  world?: WorldRef;
  players?: TeamMemberRef[];
  fullRecap?: PortableTextBlock[];
  notableMoments?: PortableTextBlock[];
  loreUpdates?: PortableTextBlock[];
  npcStatusChanges?: PortableTextBlock[];
  nextSession?: string;
  _createdAt?: string;
  _updatedAt?: string;
  lastEditedBy?: TeamMemberRef;
  siblingEntries?: WikiSiblingEntry[];
}

/**
 * Field names deliberately mirror the Fight Club 5e XML `<monster>` element
 * (ac, hp, str/dex/con/int/wis/cha, cr, etc.) so a future export script can
 * map this object straight across. No export tooling exists yet — see
 * CLAUDE.md § Stat block XML mapping.
 */
export interface StatBlockNamedText {
  name?: string;
  text?: string;
}

export interface StatBlock {
  size?: "Tiny" | "Small" | "Medium" | "Large" | "Huge" | "Gargantuan";
  creatureType?: string;
  alignment?: string;
  ac?: string;
  hp?: string;
  speed?: string;
  abilities?: {
    str?: number;
    dex?: number;
    con?: number;
    int?: number;
    wis?: number;
    cha?: number;
  };
  savingThrows?: string;
  skills?: string;
  resistances?: string;
  immunities?: string;
  vulnerabilities?: string;
  conditionImmunities?: string;
  senses?: string;
  passivePerception?: number;
  languages?: string;
  challengeRating?: string;
  traits?: StatBlockNamedText[];
  actions?: StatBlockNamedText[];
  legendaryActions?: StatBlockNamedText[];
  reactions?: StatBlockNamedText[];
}

export interface KeyFigureCard {
  _id: string;
  name: string;
  slug: string;
  role?: string;
  status?: "alive" | "dead" | "unknown" | "missing";
  threatLevel?: "friendly" | "neutral" | "cautious" | "dangerous" | "deadly";
  portrait?: SanityImage;
  hasStatBlock?: boolean;
}

export interface KeyFigure extends KeyFigureCard {
  alsoKnownAs?: string;
  description?: PortableTextBlock[];
  statBlock?: StatBlock;
  faction?: { name: string; slug: string };
  world?: WorldRef;
  unit?: WorldUnitRef;
  _createdAt?: string;
  _updatedAt?: string;
  lastEditedBy?: TeamMemberRef;
  siblingEntries?: WikiSiblingEntry[];
}

export interface NotablePlaceCard {
  _id: string;
  name: string;
  slug: string;
  placeType?: string;
  dangerLevel?: "safe" | "low-risk" | "dangerous" | "deadly";
}

export interface NotablePlace extends NotablePlaceCard {
  description?: PortableTextBlock[];
  images?: SanityImage[];
  keyFigures?: KeyFigureCard[];
  items?: { _id: string; name: string; slug: string }[];
  world?: WorldRef;
  unit?: WorldUnitRef;
  _createdAt?: string;
  _updatedAt?: string;
  lastEditedBy?: TeamMemberRef;
  siblingEntries?: WikiSiblingEntry[];
}

export interface ItemMechanics {
  itemTypeDetail?: string;
  attunement?: string;
  text?: string;
}

export interface MagicItemCard {
  _id: string;
  name: string;
  slug: string;
  rarity?: "common" | "uncommon" | "rare" | "very-rare" | "legendary" | "artifact";
  itemArt?: SanityImage;
}

export interface MagicItem extends MagicItemCard {
  itemType?: string;
  lore?: PortableTextBlock[];
  hasMechanics?: boolean;
  mechanics?: ItemMechanics;
  currentHolder?: { _id: string; name: string; slug: string };
  foundAt?: { _id: string; name: string; slug: string };
  world?: WorldRef;
  unit?: WorldUnitRef;
  _createdAt?: string;
  _updatedAt?: string;
  lastEditedBy?: TeamMemberRef;
  siblingEntries?: WikiSiblingEntry[];
}

export interface FactionCard {
  _id: string;
  name: string;
  slug: string;
  factionType?: string;
  banner?: SanityImage;
}

export interface Faction extends FactionCard {
  description?: PortableTextBlock[];
  members?: KeyFigureCard[];
  world?: WorldRef;
  unit?: WorldUnitRef;
  _createdAt?: string;
  _updatedAt?: string;
  lastEditedBy?: TeamMemberRef;
  siblingEntries?: WikiSiblingEntry[];
}

/** Unit homepage "recent entries" preview item — see UNIT_RECENT_ENTRIES_QUERY. */
export interface RecentUnitEntry {
  _type: "keyFigure" | "notablePlace" | "magicItem" | "faction";
  _id: string;
  name: string;
  slug: string;
  role?: string;
  placeType?: string;
  rarity?: string;
  factionType?: string;
}

export interface Resource {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  category?: string;
  division?: string;
  downloadUrl?: string;
  thumbnail?: SanityImage;
  fileSize?: string;
  accessLevel?: string;
  featured?: boolean;
}

export interface GalleryPhoto {
  _id: string;
  image: SanityImage;
  caption?: string;
  photographer?: string;
  takenAt?: string;
  event?: { _id: string; title: string; slug: string };
}

export interface Organisation {
  _id: string;
  name: string;
  slug: string;
  orgType?: string;
  description?: string;
  website?: string;
  yearsPeriod?: string;
  logo?: SanityImage;
}

export interface HistoryEntry {
  year: number;
  displayTitle: string;
  description?: string;
  tag?: string;
}

export interface SiteSettings {
  title?: string;
  tagline?: string;
  shortDescription?: string;
  foundedYear?: number;
  basedIn?: string;
  contactEmail?: string;
  discordUrl?: string;
  discordServerName?: string;
  socialLinks?: { platform: string; url: string }[];
  newsletterName?: string;
  newsletterDescription?: string;
  metaDescription?: string;
  ogImage?: SanityImage;
  keywords?: string[];
  footerNavLinks?: { label: string; url: string }[];
  copyrightLine?: string;
  activities?: string[];
  visionStatement?: string;
  missionStatement?: string;
  historyTimeline?: HistoryEntry[];
}

export interface PhilosophyPillar {
  romanNumeral: string;
  name: string;
  tagline?: string;
  values?: string[];
  description?: string;
}

export interface PhilosophyBehaviour {
  name: string;
  title: string;
  description?: string;
  flavourLine?: string;
}

export interface Philosophy {
  tagline?: string;
  pillars?: PhilosophyPillar[];
  behaviours?: PhilosophyBehaviour[];
  outcomes?: PhilosophyBehaviour[];
}

export interface NumberedRule {
  number: number;
  title: string;
  points?: string[];
}

export interface SafetyComfort {
  heading?: string;
  introText?: string;
  tools?: string[];
  points?: string[];
}

export interface CodeOfConduct {
  introTagline?: string;
  tableExpectations?: NumberedRule[];
  safetyComfort?: SafetyComfort;
  diceRules?: NumberedRule[];
}

export interface AiCharterPrinciple {
  number?: number;
  title?: string;
  body?: PortableTextBlock[];
  pullQuote?: string;
}

export interface AiCharter {
  intro?: PortableTextBlock[];
  principles?: AiCharterPrinciple[];
  closingStatement?: PortableTextBlock[];
}
