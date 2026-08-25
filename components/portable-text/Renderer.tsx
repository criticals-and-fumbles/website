import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "sanity";
import Image from "next/image";
import { urlForImage } from "@/sanity/lib/image";
import { CalloutBlock } from "./CalloutBlock";

const components: PortableTextComponents = {
  // Every page already renders its own single real <h1> outside this
  // component; Sanity's default block-style list still offers editors an
  // "H1" option inside body copy (no `styles:` restriction on any rich-text
  // schema field), which would create a genuine duplicate/multiple-h1 page.
  // Downgrading to h2 here — rather than restricting the schema's styles
  // list — fixes existing content too, since it's a pure render-time
  // decision with no data migration needed. h2/h3 stay default (they're
  // already styled as intentional body sub-headings, see the wrapper class
  // below) — multiple h2s within one article body is expected, not a bug.
  block: {
    h1: ({ children }) => <h2>{children}</h2>,
  },
  types: {
    image: ({ value }) => {
      const url = urlForImage(value)?.width(1200).auto("format").url();
      if (!url) return null;
      return (
        <Image
          src={url}
          alt={value.alt ?? ""}
          width={1200}
          height={800}
          className="my-6 h-auto w-full rounded-md"
        />
      );
    },
    calloutBlock: ({ value }) => (
      <CalloutBlock tone={value.tone} text={value.text} />
    ),
  },
};

export function Renderer({ value }: { value?: PortableTextBlock[] | null }) {
  if (!value?.length) return null;

  return (
    <div
      className="prose-content max-w-none [&>h2]:mt-8 [&>h2]:mb-3 [&>h2]:font-display [&>h2]:text-3xl
      [&>h3]:mt-6 [&>h3]:mb-2 [&>h3]:font-display [&>h3]:text-2xl
      [&>p]:mb-4 [&>p]:leading-relaxed
      [&_a]:text-emerald [&_a]:underline [&_a]:underline-offset-2
      [&>ul]:mb-4 [&>ul]:list-disc [&>ul]:pl-6
      [&>ol]:mb-4 [&>ol]:list-decimal [&>ol]:pl-6
      [&>blockquote]:my-4 [&>blockquote]:border-l-4 [&>blockquote]:border-emerald [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-text-muted"
    >
      <PortableText value={value} components={components} />
    </div>
  );
}
