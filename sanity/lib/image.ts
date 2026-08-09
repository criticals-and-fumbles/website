import {
  createImageUrlBuilder,
  type SanityImageSource,
} from "@sanity/image-url";
import { projectId, dataset } from "./client";

const builder = createImageUrlBuilder({ projectId, dataset });

export function urlForImage(source: SanityImageSource | undefined | null) {
  if (!source) return undefined;
  return builder.image(source);
}
