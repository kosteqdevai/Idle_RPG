const {
  ACTIVE_COMMANDER_SLOT_CAP,
  COMMANDER_CATALOG,
  activateCommander,
  deactivateCommander,
  summonCommander,
} = require("../domain/commanders.js");
const { getCommanderArt, getCommanderIconPath, getCommanderSpritePath } = require("../assets/commanderArt.js");
const { SCENE_IDS } = require("./sceneRouter.js");

function getCommanderSpriteLevel(commander) {
  if (commander.level >= 6) {
    return 3;
  }

  if (commander.level >= 3) {
    return 2;
  }

  return 1;
}

function getCommanderSpriteKey(commander) {
  return `${commander.id}-unique-lv${getCommanderSpriteLevel(commander)}`;
}

function createCommanderRosterViewModel(domainState, error = null) {
  if (!domainState) {
    throw new TypeError("domainState is required");
  }

  const summonedIds = new Set(
    domainState.roster.commanders.map((commander) => commander.id),
  );

  return {
    essence: domainState.resources.essence,
    activeSlotCap: ACTIVE_COMMANDER_SLOT_CAP,
    activeCommanderIds: [...domainState.roster.activeCommanderIds],
    commanders: domainState.roster.commanders.map((commander) => ({
      id: commander.id,
      name: commander.name,
      role: commander.role,
      level: commander.level,
      power: commander.power,
      visualProgression: commander.visualProgression,
      spriteKey: getCommanderSpriteKey(commander),
      iconPath: getCommanderIconPath(commander.id),
      spritePath: getCommanderSpritePath(commander.id, getCommanderSpriteLevel(commander)),
      artDirection: getCommanderArt(commander.id),
      active: domainState.roster.activeCommanderIds.includes(commander.id),
    })),
    summonOptions: COMMANDER_CATALOG.map((definition) => ({
      id: definition.id,
      name: definition.name,
      role: definition.role,
      iconPath: getCommanderIconPath(definition.id),
      artDirection: getCommanderArt(definition.id),
      summoned: summonedIds.has(definition.id),
    })),
    error,
  };
}

function createCommanderRosterScreen({ router } = {}) {
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
    return createCommanderRosterViewModel(nextDomainState);
  }

  function reportError(error) {
    lastError = error.message;
    return createCommanderRosterViewModel(getDomainState(), lastError);
  }

  return {
    getViewModel() {
      return createCommanderRosterViewModel(getDomainState(), lastError);
    },
    summon(commanderId) {
      try {
        const domainState = getDomainState();
        const result = summonCommander(
          domainState.roster,
          domainState.resources,
          commanderId,
        );

        return updateDomainState({
          ...domainState,
          roster: {
            ...domainState.roster,
            commanders: result.roster.commanders,
            activeCommanderIds: result.roster.activeCommanderIds,
          },
          resources: result.resources,
        });
      } catch (error) {
        return reportError(error);
      }
    },
    activate(commanderId) {
      try {
        const domainState = getDomainState();
        const roster = activateCommander(domainState.roster, commanderId);

        return updateDomainState({
          ...domainState,
          roster: {
            ...domainState.roster,
            commanders: roster.commanders,
            activeCommanderIds: roster.activeCommanderIds,
          },
        });
      } catch (error) {
        return reportError(error);
      }
    },
    deactivate(commanderId) {
      const domainState = getDomainState();
      const roster = deactivateCommander(domainState.roster, commanderId);

      return updateDomainState({
        ...domainState,
        roster: {
          ...domainState.roster,
          commanders: roster.commanders,
          activeCommanderIds: roster.activeCommanderIds,
        },
      });
    },
    backToHub() {
      return router.navigate(SCENE_IDS.MAIN_HUB);
    },
  };
}

module.exports = {
  createCommanderRosterScreen,
  createCommanderRosterViewModel,
  getCommanderSpriteLevel,
  getCommanderSpriteKey,
};
