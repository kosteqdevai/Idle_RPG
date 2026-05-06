const { createArmyUnit, createStartingArmyRoster } = require("../../domain/army.js");
const {
  createCommander,
  createCommanderRoster,
} = require("../../domain/commanders.js");
const { createGameSession } = require("../../domain/session.js");
const { createSceneRouter, SCENE_IDS } = require("../../ui/sceneRouter.js");
const {
  createFormationViewModel,
  createFormationScreen,
} = require("../../ui/formationScreen.js");

function createDomainState() {
  const commander = createCommander("vanguard-captain");
  return createGameSession({
    roster: {
      ...createStartingArmyRoster({
        armyUnits: [
          createArmyUnit("human-peasant", { quantity: 2 }),
          createArmyUnit("human-soldier", { quantity: 1 }),
        ],
      }),
      ...createCommanderRoster({
        commanders: [commander],
        activeCommanderIds: [commander.id],
      }),
    },
  }).snapshot();
}

describe("dormant pre-combat formation screen state", () => {
  test("shows read-only auto-deployed army quantities and active commanders", () => {
    const viewModel = createFormationViewModel(createDomainState());

    expect(viewModel.dormant).toBe(true);
    expect(viewModel.note).toMatch(/auto-deploys/);
    expect(viewModel.autoDeployedArmyPower).toBe(22);
    expect(viewModel.armyOptions.map((unit) => unit.id)).toEqual([
      "human-peasant",
      "human-soldier",
    ]);
    expect(viewModel.commanderOptions).toEqual([
      {
        id: "vanguard-captain",
        name: "Vanguard Captain",
        role: "frontline",
        active: true,
      },
    ]);
  });

  test("composition and assignment actions are no-ops while dormant", () => {
    const router = createSceneRouter({
      currentScene: SCENE_IDS.FORMATION,
      domainState: createDomainState(),
    });
    const screen = createFormationScreen({ router });

    expect(screen.setComposition([{ unitId: "human-peasant", count: 99 }]).dormant).toBe(true);
    expect(screen.assignSlot("front-center", "army", "human-peasant").dormant).toBe(true);
    expect(screen.validate().slots).toEqual([]);
    expect(router.snapshot().domainState.formation.slots).toEqual([]);
  });

  test("routes to combat without mutating formation", () => {
    const router = createSceneRouter({
      currentScene: SCENE_IDS.FORMATION,
      domainState: createDomainState(),
    });
    const screen = createFormationScreen({ router });

    const nextState = screen.startCombat("verdant-kingdom-1");

    expect(nextState).toMatchObject({
      currentScene: SCENE_IDS.COMBAT,
      sceneParams: {
        zoneId: "verdant-kingdom-1",
      },
      domainState: {
        formation: {
          slots: [],
        },
      },
    });
  });

  test("routes back to hub and requires router/domain state", () => {
    const router = createSceneRouter({
      currentScene: SCENE_IDS.FORMATION,
      domainState: createDomainState(),
    });

    expect(createFormationScreen({ router }).backToHub().currentScene).toBe(
      SCENE_IDS.MAIN_HUB,
    );
    expect(() => createFormationScreen()).toThrow(/router/);
    expect(() => createFormationViewModel()).toThrow(/domainState/);
  });
});
