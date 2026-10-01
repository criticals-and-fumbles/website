import { defineField, defineType } from "sanity";
import { RECOMMENDED_FOR } from "./constants";

export default defineType({
  name: "regularEvent",
  title: "Regular Event",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) =>
        rule.required().custom((slug) =>
          !slug?.current || /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug.current)
            ? true
            : "Slug must be lowercase letters, numbers, and hyphens only — no spaces or uppercase.",
        ),
    }),
    defineField({
      name: "campaignName",
      title: "Campaign Name",
      type: "string",
    }),
    defineField({
      name: "eventType",
      title: "Event Type",
      type: "string",
      description: "Inferred default list — adjust in Studio if needed",
      options: {
        list: [
          "Campaign",
          "One-Shot Series",
          "Drop-In",
          // Added 2026-09-30 — additive, alongside the existing 3 above
          // (Campaign/One-Shot Series are both in active use on live
          // events, kept untouched; not a replacement).
          "Learn to Play",
          "Playtest",
          "One-shot",
          "Workshop",
          "Podcast",
          "Painting Session",
          "Others",
        ].map((v) => ({ title: v, value: v })),
      },
    }),
    defineField({
      name: "frequency",
      title: "Frequency",
      type: "string",
      options: {
        list: ["Weekly", "Biweekly", "Monthly", "Ad-hoc"].map((v) => ({
          title: v,
          value: v,
        })),
      },
    }),
    defineField({
      name: "schedule",
      title: "Schedule",
      type: "string",
      description: 'e.g. "Every Tuesday 7:30pm"',
    }),
    defineField({ name: "location", title: "Location", type: "string" }),
    defineField({
      name: "recommendedFor",
      title: "Recommended For",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: RECOMMENDED_FOR.map((v) => ({ title: v, value: v })),
      },
      description:
        "Who this event is aimed at — shown as tags on the event card. " +
        "Fine to pick more than one.",
    }),
    defineField({
      name: "dm",
      title: "DM",
      type: "reference",
      to: [{ type: "teamMember" }],
    }),
    defineField({
      name: "world",
      title: "World",
      type: "reference",
      to: [{ type: "world" }],
    }),
    defineField({ name: "system", title: "System", type: "string" }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "playerCount",
      title: "Player Count",
      type: "string",
      description: 'e.g. "4/6 seats filled"',
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      description: "Inferred default list — adjust in Studio if needed",
      options: {
        list: ["Active", "Recruiting", "Full", "Hiatus", "Ended"].map(
          (v) => ({ title: v, value: v }),
        ),
      },
      initialValue: "Active",
    }),
    defineField({
      name: "startedDate",
      title: "Started Date",
      type: "date",
    }),
    defineField({
      name: "startDate",
      title: "Next Session Start Date",
      type: "datetime",
      description:
        "The specific date/time of the upcoming session to promote — " +
        "not a recurrence rule (Discord/Eventbrite don't support " +
        "'every Tuesday' the way Schedule above reads to a person). " +
        "Optional for display, required once Publish to Discord and/or " +
        "Publish to Eventbrite is checked below.",
      validation: (rule) =>
        rule.custom((value, context) => {
          const doc = context.document as
            | { publishToDiscord?: boolean; publishToEventbrite?: boolean }
            | undefined;
          if ((doc?.publishToDiscord || doc?.publishToEventbrite) && !value) {
            return "Required when Publish to Discord/Eventbrite is checked.";
          }
          return true;
        }),
    }),
    defineField({
      name: "endDate",
      title: "Next Session End Date",
      type: "datetime",
      description:
        "Optional — used by the Discord/Eventbrite integrations below. " +
        "If left blank, they default to Start Date + 4 hours.",
    }),
    defineField({
      name: "publishToDiscord",
      title: "Publish to Discord",
      type: "boolean",
      initialValue: false,
      description:
        "Check this and Publish to create a Discord scheduled event " +
        "for the upcoming session above (app/api/publish-event/" +
        "route.ts). Fires once — see Discord Event ID below.",
    }),
    defineField({
      name: "publishToEventbrite",
      title: "Publish to Eventbrite",
      type: "boolean",
      initialValue: false,
      description:
        "Check this and Publish to create an Eventbrite listing for " +
        "the upcoming session above and fill in Registration URL " +
        "automatically. Fires once — see Eventbrite Event ID below.",
    }),
    defineField({
      name: "discordEventId",
      title: "Discord Event ID",
      type: "string",
      description:
        "Set automatically the first time Publish to Discord is " +
        "checked with a Start Date set. Not readOnly (2026-09-30) — " +
        "normally you should never type into this field, BUT if the " +
        "Discord event/announcement was deleted manually in Discord " +
        "(rather than by unchecking Publish to Discord here), this " +
        "field still holds the old ID and silently blocks every " +
        "republish attempt. Clear it (delete the text, leave blank) " +
        "and save to force a fresh republish on the next webhook " +
        "delivery.",
    }),
    defineField({
      name: "eventbriteEventId",
      title: "Eventbrite Event ID",
      type: "string",
      description:
        "Set automatically the first time Publish to Eventbrite is " +
        "checked with a Start Date set. Not readOnly (2026-09-30), " +
        "same reasoning as discordEventId above — if the Eventbrite " +
        "listing was deleted manually (not by unchecking Publish to " +
        "Eventbrite here), this field still blocks every republish " +
        "attempt. Clear it to force a fresh republish — AND also " +
        "clear Registration URL below if it was filled in by that " +
        "same Eventbrite publish (the republish guard checks both " +
        "fields, not just this one).",
    }),
    defineField({
      name: "sessionCount",
      title: "Session Count",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "registrationUrl",
      title: "Registration URL",
      type: "url",
      description: "Optional — if set, shows a Register button instead of View Details",
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      of: [{ type: "mediaGalleryItem" }],
      description: "Photos/media shown on the site-wide /gallery page.",
    }),
    defineField({
      name: "pageFooterCTA",
      title: "Page Footer CTA",
      type: "array",
      of: [{ type: "block" }],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "schedule", media: "coverImage" },
  },
});
