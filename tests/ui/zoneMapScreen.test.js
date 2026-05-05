const { createGameSession } = require("../../domain/session.js");
const { createSceneRouter, SCENE_IDS } = require("../../ui/sceneRouter.js");
const {
  createZoneMapViewModel,
  createZoneMapScreen,
} = require("../../ui/zoneMapScreen.js");

describe("zone map screen state", () => {
  test("presents realm selection and zone lock state", () => {
    const domainState = createGameSession({
      progression: {
        unlockedRealmIds: ["verdant-kingdom"],
        completedZoneIds: ["verdant-kingdom-1"],
        currentRealmId: "verdant-kingdom",
        currentZoneId: "verdant-kingdom-2",
      },
    }).snapshot();

    const viewModel = createZoneMapViewModel(domainState);

    expect(viewModel.realms.map((realm) => realm.id)).toEqual([
      "verdant-kingdom",
      "ashen-marches",
      "frostbound-keep",
      "realm-of-infinity",
    ]);
    expect(viewModel.zones.map((zone) => zone.status)).toEqual([
      "completed",
      "current",
      "locked",
      "locked",
      "locked",
    ]);
  });

  test("shows Realm Shard requirements and unlock availability", () => {
    const domainState = createGameSession({
      resources: {
        realmShards: 3,
      },
      progression: {
        unlockedRealmIds: ["verdant-kingdom"],
        completedZoneIds: [
          "verdant-kingdom-1",
          "verdant-kingdom-2",
          "verdant-kingdom-3",
          "verdant-kingdom-4",
          "verdant-kingdom-5",
        ],
        currentRealmId: "verdant-kingdom",
        currentZoneId: "verdant-kingdom-5",
      },
    }).snapshot();

    const ashen = createZoneMapViewModel(domainState).realms.find(
      (realm) => realm.id === "ashen-marches",
    );

    expect(ashen).toMatchObject({
      shardUnlockCost: 3,
      unlocked: false,
      canUnlock: true,
    });
  });

  test("selects realms and routes selected zones to formation", () => {
    const router = createSceneRouter({
      currentScene: SCENE_IDS.ZONE_MAP,
      domainState: createGameSession({
        progression: {
          unlockedRealmIds: ["verdant-kingdom", "ashen-marches"],
          completedZoneIds: [
            "verdant-kingdom-1",
            "verdant-kingdom-2",
            "verdant-kingdom-3",
            "verdant-kingdom-4",
            "verdant-kingdom-5",
          ],
          currentRealmId: "ashen-marches",
          currentZoneId: "ashen-marches-1",
        },
      }).snapshot(),
    });
    const screen = createZoneMapScreen({ router });

    expect(screen.selectRealm("ashen-marches").zones[0]).toMatchObject({
      id: "ashen-marches-1",
      status: "current",
    });
    expect(screen.chooseZone("ashen-marches-1")).toMatchObject({
      currentScene: SCENE_IDS.FORMATION,
      sceneParams: {
        zoneId: "ashen-marches-1",
      },
    });
  });

  test("routes back to hub and requires router/domain state", () => {
    const router = createSceneRouter({
      currentScene: SCENE_IDS.ZONE_MAP,
      domainState: createGameSession().snapshot(),
    });

    expect(createZoneMapScreen({ router }).backToHub().currentScene).toBe(
      SCENE_IDS.MAIN_HUB,
    );
    expect(() => createZoneMapScreen()).toThrow(/router/);
    expect(() => createZoneMapViewModel()).toThrow(/domainState/);
  });
});
