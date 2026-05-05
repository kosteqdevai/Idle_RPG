const {
  deleteArmyUnit,
  getArmyUnitUpgradeCost,
  upgradeArmyUnit,
} = require("../domain/army.js");
const { SCENE_IDS } = require("./sceneRouter.js");

function createArmyRosterViewModel(domainState, error = null) {
  if (!domainState) {
    throw new TypeError("domainState is required");
  }

  return {
    gold: domainState.resources.gold,
    armyUnits: domainState.roster.armyUnits.map((unit) => ({
      id: unit.id,
      name: unit.name,
      role: unit.role,
      level: unit.level,
      power: unit.power,
      stats: { ...unit.stats },
      visualProgression: unit.visualProgression,
      upgradeCost: getArmyUnitUpgradeCost(unit),
      activeFormation: domainState.roster.activeFormationUnitIds.includes(unit.id),
      inComposition: domainState.roster.armyComposition.some(
        (entry) => entry.unitId === unit.id,
      ),
    })),
    composition: domainState.roster.armyComposition.map((entry) => ({ ...entry })),
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
    upgrade(unitId) {
      try {
        const domainState = getDomainState();
        const result = upgradeArmyUnit(
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
    delete(unitId) {
      try {
        const domainState = getDomainState();
        const roster = deleteArmyUnit(domainState.roster, unitId);

        return updateDomainState({
          ...domainState,
          roster: {
            ...domainState.roster,
            armyUnits: roster.armyUnits,
            armyComposition: roster.armyComposition,
            activeFormationUnitIds: roster.activeFormationUnitIds,
          },
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
