const {
  calculateOfflineProgress,
  applyOfflineProgress,
} = require("../../domain/offline.js");

describe("offline progress engine", () => {
  test("calculates Gold and Essence from the last active zone", () => {
    const progress = calculateOfflineProgress({
      lastSeenAt: "2026-05-05T00:00:00.000Z",
      now: "2026-05-05T02:00:00.000Z",
      lastActiveZoneId: "ashen-marches-3",
    });

    expect(progress).toEqual({
      lastActiveZoneId: "ashen-marches-3",
      rawElapsedSeconds: 7200,
      cappedElapsedSeconds: 7200,
      wasCapped: false,
      rewards: {
        gold: 113,
        essence: 0,
        realmShards: 0,
      },
      resolvedCombat: false,
    });
  });

  test("caps offline progress at 8 hours", () => {
    const progress = calculateOfflineProgress({
      lastSeenAt: "2026-05-05T00:00:00.000Z",
      now: "2026-05-05T12:30:00.000Z",
      lastActiveZoneId: "frostbound-keep-5",
    });

    expect(progress.rawElapsedSeconds).toBe(45000);
    expect(progress.cappedElapsedSeconds).toBe(28800);
    expect(progress.wasCapped).toBe(true);
    expect(progress.rewards).toEqual({
      gold: 1843,
      essence: 3,
      realmShards: 0,
    });
  });

  test("applies offline rewards without resolving combat or mutating other state", () => {
    const progress = calculateOfflineProgress({
      lastSeenAt: "2026-05-05T00:00:00.000Z",
      now: "2026-05-05T08:00:00.000Z",
      lastActiveZoneId: "verdant-kingdom-5",
    });
    const result = applyOfflineProgress(
      { gold: 10, essence: 1, realmShards: 7 },
      progress,
    );

    expect(result.resources).toEqual({
      gold: 233,
      essence: 4,
      realmShards: 7,
      corpses: {},
    });
    expect(result.summary).toMatchObject({
      lastActiveZoneId: "verdant-kingdom-5",
      elapsedSeconds: 28800,
      resolvedCombat: false,
    });
  });

  test("never awards Realm Shards or accepts combat-resolving offline summaries", () => {
    expect(() =>
      applyOfflineProgress(
        { gold: 0, essence: 0, realmShards: 0 },
        {
          lastActiveZoneId: "verdant-kingdom-5",
          cappedElapsedSeconds: 3600,
          wasCapped: false,
          rewards: { gold: 1, essence: 0, realmShards: 1 },
          resolvedCombat: false,
        },
      ),
    ).toThrow(/Realm Shards/);
    expect(() =>
      applyOfflineProgress(
        { gold: 0, essence: 0, realmShards: 0 },
        {
          lastActiveZoneId: "verdant-kingdom-5",
          cappedElapsedSeconds: 3600,
          wasCapped: false,
          rewards: { gold: 1, essence: 0, realmShards: 0 },
          resolvedCombat: true,
        },
      ),
    ).toThrow(/combat/);
  });

  test("rejects invalid dates and unknown zones", () => {
    expect(() =>
      calculateOfflineProgress({
        lastSeenAt: "bad-date",
        now: "2026-05-05T00:00:00.000Z",
        lastActiveZoneId: "verdant-kingdom-1",
      }),
    ).toThrow(/lastSeenAt/);
    expect(() =>
      calculateOfflineProgress({
        lastSeenAt: "2026-05-05T00:00:00.000Z",
        now: "2026-05-05T01:00:00.000Z",
        lastActiveZoneId: "realm-of-infinity-1",
      }),
    ).toThrow(/unknown/);
  });
});
