import { type SchemaTypeDefinition } from "sanity";

import calloutBlock from "./objects/calloutBlock";
import siteSettings from "./siteSettings";
import philosophy from "./philosophy";
import world from "./world";
import teamMember from "./teamMember";
import article from "./article";
import regularEvent from "./regularEvent";
import majorEvent from "./majorEvent";
import loreEntry from "./loreEntry";
import sessionLog from "./sessionLog";
import organisation from "./organisation";
import resource from "./resource";
import galleryPhoto from "./galleryPhoto";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    // Singletons
    siteSettings,
    philosophy,
    // Documents
    world,
    teamMember,
    article,
    regularEvent,
    majorEvent,
    loreEntry,
    sessionLog,
    organisation,
    resource,
    galleryPhoto,
    // Reusable objects
    calloutBlock,
  ],
};
