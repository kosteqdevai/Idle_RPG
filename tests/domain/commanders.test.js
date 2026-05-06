const {
  COMMANDER_ROSTER_CAP,
  ACTIVE_COMMANDER_SLOT_CAP,
  COMMANDER_SUMMON_ESSENCE_COST,
  COMMANDER_CATALOG,
  createCommander,
  createCommanderRoster,
  summonCommander,
  activateCommander,
  deactivateCommander,
  removeCommander,
  calculateCommanderPower,
  calculateCommanderVisualProgression,
  getCommanderExperienceForLevel,
  getCommanderLevelForExperience,
} = require("../../domain/commanders.js");

describe("commander roster and summoning model", () => {
  test("creates commanders with combat stats and continuous visual progression", () => {
    const commander = createCommander("vanguard-captain");

    expect(commander).toMatchObject({
      id: "vanguard-captain",
      name: "Vanguard Captain",
      role: "frontline",
      level: 1,
      experience: 0,
      stats: {
        attack: 7,
        defense: 5,
        health: 70,
        command: 4,
      },
      power: 45.6,
      visualProgression: 0,
      combat: {
        damagePerSecond: 3.8889,
        mitigation: 0.0175,
        commandBonus: 0.1,
        targetPriority: "frontline",
      },
    });
  });

  test("derives commander level from experience", () => {
    expect(getCommanderExperienceForLevel(1)).toBe(0);
    expect(getCommanderExperienceForLevel(2)).toBe(80);
    expect(getCommanderExperienceForLevel(3)).toBe(184);

    expect(getCommanderLevelForExperience(0)).toBe(1);
    expect(getCommanderLevelForExperience(79)).toBe(1);
    expect(getCommanderLevelForExperience(80)).toBe(2);
    expect(getCommanderLevelForExperience(184)).toBe(3);
  });

  test("summoning consumes Essence only and makes the commander permanent", () => {
    const startingRoster = createCommanderRoster();
    const resources = {
      gold: 999,
      essence: COMMANDER_SUMMON_ESSENCE_COST,
      realmShards: 4,
    };

    const result = summonCommander(
      startingRoster,
      resources,
      "vanguard-captain",
    );

    expect(result.roster.commanders).toHaveLength(1);
    expect(result.roster.commanders[0].id).toBe("vanguard-captain");
    expect(result.resources).toEqual({
      gold: 999,
      essence: 0,
      realmShards: 4,
      corpses: {},
    });
    expect(() =>
      summonCommander(
        result.roster,
        { gold: 999, essence: COMMANDER_SUMMON_ESSENCE_COST, realmShards: 4 },
        "vanguard-captain",
      ),
    ).toThrow(/permanent/);
    expect(() => removeCommander(result.roster, "vanguard-captain")).toThrow(
      /permanent/,
    );
  });

  test("rejects summoning when Essence is short and never falls back to Gold", () => {
    expect(() =>
      summonCommander(
        createCommanderRoster(),
        { gold: 100000, essence: COMMANDER_SUMMON_ESSENCE_COST - 1 },
        "vanguard-captain",
      ),
    ).toThrow(/Essence/);
  });

  test("enforces the 10 commander roster cap", () => {
    const fullRoster = createCommanderRoster({
      commanders: COMMANDER_CATALOG.slice(0, COMMANDER_ROSTER_CAP).map(
        (definition) => createCommander(definition.id),
      ),
    });

    expect(fullRoster.commanders).toHaveLength(COMMANDER_ROSTER_CAP);
    expect(() =>
      summonCommander(
        fullRoster,
        { essence: COMMANDER_SUMMON_ESSENCE_COST },
        COMMANDER_CATALOG[COMMANDER_ROSTER_CAP - 1].id,
      ),
    ).toThrow(/cap/);
  });

  test("manages up to 4 active deployment slots", () => {
    const roster = createCommanderRoster({
      commanders: COMMANDER_CATALOG.slice(0, 5).map((definition) =>
        createCommander(definition.id),
      ),
    });

    const activeRoster = COMMANDER_CATALOG.slice(
      0,
      ACTIVE_COMMANDER_SLOT_CAP,
    ).reduce(
      (currentRoster, definition) =>
        activateCommander(currentRoster, definition.id),
      roster,
    );

    expect(activeRoster.activeCommanderIds).toEqual(
      COMMANDER_CATALOG.slice(0, ACTIVE_COMMANDER_SLOT_CAP).map(
        (definition) => definition.id,
      ),
    );
    expect(() =>
      activateCommander(activeRoster, COMMANDER_CATALOG[4].id),
    ).toThrow(/slot cap/);

    const reopenedRoster = deactivateCommander(
      activeRoster,
      COMMANDER_CATALOG[0].id,
    );
    expect(reopenedRoster.activeCommanderIds).not.toContain(
      COMMANDER_CATALOG[0].id,
    );
    expect(
      activateCommander(reopenedRoster, COMMANDER_CATALOG[4].id)
        .activeCommanderIds,
    ).toContain(COMMANDER_CATALOG[4].id);
  });

  test("visual progression is data-driven from commander power", () => {
    const baseline = calculateCommanderVisualProgression(45.6);
    const mid = calculateCommanderVisualProgression(160);
    const high = calculateCommanderVisualProgression(420);

    expect(baseline).toBe(0);
    expect(mid).toBeGreaterThan(baseline);
    expect(high).toBeGreaterThan(mid);
    expect(high).toBeLessThan(1);

    const veteran = createCommander("longbow-marshal", {
      level: 5,
      experience: getCommanderExperienceForLevel(5),
    });
    expect(veteran.power).toBe(calculateCommanderPower(veteran.stats));
    expect(veteran.visualProgression).toBeGreaterThan(0);
  });

  test("rejects invalid commander roster state", () => {
    const commander = createCommander("vanguard-captain");

    expect(() =>
      createCommanderRoster({
        commanders: [commander, commander],
      }),
    ).toThrow(/duplicates/);
    expect(() =>
      createCommanderRoster({
        commanders: [commander],
        activeCommanderIds: ["longbow-marshal"],
      }),
    ).toThrow(/exist/);
    expect(() => createCommander("missing-commander")).toThrow(/unknown/);
  });
});
