const { createGameSession } = require("../../domain/session.js");
const { createSceneRouter, SCENE_IDS } = require("../../ui/sceneRouter.js");
const {
  createMainHubViewModel,
  createMainHubScreen,
} = require("../../ui/mainHubScreen.js");

describe("main hub screen state", () => {
  test("presents hero, location, resources, and navigation targets from domain state", () => {
    const domainState = createGameSession({
      resources: {
        gold: 50,
        essence: 2,
        realmShards: 1,
        corpses: {},
      },
      roster: {
        hero: {
          experience: 235,
        },
      },
      progression: {
        unlockedRealmIds: ["verdant-kingdom"],
        completedZoneIds: ["verdant-kingdom-1"],
        currentRealmId: "verdant-kingdom",
        currentZoneId: "verdant-kingdom-2",
      },
    }).snapshot();

    expect(createMainHubViewModel(domainState)).toEqual({
      hero: {
        level: 3,
        power: expect.any(Number),
        visualProgression: expect.any(Number),
        stats: {
          attack: 16,
          defense: 10,
          health: 136,
        },
      },
      location: {
        realmId: "verdant-kingdom",
        realmName: "Verdant Kingdom",
        zoneId: "verdant-kingdom-2",
        zoneName: "Mossgate Ford",
      },
      resources: {
        gold: 50,
        essence: 2,
        realmShards: 1,
        corpses: {},
      },
      navigationTargets: [
        SCENE_IDS.ZONE_MAP,
        SCENE_IDS.FORMATION,
        SCENE_IDS.COMMANDER_ROSTER,
        SCENE_IDS.ARMY_ROSTER,
        SCENE_IDS.PROGRESSION_STATS,
      ],
    });
  });

  test("navigates from the hub to expected screens", () => {
    const router = createSceneRouter({
      currentScene: SCENE_IDS.MAIN_HUB,
      domainState: createGameSession().snapshot(),
    });
    const screen = createMainHubScreen({ router });

    expect(screen.goToZoneMap().currentScene).toBe(SCENE_IDS.ZONE_MAP);
    router.navigate(SCENE_IDS.MAIN_HUB);
    expect(screen.goToFormation("verdant-kingdom-1")).toMatchObject({
      currentScene: SCENE_IDS.FORMATION,
      sceneParams: {
        zoneId: "verdant-kingdom-1",
      },
    });
  });

  test("supports roster and progression navigation without mutating domain state", () => {
    for (const action of [
      "goToCommanderRoster",
      "goToArmyRoster",
      "goToProgressionStats",
    ]) {
      const domainState = createGameSession().snapshot();
      const router = createSceneRouter({
        currentScene: SCENE_IDS.MAIN_HUB,
        domainState,
      });
      const screen = createMainHubScreen({ router });

      const nextState = screen[action]();
      expect(nextState.domainState).toEqual(domainState);
      expect(nextState.currentScene).not.toBe(SCENE_IDS.MAIN_HUB);
    }
  });

  test("requires domain state and router", () => {
    expect(() => createMainHubViewModel()).toThrow(/domainState/);
    expect(() => createMainHubScreen()).toThrow(/router/);
  });
});
