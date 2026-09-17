import type { PortableTextBlock, PortableTextSpan } from "sanity";

/**
 * Hand-rolled, two-way Portable Text <-> HTML converter, used only by
 * RichTextSourceToggle.tsx's "View/Edit HTML source" button on
 * article.body / loreEntry.body in Studio.
 *
 * Deliberately NOT a general-purpose Portable Text renderer/parser —
 * scoped to exactly the formatting these two fields' schema and Studio
 * toolbar actually offer (h2/h3, blockquote, bullet/numbered lists,
 * bold/italic/code/link marks, calloutBlock with one level of nested
 * blocks, and tableBlock), same "small, hand-written, matches this
 * project's actual feature set" approach the console's Quill Delta<->
 * Portable Text converter already uses (see apps/console/src/
 * templates/console.js) rather than pulling in a heavier/differently-
 * versioned library like @sanity/block-tools for a Studio (v6.9.1)
 * this old. Confirmed live (2026-09-17) which marks/block types
 * actually appear in real article/loreEntry body content before
 * deciding this set: strong, em, code — no underline/strike-through,
 * no calloutBlock/tableBlock yet. If a future field ever needs a mark/
 * block type not listed here, extend both directions together — an
 * unsupported mark/block would otherwise silently vanish on a
 * source-view round trip.
 *
 * tableBlock (added 2026-09-17) round-trips as a plain <table> with
 * plain-text cells (see sanity/schemas/objects/tableBlock.ts — no rich
 * text inside a cell, so cells don't go through spanToHtml/
 * collectSpans at all). This is also the ONLY editing path for tables
 * on the console side — Quill 1.3.7 has no table plugin loaded there,
 * so a table can be viewed/edited via the HTML source toggle but never
 * inside Quill's own WYSIWYG canvas (see console.js's rich-text
 * section for how it guards against that toggle silently destroying a
 * table). Studio's `components.input` swap doesn't have that same
 * problem — renderDefault's Portable Text editor already knows how to
 * display a tableBlock as its own block (Studio's default array-item
 * rendering, not this converter), it just can't edit the table's
 * cells inline the way a spreadsheet would; the HTML source toggle is
 * still the actual editing surface for a table's contents in Studio.
 */

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function randKey(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

type MarkDef = { _key: string; _type: string; href?: string };

// This repo's cloudflare-env.d.ts pulls in @cloudflare/workers-types
// repo-wide (for HTMLRewriter elsewhere), which redefines the global
// `Element`/`Node` names to its own unrelated HTMLRewriter-shaped
// types — so the REAL browser DOM types those global names would
// normally refer to aren't reachable by name in this codebase. This
// file only ever runs inside Sanity Studio's own browser bundle (never
// under Workers), so the actual runtime shape from DOMParser is
// correct regardless; `DomNode` is just a local escape hatch from that
// naming collision, not a claim that these values are untyped/unsafe.
type DomNode = any; // eslint-disable-line @typescript-eslint/no-explicit-any

function spanToHtml(span: PortableTextSpan, markDefs: MarkDef[]): string {
  let text = escapeHtml(span.text);
  const marks = span.marks || [];
  if (marks.includes("code")) text = `<code>${text}</code>`;
  if (marks.includes("strong")) text = `<strong>${text}</strong>`;
  if (marks.includes("em")) text = `<em>${text}</em>`;
  const linkKey = marks.find((m) => markDefs.some((d) => d._key === m && d._type === "link"));
  if (linkKey) {
    const def = markDefs.find((d) => d._key === linkKey);
    text = `<a href="${escapeHtml(def?.href || "")}">${text}</a>`;
  }
  return text;
}

function blockChildrenToHtml(block: PortableTextBlock): string {
  return ((block.children as PortableTextSpan[] | undefined) || [])
    .map((child) =>
      child._type === "span" ? spanToHtml(child, (block.markDefs as MarkDef[]) || []) : "",
    )
    .join("");
}

type TableRow = { cells?: string[] };

function tableBlockToHtml(block: unknown): string {
  const { rows = [], hasHeaderRow } = block as { rows?: TableRow[]; hasHeaderRow?: boolean };
  const rowToHtml = (row: TableRow, cellTag: "th" | "td") =>
    `<tr>${(row.cells || []).map((cell) => `<${cellTag}>${escapeHtml(cell || "")}</${cellTag}>`).join("")}</tr>`;
  const headerRow = hasHeaderRow ? rows[0] : undefined;
  const bodyRows = hasHeaderRow ? rows.slice(1) : rows;
  const thead = headerRow ? `<thead>${rowToHtml(headerRow, "th")}</thead>` : "";
  const tbody = `<tbody>${bodyRows.map((row) => rowToHtml(row, "td")).join("\n")}</tbody>`;
  return `<table>\n${thead}\n${tbody}\n</table>`;
}

export function blocksToHtml(blocks: PortableTextBlock[] = []): string {
  const parts: string[] = [];
  let i = 0;
  while (i < blocks.length) {
    const block = blocks[i];

    if (block._type === "tableBlock") {
      parts.push(tableBlockToHtml(block));
      i++;
      continue;
    }

    if (block._type === "calloutBlock") {
      const tone = (block as unknown as { tone?: string }).tone || "info";
      const nested = (block as unknown as { text?: PortableTextBlock[] }).text || [];
      parts.push(`<div data-callout-tone="${escapeHtml(tone)}">\n${blocksToHtml(nested)}\n</div>`);
      i++;
      continue;
    }

    if (block._type === "block" && (block.listItem === "bullet" || block.listItem === "number")) {
      const listItem = block.listItem;
      const tag = listItem === "bullet" ? "ul" : "ol";
      const items: string[] = [];
      while (i < blocks.length && blocks[i]._type === "block" && blocks[i].listItem === listItem) {
        items.push(`<li>${blockChildrenToHtml(blocks[i])}</li>`);
        i++;
      }
      parts.push(`<${tag}>\n${items.join("\n")}\n</${tag}>`);
      continue;
    }

    const inner = blockChildrenToHtml(block);
    if (block.style === "h2") parts.push(`<h2>${inner}</h2>`);
    else if (block.style === "h3") parts.push(`<h3>${inner}</h3>`);
    else if (block.style === "blockquote") parts.push(`<blockquote>${inner}</blockquote>`);
    else parts.push(`<p>${inner}</p>`);
    i++;
  }
  return parts.join("\n");
}

function collectSpans(node: DomNode, marks: string[], markDefs: MarkDef[]): PortableTextSpan[] {
  if (node.nodeType === 3 /* Node.TEXT_NODE */) {
    const text = node.textContent || "";
    if (!text) return [];
    return [{ _type: "span", _key: randKey(), text, marks: [...marks] }];
  }
  if (node.nodeType !== 1 /* Node.ELEMENT_NODE */) return [];

  const el = node;
  const tag = el.tagName.toLowerCase();
  let nextMarks = marks;
  if (tag === "strong" || tag === "b") nextMarks = [...marks, "strong"];
  else if (tag === "em" || tag === "i") nextMarks = [...marks, "em"];
  else if (tag === "code") nextMarks = [...marks, "code"];
  else if (tag === "a") {
    const key = randKey();
    markDefs.push({ _type: "link", _key: key, href: el.getAttribute("href") || "" });
    nextMarks = [...marks, key];
  }

  const spans: PortableTextSpan[] = [];
  el.childNodes.forEach((child: DomNode) => spans.push(...collectSpans(child, nextMarks, markDefs)));
  return spans;
}

function elementToBlock(
  el: DomNode,
  style: string,
  listItem?: "bullet" | "number",
): PortableTextBlock {
  const markDefs: MarkDef[] = [];
  const children = collectSpans(el, [], markDefs);
  return {
    _type: "block",
    _key: randKey(),
    style,
    ...(listItem ? { listItem, level: 1 } : {}),
    markDefs,
    children: children.length ? children : [{ _type: "span", _key: randKey(), text: "", marks: [] }],
  } as PortableTextBlock;
}

function htmlTableToBlock(tableEl: DomNode): PortableTextBlock {
  const theadRows = Array.from(tableEl.querySelectorAll(":scope > thead > tr")) as DomNode[];
  const bodyRows = Array.from(
    tableEl.querySelectorAll(":scope > tbody > tr, :scope > tr"),
  ) as DomNode[];
  const rowToCells = (rowEl: DomNode) =>
    (Array.from(rowEl.querySelectorAll(":scope > th, :scope > td")) as DomNode[]).map(
      (cellEl) => cellEl.textContent || "",
    );

  const hasHeaderRow = theadRows.length > 0;
  const allRows = hasHeaderRow ? [...theadRows, ...bodyRows] : bodyRows;
  const rows = allRows.map((rowEl) => ({ _key: randKey(), cells: rowToCells(rowEl) }));

  return {
    _type: "tableBlock",
    _key: randKey(),
    hasHeaderRow,
    rows,
  } as unknown as PortableTextBlock;
}

export function htmlToBlocks(html: string): PortableTextBlock[] {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const blocks: PortableTextBlock[] = [];

  doc.body.childNodes.forEach((node: DomNode) => {
    if (node.nodeType !== 1 /* Node.ELEMENT_NODE */) return;
    const el = node;
    const tag = el.tagName.toLowerCase();

    if (tag === "h2") blocks.push(elementToBlock(el, "h2"));
    else if (tag === "h3") blocks.push(elementToBlock(el, "h3"));
    else if (tag === "blockquote") blocks.push(elementToBlock(el, "blockquote"));
    else if (tag === "table") blocks.push(htmlTableToBlock(el));
    else if (tag === "ul" || tag === "ol") {
      const listItem = tag === "ul" ? "bullet" : "number";
      el.querySelectorAll(":scope > li").forEach((li: DomNode) => {
        blocks.push(elementToBlock(li, "normal", listItem));
      });
    } else if (tag === "div" && el.hasAttribute("data-callout-tone")) {
      blocks.push({
        _type: "calloutBlock",
        _key: randKey(),
        tone: el.getAttribute("data-callout-tone") || "info",
        text: htmlToBlocks(el.innerHTML),
      } as unknown as PortableTextBlock);
    } else {
      // p, div (non-callout), or anything else unrecognized — treat as
      // a plain paragraph rather than dropping the content.
      blocks.push(elementToBlock(el, "normal"));
    }
  });

  return blocks;
}
