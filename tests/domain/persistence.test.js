const { createArmyUnit } = require("../../domain/army.js");
const { createCommander } = require("../../domain/commanders.js");
const { createGameSession } = require("../../domain/session.js");
const {
  DEFAULT_SAVE_KEY,
  MemoryStorageAdapter,
  serializeGameState,
  deserializeGameState,
  saveGame,
  loadGame,
  deleteSave,
} = require("../../domain/persistence.js");

function createFullState() {
  const commander = createCommander("vanguard-captain");

  return createGameSession({
    tick: 42,
    elapsedSeconds: 42,
    savedAt: "2026-05-05T02:00:00.000Z",
    lastSeenAt: "2026-05-05T01:00:00.000Z",
    resources: {
      gold: 123,
      essence: 25,
      realmShards: 3,
      corpses: {
        "human-peasant-corpse": 2,
      },
    },
    roster: {
      hero: {
        experience: 235,
      },
      commanders: [commander],
      activeCommanderIds: [commander.id],
      armyUnits: [
        createArmyUnit("human-peasant", { quantity: 2 }),
        createArmyUnit("human-soldier", { quantity: 1 }),
      ],
    },
    formation: {
      slots: [
        {
          slotId: "back-center",
          occupantType: "commander",
          occupantId: commander.id,
        },
      ],
    },
    progression: {
      unlockedRealmIds: ["verdant-kingdom"],
      completedZoneIds: ["verdant-kingdom-1"],
      currentRealmId: "verdant-kingdom",
      currentZoneId: "verdant-kingdom-2",
      infinityDepth: 0,
    },
    visualProgression: {
      hero: 0.35,
      commanders: {
        [commander.id]: 0.1,
      },
      armyUnits: {
        "human-peasant": 0.2,
      },
    },
  }).snapshot();
}

describe("storage abstraction and persistence", () => {
  test("serializes and restores full game state through the session validator", () => {
    const state = createFullState();
    const restored = deserializeGameState(serializeGameState(state));

    expect(restored).toEqual(state);
    expect(restored.roster.hero.level).toBe(3);
    expect(restored.roster.commanders).toHaveLength(1);
    expect(restored.roster.armyUnits).toHaveLength(2);
    expect(restored.formation.slots).toHaveLength(1);
    expect(restored.progression.currentZoneId).toBe("verdant-kingdom-2");
    expect(restored.visualProgression).toMatchObject({
      hero: 0.35,
      commanders: {
        "vanguard-captain": 0.1,
      },
      armyUnits: {
        "human-peasant": 0.2,
      },
    });
  });

  test("saves and loads through a storage adapter without browser APIs", () => {
    const storage = new MemoryStorageAdapter();
    const state = createFullState();

    const saveResult = saveGame(storage, state, {
      savedAt: "2026-05-05T03:00:00.000Z",
    });
    const loaded = loadGame(storage);

    expect(saveResult.key).toBe(DEFAULT_SAVE_KEY);
    expect(saveResult.savedAt).toBe("2026-05-05T03:00:00.000Z");
    expect(storage.getItem(DEFAULT_SAVE_KEY)).toBe(saveResult.serialized);
    expect(loaded).toMatchObject({
      tick: 42,
      elapsedSeconds: 42,
      savedAt: "2026-05-05T03:00:00.000Z",
      lastSeenAt: "2026-05-05T01:00:00.000Z",
      resources: {
        gold: 123,
        essence: 25,
        realmShards: 3,
        corpses: {
          "human-peasant-corpse": 2,
        },
      },
    });
  });

  test("supports custom keys and deleting saves through the adapter", () => {
    const storage = new MemoryStorageAdapter();
    const state = createFullState();

    saveGame(storage, state, { key: "slot-a" });
    expect(loadGame(storage, { key: "slot-a" })).not.toBeNull();

    deleteSave(storage, { key: "slot-a" });
    expect(loadGame(storage, { key: "slot-a" })).toBeNull();
  });

  test("returns null when no save exists", () => {
    expect(loadGame(new MemoryStorageAdapter())).toBeNull();
  });

  test("rejects invalid adapters and unsupported save versions", () => {
    expect(() => saveGame({}, createFullState())).toThrow(/adapter/);
    expect(() => loadGame({ getItem: () => "{}", setItem: () => {} })).toThrow(
      /version/,
    );
    expect(() =>
      deserializeGameState(JSON.stringify({ version: 999, state: {} })),
    ).toThrow(/version/);
  });
});
