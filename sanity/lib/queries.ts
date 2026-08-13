import { groq } from "next-sanity";

/* ---------------------------------------------------------------------- */
/* Shared fragments                                                       */
/* ---------------------------------------------------------------------- */

const articleCardFields = groq`
  _id, title, "slug": slug.current, excerpt, category,
  publishedAt, readTimeMinutes,
  coverImage,
  "author": author->{ handle, "slug": slug.current, avatar }
`;

const teamMemberRefFields = groq`_id, handle, "slug": slug.current, avatar`;

/**
 * Wiki entry meta panel (Phase 1.5) — "In this unit"/"In this world" list.
 * Named "siblingEntries" (not "relatedEntries") specifically to avoid
 * colliding with loreEntry's pre-existing, manually-curated
 * "relatedEntries" reference array field — this is a separate,
 * auto-computed-by-shared-unit/world query, not that field.
 * Falls back to world-level siblings when the current doc has no unit set
 * (matches the panel's own "In this world" fallback framing).
 */
const wikiSiblingEntries = groq`
  "siblingEntries": *[
    _type in ["loreEntry", "sessionLog", "keyFigure", "notablePlace", "magicItem", "faction"]
    && _id != ^._id
    && (
      (defined(^.unit._ref) && unit._ref == ^.unit._ref) ||
      (!defined(^.unit._ref) && world._ref == ^.world._ref)
    )
  ] | order(_updatedAt desc) [0...4] {
    _type,
    "title": coalesce(title, name),
    "slug": slug.current,
    "worldSlug": world->slug.current,
    "unitSlug": unit->slug.current
  }
`;

const wikiLastEditedBy = groq`"lastEditedBy": lastEditedBy->{ handle }`;

/* ---------------------------------------------------------------------- */
/* Singletons                                                             */
/* ---------------------------------------------------------------------- */

export const SITE_SETTINGS_QUERY = groq`*[_type == "siteSettings"][0]`;

export const PHILOSOPHY_QUERY = groq`*[_type == "philosophy"][0]`;

export const CODE_OF_CONDUCT_QUERY = groq`
  *[_type == "codeOfConduct"][0] {
    introTagline,
    tableExpectations,
    safetyComfort,
    diceRules
  }
`;

/* ---------------------------------------------------------------------- */
/* Homepage                                                               */
/* ---------------------------------------------------------------------- */

export const HOME_LATEST_ARTICLES_QUERY = groq`
  *[_type == "article" && status == "published"]
    | order(coalesce(publishedAt, _updatedAt) desc)[0...3] {
    ${articleCardFields}
  }
`;

/**
 * Hero right panel — pinned event banner. Any majorEvent still "live" in the
 * announcement sense (not full/completed/cancelled), preferring
 * registration-open, then coming-soon, then most-recently-updated among
 * watch-this-space entries.
 */
export const HOME_PINNED_EVENT_QUERY = groq`
  *[_type == "majorEvent"
    && status in ["registration-open", "coming-soon", "watch-this-space"]
  ] | order(
    (status == "registration-open") desc,
    (status == "coming-soon") desc,
    _updatedAt desc
  )[0] {
    _id,
    title,
    status,
    eventDate,
    startDate,
    location,
    tagline,
    "slug": slug.current,
    splashImage,
    coverImage,
    watchThisSpaceTeaser
  }
`;

/**
 * Hero right panel — RSS-style feed grouped by content type. Merged and
 * sorted client-side (in app/(site)/page.tsx) into a single newest-first
 * list, capped at 5 (3 on mobile).
 */
