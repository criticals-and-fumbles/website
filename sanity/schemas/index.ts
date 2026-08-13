import { type SchemaTypeDefinition } from "sanity";

import calloutBlock from "./objects/calloutBlock";
import siteSettings from "./siteSettings";
import philosophy from "./philosophy";
import codeOfConduct from "./codeOfConduct";
import world from "./world";
import worldUnit from "./worldUnit";
import division from "./division";
import teamMember from "./teamMember";
import article from "./article";
import regularEvent from "./regularEvent";
import majorEvent from "./majorEvent";
import loreEntry from "./loreEntry";
import sessionLog from "./sessionLog";
import keyFigure from "./keyFigure";
import notablePlace from "./notablePlace";
import magicItem from "./magicItem";
import faction from "./faction";
import organisation from "./organisation";
import resource from "./resource";
import galleryPhoto from "./galleryPhoto";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    // Singletons
    siteSettings,
    philosophy,
    codeOfConduct,
    // Documents
    world,
    worldUnit,
    division,
    teamMember,
    article,
    regularEvent,
    majorEvent,
    loreEntry,
    sessionLog,
    keyFigure,
    notablePlace,
    magicItem,
    faction,
    organisation,
    resource,
    galleryPhoto,
    // Reusable objects
    calloutBlock,
  ],
};
