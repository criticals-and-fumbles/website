import { defineField, defineType } from "sanity";

/**
 * tableBlock — a simple HTML-table stand-in for article.body/
 * loreEntry.body. Deliberately plain-text cells (no rich text/marks
 * inside a cell) rather than nesting another block array per cell —
 * matches the actual need (a data table, not a page-inside-a-page) and
 * keeps every conversion path (console's Quill-adjacent HTML parser,
 * Studio's RichTextSourceToggle, the site's Renderer) simple and
 * symmetric. See sanity/lib/portableTextHtml.ts's doc comment and
 * apps/console/src/templates/console.js's rich-text section for why
 * table content only round-trips through the HTML source view, never
 * through Quill's own WYSIWYG canvas (Quill 1.3.7 has no table plugin
 * loaded, so it can't display or edit one).
 */
const tableRow = {
  type: "object",
  name: "tableRow",
  fields: [
    defineField({
      name: "cells",
      title: "Cells",
      type: "array",
      of: [{ type: "string" }],
    }),
  ],
  preview: {
    select: { cells: "cells" },
    prepare({ cells }: { cells?: string[] }) {
      return { title: (cells || []).join(" | ") };
    },
  },
};

export default defineType({
  name: "tableBlock",
  title: "Table",
  type: "object",
  fields: [
    defineField({
      name: "hasHeaderRow",
      title: "First row is a header",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "rows",
      title: "Rows",
      type: "array",
      of: [tableRow],
    }),
  ],
  preview: {
    select: { rows: "rows" },
    prepare({ rows }: { rows?: { cells?: string[] }[] }) {
      const rowCount = rows?.length || 0;
      const colCount = rows?.[0]?.cells?.length || 0;
      return { title: `Table (${rowCount} row${rowCount === 1 ? "" : "s"} × ${colCount} col${colCount === 1 ? "" : "s"})` };
    },
  },
});
