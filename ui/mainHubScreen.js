const { SCENE_IDS } = require("./sceneRouter.js");

function createMainHubViewModel(domainState) {
  if (!domainState) {
    throw new TypeError("domainState is required");
  }

  return {
    hero: {
      level: domainState.roster.hero.level,
      power: domainState.roster.hero.power,
      visualProgression: domainState.roster.hero.visualProgression,
      stats: { ...domainState.roster.hero.stats },
    },
    location: {
      realmId: domainState.realm.id,
      realmName: domainState.realm.name,
      zoneId: domainState.zone.id,
      zoneName: domainState.zone.name,
    },
    resources: { ...domainState.resources },
    navigationTargets: [
      SCENE_IDS.ZONE_MAP,
      SCENE_IDS.FORMATION,
      SCENE_IDS.COMMANDER_ROSTER,
      SCENE_IDS.ARMY_ROSTER,
      SCENE_IDS.PROGRESSION_STATS,
    ],
  };
}

function createMainHubScreen({ router } = {}) {
  if (!router) {
    throw new TypeError("router is required");
  }

  return {
    getViewModel() {
      return createMainHubViewModel(router.snapshot().domainState);
    },
    goToZoneMap() {
      return router.navigate(SCENE_IDS.ZONE_MAP);
    },
    goToFormation(zoneId) {
      return router.navigate(SCENE_IDS.FORMATION, { zoneId });
    },
    goToCommanderRoster() {
      return router.navigate(SCENE_IDS.COMMANDER_ROSTER);
    },
    goToArmyRoster() {
      return router.navigate(SCENE_IDS.ARMY_ROSTER);
    },
    goToProgressionStats() {
      return router.navigate(SCENE_IDS.PROGRESSION_STATS);
    },
  };
}

module.exports = {
  createMainHubViewModel,
  createMainHubScreen,
};
