const { raiseArmyUnit } = require("../domain/army.js");
const { SCENE_IDS } = require("./sceneRouter.js");

function createArmyRosterViewModel(domainState, error = null) {
  if (!domainState) {
    throw new TypeError("domainState is required");
  }

  const corpses = domainState.resources.corpses ?? {};

  return {
    corpses: { ...corpses },
    totalCorpses: Object.values(corpses).reduce((total, quantity) => total + quantity, 0),
    armyUnits: domainState.roster.armyUnits.map((unit) => ({
      id: unit.id,
      name: unit.name,
      race: unit.race,
      tier: unit.tier,
      power: unit.power,
      quantity: unit.quantity,
      totalPower: unit.power * unit.quantity,
      corpseType: unit.corpseType,
      corpseCost: unit.corpseCost,
      availableCorpses: corpses[unit.corpseType] ?? 0,
      canRaise: (corpses[unit.corpseType] ?? 0) >= unit.corpseCost,
      visualProgression: unit.visualProgression,
    })),
    error,
  };
}

function createArmyRosterScreen({ router } = {}) {
  if (!router) {
    throw new TypeError("router is required");
  }

  let lastError = null;

  function getDomainState() {
    return router.snapshot().domainState;
  }

  function updateDomainState(nextDomainState) {
    router.replaceDomainState(nextDomainState);
    lastError = null;
    return createArmyRosterViewModel(nextDomainState);
  }

  function reportError(error) {
    lastError = error.message;
    return createArmyRosterViewModel(getDomainState(), lastError);
  }

  return {
    getViewModel() {
      return createArmyRosterViewModel(getDomainState(), lastError);
    },
    raise(unitId) {
      try {
        const domainState = getDomainState();
        const result = raiseArmyUnit(
          domainState.roster,
          domainState.resources,
          unitId,
        );

        return updateDomainState({
          ...domainState,
          roster: {
            ...domainState.roster,
            armyUnits: result.roster.armyUnits,
          },
          resources: result.resources,
        });
      } catch (error) {
        return reportError(error);
      }
    },
    backToHub() {
      return router.navigate(SCENE_IDS.MAIN_HUB);
    },
  };
}

module.exports = {
  createArmyRosterScreen,
  createArmyRosterViewModel,
};