export const HOME_RSS_FEED_QUERY = groq`{
  "articles": *[_type == "article"
    && status == "published"
  ] | order(_updatedAt desc)[0...5] {
    _type, _id, title,
    "slug": slug.current,
    "date": _updatedAt,
    category,
    "author": author->handle
  },
  "events": *[_type in ["majorEvent", "regularEvent"]
  ] | order(_updatedAt desc)[0...5] {
    _type, _id, title,
    "slug": slug.current,
    "date": _updatedAt,
    "subtitle": coalesce(eventType, status)
  },
  "lore": *[_type == "loreEntry"
  ] | order(_updatedAt desc)[0...5] {
    _type, _id, title,
    "slug": slug.current,
    "date": _updatedAt,
    category,
    "worldSlug": world->slug.current
  },
  "sessions": *[_type == "sessionLog"
  ] | order(_updatedAt desc)[0...5] {
    _type, _id,
    "title": coalesce(sessionTitle, "Session " + string(sessionNumber)),
    "slug": slug.current,
    "date": coalesce(sessionDate, _updatedAt),
    "worldSlug": world->slug.current,
    campaignName
  },
  "team": *[_type == "teamMember"
    && active == true
  ] | order(_updatedAt desc)[0...3] {
    _type, _id,
    "title": handle,
    "slug": slug.current,
    "date": _updatedAt,
    roles
  },
  "worldUnits": *[_type == "worldUnit"
  ] | order(_updatedAt desc)[0...5] {
    _type, _id,
    "title": name,
    "slug": slug.current,
    "date": _updatedAt,
    "worldSlug": world->slug.current,
    "unitLabel": world->unitLabel,
    developmentStatus
  },
  "keyFigures": *[_type == "keyFigure"
  ] | order(_updatedAt desc)[0...5] {
    _type, _id,
    "title": name,
    "slug": slug.current,
    "date": _updatedAt,
    "worldSlug": world->slug.current,
    "unitSlug": unit->slug.current,
    role
  },
  "notablePlaces": *[_type == "notablePlace"
  ] | order(_updatedAt desc)[0...5] {
    _type, _id,
    "title": name,
    "slug": slug.current,
    "date": _updatedAt,
    "worldSlug": world->slug.current,
    "unitSlug": unit->slug.current,
    placeType
  },
  "magicItems": *[_type == "magicItem"
  ] | order(_updatedAt desc)[0...5] {
    _type, _id,
    "title": name,
    "slug": slug.current,
    "date": _updatedAt,
    "worldSlug": world->slug.current,
    "unitSlug": unit->slug.current,
    rarity
  },
  "factions": *[_type == "faction"
  ] | order(_updatedAt desc)[0...5] {
    _type, _id,
    "title": name,
    "slug": slug.current,
    "date": _updatedAt,
    "worldSlug": world->slug.current,
    "unitSlug": unit->slug.current,
    factionType
  }
}`;

/**
 * Homepage "Upcoming Events" — merges majorEvent + regularEvent (scope
 * change, see CLAUDE.md Release History; originally majorEvent-only).
 * Each half is capped at [0...5] server-side and carries its own
 * "sortDate" projection (majorEvent: startDate; regularEvent has no
 * "next occurrence" field, only startedDate — the campaign's start, not
 * a future date, but it's the only schedule-relevant field the schema
 * has); the two are merged and sorted together client-side in
 * app/(site)/page.tsx, then sliced to 3 — same merge-in-JS pattern this
 * project already uses for HOME_RSS_FEED_QUERY, since GROQ can't cleanly
 * cross-type-sort in one query.
 */
export const HOME_UPCOMING_EVENTS_QUERY = groq`{
  "major": *[_type == "majorEvent" && status != "cancelled" && status != "completed"]
    | order(coalesce(startDate, _createdAt) asc)[0...5] {
    _id, title, "slug": slug.current, eventType, eventDate, startDate,
    location, status, coverImage, registrationUrl,
    "sortDate": coalesce(startDate, _createdAt)
  },
  "regular": *[_type == "regularEvent" && status != "Ended"]
    | order(coalesce(startedDate, _createdAt) asc)[0...5] {
    _id, title, "slug": slug.current, campaignName, schedule, status,
    coverImage,
    "sortDate": coalesce(startedDate, _createdAt)
  }
}`;

export const HOME_WORLDS_QUERY = groq`
  *[_type == "world"] | order(name asc) {
    _id, name, "slug": slug.current, tagline, colourAccent, coverImage,
    "dms": dms[]->{ ${teamMemberRefFields} }
  }
`;

/* ---------------------------------------------------------------------- */
/* Articles                                                                */
/* ---------------------------------------------------------------------- */

export const ARTICLES_QUERY = groq`
  *[_type == "article" && status == "published"
    && (!defined($category) || category == $category)]
    | order(coalesce(publishedAt, _updatedAt) desc) {
    ${articleCardFields}
  }
`;

