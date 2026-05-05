const {
  COMMANDER_SUMMON_ESSENCE_COST,
  createCommander,
  createCommanderRoster,
} = require("../../domain/commanders.js");
const { createGameSession } = require("../../domain/session.js");
const { createSceneRouter, SCENE_IDS } = require("../../ui/sceneRouter.js");
const {
  createCommanderRosterScreen,
  createCommanderRosterViewModel,
  getCommanderSpriteKey,
  getCommanderSpriteLevel,
} = require("../../ui/commanderRosterScreen.js");

function createDomainState(overrides = {}) {
  return createGameSession({
    resources: {
      essence: COMMANDER_SUMMON_ESSENCE_COST,
      ...(overrides.resources ?? {}),
    },
    roster: {
      ...createCommanderRoster(overrides.commanderRoster ?? {}),
      ...(overrides.roster ?? {}),
    },
  }).snapshot();
}

describe("commander roster screen state", () => {
  test("lists summoned commanders, active slots, summon options, and unique sprite keys", () => {
    const commander = createCommander("vanguard-captain", {
      level: 3,
      experience: 184,
    });
    const domainState = createDomainState({
      commanderRoster: {
        commanders: [commander],
        activeCommanderIds: [commander.id],
      },
    });

    expect(createCommanderRosterViewModel(domainState)).toMatchObject({
      essence: COMMANDER_SUMMON_ESSENCE_COST,
      activeSlotCap: 4,
      activeCommanderIds: ["vanguard-captain"],
      commanders: [
        {
          id: "vanguard-captain",
          active: true,
          spriteKey: "vanguard-captain-unique-lv2",
          iconPath: "assets/commanders/icons/vanguard-captain.svg",
          spritePath: "assets/commanders/sprites/vanguard-captain-lv2.svg",
        },
      ],
      summonOptions: expect.arrayContaining([
        expect.objectContaining({
          id: "vanguard-captain",
          iconPath: "assets/commanders/icons/vanguard-captain.svg",
          summoned: true,
        }),
        expect.objectContaining({
          id: "longbow-marshal",
          summoned: false,
        }),
      ]),
      error: null,
    });
  });

  test("uses three unique commander sprite levels from commander level", () => {
    expect(getCommanderSpriteLevel(createCommander("vanguard-captain"))).toBe(1);
    expect(
      getCommanderSpriteLevel(
        createCommander("vanguard-captain", { level: 3, experience: 184 }),
      ),
    ).toBe(2);
    expect(
      getCommanderSpriteKey(
        createCommander("vanguard-captain", { level: 6, experience: 595 }),
      ),
    ).toBe("vanguard-captain-unique-lv3");
  });

  test("summons with Essence only and updates domain state", () => {
    const router = createSceneRouter({
      currentScene: SCENE_IDS.COMMANDER_ROSTER,
      domainState: createDomainState(),
    });
    const screen = createCommanderRosterScreen({ router });

    const viewModel = screen.summon("vanguard-captain");

    expect(viewModel.error).toBeNull();
    expect(viewModel.essence).toBe(0);
    expect(viewModel.commanders.map((commander) => commander.id)).toEqual([
      "vanguard-captain",
    ]);
    expect(router.snapshot().domainState.resources.gold).toBe(0);
  });

  test("reports summon errors for missing Essence, duplicates, and roster cap", () => {
    const noEssenceScreen = createCommanderRosterScreen({
      router: createSceneRouter({
        currentScene: SCENE_IDS.COMMANDER_ROSTER,
        domainState: createDomainState({
          resources: {
            essence: COMMANDER_SUMMON_ESSENCE_COST - 1,
            gold: 999,
          },
        }),
      }),
    });

    expect(noEssenceScreen.summon("vanguard-captain").error).toMatch(/Essence/);

    const duplicateScreen = createCommanderRosterScreen({
      router: createSceneRouter({
        currentScene: SCENE_IDS.COMMANDER_ROSTER,
        domainState: createDomainState({
          resources: {
            essence: COMMANDER_SUMMON_ESSENCE_COST * 2,
          },
        }),
      }),
    });
    duplicateScreen.summon("vanguard-captain");
    expect(duplicateScreen.summon("vanguard-captain").error).toMatch(/permanent/);

    const fullRoster = [
      "vanguard-captain",
      "longbow-marshal",
      "cavalry-banneret",
      "shield-sergeant",
      "siege-overseer",
      "ember-tactician",
      "iron-chaplain",
      "falcon-scoutmaster",
      "royal-standardbearer",
      "infinity-herald",
    ].map((id) => createCommander(id));
    const fullScreen = createCommanderRosterScreen({
      router: createSceneRouter({
        currentScene: SCENE_IDS.COMMANDER_ROSTER,
        domainState: createDomainState({
          resources: {
            essence: COMMANDER_SUMMON_ESSENCE_COST,
          },
          commanderRoster: {
            commanders: fullRoster,
          },
        }),
      }),
    });

    expect(fullScreen.summon("vanguard-captain").error).toMatch(/cap/);
  });

  test("manages active slots and reports slot cap errors", () => {
    const commanders = [
      "vanguard-captain",
      "longbow-marshal",
      "cavalry-banneret",
      "shield-sergeant",
      "siege-overseer",
    ].map((id) => createCommander(id));
    const screen = createCommanderRosterScreen({
      router: createSceneRouter({
        currentScene: SCENE_IDS.COMMANDER_ROSTER,
        domainState: createDomainState({
          commanderRoster: {
            commanders,
            activeCommanderIds: commanders.slice(0, 4).map((commander) => commander.id),
          },
        }),
      }),
    });

    expect(screen.activate("siege-overseer").error).toMatch(/slot cap/);
    expect(screen.deactivate("vanguard-captain").activeCommanderIds).toEqual([
      "longbow-marshal",
      "cavalry-banneret",
      "shield-sergeant",
    ]);
    expect(screen.activate("siege-overseer").activeCommanderIds).toContain(
      "siege-overseer",
    );
  });

  test("routes back to hub and requires router/domain state", () => {
    const router = createSceneRouter({
      currentScene: SCENE_IDS.COMMANDER_ROSTER,
      domainState: createDomainState(),
    });

    expect(createCommanderRosterScreen({ router }).backToHub().currentScene).toBe(
      SCENE_IDS.MAIN_HUB,
    );
    expect(() => createCommanderRosterScreen()).toThrow(/router/);
    expect(() => createCommanderRosterViewModel()).toThrow(/domainState/);
  });
});
