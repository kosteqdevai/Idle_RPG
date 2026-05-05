const { createGameSession } = require("../../domain/session.js");
const {
  SCENE_IDS,
  ROUTES,
  createSceneRouter,
} = require("../../ui/sceneRouter.js");

describe("Phaser-ready scene state routing", () => {
  test("defines all expected scenes and routes without importing renderer code", () => {
    expect(Object.values(SCENE_IDS)).toEqual([
      "title-load",
      "offline-return",
      "main-hub",
      "zone-map",
      "formation",
      "combat",
      "commander-roster",
      "army-roster",
      "progression-stats",
    ]);
    expect(ROUTES[SCENE_IDS.MAIN_HUB]).toContain(SCENE_IDS.ZONE_MAP);
    expect(ROUTES[SCENE_IDS.MAIN_HUB]).toContain(SCENE_IDS.COMMANDER_ROSTER);
    expect(ROUTES[SCENE_IDS.FORMATION]).toContain(SCENE_IDS.COMBAT);
  });

  test("moves from title/load through offline return and main hub", () => {
    const router = createSceneRouter();

    expect(router.snapshot().currentScene).toBe(SCENE_IDS.TITLE_LOAD);
    expect(router.navigate(SCENE_IDS.OFFLINE_RETURN)).toMatchObject({
      previousScene: SCENE_IDS.TITLE_LOAD,
      currentScene: SCENE_IDS.OFFLINE_RETURN,
    });
    expect(router.navigate(SCENE_IDS.MAIN_HUB)).toMatchObject({
      previousScene: SCENE_IDS.OFFLINE_RETURN,
      currentScene: SCENE_IDS.MAIN_HUB,
    });
  });

  test("routes through hub, zone map, formation, combat, and back without duplicating domain logic", () => {
    const domainState = createGameSession().snapshot();
    const router = createSceneRouter({
      currentScene: SCENE_IDS.MAIN_HUB,
      domainState,
    });

    router.navigate(SCENE_IDS.ZONE_MAP);
    router.navigate(SCENE_IDS.FORMATION, { zoneId: "verdant-kingdom-1" });
    expect(router.snapshot()).toMatchObject({
      currentScene: SCENE_IDS.FORMATION,
      sceneParams: {
        zoneId: "verdant-kingdom-1",
      },
      domainState,
    });

    router.navigate(SCENE_IDS.COMBAT, { zoneId: "verdant-kingdom-1" });
    expect(router.navigate(SCENE_IDS.MAIN_HUB)).toMatchObject({
      currentScene: SCENE_IDS.MAIN_HUB,
      domainState,
    });
  });

  test("routes to roster and progression screens from hub only", () => {
    for (const sceneId of [
      SCENE_IDS.COMMANDER_ROSTER,
      SCENE_IDS.ARMY_ROSTER,
      SCENE_IDS.PROGRESSION_STATS,
    ]) {
      const router = createSceneRouter({
        currentScene: SCENE_IDS.MAIN_HUB,
      });

      expect(router.navigate(sceneId).currentScene).toBe(sceneId);
      expect(router.navigate(SCENE_IDS.MAIN_HUB).currentScene).toBe(
        SCENE_IDS.MAIN_HUB,
      );
    }
  });

  test("rejects illegal scene transitions and unknown scenes", () => {
    const router = createSceneRouter();

    expect(() => router.navigate(SCENE_IDS.COMBAT)).toThrow(/cannot navigate/);
    expect(() => router.navigate("missing-scene")).toThrow(/unknown/);
  });

  test("defensively copies scene params and domain state", () => {
    const domainState = createGameSession().snapshot();
    const router = createSceneRouter({
      currentScene: SCENE_IDS.MAIN_HUB,
      domainState,
    });

    domainState.resources.gold = 999;
    expect(router.snapshot().domainState.resources.gold).toBe(0);

    const params = { zoneId: "verdant-kingdom-1" };
    router.navigate(SCENE_IDS.FORMATION, params);
    params.zoneId = "mutated";
    expect(router.snapshot().sceneParams.zoneId).toBe("verdant-kingdom-1");
  });
});
