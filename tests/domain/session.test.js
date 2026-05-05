const { createGameSession, SESSION_STATUS } = require("../../domain/session.js");

describe("core game session state", () => {
  test("initializes a new pure domain session with the required state surface", () => {
    const session = createGameSession();
    const state = session.snapshot();

    expect(state.status).toBe(SESSION_STATUS.RUNNING);
    expect(state.tick).toBe(0);
    expect(state.elapsedSeconds).toBe(0);
    expect(state.realm).toMatchObject({
      id: "verdant-kingdom",
      index: 1,
    });
    expect(state.zone).toMatchObject({
      id: "verdant-kingdom-1",
      index: 1,
    });
    expect(state.roster.hero).toMatchObject({
      id: "hero",
      level: 1,
      power: 52.2,
      visualProgression: 0,
    });
    expect(state.roster.commanders).toEqual([]);
    expect(state.roster.activeCommanderIds).toEqual([]);
    expect(state.roster.armyUnits).toEqual([]);
    expect(state.roster.armyComposition).toEqual([]);
    expect(state.roster.activeFormationUnitIds).toEqual([]);
    expect(state.formation.slots).toEqual([]);
    expect(state.resources).toEqual({
      gold: 0,
      essence: 0,
      realmShards: 0,
    });
    expect(state.visualProgression).toEqual({
      hero: 0,
      commanders: {},
      armyUnits: {},
    });
    expect(state.progression).toMatchObject({
      unlockedRealmIds: ["verdant-kingdom"],
      currentRealmId: "verdant-kingdom",
      currentZoneId: "verdant-kingdom-1",
    });
  });

  test("validates formation references against roster state", () => {
    const session = createGameSession({
      roster: {
        armyUnits: [
          {
            id: "infantry",
            archetypeId: "infantry",
            name: "Infantry Squad",
            role: "frontline",
            level: 1,
            experience: 0,
            stats: {
              attack: 4,
              defense: 6,
              health: 55,
              speed: 2,
            },
            power: 26.7,
            visualProgression: 0,
          },
        ],
        armyComposition: [{ unitId: "infantry", count: 3 }],
      },
      formation: {
        slots: [
          {
            slotId: "front-center",
            occupantType: "army",
            occupantId: "infantry",
          },
        ],
      },
    });

    expect(session.snapshot().formation.slots).toEqual([
      {
        slotId: "front-center",
        occupantType: "army",
        occupantId: "infantry",
      },
    ]);
    expect(() =>
      createGameSession({
        formation: {
          slots: [
            {
              slotId: "front-center",
              occupantType: "army",
              occupantId: "missing",
            },
          ],
        },
      }),
    ).toThrow(/composition/);
  });

  test("advances deterministic ticks without using real time", () => {
    const session = createGameSession();

    expect(session.tick()).toMatchObject({
      tick: 1,
      elapsedSeconds: 1,
    });
    expect(session.tick(4)).toMatchObject({
      tick: 5,
      elapsedSeconds: 5,
    });
  });

  test("pause and resume control autonomous progress", () => {
    const session = createGameSession();

    session.tick(3);
    expect(session.pause()).toMatchObject({
      status: SESSION_STATUS.PAUSED,
      tick: 3,
    });
    expect(session.tick(10)).toMatchObject({
      status: SESSION_STATUS.PAUSED,
      tick: 3,
      elapsedSeconds: 3,
    });
    expect(session.resume()).toMatchObject({
      status: SESSION_STATUS.RUNNING,
    });
    expect(session.tick(2)).toMatchObject({
      tick: 5,
      elapsedSeconds: 5,
    });
  });

  test("returns immutable snapshots so callers cannot mutate session state", () => {
    const session = createGameSession();
    const state = session.snapshot();

    state.resources.gold = 999;
    state.roster.commanders.push({ id: "mutated" });

    expect(session.snapshot().resources.gold).toBe(0);
    expect(session.snapshot().roster.commanders).toEqual([]);
  });

  test("accepts deterministic initial state overrides for future systems", () => {
    const session = createGameSession({
      tick: 12,
      elapsedSeconds: 12,
      resources: {
        gold: 50,
      },
      visualProgression: {
        hero: 0.35,
      },
      roster: {
        hero: {
          experience: 100,
        },
      },
    });

    expect(session.snapshot()).toMatchObject({
      tick: 12,
      elapsedSeconds: 12,
      resources: {
        gold: 50,
        essence: 0,
        realmShards: 0,
      },
      visualProgression: {
        hero: 0.35,
        commanders: {},
        armyUnits: {},
      },
      roster: {
        hero: {
          level: 2,
          experience: 100,
        },
      },
    });
  });

  test("rejects invalid tick counts", () => {
    const session = createGameSession();

    expect(() => session.tick(-1)).toThrow(RangeError);
    expect(() => session.tick(1.5)).toThrow(RangeError);
  });
});
