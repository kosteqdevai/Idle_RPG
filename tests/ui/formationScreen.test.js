const { createStartingArmyRoster } = require("../../domain/army.js");
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
      ...createStartingArmyRoster(),
      ...createCommanderRoster({
        commanders: [commander],
        activeCommanderIds: [commander.id],
      }),
    },
  }).snapshot();
}

describe("pre-combat formation screen state", () => {
  test("shows army composition options, active commanders, and current formation", () => {
    const viewModel = createFormationViewModel(createDomainState());

    expect(viewModel.armyOptions.map((unit) => unit.id)).toEqual([
      "infantry",
      "archer",
      "cavalry",
    ]);
    expect(viewModel.armyOptions.every((unit) => unit.inComposition)).toBe(true);
    expect(viewModel.commanderOptions).toEqual([
      {
        id: "vanguard-captain",
        name: "Vanguard Captain",
        role: "frontline",
        active: true,
      },
    ]);
  });

  test("updates army composition through the domain roster validator", () => {
    const router = createSceneRouter({
      currentScene: SCENE_IDS.FORMATION,
      domainState: createDomainState(),
    });
    const screen = createFormationScreen({ router });

    expect(
      screen.setComposition([{ unitId: "infantry", count: 9 }]).composition,
    ).toEqual([{ unitId: "infantry", count: 9 }]);
    expect(() =>
      screen.setComposition([{ unitId: "missing", count: 1 }]),
    ).toThrow(/exist/);
  });

  test("assigns units and commanders to slots and validates illegal placements", () => {
    const router = createSceneRouter({
      currentScene: SCENE_IDS.FORMATION,
      domainState: createDomainState(),
    });
    const screen = createFormationScreen({ router });

    screen.assignSlot("front-center", "army", "infantry");
    screen.assignSlot("back-center", "commander", "vanguard-captain");

    expect(screen.validate().slots).toEqual([
      {
        slotId: "front-center",
        occupantType: "army",
        occupantId: "infantry",
      },
      {
        slotId: "back-center",
        occupantType: "commander",
        occupantId: "vanguard-captain",
      },
    ]);
    expect(() => screen.assignSlot("bad-slot", "army", "infantry")).toThrow(
      /unknown/,
    );
  });

  test("passes a valid formation into combat setup", () => {
    const router = createSceneRouter({
      currentScene: SCENE_IDS.FORMATION,
      domainState: createDomainState(),
    });
    const screen = createFormationScreen({ router });

    screen.assignSlot("front-center", "army", "infantry");
    const nextState = screen.startCombat("verdant-kingdom-1");

    expect(nextState).toMatchObject({
      currentScene: SCENE_IDS.COMBAT,
      sceneParams: {
        zoneId: "verdant-kingdom-1",
      },
      domainState: {
        formation: {
          slots: [
            {
              slotId: "front-center",
              occupantType: "army",
              occupantId: "infantry",
            },
          ],
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
