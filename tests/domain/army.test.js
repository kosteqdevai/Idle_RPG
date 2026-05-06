const {
  ARMY_UNIT_ARCHETYPES,
  createArmyUnit,
  createStartingArmyRoster,
  calculateArmyRosterPower,
  calculateArmySquadStats,
  getArmyUnitsForRealm,
  getZoneCorpseDrop,
  raiseArmyUnit,
} = require("../../domain/army.js");

describe("corpse-based army roster", () => {
  test("new rosters initialize every configured realm unit at zero quantity", () => {
    const roster = createStartingArmyRoster();

    expect(roster.armyUnits).toHaveLength(20);
    expect(roster.armyUnits.every((unit) => unit.quantity === 0)).toBe(true);
    expect(roster.armyComposition).toEqual([]);
    expect(roster.activeFormationUnitIds).toEqual([]);
    expect(roster.armyUnits[0]).toMatchObject({
      id: "human-peasant",
      name: "Human Peasant",
      race: "human",
      tier: 1,
      power: 5,
      corpseType: "human-peasant-corpse",
      corpseCost: 1,
    });
    expect(ARMY_UNIT_ARCHETYPES.map((unit) => unit.id)).toContain("orc-knight");
    expect(getArmyUnitsForRealm("frostbound-keep").map((unit) => unit.id)).toEqual([
      "undead-peasant",
      "undead-soldier",
      "undead-guard",
      "undead-knight",
      "undead-champion",
    ]);
  });

  test("units expose Power and quantity without level or stat attributes", () => {
    const unit = createArmyUnit("orc-knight", { quantity: 2 });

    expect(unit).toMatchObject({
      id: "orc-knight",
      power: 42,
      quantity: 2,
      corpseCost: 2,
    });
    expect(unit).not.toHaveProperty("level");
    expect(unit).not.toHaveProperty("stats");
    expect(calculateArmyRosterPower({ armyUnits: [unit] })).toBe(84);
    expect(calculateArmySquadStats({ armyUnits: [unit] })).toMatchObject({
      power: 84,
      unitCount: 2,
    });
  });

  test("raising a unit spends matching corpses and increments quantity", () => {
    const roster = createStartingArmyRoster();
    const result = raiseArmyUnit(
      roster,
      {
        gold: 3,
        essence: 1,
        realmShards: 0,
        corpses: { "orc-knight-corpse": 2 },
      },
      "orc-knight",
    );
    const raised = result.roster.armyUnits.find((unit) => unit.id === "orc-knight");

    expect(raised.quantity).toBe(1);
    expect(raised.visualProgression).toBeGreaterThan(0);
    expect(result.resources).toEqual({
      gold: 3,
      essence: 1,
      realmShards: 0,
      corpses: { "orc-knight-corpse": 0 },
    });
    expect(() =>
      raiseArmyUnit(roster, { corpses: { "orc-knight-corpse": 1 } }, "orc-knight"),
    ).toThrow(/corpses/);
  });

  test("zone corpse drops use weighted unit selection and tier-adjusted counts", () => {
    const zoneOne = { realmId: "verdant-kingdom", index: 1 };
    const zoneFive = { realmId: "ashen-marches", index: 5 };

    expect(getZoneCorpseDrop(zoneOne, 0.01)).toEqual({
      corpseType: "human-peasant-corpse",
      unitId: "human-peasant",
      unitName: "Human Peasant",
      quantity: 3,
    });
    expect(getZoneCorpseDrop(zoneFive, 0.95)).toEqual({
      corpseType: "orc-champion-corpse",
      unitId: "orc-champion",
      unitName: "Orc Champion",
      quantity: 5,
    });
  });

  test("validates quantities, corpse references, and unknown units", () => {
    expect(() => createArmyUnit("human-peasant", { quantity: -1 })).toThrow(
      RangeError,
    );
    expect(() => createArmyUnit("infantry")).toThrow(/unknown/);
    expect(() => getArmyUnitsForRealm("missing")).toThrow(/realm/);
  });
});
