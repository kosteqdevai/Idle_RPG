const { createArmyUnit, createStartingArmyRoster } = require("../../domain/army.js");
const { createCommander, createCommanderRoster } = require("../../domain/commanders.js");
const { createGameSession } = require("../../domain/session.js");
const {
  createVisualRenderData,
  getCommanderAssetPath,
  interpolateVisualProperties,
} = require("../../ui/visualProgressionPipeline.js");

describe("placeholder asset and visual progression pipeline", () => {
  test("interpolates renderer properties from continuous progression values", () => {
    expect(interpolateVisualProperties(0)).toEqual({
      scale: 1,
      glowIntensity: 0,
      particleDensity: 0,
      overlayOpacity: 0,
    });
    expect(interpolateVisualProperties(0.5)).toEqual({
      scale: 1.175,
      glowIntensity: 0.45,
      particleDensity: 0.75,
      overlayOpacity: 0.4,
    });
  });

  test("uses 3 unique commander placeholder sprite levels", () => {
    expect(getCommanderAssetPath("vanguard-captain", 0.1)).toBe(
      "assets/commanders/sprites/vanguard-captain-lv1.svg",
    );
    expect(getCommanderAssetPath("vanguard-captain", 0.4)).toBe(
      "assets/commanders/sprites/vanguard-captain-lv2.svg",
    );
    expect(getCommanderAssetPath("vanguard-captain", 0.9)).toBe(
      "assets/commanders/sprites/vanguard-captain-lv3.svg",
    );
  });

  test("creates placeholder render data for hero, commanders, army units, and realms", () => {
    const commander = createCommander("vanguard-captain", {
      level: 6,
      experience: 595,
    });
    const domainState = createGameSession({
      roster: {
        ...createStartingArmyRoster(),
        armyUnits: [
          createArmyUnit("human-peasant", { quantity: 3 }),
          createArmyUnit("human-soldier"),
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

    const renderData = createVisualRenderData(domainState);

    expect(renderData.style).toMatchObject({
      pixelArt: true,
      commanderVisualLevels: 3,
    });
    expect(renderData.hero.sprite).toBe("assets/placeholders/hero.png");
    expect(renderData.commanders[0].sprite).toMatch(
      /vanguard-captain-lv/,
    );
    expect(renderData.commanders[0].icon).toBe(
      "assets/commanders/icons/vanguard-captain.svg",
    );
    expect(renderData.armyUnits.map((unit) => unit.sprite)).toEqual([
      "assets/placeholders/army/human-peasant.png",
      "assets/placeholders/army/human-soldier.png",
    ]);
    expect(renderData.realm.sprite).toBe(
      "assets/placeholders/realms/verdant-kingdom.png",
    );
    expect(renderData.hero.properties.glowIntensity).toBeGreaterThan(0);
  });

  test("rejects missing domain state", () => {
    expect(() => createVisualRenderData()).toThrow(/domainState/);
  });
});
