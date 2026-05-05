const { PLACEHOLDER_ASSETS, PIXEL_ART_STYLE } = require("../assets/manifest.js");
const { getCommanderIconPath, getCommanderSpritePath } = require("../assets/commanderArt.js");

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function interpolateVisualProperties(visualProgression) {
  const progress = clamp01(visualProgression);

  return {
    scale: Number((1 + progress * 0.35).toFixed(4)),
    glowIntensity: Number((progress * 0.9).toFixed(4)),
    particleDensity: Number((progress * 1.5).toFixed(4)),
    overlayOpacity: Number((progress * 0.8).toFixed(4)),
  };
}

function getCommanderAssetPath(commanderId, visualProgression) {
  const progress = clamp01(visualProgression);
  const level = progress >= 0.66 ? 3 : progress >= 0.33 ? 2 : 1;

  return getCommanderSpritePath(commanderId, level);
}

function getArmyAssetPath(unitId) {
  return PLACEHOLDER_ASSETS.armyUnits.spritePattern.replace("{id}", unitId);
}

function getRealmAssetPath(realmId) {
  return PLACEHOLDER_ASSETS.realms.spritePattern.replace("{id}", realmId);
}

function createVisualRenderData(domainState) {
  if (!domainState) {
    throw new TypeError("domainState is required");
  }

  return {
    style: PIXEL_ART_STYLE,
    hero: {
      sprite: PLACEHOLDER_ASSETS.hero.sprite,
      overlays: PLACEHOLDER_ASSETS.hero.overlays,
      properties: interpolateVisualProperties(
        domainState.roster.hero.visualProgression,
      ),
    },
    commanders: domainState.roster.commanders.map((commander) => ({
      id: commander.id,
      icon: getCommanderIconPath(commander.id),
      sprite: getCommanderAssetPath(commander.id, commander.visualProgression),
      properties: interpolateVisualProperties(commander.visualProgression),
    })),
    armyUnits: domainState.roster.armyUnits.map((unit) => ({
      id: unit.id,
      sprite: getArmyAssetPath(unit.id),
      overlays: PLACEHOLDER_ASSETS.armyUnits.overlays,
      properties: interpolateVisualProperties(unit.visualProgression),
    })),
    realm: {
      id: domainState.realm.id,
      sprite: getRealmAssetPath(domainState.realm.id),
      overlays: PLACEHOLDER_ASSETS.realms.overlays,
    },
  };
}

module.exports = {
  interpolateVisualProperties,
  getCommanderAssetPath,
  getArmyAssetPath,
  getRealmAssetPath,
  createVisualRenderData,
};
