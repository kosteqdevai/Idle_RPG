const PIXEL_ART_STYLE = Object.freeze({
  pixelArt: true,
  baseSpriteSize: 32,
  commanderVisualLevels: 3,
});

const PLACEHOLDER_ASSETS = Object.freeze({
  hero: Object.freeze({
    sprite: "assets/placeholders/hero.png",
    overlays: Object.freeze(["glow", "banner"]),
  }),
  commanders: Object.freeze({
    iconPattern: "assets/commanders/icons/{id}.svg",
    spritePattern: "assets/commanders/sprites/{id}-lv{level}.svg",
    visualLevels: 3,
  }),
  armyUnits: Object.freeze({
    spritePattern: "assets/placeholders/army/{id}.png",
    overlays: Object.freeze(["rank-stripes", "weapon-glow"]),
  }),
  realms: Object.freeze({
    spritePattern: "assets/placeholders/realms/{id}.png",
    overlays: Object.freeze(["ambient-particles"]),
  }),
});

module.exports = {
  PIXEL_ART_STYLE,
  PLACEHOLDER_ASSETS,
};
