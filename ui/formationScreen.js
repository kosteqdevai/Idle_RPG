const {
  createFormation,
  validateFormation,
} = require("../domain/formation.js");
const {
  setArmyComposition,
} = require("../domain/army.js");
const { SCENE_IDS } = require("./sceneRouter.js");

function createFormationViewModel(domainState, draftFormation = null) {
  if (!domainState) {
    throw new TypeError("domainState is required");
  }

  return {
    armyOptions: domainState.roster.armyUnits.map((unit) => ({
      id: unit.id,
      name: unit.name,
      role: unit.role,
      inComposition: domainState.roster.armyComposition.some(
        (entry) => entry.unitId === unit.id,
      ),
    })),
    commanderOptions: domainState.roster.commanders.map((commander) => ({
      id: commander.id,
      name: commander.name,
      role: commander.role,
      active: domainState.roster.activeCommanderIds.includes(commander.id),
    })),
    composition: domainState.roster.armyComposition,
    formation: draftFormation ?? domainState.formation,
  };
}

function createFormationScreen({ router } = {}) {
  if (!router) {
    throw new TypeError("router is required");
  }

  let draftFormation = null;

  function getDomainState() {
    return router.snapshot().domainState;
  }

  return {
    getViewModel() {
      return createFormationViewModel(getDomainState(), draftFormation);
    },
    setComposition(armyComposition) {
      const domainState = getDomainState();
      const armyRoster = setArmyComposition(domainState.roster, armyComposition);
      const nextDomainState = {
        ...domainState,
        roster: {
          ...domainState.roster,
          armyComposition: armyRoster.armyComposition,
        },
      };
      router.replaceDomainState(nextDomainState);
      return this.getViewModel();
    },
    assignSlot(slotId, occupantType, occupantId) {
      const current = draftFormation ?? getDomainState().formation;
      const remainingSlots = current.slots.filter(
        (slot) =>
          slot.slotId !== slotId &&
          !(
            slot.occupantType === occupantType &&
            slot.occupantId === occupantId
          ),
      );
      draftFormation = createFormation([
        ...remainingSlots,
        { slotId, occupantType, occupantId },
      ]);

      return this.getViewModel();
    },
    validate() {
      return validateFormation(draftFormation ?? getDomainState().formation, getDomainState().roster);
    },
    startCombat(zoneId) {
      const formation = this.validate();
      const domainState = {
        ...getDomainState(),
        formation,
      };
      router.replaceDomainState(domainState);
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
