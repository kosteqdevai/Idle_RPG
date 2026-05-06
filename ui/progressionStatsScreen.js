const { SCENE_IDS } = require("./sceneRouter.js");

function createProgressionStatsViewModel(domainState) {
  if (!domainState) {
    throw new TypeError("domainState is required");
  }

  return {
    hero: {
      id: domainState.roster.hero.id,
      level: domainState.roster.hero.level,
      experience: domainState.roster.hero.experience,
      power: domainState.roster.hero.power,
      stats: { ...domainState.roster.hero.stats },
      visualProgression: domainState.roster.hero.visualProgression,
    },
    commanders: domainState.roster.commanders.map((commander) => ({
      id: commander.id,
      name: commander.name,
      level: commander.level,
      power: commander.power,
      role: commander.role,
      visualProgression: commander.visualProgression,
    })),
    armyUnits: domainState.roster.armyUnits.map((unit) => ({
      id: unit.id,
      name: unit.name,
      race: unit.race,
      tier: unit.tier,
      power: unit.power,
      quantity: unit.quantity,
      totalPower: unit.power * unit.quantity,
      visualProgression: unit.visualProgression,
    })),
    aggregate: {
      totalCommanderPower: domainState.roster.commanders.reduce(
        (total, commander) => total + commander.power,
        0,
      ),
      totalArmyPower: domainState.roster.armyUnits.reduce(
        (total, unit) => total + unit.power * unit.quantity,
        0,
      ),
    },
  };
}

function createProgressionStatsScreen({ router } = {}) {
  if (!router) {
    throw new TypeError("router is required");
  }

  return {
    getViewModel() {
      return createProgressionStatsViewModel(router.snapshot().domainState);
    },
    backToHub() {
      return router.navigate(SCENE_IDS.MAIN_HUB);
    },
  };
}

module.exports = {
  createProgressionStatsScreen,
  createProgressionStatsViewModel,
};