export const ARTICLE_BY_SLUG_QUERY = groq`
  *[_type == "article" && slug.current == $slug][0] {
    ...,
    "slug": slug.current,
    "author": author->{ ${teamMemberRefFields}, realName, roles },
    "worlds": worlds[]->{ _id, name, "slug": slug.current, colourAccent }
  }
`;

export const ARTICLES_BY_MEMBER_QUERY = groq`
  *[_type == "article" && status == "published" && author._ref == $memberId]
    | order(publishedAt desc) {
    ${articleCardFields}
  }
`;

/* ---------------------------------------------------------------------- */
/* Events                                                                  */
/* ---------------------------------------------------------------------- */

export const MAJOR_EVENTS_UPCOMING_QUERY = groq`
  *[_type == "majorEvent" && status != "completed" && status != "cancelled"]
    | order(startDate asc) {
    _id, title, "slug": slug.current, tagline, eventType, status,
    eventDate, startDate, location, coverImage, registrationUrl
  }
`;

export const MAJOR_EVENTS_PAST_QUERY = groq`
  *[_type == "majorEvent" && status == "completed"] | order(startDate desc) {
    _id, title, "slug": slug.current, eventDate, coverImage
  }
`;

export const REGULAR_EVENTS_QUERY = groq`
  *[_type == "regularEvent"] | order(title asc) {
    _id, title, "slug": slug.current, campaignName, schedule, system,
    playerCount, status,
    "dm": dm->{ ${teamMemberRefFields} },
    "world": world->{ _id, name, "slug": slug.current, colourAccent }
  }
`;

export const MAJOR_EVENT_BY_SLUG_QUERY = groq`
  *[_type == "majorEvent" && slug.current == $slug][0] {
    ...,
    "slug": slug.current,
    "dms": dms[]->{ ${teamMemberRefFields} }
  }
`;

export const REGULAR_EVENT_BY_SLUG_QUERY = groq`
  *[_type == "regularEvent" && slug.current == $slug][0] {
    ...,
    "slug": slug.current,
    "dm": dm->{ ${teamMemberRefFields} },
    "world": world->{ _id, name, "slug": slug.current, colourAccent }
  }
`;

/* ---------------------------------------------------------------------- */
/* Team                                                                    */
/* ---------------------------------------------------------------------- */

export const TEAM_MEMBERS_QUERY = groq`
  *[_type == "teamMember" && active == true] | order(tier asc, handle asc) {
    _id, handle, "slug": slug.current, realName, roles, tier,
    dndClass, race, alignment, stats, backstory, signatureMove,
    avatar, socialLinks,
    "worlds": worlds[]->{ _id, name, "slug": slug.current, colourAccent },
    "division": division->{ name, "slug": slug.current, colourAccent }
  }
`;

export const TEAM_MEMBER_BY_SLUG_QUERY = groq`
  *[_type == "teamMember" && slug.current == $slug][0] {
    ...,
    "slug": slug.current,
    "worlds": worlds[]->{ _id, name, "slug": slug.current, colourAccent }
  }
`;

/* ---------------------------------------------------------------------- */
/* Wiki                                                                     */
/* ---------------------------------------------------------------------- */

export const WORLDS_QUERY = groq`
  *[_type == "world"] | order(name asc) {
    _id, name, "slug": slug.current, tagline, colourAccent, coverImage,
    sessionCount, loreCount,
    "dms": dms[]->{ ${teamMemberRefFields} }
  }
`;

export const WIKI_SEARCH_INDEX_QUERY = groq`
  {
    "lore": *[_type == "loreEntry"] {
      _id, title, "slug": slug.current, "worldSlug": world->slug.current
    },
    "sessions": *[_type == "sessionLog"] {
      _id, title, "slug": slug.current, "worldSlug": world->slug.current
    }
  }
`;

export const WORLD_BY_SLUG_QUERY = groq`
  *[_type == "world" && slug.current == $slug][0] {
    ...,
    "slug": slug.current,
    "dms": dms[]->{ ${teamMemberRefFields} },
    ${wikiLastEditedBy}
  }
`;

