const { createStartingArmyRoster } = require("../../domain/army.js");
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
      ...(overrides.resources ?? {}),
    },
    roster: {
      ...createStartingArmyRoster(),
      ...(overrides.roster ?? {}),
    },
  }).snapshot();
}

describe("army roster screen state", () => {
  test("lists global units, composition, upgrade costs, active state, and visual progression", () => {
    const domainState = createDomainState({
      roster: {
        ...createStartingArmyRoster(),
        activeFormationUnitIds: ["infantry"],
      },
    });

    expect(createArmyRosterViewModel(domainState)).toMatchObject({
      gold: 100,
      armyUnits: [
        {
          id: "infantry",
          level: 1,
          upgradeCost: 30,
          activeFormation: true,
          inComposition: true,
          visualProgression: 0,
        },
        {
          id: "archer",
          activeFormation: false,
          inComposition: true,
        },
        {
          id: "cavalry",
          activeFormation: false,
          inComposition: true,
        },
      ],
      composition: [
        { unitId: "infantry", count: 6 },
        { unitId: "archer", count: 4 },
        { unitId: "cavalry", count: 2 },
      ],
      error: null,
    });
  });

  test("upgrades units through Gold where domain rules allow", () => {
    const router = createSceneRouter({
      currentScene: SCENE_IDS.ARMY_ROSTER,
      domainState: createDomainState(),
    });
    const screen = createArmyRosterScreen({ router });

    const viewModel = screen.upgrade("infantry");
    const infantry = viewModel.armyUnits.find((unit) => unit.id === "infantry");

    expect(viewModel.gold).toBe(70);
    expect(infantry.level).toBe(2);
    expect(infantry.visualProgression).toBeGreaterThan(0);
    expect(router.snapshot().domainState.resources.gold).toBe(70);
  });

  test("reports upgrade errors without spending resources", () => {
    const router = createSceneRouter({
      currentScene: SCENE_IDS.ARMY_ROSTER,
      domainState: createDomainState({
        resources: {
          gold: 29,
        },
      }),
    });
    const screen = createArmyRosterScreen({ router });

    expect(screen.upgrade("infantry").error).toMatch(/Gold/);
    expect(router.snapshot().domainState.resources.gold).toBe(29);
  });

  test("blocks deleting active formation units and deletes inactive units", () => {
    const router = createSceneRouter({
      currentScene: SCENE_IDS.ARMY_ROSTER,
      domainState: createDomainState({
        roster: {
          ...createStartingArmyRoster(),
          activeFormationUnitIds: ["infantry"],
        },
      }),
    });
    const screen = createArmyRosterScreen({ router });

    expect(screen.delete("infantry").error).toMatch(/active/);
    const viewModel = screen.delete("archer");

    expect(viewModel.armyUnits.map((unit) => unit.id)).toEqual([
      "infantry",
      "cavalry",
    ]);
    expect(viewModel.composition.map((entry) => entry.unitId)).toEqual([
      "infantry",
      "cavalry",
    ]);
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
