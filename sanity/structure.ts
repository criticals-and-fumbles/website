import type { StructureResolver } from "sanity/structure";

/**
 * Studio desk structure — pure navigation/grouping, no schema impact.
 * Singletons use the direct-to-document child pattern (not
 * .documentTypeListItem(), which implies a list of many and would let an
 * editor create a duplicate) — same pattern as before this reorg, just
 * nested under Main > Settings now instead of sitting at Content's root.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Main")
        .child(
          S.list()
            .title("Main")
            .items([
              S.listItem()
                .title("Events")
                .child(
                  S.list()
                    .title("Events")
                    .items([
                      S.documentTypeListItem("majorEvent").title("Major Events"),
                      S.documentTypeListItem("regularEvent").title("Regular Events"),
                    ]),
                ),
              S.listItem()
                .title("Team")
                .child(
                  S.list()
                    .title("Team")
                    .items([
                      S.documentTypeListItem("teamMember").title("Team Members"),
                      S.documentTypeListItem("division").title("Divisions"),
                    ]),
                ),
              S.listItem()
                .title("Wiki")
                .child(
                  S.list()
                    .title("Wiki")
                    .items([
                      S.documentTypeListItem("world").title("Worlds"),
                      S.documentTypeListItem("worldUnit").title("World Units"),
                      S.documentTypeListItem("loreEntry").title("Lore Entries"),
                      S.documentTypeListItem("sessionLog").title("Session Logs"),
                      S.documentTypeListItem("keyFigure").title("Key Figures"),
                      S.documentTypeListItem("notablePlace").title("Notable Places"),
                      S.documentTypeListItem("magicItem").title("Magic Items"),
                      S.documentTypeListItem("faction").title("Factions"),
                    ]),
                ),
              S.listItem()
                .title("Settings")
                .child(
                  S.list()
                    .title("Settings")
                    .items([
                      S.listItem()
                        .title("Site Settings")
                        .id("siteSettings")
                        .child(
                          S.document()
                            .schemaType("siteSettings")
                            .documentId("siteSettings"),
                        ),
                      S.listItem()
                        .title("Philosophy")
                        .id("philosophy")
                        .child(
                          S.document()
                            .schemaType("philosophy")
                            .documentId("philosophy"),
                        ),
                      S.listItem()
                        .title("Code of Conduct")
                        .id("codeOfConduct")
                        .child(
                          S.document()
                            .schemaType("codeOfConduct")
                            .documentId("codeOfConduct"),
                        ),
                      S.listItem()
                        .title("AI Charter")
                        .id("aiCharter")
                        .child(
                          S.document()
                            .schemaType("aiCharter")
                            .documentId("aiCharter"),
                        ),
                      S.listItem()
                        .title("Divisions Synergy")
                        .id("divisionsSynergy")
                        .child(
                          S.document()
                            .schemaType("divisionsSynergy")
                            .documentId("divisionsSynergy"),
                        ),
                    ]),
                ),
            ]),
        ),
      S.listItem()
        .title("Campaigns")
        .child(
          S.list()
            .title("Campaigns")
            .items([
              S.documentTypeListItem("campaign").title("Campaigns"),
              // Dossiers grouped by their parent campaign — one level
              // in (campaign list, titled by the campaign's own title),
              // then that campaign's dossiers. Pure desk-structure
              // grouping, same as this file's other nested lists; no
              // schema change, and the flat "all dossiers" list is
              // still reachable by opening a campaign's own document
              // and following its dossier references there if needed.
              S.listItem()
                .title("Dossiers by Campaign")
                .child(
                  S.documentTypeList("campaign")
                    .title("Dossiers by Campaign")
                    .child((campaignId) =>
                      S.documentList()
                        .title("Dossiers")
                        .schemaType("dossier")
                        .filter('_type == "dossier" && campaign._ref == $campaignId')
                        .params({ campaignId }),
                    ),
                ),
              S.documentTypeListItem("genreTheme").title("Genre Themes"),
            ]),
        ),
      S.divider(),
      S.documentTypeListItem("article").title("Articles"),
      S.documentTypeListItem("resource").title("Resources"),
      S.documentTypeListItem("organisation").title("Organisations"),
      S.documentTypeListItem("galleryPhoto").title("Gallery Photos"),
    ]);
