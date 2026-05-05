const { createGameSession } = require("../../domain/session.js");
const {
  MemoryStorageAdapter,
  saveGame,
} = require("../../domain/persistence.js");
const { createSceneRouter, SCENE_IDS } = require("../../ui/sceneRouter.js");
const { createTitleLoadScreen } = require("../../ui/titleLoadScreen.js");

describe("title and load screen state", () => {
  test("starts a new game and routes to main hub", () => {
    const router = createSceneRouter();
    const screen = createTitleLoadScreen({ router });
    const nextState = screen.startNewGame();

    expect(nextState).toMatchObject({
      currentScene: SCENE_IDS.MAIN_HUB,
      sceneParams: {
        mode: "new-game",
      },
      domainState: {
        tick: 0,
        resources: {
          gold: 0,
          essence: 0,
          realmShards: 0,
        },
      },
    });
  });

  test("loads a saved game through the storage abstraction and routes to main hub", () => {
    const storage = new MemoryStorageAdapter();
    const savedState = createGameSession({
      tick: 9,
      resources: {
        gold: 40,
      },
    }).snapshot();
    saveGame(storage, savedState, {
      savedAt: "2026-05-05T01:00:00.000Z",
    });
    const router = createSceneRouter();
    const screen = createTitleLoadScreen({ storage, router });

    expect(screen.loadSavedGame()).toMatchObject({
      currentScene: SCENE_IDS.MAIN_HUB,
      sceneParams: {
        mode: "loaded-game",
      },
      domainState: {
        tick: 9,
        resources: {
          gold: 40,
        },
      },
    });
  });

  test("routes loaded saves with offline elapsed time to offline return", () => {
    const storage = new MemoryStorageAdapter();
    const savedState = createGameSession({
      lastSeenAt: "2026-05-05T00:00:00.000Z",
      progression: {
        unlockedRealmIds: ["verdant-kingdom"],
        completedZoneIds: ["verdant-kingdom-1"],
        currentRealmId: "verdant-kingdom",
        currentZoneId: "verdant-kingdom-2",
      },
    }).snapshot();
    saveGame(storage, savedState);
    const router = createSceneRouter();
    const screen = createTitleLoadScreen({
      storage,
      router,
      now: "2026-05-05T02:00:00.000Z",
    });

    expect(screen.loadSavedGame()).toMatchObject({
      currentScene: SCENE_IDS.OFFLINE_RETURN,
      sceneParams: {
        offlineSummary: {
          lastActiveZoneId: "verdant-kingdom-2",
          cappedElapsedSeconds: 7200,
          rewards: {
            gold: 23,
            essence: 0,
            realmShards: 0,
          },
          resolvedCombat: false,
        },
      },
    });
  });

  test("falls back to new game when no save exists", () => {
    const router = createSceneRouter();
    const screen = createTitleLoadScreen({
      storage: new MemoryStorageAdapter(),
      router,
    });

    expect(screen.loadSavedGame()).toMatchObject({
      currentScene: SCENE_IDS.MAIN_HUB,
      sceneParams: {
        mode: "new-game",
      },
    });
  });

  test("requires a router and storage for load", () => {
    expect(() => createTitleLoadScreen()).toThrow(/router/);
    expect(() =>
      createTitleLoadScreen({ router: createSceneRouter() }).loadSavedGame(),
    ).toThrow(/storage/);
  });
});
