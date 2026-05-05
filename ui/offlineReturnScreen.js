const { applyOfflineProgress } = require("../domain/offline.js");
const { SCENE_IDS } = require("./sceneRouter.js");

function createOfflineReturnViewModel(offlineSummary) {
  if (!offlineSummary) {
    throw new TypeError("offlineSummary is required");
  }

  return {
    lastActiveZoneId: offlineSummary.lastActiveZoneId,
    elapsedSeconds: offlineSummary.cappedElapsedSeconds ?? offlineSummary.elapsedSeconds,
    wasCapped: offlineSummary.wasCapped,
    rewards: {
      gold: offlineSummary.rewards.gold,
      essence: offlineSummary.rewards.essence,
      realmShards: 0,
    },
    resolvedCombat: false,
  };
}

function createOfflineReturnScreen({ router } = {}) {
  if (!router) {
    throw new TypeError("router is required");
  }

  let applied = false;

  function getOfflineSummary() {
    const summary = router.snapshot().sceneParams.offlineSummary;
    if (!summary) {
      throw new TypeError("offline summary is required");
    }

    return summary;
  }

  return {
    getViewModel() {
      return createOfflineReturnViewModel(getOfflineSummary());
    },
    collectAndContinue() {
      const domainState = router.snapshot().domainState;
      const offlineSummary = getOfflineSummary();

      if (!applied) {
        const result = applyOfflineProgress(domainState.resources, offlineSummary);
        router.replaceDomainState({
          ...domainState,
          resources: result.resources,
          lastSeenAt: null,
        });
        applied = true;
      }

      return router.navigate(SCENE_IDS.MAIN_HUB, {
        offlineSummary: createOfflineReturnViewModel(offlineSummary),
      });
    },
  };
}

module.exports = {
  createOfflineReturnScreen,
  createOfflineReturnViewModel,
};
