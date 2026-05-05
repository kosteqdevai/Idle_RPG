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
  const armyRoster = createStartingArmyRoster();
  const commander = createCommander("cavalry-banneret");
  const commanderRoster = createCommanderRoster({
    commanders: [commander],
    activeCommanderIds: [commander.id],
  });

  return {
    ...armyRoster,
    ...commanderRoster,
  };
}

describe("formation modifiers and targeting rules", () => {
  test("creates a default formation from active army composition and commanders", () => {
    const roster = createRosterFixture();
    const formation = createDefaultFormation(roster);

    expect(formation.slots).toEqual([
      {
        slotId: FORMATION_SLOT_IDS.FRONT_CENTER,
        occupantType: "army",
        occupantId: "infantry",
      },
      {
        slotId: FORMATION_SLOT_IDS.BACK_LEFT,
        occupantType: "army",
        occupantId: "archer",
      },
      {
        slotId: FORMATION_SLOT_IDS.FRONT_RIGHT,
        occupantType: "army",
        occupantId: "cavalry",
      },
      {
        slotId: FORMATION_SLOT_IDS.BACK_CENTER,
        occupantType: "commander",
        occupantId: "cavalry-banneret",
      },
    ]);
    expect(validateFormation(formation, roster)).toEqual(formation);
  });

  test("rejects formations that deploy unknown, inactive, duplicate, or invalid occupants", () => {
    const roster = createRosterFixture();

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
    ).toThrow(/composition/);
    expect(() =>
      validateFormation(
        createFormation([
          {
            slotId: FORMATION_SLOT_IDS.BACK_CENTER,
            occupantType: "commander",
            occupantId: "vanguard-captain",
          },
        ]),
        roster,
      ),
    ).toThrow(/active/);
    expect(() =>
      createFormation([
        {
          slotId: FORMATION_SLOT_IDS.FRONT_CENTER,
          occupantType: "army",
          occupantId: "infantry",
        },
        {
          slotId: FORMATION_SLOT_IDS.FRONT_LEFT,
          occupantType: "army",
          occupantId: "infantry",
        },
      ]),
    ).toThrow(/twice/);
    expect(() =>
      createFormation([
        {
          slotId: "unknown-slot",
          occupantType: "army",
          occupantId: "infantry",
        },
      ]),
    ).toThrow(/unknown/);
  });

  test("applies positional buffs and targeting order to autonomous combat input", () => {
    const roster = createRosterFixture();
    const input = buildFormationCombatInput(createDefaultFormation(roster), roster);

    const infantry = input.combatants.find((combatant) => combatant.id === "infantry");
    const archer = input.combatants.find((combatant) => combatant.id === "archer");

    expect(infantry).toMatchObject({
      slotId: FORMATION_SLOT_IDS.FRONT_CENTER,
      row: "front",
      targetPriority: 0,
      stats: {
        attack: 24,
        defense: 48.6,
        health: 379.5,
      },
    });
    expect(archer).toMatchObject({
      slotId: FORMATION_SLOT_IDS.BACK_LEFT,
      row: "back",
      lane: "left",
      flankingBonus: {
        attackMultiplier: 1.15,
      },
      stats: {
        attack: 38.64,
        defense: 7.2,
        health: 128,
      },
    });
    expect(input.targetingOrder[0]).toBe("infantry");
    expect(input.targetingOrder).toEqual([
      "infantry",
      "cavalry",
      "archer",
      "cavalry-banneret",
    ]);
  });

  test("formation choices measurably change combat power", () => {
    const roster = createRosterFixture();
    const protectedFormation = createDefaultFormation(roster);
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
        occupantId: "cavalry-banneret",
      },
    ]);

    const protectedInput = buildFormationCombatInput(protectedFormation, roster);
    const riskyInput = buildFormationCombatInput(riskyFormation, roster);

    expect(riskyInput.totalCombatPower).not.toBe(protectedInput.totalCombatPower);
    expect(riskyInput.targetingOrder[0]).toBe("archer");
    expect(protectedInput.targetingOrder[0]).toBe("infantry");
  });

  test("requires army squads to come from player composition, not merely roster ownership", () => {
    const roster = {
      ...createStartingArmyRoster(),
      armyUnits: [
        ...createStartingArmyRoster().armyUnits,
        createArmyUnit("infantry", { id: "reserve-infantry" }),
      ],
    };

    expect(() =>
      validateFormation(
        createFormation([
          {
            slotId: FORMATION_SLOT_IDS.FRONT_LEFT,
            occupantType: "army",
            occupantId: "reserve-infantry",
          },
        ]),
        roster,
      ),
    ).toThrow(/composition/);
  });
});
