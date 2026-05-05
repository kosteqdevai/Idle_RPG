import { scenes, setScene, state } from "./state.mjs";

const routes = {
  [scenes.title]: [scenes.hub, scenes.offline],
  [scenes.offline]: [scenes.hub],
  [scenes.hub]: [
    scenes.zoneMap,
    scenes.formation,
    scenes.combat,
    scenes.commanders,
    scenes.army,
    scenes.progression,
  ],
  [scenes.zoneMap]: [scenes.hub, scenes.formation],
  [scenes.formation]: [scenes.hub, scenes.combat],
  [scenes.combat]: [scenes.hub, scenes.zoneMap],
  [scenes.commanders]: [scenes.hub],
  [scenes.army]: [scenes.hub],
  [scenes.progression]: [scenes.hub],
};

export function createSceneRouter(initialScene = scenes.title) {
  setScene(initialScene);

  return {
    get currentScene() {
      return state.currentScene;
    },
    canNavigate(targetScene) {
      return routes[state.currentScene]?.includes(targetScene) ?? false;
    },
    navigate(targetScene) {
      if (!routes[targetScene]) {
        throw new RangeError(`unknown scene: ${targetScene}`);
      }

      if (!this.canNavigate(targetScene)) {
        throw new RangeError(`cannot navigate from ${state.currentScene} to ${targetScene}`);
      }

      setScene(targetScene);
      return state.currentScene;
    },
  };
}