export const WORLD_RECENT_LORE_QUERY = groq`
  *[_type == "loreEntry" && world->slug.current == $worldSlug]
    | order(_createdAt desc)[0...6] {
    _id, title, "slug": slug.current, category, canonStatus, summary, coverImage
  }
`;

export const WORLD_RECENT_SESSIONS_QUERY = groq`
  *[_type == "sessionLog" && world->slug.current == $worldSlug]
    | order(sessionDate desc)[0...3] {
    _id, title, "slug": slug.current, sessionNumber, sessionDate, tone, synopsis,
    "dm": dm->{ ${teamMemberRefFields} }
  }
`;

export const LORE_ENTRIES_QUERY = groq`
  *[_type == "loreEntry" && world->slug.current == $worldSlug
    && (!defined($category) || category == $category)
    && (!defined($canonStatus) || canonStatus == $canonStatus)]
    | order(title asc) {
    _id, title, "slug": slug.current, category, canonStatus, summary, coverImage
  }
`;

export const LORE_ENTRY_BY_SLUG_QUERY = groq`
  *[_type == "loreEntry" && world->slug.current == $worldSlug && slug.current == $slug][0] {
    ...,
    "slug": slug.current,
    "world": world->{ _id, name, "slug": slug.current, colourAccent },
    "relatedEntries": relatedEntries[]->{ _id, title, "slug": slug.current, category },
    "lastEditedBy": lastEditedBy->{ ${teamMemberRefFields} },
    ${wikiSiblingEntries}
  }
`;

export const SESSION_LOGS_QUERY = groq`
  *[_type == "sessionLog" && world->slug.current == $worldSlug
    && (!defined($campaignName) || campaignName == $campaignName)]
    | order(sessionDate desc) {
    _id, title, "slug": slug.current, sessionNumber, campaignName, sessionDate,
    tone, synopsis, "dm": dm->{ ${teamMemberRefFields} }
  }
`;

export const SESSION_LOG_BY_SLUG_QUERY = groq`
  *[_type == "sessionLog" && world->slug.current == $worldSlug && slug.current == $slug][0] {
    ...,
    "slug": slug.current,
    "world": world->{ _id, name, "slug": slug.current, colourAccent },
    "dm": dm->{ ${teamMemberRefFields} },
    "players": players[]->{ ${teamMemberRefFields} },
    ${wikiLastEditedBy},
    ${wikiSiblingEntries}
  }
`;

/* ---------------------------------------------------------------------- */
/* World Units (Phase 1.3)                                                 */
/* ---------------------------------------------------------------------- */

export const WORLD_UNITS_QUERY = groq`
  *[_type == "worldUnit" && world->slug.current == $worldSlug]
    | order(developmentStatus desc, name asc) {
    _id, name, "slug": slug.current,
    developmentStatus, colourAccent, coverImage,
    "dmOwner": dmOwner->{ handle, "slug": slug.current }
  }
`;

export const WORLD_UNIT_QUERY = groq`
  *[_type == "worldUnit"
    && world->slug.current == $worldSlug
    && slug.current == $unitSlug][0] {
    _id, name, overview, coverImage, mapImage, mapImageUrl,
    developmentStatus, colourAccent, pageFooterCTA,
    _createdAt, _updatedAt,
    "dmOwner": dmOwner->{ handle, "slug": slug.current, avatar },
    "world": world->{ name, "slug": slug.current, unitLabel },
    ${wikiLastEditedBy},
    "counts": {
      "keyFigures": count(*[_type == "keyFigure" && unit._ref == ^._id]),
      "notablePlaces": count(*[_type == "notablePlace" && unit._ref == ^._id]),
      "magicItems": count(*[_type == "magicItem" && unit._ref == ^._id]),
      "factions": count(*[_type == "faction" && unit._ref == ^._id]),
      "loreEntries": count(*[_type == "loreEntry" && unit._ref == ^._id]),
      "sessionLogs": count(*[_type == "sessionLog" && unit._ref == ^._id])
    },
    "siblingEntries": *[
      _type == "worldUnit" && _id != ^._id && world._ref == ^.world._ref
    ] | order(_updatedAt desc) [0...4] {
      _type, "title": name, "slug": slug.current, "worldSlug": world->slug.current
    }
  }
`;

