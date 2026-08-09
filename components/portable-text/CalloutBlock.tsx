import { PortableText } from "@portabletext/react";
import type { PortableTextBlock } from "sanity";

const TONE_STYLES: Record<string, string> = {
  info: "border-emerald/60 bg-emerald/10",
  warning: "border-amber/60 bg-amber/10",
  success: "border-emerald/60 bg-emerald/10",
  tip: "border-magenta/60 bg-magenta/10",
};

export function CalloutBlock({
  tone = "info",
  text,
}: {
  tone?: string;
  text?: PortableTextBlock[];
}) {
  if (!text?.length) return null;

  return (
    <div
      className={`my-6 rounded-md border-l-4 p-4 font-ui text-sm [&_p]:m-0 ${
        TONE_STYLES[tone] ?? TONE_STYLES.info
      }`}
    >
      <PortableText value={text} />
    </div>
  );
}
