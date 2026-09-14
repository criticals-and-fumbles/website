import { defineField, defineType } from "sanity";

export default defineType({
  name: "majorEvent",
  title: "Major Event",
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
    defineField({ name: "tagline", title: "Tagline", type: "string" }),
    defineField({
      name: "eventType",
      title: "Event Type",
      type: "string",
      description: "Inferred default list — adjust in Studio if needed",
      options: {
        list: [
          "Convention",
          "Tournament",
          "Workshop",
          "One-Shot Night",
          "Social",
          "Charity",
          "Community",
        ].map((v) => ({ title: v, value: v })),
      },
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Watch This Space", value: "watch-this-space" },
          { title: "Coming Soon", value: "coming-soon" },
          { title: "Registration Open", value: "registration-open" },
          { title: "Full", value: "full" },
          { title: "Completed", value: "completed" },
          { title: "Cancelled", value: "cancelled" },
        ],
      },
      initialValue: "watch-this-space",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "eventDate",
      title: "Event Date (display)",
      type: "string",
      description: 'Flexible display string, e.g. "Q3 2027"',
    }),
    defineField({
      name: "startDate",
      title: "Start Date (for countdown)",
      type: "datetime",
      description:
        "Optional for display purposes (the live countdown). Required " +
        "once Publish to Discord and/or Publish to Eventbrite is " +
        "checked below, since both integrations need a real start time.",
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
    defineField({ name: "location", title: "Location", type: "string" }),
    defineField({ name: "capacity", title: "Capacity", type: "number" }),
    defineField({
      name: "ticketPrice",
      title: "Ticket Price",
      type: "string",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "watchThisSpaceTeaser",
      title: "Watch This Space Teaser",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "schedule",
      title: "Schedule / Programme",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "dms",
      title: "DM(s)",
      type: "array",
      of: [{ type: "reference", to: [{ type: "teamMember" }] }],
    }),
    defineField({
      name: "registrationUrl",
      title: "Registration URL",
      type: "url",
    }),
    defineField({
      name: "endDate",
      title: "End Date",
      type: "datetime",
      description:
        "Optional — used by the Discord/Eventbrite integrations below. " +
        "If left blank, they default to Start Date + 4 hours rather " +
        "than blocking on this being filled in.",
    }),
    defineField({
      name: "publishToDiscord",
      title: "Publish to Discord",
      type: "boolean",
      initialValue: false,
      description:
        "Check this and Publish to create a Discord scheduled event " +
        "for this event (app/api/publish-event/route.ts). Fires once — " +
        "later edits won't create a duplicate as long as this stays " +
        "checked (see Discord Event ID below).",
    }),
    defineField({
      name: "publishToEventbrite",
      title: "Publish to Eventbrite",
      type: "boolean",
      initialValue: false,
      description:
        "Check this and Publish to create an Eventbrite listing for " +
        "this event and fill in Registration URL automatically. Fires " +
        "once — see Eventbrite Event ID below.",
    }),
    defineField({
      name: "discordEventId",
      title: "Discord Event ID",
      type: "string",
      readOnly: true,
      description:
        "Set automatically by app/api/publish-event/route.ts the first " +
        "time Publish to Discord is checked with a Start Date set — " +
        "its presence is what stops that integration from creating a " +
        "duplicate Discord event on every later edit. Don't set this " +
        "by hand.",
    }),
    defineField({
      name: "eventbriteEventId",
      title: "Eventbrite Event ID",
      type: "string",
      readOnly: true,
      description:
        "Set automatically by app/api/publish-event/route.ts the first " +
        "time Publish to Eventbrite is checked with a Start Date set. " +
        "Don't set this by hand.",
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "splashImage",
      title: "Splash Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "pageFooterCTA",
      title: "Page Footer CTA",
      type: "array",
      of: [{ type: "block" }],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "status", media: "coverImage" },
  },
});
