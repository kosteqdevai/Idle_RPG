const { calculateArmyRosterPower } = require("../domain/army.js");
const { SCENE_IDS } = require("./sceneRouter.js");

function createFormationViewModel(domainState) {
  if (!domainState) {
    throw new TypeError("domainState is required");
  }

  return {
    dormant: true,
    note: "Formation is dormant: combat auto-deploys raised army quantities.",
    autoDeployedArmyPower: calculateArmyRosterPower(domainState.roster),
    armyOptions: domainState.roster.armyUnits.map((unit) => ({
      id: unit.id,
      name: unit.name,
      race: unit.race,
      tier: unit.tier,
      quantity: unit.quantity,
      power: unit.power,
      totalPower: unit.power * unit.quantity,
    })),
    commanderOptions: domainState.roster.commanders.map((commander) => ({
      id: commander.id,
      name: commander.name,
      role: commander.role,
      active: domainState.roster.activeCommanderIds.includes(commander.id),
    })),
    formation: domainState.formation,
  };
}

function createFormationScreen({ router } = {}) {
  if (!router) {
    throw new TypeError("router is required");
  }

  function getDomainState() {
    return router.snapshot().domainState;
  }

  return {
    getViewModel() {
      return createFormationViewModel(getDomainState());
    },
    setComposition() {
      return this.getViewModel();
    },
    assignSlot() {
      return this.getViewModel();
    },
    validate() {
      return getDomainState().formation;
    },
    startCombat(zoneId) {
      return router.navigate(SCENE_IDS.COMBAT, {
        zoneId,
      });
    },
    backToHub() {
      return router.navigate(SCENE_IDS.MAIN_HUB);
    },
  };
}

module.exports = {
  createFormationViewModel,
  createFormationScreen,
};
