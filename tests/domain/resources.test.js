const {
  COMMANDER_SUMMON_ESSENCE_COST,
  createCommanderRoster,
  summonCommander,
} = require("../../domain/commanders.js");
const {
  createWorldProgression,
  unlockRealm,
} = require("../../domain/world.js");
const {
  createResources,
  addResources,
  applyCombatRewards,
  spendCommanderSummonResources,
  spendRealmUnlockResources,
} = require("../../domain/resources.js");

describe("resource economy and reward rules", () => {
  test("creates and adds the three supported resources", () => {
    expect(createResources()).toEqual({
      gold: 0,
      essence: 0,
      realmShards: 0,
    });
    expect(
      addResources(
        { gold: 5, essence: 1, realmShards: 2 },
        { gold: 7, essence: 3, realmShards: 4 },
      ),
    ).toEqual({
      gold: 12,
      essence: 4,
      realmShards: 6,
    });
  });

  test("applies combat rewards with explicit resource sources", () => {
    const result = applyCombatRewards(
      { gold: 1, essence: 0, realmShards: 0 },
      "verdant-kingdom-3",
      { gold: 50, essence: 1, realmShards: 1 },
    );

    expect(result.resources).toEqual({
      gold: 51,
      essence: 1,
      realmShards: 1,
    });
    expect(result.sources).toEqual({
      gold: "combat",
      essence: "rare-combat-drop",
      realmShards: "specific-zone-drop",
    });
  });

  test("rejects Realm Shards that do not match the specific zone drop", () => {
    expect(() =>
      applyCombatRewards(
        { gold: 0, essence: 0, realmShards: 0 },
        "verdant-kingdom-1",
        { gold: 10, essence: 0, realmShards: 1 },
      ),
    ).toThrow(/Realm Shards/);
  });

  test("commander summoning consumes Essence only and never falls back to Gold", () => {
    expect(
      spendCommanderSummonResources({
        gold: 999,
        essence: COMMANDER_SUMMON_ESSENCE_COST,
        realmShards: 0,
      }),
    ).toEqual({
      gold: 999,
      essence: 0,
      realmShards: 0,
    });
    expect(() =>
      spendCommanderSummonResources({
        gold: 999999,
        essence: COMMANDER_SUMMON_ESSENCE_COST - 1,
        realmShards: 0,
      }),
    ).toThrow(/Essence/);

    const summonResult = summonCommander(
      createCommanderRoster(),
      { gold: 999, essence: COMMANDER_SUMMON_ESSENCE_COST, realmShards: 3 },
      "vanguard-captain",
    );
    expect(summonResult.resources).toEqual({
      gold: 999,
      essence: 0,
      realmShards: 3,
    });
  });

  test("realm unlocks consume Realm Shards only and Gold cannot substitute", () => {
    expect(
      spendRealmUnlockResources({ gold: 999, essence: 4, realmShards: 3 }, 3),
    ).toEqual({
      gold: 999,
      essence: 4,
      realmShards: 0,
    });
    expect(() =>
      spendRealmUnlockResources({ gold: 999999, essence: 4, realmShards: 2 }, 3),
    ).toThrow(/Realm Shards/);

    const progression = createWorldProgression({
      completedZoneIds: [
        "verdant-kingdom-1",
        "verdant-kingdom-2",
        "verdant-kingdom-3",
        "verdant-kingdom-4",
        "verdant-kingdom-5",
      ],
    });
    const unlockResult = unlockRealm(
      progression,
      { gold: 999, essence: 4, realmShards: 3 },
      "ashen-marches",
    );

    expect(unlockResult.resources).toEqual({
      gold: 999,
      essence: 4,
      realmShards: 0,
    });
  });

  test("rejects negative or fractional resource values", () => {
    expect(() => createResources({ gold: -1 })).toThrow(RangeError);
    expect(() => createResources({ essence: 1.5 })).toThrow(RangeError);
    expect(() => addResources({}, { realmShards: -1 })).toThrow(RangeError);
  });
});
