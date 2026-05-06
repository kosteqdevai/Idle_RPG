const { createArmyUnit, createStartingArmyRoster } = require("../../domain/army.js");
const {
  createCommander,
  createCommanderRoster,
} = require("../../domain/commanders.js");
const { createDefaultFormation } = require("../../domain/formation.js");
const { createGameSession } = require("../../domain/session.js");
const { createSceneRouter, SCENE_IDS } = require("../../ui/sceneRouter.js");
const {
  createCombatViewModel,
  createCombatScreen,
} = require("../../ui/combatScreen.js");

function createDomainState() {
  const commander = createCommander("vanguard-captain");
  const roster = {
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
  };
  return createGameSession({
    roster,
    formation: createDefaultFormation(roster),
    roster: {
      ...roster,
      hero: {
        experience: 420,
      },
    },
  }).snapshot();
}

describe("combat scene state", () => {
  test("starts autonomous combat and exposes participants, rewards, and logs", () => {
    const router = createSceneRouter({
      currentScene: SCENE_IDS.COMBAT,
      domainState: createDomainState(),
    });
    const screen = createCombatScreen({ router, seed: "combat-ui" });
    const viewModel = screen.start("verdant-kingdom-1");

    expect(viewModel).toMatchObject({
      outcome: "win",
      activeInputEnabled: false,
      participants: {
        hero: {
          id: "hero",
        },
      },
      rewards: {
        gold: expect.any(Number),
        essence: expect.any(Number),
        realmShards: 0,
        corpseDrop: expect.any(Object),
      },
    });
    expect(viewModel.participants.formation.map((unit) => unit.id)).toContain(
      "vanguard-captain",
    );
    expect(viewModel.log.map((entry) => entry.type)).toContain("combat-won");
  });

  test("finish applies rewards and routes to hub with combat summary", () => {
    const router = createSceneRouter({
      currentScene: SCENE_IDS.COMBAT,
      domainState: createDomainState(),
    });
    const screen = createCombatScreen({ router, seed: "combat-ui" });

    screen.start("verdant-kingdom-1");
    const beforeExperience = router.snapshot().domainState.roster.hero.experience;
    const nextState = screen.finishToHub();

    expect(nextState.currentScene).toBe(SCENE_IDS.MAIN_HUB);
    expect(nextState.domainState.resources.gold).toBeGreaterThan(0);
    expect(Object.values(nextState.domainState.resources.corpses).some(Boolean)).toBe(true);
    expect(nextState.domainState.roster.hero.experience).toBeGreaterThan(
      beforeExperience,
    );
    expect(nextState.domainState.progression.completedZoneIds).toContain(
      "verdant-kingdom-1",
    );
    expect(nextState.sceneParams.combatSummary.rewards.heroExperience).toBeGreaterThan(0);
    expect(nextState.sceneParams.combatSummary.activeInputEnabled).toBe(false);
  });

  test("can route from combat to zone map after summary application", () => {
    const router = createSceneRouter({
      currentScene: SCENE_IDS.COMBAT,
      domainState: createDomainState(),
    });
    const screen = createCombatScreen({ router, seed: "combat-ui" });

    screen.start("verdant-kingdom-1");
    expect(screen.finishToZoneMap().currentScene).toBe(SCENE_IDS.ZONE_MAP);
  });

  test("requires combat result and router", () => {
    expect(() => createCombatViewModel()).toThrow(/combatResult/);
    expect(() => createCombatScreen()).toThrow(/router/);

    const screen = createCombatScreen({
      router: createSceneRouter({
        currentScene: SCENE_IDS.COMBAT,
        domainState: createDomainState(),
      }),
    });

    expect(() => screen.getViewModel()).toThrow(/combatResult/);
    expect(() => screen.finishToHub()).toThrow(/started/);
  });
});
