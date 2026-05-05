const {
  ARMY_ARCHETYPE_IDS,
  ARMY_SQUAD_ARCHETYPE_CAP,
  ARMY_UNIT_ARCHETYPES,
  createArmyUnit,
  createArmyRoster,
  createStartingArmyRoster,
  setArmyComposition,
  setActiveFormationUnitIds,
  calculateArmySquadStats,
  calculateArmyUnitPower,
  calculateArmyUnitVisualProgression,
  deleteArmyUnit,
  getArmyUnitUpgradeCost,
  upgradeArmyUnit,
  getArmyUnitExperienceForLevel,
  getArmyUnitLevelForExperience,
} = require("../../domain/army.js");

describe("army unit roster and squad composition", () => {
  test("defines the resolved small-squad archetypes as zone-agnostic units", () => {
    expect(ARMY_UNIT_ARCHETYPES.map((unit) => unit.id)).toEqual([
      ARMY_ARCHETYPE_IDS.INFANTRY,
      ARMY_ARCHETYPE_IDS.ARCHER,
      ARMY_ARCHETYPE_IDS.CAVALRY,
    ]);
    expect(ARMY_SQUAD_ARCHETYPE_CAP).toBe(3);

    const infantry = createArmyUnit(ARMY_ARCHETYPE_IDS.INFANTRY);
    expect(infantry).toMatchObject({
      id: "infantry",
      archetypeId: "infantry",
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
    });
  });

  test("derives army unit level from experience", () => {
    expect(getArmyUnitExperienceForLevel(1)).toBe(0);
    expect(getArmyUnitExperienceForLevel(2)).toBe(45);
    expect(getArmyUnitExperienceForLevel(3)).toBe(101);

    expect(getArmyUnitLevelForExperience(0)).toBe(1);
    expect(getArmyUnitLevelForExperience(44)).toBe(1);
    expect(getArmyUnitLevelForExperience(45)).toBe(2);
    expect(getArmyUnitLevelForExperience(101)).toBe(3);
  });

  test("creates a global roster with player-defined squad composition", () => {
    const roster = createStartingArmyRoster();

    expect(roster.armyUnits.map((unit) => unit.archetypeId)).toEqual([
      "infantry",
      "archer",
      "cavalry",
    ]);
    expect(roster.armyComposition).toEqual([
      { unitId: "infantry", count: 6 },
      { unitId: "archer", count: 4 },
      { unitId: "cavalry", count: 2 },
    ]);

    const revisedRoster = setArmyComposition(roster, [
      { unitId: "infantry", count: 8 },
      { unitId: "archer", count: 3 },
    ]);

    expect(revisedRoster.armyComposition).toEqual([
      { unitId: "infantry", count: 8 },
      { unitId: "archer", count: 3 },
    ]);
  });

  test("calculates aggregate squad stats from composition counts", () => {
    const stats = calculateArmySquadStats(createStartingArmyRoster());

    expect(stats).toEqual({
      attack: 64,
      defense: 52,
      health: 546,
      speed: 3,
      power: 321.72,
      unitCount: 12,
      visualProgression: 0,
    });
  });

  test("rejects deleting a unit assigned to active formation", () => {
    const roster = setActiveFormationUnitIds(createStartingArmyRoster(), [
      "infantry",
    ]);

    expect(() => deleteArmyUnit(roster, "infantry")).toThrow(/active/);

    const updatedRoster = deleteArmyUnit(roster, "archer");
    expect(updatedRoster.armyUnits.map((unit) => unit.id)).toEqual([
      "infantry",
      "cavalry",
    ]);
    expect(updatedRoster.armyComposition.map((entry) => entry.unitId)).toEqual([
      "infantry",
      "cavalry",
    ]);
  });

  test("visual progression is a continuous function of unit power", () => {
    const infantry = createArmyUnit("infantry", {
      level: 5,
      experience: getArmyUnitExperienceForLevel(5),
    });

    expect(infantry.power).toBe(calculateArmyUnitPower(infantry.stats));
    expect(infantry.visualProgression).toBeGreaterThan(0);
    expect(calculateArmyUnitVisualProgression("infantry", 80)).toBeGreaterThan(
      calculateArmyUnitVisualProgression("infantry", 79),
    );
    expect(calculateArmyUnitVisualProgression("infantry", 80)).toBeLessThan(1);
  });

  test("upgrades army units with Gold and exposes improved visual progression", () => {
    const roster = createStartingArmyRoster();
    const infantry = roster.armyUnits.find((unit) => unit.id === "infantry");

    expect(getArmyUnitUpgradeCost(infantry)).toBe(30);

    const result = upgradeArmyUnit(roster, { gold: 40 }, "infantry");

    expect(result.resources).toEqual({
      gold: 10,
      essence: 0,
      realmShards: 0,
    });
    expect(result.upgradedUnit.level).toBe(2);
    expect(result.upgradedUnit.power).toBeGreaterThan(infantry.power);
    expect(result.upgradedUnit.visualProgression).toBeGreaterThan(
      infantry.visualProgression,
    );
    expect(() =>
      upgradeArmyUnit(roster, { gold: 29 }, "infantry"),
    ).toThrow(/Gold/);
  });

  test("validates roster, composition, and active formation references", () => {
    const infantry = createArmyUnit("infantry");

    expect(() =>
      createArmyRoster({
        armyUnits: [infantry, infantry],
      }),
    ).toThrow(/duplicate/);
    expect(() =>
      createArmyRoster({
        armyUnits: [infantry],
        armyComposition: [{ unitId: "archer", count: 1 }],
      }),
    ).toThrow(/exist/);
    expect(() =>
      createArmyRoster({
        armyUnits: [infantry],
        armyComposition: [{ unitId: "infantry", count: 0 }],
      }),
    ).toThrow(/positive/);
    expect(() =>
      createArmyRoster({
        armyUnits: [infantry],
        activeFormationUnitIds: ["archer"],
      }),
    ).toThrow(/exist/);
    expect(() => createArmyUnit("mage")).toThrow(/unknown/);
  });
});
