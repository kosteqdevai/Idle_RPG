const { createArmyUnit, createStartingArmyRoster } = require("../../domain/army.js");
const {
  createCommander,
  createCommanderRoster,
} = require("../../domain/commanders.js");
const {
  FORMATION_SLOT_IDS,
  createDefaultFormation,
  createFormation,
  validateFormation,
  buildFormationCombatInput,
} = require("../../domain/formation.js");

function createRosterFixture() {
  const commander = createCommander("cavalry-banneret");
  const commanderRoster = createCommanderRoster({
    commanders: [commander],
    activeCommanderIds: [commander.id],
  });

  return {
    ...createStartingArmyRoster({
      armyUnits: [
        createArmyUnit("human-peasant", { quantity: 3 }),
        createArmyUnit("human-soldier", { quantity: 1 }),
      ],
    }),
    ...commanderRoster,
  };
}

describe("dormant formation rules", () => {
  test("creates a default formation from active commanders only", () => {
    const roster = createRosterFixture();
    const formation = createDefaultFormation(roster);

    expect(formation.slots).toEqual([
      {
        slotId: FORMATION_SLOT_IDS.BACK_CENTER,
        occupantType: "commander",
        occupantId: "cavalry-banneret",
      },
    ]);
    expect(validateFormation(formation, roster)).toEqual(formation);
  });

  test("tolerates empty formation and validates stale army references by roster only", () => {
    const roster = createRosterFixture();

    expect(validateFormation(createFormation([]), roster)).toEqual({ slots: [] });
    expect(
      validateFormation(
        createFormation([
          {
            slotId: FORMATION_SLOT_IDS.FRONT_CENTER,
            occupantType: "army",
            occupantId: "human-peasant",
          },
        ]),
        roster,
      ),
    ).toMatchObject({
      slots: [
        {
          occupantType: "army",
          occupantId: "human-peasant",
        },
      ],
    });
    expect(() =>
      validateFormation(
        createFormation([
          {
            slotId: FORMATION_SLOT_IDS.FRONT_CENTER,
            occupantType: "army",
            occupantId: "missing",
          },
        ]),
        roster,
      ),
    ).toThrow(/roster/);
  });

  test("combat input ignores army slots while retaining commander contribution", () => {
    const roster = createRosterFixture();
    const input = buildFormationCombatInput(
      createFormation([
        {
          slotId: FORMATION_SLOT_IDS.FRONT_CENTER,
          occupantType: "army",
          occupantId: "human-peasant",
        },
        {
          slotId: FORMATION_SLOT_IDS.BACK_CENTER,
          occupantType: "commander",
          occupantId: "cavalry-banneret",
        },
      ]),
      roster,
    );

    expect(input.combatants.map((combatant) => combatant.id)).toEqual([
      "cavalry-banneret",
    ]);
    expect(input.totalCombatPower).toBeGreaterThan(0);
    expect(input.targetingOrder).toEqual(["cavalry-banneret"]);
  });

  test("rejects duplicate occupants and bad slots before dormant filtering", () => {
    expect(() =>
      createFormation([
        {
          slotId: FORMATION_SLOT_IDS.FRONT_CENTER,
          occupantType: "army",
          occupantId: "human-peasant",
        },
        {
          slotId: FORMATION_SLOT_IDS.FRONT_LEFT,
          occupantType: "army",
          occupantId: "human-peasant",
        },
      ]),
    ).toThrow(/twice/);
    expect(() =>
      createFormation([
        {
          slotId: "unknown-slot",
          occupantType: "army",
          occupantId: "human-peasant",
        },
      ]),
    ).toThrow(/unknown/);
  });
});
