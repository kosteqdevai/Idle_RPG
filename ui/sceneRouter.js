const SCENE_IDS = Object.freeze({
  TITLE_LOAD: "title-load",
  OFFLINE_RETURN: "offline-return",
  MAIN_HUB: "main-hub",
  ZONE_MAP: "zone-map",
  FORMATION: "formation",
  COMBAT: "combat",
  COMMANDER_ROSTER: "commander-roster",
  ARMY_ROSTER: "army-roster",
  PROGRESSION_STATS: "progression-stats",
});

const ROUTES = Object.freeze({
  [SCENE_IDS.TITLE_LOAD]: Object.freeze([
    SCENE_IDS.MAIN_HUB,
    SCENE_IDS.OFFLINE_RETURN,
  ]),
  [SCENE_IDS.OFFLINE_RETURN]: Object.freeze([SCENE_IDS.MAIN_HUB]),
  [SCENE_IDS.MAIN_HUB]: Object.freeze([
    SCENE_IDS.ZONE_MAP,
    SCENE_IDS.FORMATION,
    SCENE_IDS.COMMANDER_ROSTER,
    SCENE_IDS.ARMY_ROSTER,
    SCENE_IDS.PROGRESSION_STATS,
  ]),
  [SCENE_IDS.ZONE_MAP]: Object.freeze([
    SCENE_IDS.MAIN_HUB,
    SCENE_IDS.FORMATION,
  ]),
  [SCENE_IDS.FORMATION]: Object.freeze([
    SCENE_IDS.MAIN_HUB,
    SCENE_IDS.COMBAT,
  ]),
  [SCENE_IDS.COMBAT]: Object.freeze([
    SCENE_IDS.MAIN_HUB,
    SCENE_IDS.ZONE_MAP,
  ]),
  [SCENE_IDS.COMMANDER_ROSTER]: Object.freeze([SCENE_IDS.MAIN_HUB]),
  [SCENE_IDS.ARMY_ROSTER]: Object.freeze([SCENE_IDS.MAIN_HUB]),
  [SCENE_IDS.PROGRESSION_STATS]: Object.freeze([SCENE_IDS.MAIN_HUB]),
});

function createSceneRouter(initialState = {}) {
  let state = {
    currentScene: initialState.currentScene ?? SCENE_IDS.TITLE_LOAD,
    previousScene: initialState.previousScene ?? null,
    domainState: initialState.domainState
      ? structuredClone(initialState.domainState)
      : null,
    sceneParams: structuredClone(initialState.sceneParams ?? {}),
  };

  function snapshot() {
    return structuredClone(state);
  }

  return {
    snapshot,
    canNavigate(targetScene) {
      return ROUTES[state.currentScene]?.includes(targetScene) ?? false;
    },
    navigate(targetScene, sceneParams = {}) {
      if (!ROUTES[targetScene]) {
        throw new RangeError(`unknown scene id: ${targetScene}`);
      }

      if (!(ROUTES[state.currentScene]?.includes(targetScene) ?? false)) {
        throw new RangeError(
          `cannot navigate from ${state.currentScene} to ${targetScene}`,
        );
      }

      state = {
        ...state,
        previousScene: state.currentScene,
        currentScene: targetScene,
        sceneParams: structuredClone(sceneParams),
      };

      return snapshot();
    },
    replaceDomainState(domainState) {
      state = {
        ...state,
        domainState: structuredClone(domainState),
      };

      return snapshot();
    },
  };
}

module.exports = {
  SCENE_IDS,
  ROUTES,
  createSceneRouter,
};
