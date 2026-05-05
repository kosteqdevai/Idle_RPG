const {
  FINITE_REALMS,
  REALM_IDS,
  REALM_OF_INFINITY,
  createWorldProgression,
  getRealm,
  getZone,
  getDesignedZones,
  getZoneStatus,
  canEnterZone,
  completeZone,
  canUnlockRealm,
  unlockRealm,
  getInfinityEncounter,
} = require("../../domain/world.js");

describe("realm and zone progression model", () => {
  test("defines 3 designed realms with 5 zones each", () => {
    expect(FINITE_REALMS).toHaveLength(3);
    expect(FINITE_REALMS.map((realm) => realm.zones.length)).toEqual([
      5,
      5,
      5,
    ]);
    expect(getDesignedZones()).toHaveLength(15);
    expect(getRealm("verdant-kingdom")).toMatchObject({
      index: 1,
      theme: expect.any(String),
    });
    expect(getZone("ashen-marches-3")).toMatchObject({
      realmId: "ashen-marches",
      index: 3,
      enemyPower: 315,
    });
  });

  test("starts in the first realm and first zone with only Verdant Kingdom unlocked", () => {
    const progression = createWorldProgression();

    expect(progression).toEqual({
      unlockedRealmIds: [REALM_IDS.VERDANT_KINGDOM],
      completedZoneIds: [],
      currentRealmId: REALM_IDS.VERDANT_KINGDOM,
      currentZoneId: "verdant-kingdom-1",
      infinityDepth: 0,
    });
    expect(getZoneStatus(progression, "verdant-kingdom-1")).toBe("current");
    expect(getZoneStatus(progression, "verdant-kingdom-2")).toBe("locked");
  });

  test("allows designed zones only when realm and previous zone requirements are met", () => {
    let progression = createWorldProgression();

    expect(canEnterZone(progression, "verdant-kingdom-1")).toBe(true);
    expect(canEnterZone(progression, "verdant-kingdom-2")).toBe(false);

    progression = completeZone(progression, "verdant-kingdom-1");

    expect(progression.completedZoneIds).toEqual(["verdant-kingdom-1"]);
    expect(progression.currentZoneId).toBe("verdant-kingdom-2");
    expect(canEnterZone(progression, "verdant-kingdom-2")).toBe(true);
    expect(getZoneStatus(progression, "verdant-kingdom-1")).toBe("completed");
  });

  test("uses Realm Shards and previous realm completion to unlock the next realm", () => {
    const progression = createWorldProgression({
      completedZoneIds: FINITE_REALMS[0].zones.map((zone) => zone.id),
    });

    expect(canUnlockRealm(progression, { realmShards: 2 }, "ashen-marches")).toBe(
      false,
    );
    expect(canUnlockRealm(progression, { realmShards: 3 }, "ashen-marches")).toBe(
      true,
    );

    const result = unlockRealm(
      progression,
      { gold: 10, essence: 5, realmShards: 3 },
      "ashen-marches",
    );

    expect(result.progression.unlockedRealmIds).toEqual([
      "verdant-kingdom",
      "ashen-marches",
    ]);
    expect(result.progression.currentZoneId).toBe("ashen-marches-1");
    expect(result.resources).toEqual({
      gold: 10,
      essence: 5,
      realmShards: 0,
    });
  });

  test("represents Realm of Infinity as endless escalation data without designed zones", () => {
    expect(REALM_OF_INFINITY).toMatchObject({
      id: REALM_IDS.REALM_OF_INFINITY,
      endless: true,
    });
    expect(REALM_OF_INFINITY).not.toHaveProperty("zones");

    expect(getInfinityEncounter(1)).toEqual({
      realmId: REALM_IDS.REALM_OF_INFINITY,
      depth: 1,
      enemyPower: 1500,
      shardReward: 0,
    });
    expect(getInfinityEncounter(5)).toMatchObject({
      depth: 5,
      shardReward: 1,
    });
    expect(getInfinityEncounter(6).enemyPower).toBeGreaterThan(
      getInfinityEncounter(5).enemyPower,
    );
  });

  test("requires all designed zones and shards before unlocking Realm of Infinity", () => {
    const allDesignedZoneIds = getDesignedZones().map((zone) => zone.id);
    const incompleteProgression = createWorldProgression({
      unlockedRealmIds: [
        "verdant-kingdom",
        "ashen-marches",
        "frostbound-keep",
      ],
      completedZoneIds: allDesignedZoneIds.slice(0, -1),
      currentRealmId: "frostbound-keep",
      currentZoneId: "frostbound-keep-5",
    });

    expect(
      canUnlockRealm(incompleteProgression, { realmShards: 99 }, "realm-of-infinity"),
    ).toBe(false);

    const completeProgression = createWorldProgression({
      ...incompleteProgression,
      completedZoneIds: allDesignedZoneIds,
    });

    expect(
      canUnlockRealm(completeProgression, { realmShards: 14 }, "realm-of-infinity"),
    ).toBe(false);
    expect(
      canUnlockRealm(completeProgression, { realmShards: 15 }, "realm-of-infinity"),
    ).toBe(true);
  });

  test("rejects invalid progression and unknown content", () => {
    expect(() => getRealm("missing-realm")).toThrow(/unknown/);
    expect(() => getZone("realm-of-infinity-1")).toThrow(/unknown/);
    expect(() =>
      createWorldProgression({
        unlockedRealmIds: ["ashen-marches"],
      }),
    ).toThrow(/Verdant/);
    expect(() => completeZone(createWorldProgression(), "verdant-kingdom-2"))
      .toThrow(/available/);
    expect(() => getInfinityEncounter(0)).toThrow(/positive/);
  });
});
