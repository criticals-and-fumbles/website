import { useCallback, useState } from "react";
import { Box, Button, Card, Flex, Stack, Text, TextArea } from "@sanity/ui";
import { set, unset } from "sanity";
import type { ArrayOfObjectsInputProps, PortableTextBlock } from "sanity";
import { blocksToHtml, htmlToBlocks } from "../lib/portableTextHtml";

/**
 * Custom `components.input` for article.body / loreEntry.body (see
 * those two schemas) — adds a "View/Edit HTML source" toggle above
 * Studio's normal Portable Text editor, requested directly (2026-09-17)
 * as the Studio-side half of the same feature the console's Quill
 * editors got (apps/console/src/templates/console.js's
 * toggleRichTextSource). Conversion is hand-rolled in
 * sanity/lib/portableTextHtml.ts — see that file's doc comment for why
 * (not @sanity/block-tools) and exactly which marks/block types round-
 * trip.
 *
 * Applying edited HTML replaces the field's value outright (`set`/
 * `unset`, not a merge) — same "the textarea IS the source of truth
 * once you're editing it" model the console's version uses. Switching
 * back to the visual editor without clicking Apply discards the draft,
 * same as closing a dialog without saving; this is intentionally NOT
 * wired to auto-apply on blur, so a half-finished/invalid HTML edit
 * can never silently overwrite real content.
 */
export function RichTextSourceToggle(props: ArrayOfObjectsInputProps) {
  const [sourceMode, setSourceMode] = useState(false);
  const [draft, setDraft] = useState("");

  const openSource = useCallback(() => {
    setDraft(blocksToHtml((props.value as PortableTextBlock[] | undefined) || []));
    setSourceMode(true);
  }, [props.value]);

  const cancelSource = useCallback(() => setSourceMode(false), []);

  const applySource = useCallback(() => {
    const blocks = htmlToBlocks(draft);
    props.onChange(blocks.length ? set(blocks) : unset());
    setSourceMode(false);
  }, [draft, props]);

  return (
    <Stack space={3}>
      <Flex justify="flex-end">
        {!sourceMode ? (
          <Button
            text="</> View/Edit HTML source"
            mode="ghost"
            fontSize={1}
            padding={2}
            onClick={openSource}
          />
        ) : null}
      </Flex>

      {sourceMode ? (
        <Card padding={3} radius={2} shadow={1} tone="caution">
          <Stack space={3}>
            <Text size={1} muted>
              Raw HTML — supports h2/h3, p, blockquote, ul/ol/li, strong/em/code, and
              &lt;a href&gt;. Applying replaces the whole field; anything outside that set
              (or an unclosed tag) may not come back the way you expect, so double-check
              the visual editor after applying.
            </Text>
            <TextArea
              value={draft}
              onChange={(event) => setDraft(event.currentTarget.value)}
              rows={14}
              style={{ fontFamily: "monospace", fontSize: "0.85em" }}
            />
            <Flex gap={2} justify="flex-end">
              <Button text="Cancel" mode="ghost" onClick={cancelSource} />
              <Button text="Apply" tone="primary" onClick={applySource} />
            </Flex>
          </Stack>
        </Card>
      ) : (
        <Box>{props.renderDefault(props)}</Box>
      )}
    </Stack>
  );
}
