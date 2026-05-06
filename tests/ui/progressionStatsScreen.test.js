const { createArmyUnit, createStartingArmyRoster } = require("../../domain/army.js");
const { createCommander, createCommanderRoster } = require("../../domain/commanders.js");
const { createGameSession } = require("../../domain/session.js");
const { createSceneRouter, SCENE_IDS } = require("../../ui/sceneRouter.js");
const {
  createProgressionStatsScreen,
  createProgressionStatsViewModel,
} = require("../../ui/progressionStatsScreen.js");

function createDomainState() {
  const commander = createCommander("vanguard-captain", {
    level: 3,
    experience: 184,
  });
  return createGameSession({
    roster: {
      ...createStartingArmyRoster({
        armyUnits: [
          createArmyUnit("human-peasant", { quantity: 3 }),
          createArmyUnit("human-soldier", { quantity: 2 }),
        ],
      }),
      ...createCommanderRoster({
        commanders: [commander],
        activeCommanderIds: [commander.id],
      }),
      hero: {
        experience: 235,
      },
    },
  }).snapshot();
}

describe("progression and stats screen state", () => {
  test("displays hero, commander, and corpse-raised army growth data", () => {
    const viewModel = createProgressionStatsViewModel(createDomainState());

    expect(viewModel.hero).toMatchObject({
      id: "hero",
      level: 3,
      experience: 235,
      power: expect.any(Number),
      visualProgression: expect.any(Number),
    });
    expect(viewModel.commanders).toEqual([
      expect.objectContaining({
        id: "vanguard-captain",
        level: 3,
        visualProgression: expect.any(Number),
      }),
    ]);
    expect(viewModel.armyUnits).toEqual([
      expect.objectContaining({
        id: "human-peasant",
        quantity: 3,
        totalPower: 15,
      }),
      expect.objectContaining({
        id: "human-soldier",
        quantity: 2,
        totalPower: 24,
      }),
    ]);
  });

  test("uses continuous numeric progression values without renderer-specific tiers", () => {
    const viewModel = createProgressionStatsViewModel(createDomainState());

    expect(viewModel.hero.visualProgression).toBeGreaterThan(0);
    expect(viewModel.hero.visualProgression).toBeLessThan(1);
    expect(viewModel.commanders[0]).not.toHaveProperty("spriteTier");
    expect(viewModel.armyUnits[0]).not.toHaveProperty("spriteName");
  });

  test("reports aggregate power for comparison displays", () => {
    const viewModel = createProgressionStatsViewModel(createDomainState());

    expect(viewModel.aggregate.totalCommanderPower).toBeGreaterThan(0);
    expect(viewModel.aggregate.totalArmyPower).toBe(39);
  });

  test("routes back to hub and requires router/domain state", () => {
    const router = createSceneRouter({
      currentScene: SCENE_IDS.PROGRESSION_STATS,
      domainState: createDomainState(),
    });

    expect(createProgressionStatsScreen({ router }).backToHub().currentScene).toBe(
      SCENE_IDS.MAIN_HUB,
    );
    expect(() => createProgressionStatsScreen()).toThrow(/router/);
    expect(() => createProgressionStatsViewModel()).toThrow(/domainState/);
  });
});
