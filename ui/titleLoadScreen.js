const { createGameSession } = require("../domain/session.js");
const { loadGame } = require("../domain/persistence.js");
const { calculateOfflineProgress } = require("../domain/offline.js");
const { SCENE_IDS } = require("./sceneRouter.js");

function getLastActiveZoneId(domainState) {
  return (
    domainState.progression?.currentZoneId ??
    domainState.zone?.id ??
    "verdant-kingdom-1"
  );
}

function createTitleLoadScreen({ storage, router, now = new Date() } = {}) {
  if (!router) {
    throw new TypeError("router is required");
  }

  return {
    startNewGame() {
      const domainState = createGameSession().snapshot();
      router.replaceDomainState(domainState);
      return router.navigate(SCENE_IDS.MAIN_HUB, {
        mode: "new-game",
      });
    },
    loadSavedGame() {
      if (!storage) {
        throw new TypeError("storage is required to load a saved game");
      }

      const domainState = loadGame(storage);
      if (!domainState) {
        return this.startNewGame();
      }

      router.replaceDomainState(domainState);

      if (domainState.lastSeenAt) {
        const offlineSummary = calculateOfflineProgress({
          lastSeenAt: domainState.lastSeenAt,
          now,
          lastActiveZoneId: getLastActiveZoneId(domainState),
        });

        if (offlineSummary.cappedElapsedSeconds > 0) {
          return router.navigate(SCENE_IDS.OFFLINE_RETURN, {
            offlineSummary,
          });
        }
      }

      return router.navigate(SCENE_IDS.MAIN_HUB, {
        mode: "loaded-game",
      });
    },
  };
}

module.exports = {
  createTitleLoadScreen,
};
