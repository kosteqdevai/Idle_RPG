const { createGameSession } = require("../../domain/session.js");
const { createSceneRouter, SCENE_IDS } = require("../../ui/sceneRouter.js");
const {
  createArmyRosterScreen,
  createArmyRosterViewModel,
} = require("../../ui/armyRosterScreen.js");

function createDomainState(overrides = {}) {
  return createGameSession({
    resources: {
      gold: 100,
      corpses: {
        "human-peasant-corpse": 1,
        ...(overrides.corpses ?? {}),
      },
    },
    roster: overrides.roster ?? {},
  }).snapshot();
}

describe("corpse-based army roster screen state", () => {
  test("lists units with quantity, Power, corpse inventory, and raise costs", () => {
    const viewModel = createArmyRosterViewModel(createDomainState());
    const peasant = viewModel.armyUnits.find((unit) => unit.id === "human-peasant");

    expect(viewModel.totalCorpses).toBe(1);
    expect(peasant).toMatchObject({
      id: "human-peasant",
      race: "human",
      tier: 1,
      power: 5,
      quantity: 0,
      totalPower: 0,
      corpseType: "human-peasant-corpse",
      corpseCost: 1,
      availableCorpses: 1,
      canRaise: true,
    });
  });

  test("raises units through matching corpses", () => {
    const router = createSceneRouter({
      currentScene: SCENE_IDS.ARMY_ROSTER,
      domainState: createDomainState(),
    });
    const screen = createArmyRosterScreen({ router });

    const viewModel = screen.raise("human-peasant");
    const peasant = viewModel.armyUnits.find((unit) => unit.id === "human-peasant");

    expect(peasant.quantity).toBe(1);
    expect(peasant.totalPower).toBe(5);
    expect(peasant.availableCorpses).toBe(0);
    expect(router.snapshot().domainState.resources.corpses["human-peasant-corpse"]).toBe(0);
  });

  test("reports corpse errors without mutating resources", () => {
    const router = createSceneRouter({
      currentScene: SCENE_IDS.ARMY_ROSTER,
      domainState: createDomainState({
        corpses: {
          "human-peasant-corpse": 0,
        },
      }),
    });
    const screen = createArmyRosterScreen({ router });

    expect(screen.raise("human-peasant").error).toMatch(/corpses/);
    expect(router.snapshot().domainState.resources.corpses["human-peasant-corpse"]).toBe(0);
  });

  test("routes back to hub and requires router/domain state", () => {
    const router = createSceneRouter({
      currentScene: SCENE_IDS.ARMY_ROSTER,
      domainState: createDomainState(),
    });

    expect(createArmyRosterScreen({ router }).backToHub().currentScene).toBe(
      SCENE_IDS.MAIN_HUB,
    );
    expect(() => createArmyRosterScreen()).toThrow(/router/);
    expect(() => createArmyRosterViewModel()).toThrow(/domainState/);
  });
});