export const WORLD_UNIT_LORE_QUERY = groq`
  *[_type == "loreEntry" && unit->slug.current == $unitSlug] | order(title asc) {
    _id, title, "slug": slug.current, category, canonStatus, summary, coverImage
  }
`;

export const WORLD_UNIT_SESSIONS_QUERY = groq`
  *[_type == "sessionLog" && unit->slug.current == $unitSlug] | order(sessionDate desc) {
    _id, title, "slug": slug.current, sessionNumber, campaignName, sessionDate,
    tone, synopsis, "dm": dm->{ ${teamMemberRefFields} }
  }
`;

export const WORLD_UNIT_LORE_ENTRY_QUERY = groq`
  *[_type == "loreEntry" && unit->slug.current == $unitSlug && slug.current == $slug][0] {
    ...,
    "slug": slug.current,
    "world": world->{ _id, name, "slug": slug.current, colourAccent },
    "relatedEntries": relatedEntries[]->{ _id, title, "slug": slug.current, category },
    "lastEditedBy": lastEditedBy->{ ${teamMemberRefFields} },
    ${wikiSiblingEntries}
  }
`;

export const WORLD_UNIT_SESSION_QUERY = groq`
  *[_type == "sessionLog" && unit->slug.current == $unitSlug && slug.current == $slug][0] {
    ...,
    "slug": slug.current,
    "world": world->{ _id, name, "slug": slug.current, colourAccent },
    "dm": dm->{ ${teamMemberRefFields} },
    "players": players[]->{ ${teamMemberRefFields} },
    ${wikiLastEditedBy},
    ${wikiSiblingEntries}
  }
`;

export const UNIT_KEY_FIGURES_QUERY = groq`
  *[_type == "keyFigure" && unit->slug.current == $unitSlug] | order(name asc) {
    _id, name, "slug": slug.current, role, status, threatLevel, portrait, hasStatBlock
  }
`;

export const KEY_FIGURE_QUERY = groq`
  *[_type == "keyFigure" && slug.current == $slug][0] {
    _id, name, alsoKnownAs, role, status, threatLevel,
    description, portrait, hasStatBlock, statBlock,
    _createdAt, _updatedAt,
    "faction": faction->{ name, "slug": slug.current },
    "world": world->{ name, "slug": slug.current },
    "unit": unit->{ name, "slug": slug.current },
    ${wikiLastEditedBy},
    ${wikiSiblingEntries}
  }
  // dmNotes intentionally excluded — never queried publicly
`;

export const UNIT_NOTABLE_PLACES_QUERY = groq`
  *[_type == "notablePlace" && unit->slug.current == $unitSlug] | order(name asc) {
    _id, name, "slug": slug.current, placeType, dangerLevel
  }
`;

export const NOTABLE_PLACE_QUERY = groq`
  *[_type == "notablePlace" && slug.current == $slug][0] {
    _id, name, placeType, dangerLevel, description, images,
    _createdAt, _updatedAt,
    "keyFigures": keyFigures[]->{ _id, name, "slug": slug.current, role, portrait },
    "items": items[]->{ _id, name, "slug": slug.current },
    "world": world->{ name, "slug": slug.current },
    "unit": unit->{ name, "slug": slug.current },
    ${wikiLastEditedBy},
    ${wikiSiblingEntries}
  }
  // dmNotes intentionally excluded — never queried publicly
`;

export const UNIT_MAGIC_ITEMS_QUERY = groq`
  *[_type == "magicItem" && unit->slug.current == $unitSlug] | order(name asc) {
    _id, name, "slug": slug.current, rarity, itemArt
  }
`;

export const MAGIC_ITEM_QUERY = groq`
  *[_type == "magicItem" && slug.current == $slug][0] {
    _id, name, itemType, rarity, lore, itemArt,
    hasMechanics, mechanics,
    _createdAt, _updatedAt,
    "currentHolder": currentHolder->{ _id, name, "slug": slug.current },
    "foundAt": foundAt->{ _id, name, "slug": slug.current },
    "world": world->{ name, "slug": slug.current },
    "unit": unit->{ name, "slug": slug.current },
    ${wikiLastEditedBy},
    ${wikiSiblingEntries}
  }
  // dmNotes intentionally excluded — never queried publicly
`;

