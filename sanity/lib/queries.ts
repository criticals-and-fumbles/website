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

/* ---------------------------------------------------------------------- */
/* Singletons                                                             */
/* ---------------------------------------------------------------------- */

export const SITE_SETTINGS_QUERY = groq`*[_type == "siteSettings"][0]`;

export const PHILOSOPHY_QUERY = groq`*[_type == "philosophy"][0]`;

/* ---------------------------------------------------------------------- */
/* Homepage                                                               */
/* ---------------------------------------------------------------------- */

export const HOME_LATEST_ARTICLES_QUERY = groq`
  *[_type == "article" && status == "published"] | order(publishedAt desc)[0...3] {
    ${articleCardFields}
  }
`;

export const HOME_NEXT_MAJOR_EVENT_QUERY = groq`
  *[_type == "majorEvent" && status in ["registration-open", "coming-soon", "watch-this-space", "full"]]
    | order(startDate asc)[0] {
    _id, title, "slug": slug.current, tagline, status,
    eventDate, startDate, location, coverImage, splashImage, registrationUrl
  }
`;

export const HOME_UPCOMING_EVENTS_QUERY = groq`
  *[_type == "majorEvent" && status != "cancelled" && status != "completed"]
    | order(startDate asc)[0...3] {
    _id, title, "slug": slug.current, eventType, eventDate, startDate,
    location, status, coverImage
  }
`;

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
    | order(publishedAt desc) {
    ${articleCardFields}
  }
`;

export const ARTICLE_BY_SLUG_QUERY = groq`
  *[_type == "article" && slug.current == $slug][0] {
    ...,
    "slug": slug.current,
    "author": author->{ ${teamMemberRefFields}, realName, role },
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

/* ---------------------------------------------------------------------- */
/* Team                                                                    */
/* ---------------------------------------------------------------------- */

export const TEAM_MEMBERS_QUERY = groq`
  *[_type == "teamMember" && active == true] | order(tier asc, handle asc) {
    _id, handle, "slug": slug.current, realName, role, tier,
    dndClass, race, alignment, stats, backstory, signatureMove,
    avatar, socialLinks,
    "worlds": worlds[]->{ _id, name, "slug": slug.current, colourAccent }
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
    "dms": dms[]->{ ${teamMemberRefFields} }
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
    "lastEditedBy": lastEditedBy->{ ${teamMemberRefFields} }
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
    "players": players[]->{ ${teamMemberRefFields} }
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
