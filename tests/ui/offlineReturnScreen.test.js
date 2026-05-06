const { calculateOfflineProgress } = require("../../domain/offline.js");
const { createGameSession } = require("../../domain/session.js");
const { createSceneRouter, SCENE_IDS } = require("../../ui/sceneRouter.js");
const {
  createOfflineReturnScreen,
  createOfflineReturnViewModel,
} = require("../../ui/offlineReturnScreen.js");

function createOfflineSummary() {
  return calculateOfflineProgress({
    lastSeenAt: "2026-05-05T00:00:00.000Z",
    now: "2026-05-05T08:00:00.000Z",
    lastActiveZoneId: "verdant-kingdom-5",
  });
}

describe("offline return screen state", () => {
  test("summarizes capped Gold and Essence rewards with no combat", () => {
    expect(createOfflineReturnViewModel(createOfflineSummary())).toEqual({
      lastActiveZoneId: "verdant-kingdom-5",
      elapsedSeconds: 28800,
      wasCapped: false,
      rewards: {
        gold: 223,
        essence: 3,
        realmShards: 0,
      },
      resolvedCombat: false,
    });
  });

  test("collects offline resources once and routes to main hub", () => {
    const router = createSceneRouter({
      currentScene: SCENE_IDS.OFFLINE_RETURN,
      domainState: createGameSession({
        lastSeenAt: "2026-05-05T00:00:00.000Z",
        resources: {
          gold: 10,
          essence: 1,
          realmShards: 4,
        },
      }).snapshot(),
      sceneParams: {
        offlineSummary: createOfflineSummary(),
      },
    });
    const screen = createOfflineReturnScreen({ router });

    const nextState = screen.collectAndContinue();

    expect(nextState).toMatchObject({
      currentScene: SCENE_IDS.MAIN_HUB,
      domainState: {
        resources: {
          gold: 233,
          essence: 4,
          realmShards: 4,
          corpses: {},
        },
        lastSeenAt: null,
      },
      sceneParams: {
        offlineSummary: {
          resolvedCombat: false,
          rewards: {
            realmShards: 0,
          },
        },
      },
    });
  });

  test("rejects summaries that try to award Realm Shards or resolve combat", () => {
    const router = createSceneRouter({
      currentScene: SCENE_IDS.OFFLINE_RETURN,
      domainState: createGameSession().snapshot(),
      sceneParams: {
        offlineSummary: {
          ...createOfflineSummary(),
          rewards: {
            gold: 1,
            essence: 0,
            realmShards: 1,
          },
        },
      },
    });

    expect(() => createOfflineReturnScreen({ router }).collectAndContinue()).toThrow(
      /Realm Shards/,
    );
  });

  test("requires router and offline summary", () => {
    expect(() => createOfflineReturnScreen()).toThrow(/router/);
    expect(() => createOfflineReturnViewModel()).toThrow(/offlineSummary/);
    expect(() =>
      createOfflineReturnScreen({
        router: createSceneRouter({
          currentScene: SCENE_IDS.OFFLINE_RETURN,
          domainState: createGameSession().snapshot(),
        }),
      }).getViewModel(),
    ).toThrow(/offline summary/);
  });
});
