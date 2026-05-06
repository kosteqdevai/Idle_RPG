const { resolveCombat } = require("../domain/combat.js");
const { awardHeroExperience } = require("../domain/hero.js");
const { applyCombatRewards } = require("../domain/resources.js");
const { completeZone } = require("../domain/world.js");
const { SCENE_IDS } = require("./sceneRouter.js");

function createCombatViewModel(combatResult) {
  if (!combatResult) {
    throw new TypeError("combatResult is required");
  }

  return {
    outcome: combatResult.outcome,
    participants: combatResult.participants,
    targetingOrder: combatResult.targetingOrder,
    rewards: combatResult.rewards,
    log: combatResult.log,
    activeInputEnabled: false,
  };
}

function createCombatScreen({ router, seed = "combat-scene" } = {}) {
  if (!router) {
    throw new TypeError("router is required");
  }

  let combatResult = null;

  return {
    start(zoneId) {
      const domainState = router.snapshot().domainState;
      combatResult = resolveCombat({
        hero: domainState.roster.hero,
        roster: domainState.roster,
        formation: domainState.formation,
        zoneId,
        seed,
      });

      return this.getViewModel();
    },
    getViewModel() {
      return createCombatViewModel(combatResult);
    },
    finishToHub() {
      const domainState = router.snapshot().domainState;
      if (!combatResult) {
        throw new TypeError("combat must be started before finishing");
      }

      const rewardResult = applyCombatRewards(
        domainState.resources,
        combatResult.zoneId,
        combatResult.rewards,
      );
      const progression = combatResult.didWin
        ? completeZone(domainState.progression, combatResult.zoneId)
        : domainState.progression;
      const hero = awardHeroExperience(
        domainState.roster.hero,
        combatResult.rewards.heroExperience,
      );
      const nextDomainState = {
        ...domainState,
        roster: {
          ...domainState.roster,
          hero,
        },
        resources: rewardResult.resources,
        progression,
      };

      router.replaceDomainState(nextDomainState);
      return router.navigate(SCENE_IDS.MAIN_HUB, {
        combatSummary: createCombatViewModel(combatResult),
      });
    },
    finishToZoneMap() {
      this.finishToHub();
      return router.navigate(SCENE_IDS.ZONE_MAP);
    },
  };
}

module.exports = {
  createCombatViewModel,
  createCombatScreen,
};
