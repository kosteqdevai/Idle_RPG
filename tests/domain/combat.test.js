const { createStartingArmyRoster } = require("../../domain/army.js");
const {
  createCommander,
  createCommanderRoster,
} = require("../../domain/commanders.js");
const { createHero } = require("../../domain/hero.js");
const {
  FORMATION_SLOT_IDS,
  createDefaultFormation,
  createFormation,
} = require("../../domain/formation.js");
const {
  resolveCombat,
  calculateWinProbability,
  deterministicRoll,
} = require("../../domain/combat.js");

function createCombatFixture() {
  const armyRoster = createStartingArmyRoster();
  const commander = createCommander("vanguard-captain");
  const commanderRoster = createCommanderRoster({
    commanders: [commander],
    activeCommanderIds: [commander.id],
  });
  const roster = {
    ...armyRoster,
    ...commanderRoster,
  };

  return {
    hero: createHero({ level: 4, experience: 420 }),
    roster,
    formation: createDefaultFormation(roster),
  };
}

describe("autonomous combat engine", () => {
  test("resolves deterministic combat from hero, commanders, army squads, and zone data", () => {
    const fixture = createCombatFixture();
    const result = resolveCombat({
      ...fixture,
      zoneId: "verdant-kingdom-1",
      seed: "same-input",
    });
    const repeatedResult = resolveCombat({
      ...fixture,
      zoneId: "verdant-kingdom-1",
      seed: "same-input",
    });

    expect(result).toEqual(repeatedResult);
    expect(result.didWin).toBe(true);
    expect(result.playerPower).toBeGreaterThan(result.enemyPower);
    expect(result.participants.hero).toMatchObject({
      id: "hero",
      power: expect.any(Number),
    });
    expect(result.participants.formation.map((unit) => unit.id)).toEqual([
      "infantry",
      "archer",
      "cavalry",
      "vanguard-captain",
    ]);
    expect(result.targetingOrder[0]).toBe("infantry");
  });

  test("produces win/loss results, rewards, and combat logs", () => {
    const fixture = createCombatFixture();
    const win = resolveCombat({
      ...fixture,
      zoneId: "verdant-kingdom-1",
      seed: "reward-check",
    });
    const loss = resolveCombat({
      ...fixture,
      hero: createHero(),
      roster: {
        armyUnits: [],
        armyComposition: [],
        activeFormationUnitIds: [],
        commanders: [],
        activeCommanderIds: [],
      },
      formation: createFormation([]),
      zoneId: "frostbound-keep-5",
      seed: "loss-check",
    });

    expect(win.outcome).toBe("win");
    expect(win.rewards.gold).toBeGreaterThan(0);
    expect(win.rewards.realmShards).toBe(0);
    expect(win.log.map((entry) => entry.type)).toEqual([
      "combat-started",
      "targeting-order",
      "combat-won",
      "rewards",
    ]);

    expect(loss.outcome).toBe("loss");
    expect(loss.rewards).toEqual({
      gold: expect.any(Number),
      essence: 0,
      realmShards: 0,
    });
    expect(loss.log[2].type).toBe("combat-lost");
  });

  test("formation changes alter outcome probability and targeting order", () => {
    const fixture = createCombatFixture();
    const protectedResult = resolveCombat({
      ...fixture,
      zoneId: "ashen-marches-1",
      seed: "formation-a",
    });
    const riskyFormation = createFormation([
      {
        slotId: FORMATION_SLOT_IDS.BACK_LEFT,
        occupantType: "army",
        occupantId: "infantry",
      },
      {
        slotId: FORMATION_SLOT_IDS.FRONT_CENTER,
        occupantType: "army",
        occupantId: "archer",
      },
      {
        slotId: FORMATION_SLOT_IDS.BACK_RIGHT,
        occupantType: "army",
        occupantId: "cavalry",
      },
      {
        slotId: FORMATION_SLOT_IDS.FRONT_LEFT,
        occupantType: "commander",
        occupantId: "vanguard-captain",
      },
    ]);
    const riskyResult = resolveCombat({
      ...fixture,
      formation: riskyFormation,
      zoneId: "ashen-marches-1",
      seed: "formation-a",
    });

    expect(riskyResult.playerPower).not.toBe(protectedResult.playerPower);
    expect(riskyResult.winProbability).not.toBe(
      protectedResult.winProbability,
    );
    expect(protectedResult.targetingOrder[0]).toBe("infantry");
    expect(riskyResult.targetingOrder[0]).toBe("archer");
  });

  test("calculates bounded win probability and deterministic rolls", () => {
    expect(calculateWinProbability(1, 100000)).toBe(0.05);
    expect(calculateWinProbability(100000, 1)).toBe(0.95);
    expect(deterministicRoll("stable")).toBe(deterministicRoll("stable"));
    expect(deterministicRoll("stable")).not.toBe(deterministicRoll("changed"));
  });

  test("rejects missing combat inputs and unavailable zones", () => {
    const fixture = createCombatFixture();

    expect(() =>
      resolveCombat({
        ...fixture,
        roster: null,
        zoneId: "verdant-kingdom-1",
      }),
    ).toThrow(/roster/);
    expect(() =>
      resolveCombat({
        ...fixture,
        formation: null,
        zoneId: "verdant-kingdom-1",
      }),
    ).toThrow(/formation/);
    expect(() =>
      resolveCombat({
        ...fixture,
        zoneId: "realm-of-infinity-1",
      }),
    ).toThrow(/unknown/);
  });
});
