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
