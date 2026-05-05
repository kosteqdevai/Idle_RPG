const { COMMANDER_CATALOG } = require("../config/commanders.js");
const { PLACEHOLDER_ASSETS } = require("./manifest.js");

const COMMANDER_ART = Object.freeze({
  "vanguard-captain": Object.freeze({
    palette: Object.freeze(["steel blue", "champion gold", "war banner red"]),
    iconMotif: "upright sword",
    silhouette: "broad helm, short cloak, raised blade",
    progression: Object.freeze([
      "plain steel kit with a compact red plume",
      "gold-trim captain armor with a wider cloak",
      "champion crest, banner aura, and brighter weapon pixels",
    ]),
  }),
  "longbow-marshal": Object.freeze({
    palette: Object.freeze(["forest green", "aged leather", "arrow gold"]),
    iconMotif: "curved bow and arrow",
    silhouette: "hooded archer, longbow profile, narrow stance",
    progression: Object.freeze([
      "field hood and simple bow",
      "marshal mantle with gold fletching",
      "ceremonial bow, winged trim, and luminous arrow accents",
    ]),
  }),
  "cavalry-banneret": Object.freeze({
    palette: Object.freeze(["royal violet", "banner gold", "deep blue steel"]),
    iconMotif: "tilted lance pennant",
    silhouette: "tall lance, sloped shoulder plates, fluttering pennant",
    progression: Object.freeze([
      "lean rider armor and a short pennant",
      "larger lance flag with violet trim",
      "heroic banneret crest and bright charge aura",
    ]),
  }),
  "shield-sergeant": Object.freeze({
    palette: Object.freeze(["teal iron", "pale steel", "garrison red"]),
    iconMotif: "tower shield",
    silhouette: "square shield mass, squat helmet, braced stance",
    progression: Object.freeze([
      "plain tower shield and infantry helm",
      "reinforced shield bands and heavier shoulder plates",
      "fortress shield glow and veteran command stripes",
    ]),
  }),
  "siege-overseer": Object.freeze({
    palette: Object.freeze(["dark timber", "brass", "smoke gray"]),
    iconMotif: "war hammer and cog",
    silhouette: "stocky engineer, hammer head, gear-marked armor",
    progression: Object.freeze([
      "workman armor and hand hammer",
      "brass overseer plates with tool glyphs",
      "smoldering siege crown and heavy command hammer",
    ]),
  }),
  "ember-tactician": Object.freeze({
    palette: Object.freeze(["ember red", "blackened violet", "hot gold"]),
    iconMotif: "flame rune",
    silhouette: "robe plates, flame hand, sharp helm ridge",
    progression: Object.freeze([
      "small ember sigil and dark robe armor",
      "burning shoulder marks and brighter rune work",
      "tactical fire halo with aggressive ember particles",
    ]),
  }),
  "iron-chaplain": Object.freeze({
    palette: Object.freeze(["iron gray", "bone white", "old gold"]),
    iconMotif: "mace and halo",
    silhouette: "mace, tabard block, compact iron helm",
    progression: Object.freeze([
      "simple iron mace and muted tabard",
      "chaplain halo mark and brighter tabard edge",
      "relic mace, radiant trim, and sustain aura",
    ]),
  }),
  "falcon-scoutmaster": Object.freeze({
    palette: Object.freeze(["pine green", "falcon tan", "weathered brown"]),
    iconMotif: "falcon wing",
    silhouette: "wing cloak, scout hood, compact blade profile",
    progression: Object.freeze([
      "scout cloak with a small wing mark",
      "falcon-feather mantle and brighter leather",
      "golden wing crest and wind-read command aura",
    ]),
  }),
  "royal-standardbearer": Object.freeze({
    palette: Object.freeze(["royal blue", "crown gold", "crimson cloth"]),
    iconMotif: "crowned standard",
    silhouette: "vertical banner pole, crown crest, upright posture",
    progression: Object.freeze([
      "small standard and simple blue livery",
      "royal cloth banner with gold edging",
      "large crowned standard and morale glow",
    ]),
  }),
  "infinity-herald": Object.freeze({
    palette: Object.freeze(["void navy", "aether cyan", "pale gold"]),
    iconMotif: "infinity loop",
    silhouette: "thin herald helm, strange aura bars, floating sigil",
    progression: Object.freeze([
      "dark herald armor with a small loop mark",
      "cyan aether trim and stronger sigil geometry",
      "infinity crest with luminous void-gold aura",
    ]),
  }),
});

function assertCommanderId(commanderId) {
  if (!COMMANDER_ART[commanderId]) {
    throw new RangeError(`Unknown commander art id: ${commanderId}`);
  }
}

function getCommanderIconPath(commanderId) {
  assertCommanderId(commanderId);
  return PLACEHOLDER_ASSETS.commanders.iconPattern.replace("{id}", commanderId);
}

function getCommanderSpritePath(commanderId, level = 1) {
  assertCommanderId(commanderId);
  if (!Number.isInteger(level) || level < 1 || level > 3) {
    throw new RangeError("Commander sprite level must be 1, 2, or 3");
  }

  return PLACEHOLDER_ASSETS.commanders.spritePattern
    .replace("{id}", commanderId)
    .replace("{level}", String(level));
}

function getCommanderArt(commanderId) {
  assertCommanderId(commanderId);
  return {
    ...COMMANDER_ART[commanderId],
    id: commanderId,
    iconPath: getCommanderIconPath(commanderId),
    spritePaths: Object.freeze([1, 2, 3].map((level) => getCommanderSpritePath(commanderId, level))),
  };
}

function listCommanderArt() {
  return COMMANDER_CATALOG.map((commander) => ({
    ...commander,
    art: getCommanderArt(commander.id),
  }));
}

module.exports = {
  COMMANDER_ART,
  getCommanderArt,
  getCommanderIconPath,
  getCommanderSpritePath,
  listCommanderArt,
};
