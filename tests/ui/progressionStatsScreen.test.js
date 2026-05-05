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
      ...createStartingArmyRoster(),
      armyUnits: [
        createArmyUnit("infantry", { level: 4, experience: 172 }),
        createArmyUnit("archer"),
      ],
      armyComposition: [
        { unitId: "infantry", count: 6 },
        { unitId: "archer", count: 4 },
      ],
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
  test("displays hero, commander, and army growth data with visual progression", () => {
    const viewModel = createProgressionStatsViewModel(createDomainState());

    expect(viewModel.hero).toMatchObject({
      id: "hero",
      level: 3,
      experience: 235,
      power: expect.any(Number),
      visualProgression: expect.any(Number),
      stats: {
        attack: 16,
        defense: 10,
        health: 136,
      },
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
        id: "infantry",
        level: 4,
        visualProgression: expect.any(Number),
      }),
      expect.objectContaining({
        id: "archer",
        level: 1,
        visualProgression: 0,
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
    expect(viewModel.aggregate.totalArmyPower).toBeGreaterThan(0);
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