export const UNIT_FACTIONS_QUERY = groq`
  *[_type == "faction" && unit->slug.current == $unitSlug] | order(name asc) {
    _id, name, "slug": slug.current, factionType, banner
  }
`;

export const FACTION_QUERY = groq`
  *[_type == "faction" && slug.current == $slug][0] {
    _id, name, factionType, description, banner,
    _createdAt, _updatedAt,
    "members": members[]->{ _id, name, "slug": slug.current, role, portrait },
    "world": world->{ name, "slug": slug.current },
    "unit": unit->{ name, "slug": slug.current },
    ${wikiLastEditedBy},
    ${wikiSiblingEntries}
  }
  // dmNotes intentionally excluded — never queried publicly
`;

/**
 * Unit homepage "recent entries" preview — merges the 4 new entry types
 * scoped to this unit, newest-created first, capped at 3. loreEntry/
 * sessionLog are intentionally excluded here (they have their own "Recent
 * Lore"/"Recent Sessions" precedent at the world level — see
 * WORLD_RECENT_LORE_QUERY/WORLD_RECENT_SESSIONS_QUERY — and mixing them in
 * would need extra type-branching for little benefit at unit scale).
 */
export const UNIT_RECENT_ENTRIES_QUERY = groq`
  *[_type in ["keyFigure", "notablePlace", "magicItem", "faction"]
    && unit->slug.current == $unitSlug]
    | order(_createdAt desc)[0...3] {
    _type, _id, name, "slug": slug.current,
    role, placeType, rarity, factionType
  }
`;

/* ---------------------------------------------------------------------- */
/* Sitemap (Phase 1.4) — minimal slug + lastModified projections only,     */
/* deliberately not reusing the card queries above (those pull in images/  */
/* author refs the sitemap doesn't need)                                  */
/* ---------------------------------------------------------------------- */

export const SITEMAP_ARTICLES_QUERY = groq`
  *[_type == "article" && status == "published"] {
    "slug": slug.current, _updatedAt
  }
`;

export const SITEMAP_EVENTS_QUERY = groq`
  *[_type == "majorEvent"] {
    "slug": slug.current, _updatedAt
  }
`;

export const SITEMAP_WORLDS_QUERY = groq`
  *[_type == "world"] {
    "slug": slug.current, _updatedAt
  }
`;

/* ---------------------------------------------------------------------- */
/* Resources                                                                */
/* ---------------------------------------------------------------------- */

export const RESOURCES_QUERY = groq`
  *[_type == "resource"
    && (!defined($division) || division == $division)]
    | order(featured desc, publishedAt desc) {
    _id, title, "slug": slug.current, description, category, division,
    downloadUrl, thumbnail, fileSize, accessLevel, featured
  }
`;

/* ---------------------------------------------------------------------- */
/* Gallery                                                                   */
/* ---------------------------------------------------------------------- */

export const GALLERY_PHOTOS_QUERY = groq`
  *[_type == "galleryPhoto"
    && (!defined($eventId) || event._ref == $eventId)]
    | order(takenAt desc) {
    _id, image, caption, photographer, takenAt,
    "event": event->{ _id, title, "slug": slug.current }
  }
`;

export const GALLERY_EVENTS_QUERY = groq`
  *[_type == "majorEvent" && count(*[_type == "galleryPhoto" && references(^._id)]) > 0] {
    _id, title, "slug": slug.current
  }
`;

/* ---------------------------------------------------------------------- */
/* About                                                                     */
/* ---------------------------------------------------------------------- */

export const ORGANISATIONS_QUERY = groq`
  *[_type == "organisation" && active == true] | order(name asc) {
    _id, name, "slug": slug.current, orgType, description, website, yearsPeriod, logo
  }
`;

export const DIVISIONS_QUERY = groq`
  *[_type == "division"] | order(order asc) {
    _id, name, "slug": slug.current, logo, blurb, colourAccent, order,
    "memberCount": count(*[_type == "teamMember" && active == true && division._ref == ^._id])
  }
`;
