const {
  FORMATION_SLOT_IDS,
  FORMATION_SLOTS,
  FLANKING_ATTACK_MULTIPLIER,
} = require("../config/formation.js");
const { createArmyRoster } = require("./army.js");
const { createCommanderRoster } = require("./commanders.js");

function clone(value) {
  return structuredClone(value);
}

function round(value, places = 4) {
  const scale = 10 ** places;
  return Math.round(value * scale) / scale;
}

function getFormationSlot(slotId) {
  const slot = FORMATION_SLOTS.find((candidate) => candidate.id === slotId);

  if (!slot) {
    throw new RangeError(`unknown formation slot id: ${slotId}`);
  }

  return slot;
}

function createFormation(slots = []) {
  const clonedSlots = clone(slots);
  const occupiedSlotIds = new Set();
  const occupantKeys = new Set();

  for (const slot of clonedSlots) {
    getFormationSlot(slot.slotId);

    if (!["army", "commander"].includes(slot.occupantType)) {
      throw new RangeError("formation occupantType must be army or commander");
    }

    if (occupiedSlotIds.has(slot.slotId)) {
      throw new RangeError("formation slot cannot be occupied twice");
    }

    const occupantKey = `${slot.occupantType}:${slot.occupantId}`;
    if (occupantKeys.has(occupantKey)) {
      throw new RangeError("formation occupant cannot be deployed twice");
    }

    occupiedSlotIds.add(slot.slotId);
    occupantKeys.add(occupantKey);
  }

  return {
    slots: clonedSlots,
  };
}

function getArmyUnitDeploymentStats(armyRoster, unitId) {
  const unit = armyRoster.armyUnits.find((candidate) => candidate.id === unitId);
  const composition = armyRoster.armyComposition.find(
    (entry) => entry.unitId === unitId,
  );

  if (!unit || !composition) {
    throw new RangeError("deployed army unit must exist in army composition");
  }

  return {
    id: unit.id,
    type: "army",
    role: unit.role,
    count: composition.count,
    stats: {
      attack: unit.stats.attack * composition.count,
      defense: unit.stats.defense * composition.count,
      health: unit.stats.health * composition.count,
      speed: unit.stats.speed,
    },
    power: unit.power * composition.count,
    visualProgression: unit.visualProgression,
  };
}

function getCommanderDeploymentStats(commanderRoster, commanderId) {
  if (!commanderRoster.activeCommanderIds.includes(commanderId)) {
    throw new RangeError("deployed commander must be active");
  }

  const commander = commanderRoster.commanders.find(
    (candidate) => candidate.id === commanderId,
  );

  if (!commander) {
    throw new RangeError("deployed commander must exist in roster");
  }

  return {
    id: commander.id,
    type: "commander",
    role: commander.role,
    count: 1,
    stats: {
      attack: commander.stats.attack,
      defense: commander.stats.defense,
      health: commander.stats.health,
      speed: commander.stats.command,
    },
    power: commander.power,
    visualProgression: commander.visualProgression,
  };
}

function validateFormation(formation, roster) {
  const currentFormation = createFormation(formation.slots ?? []);
  const armyRoster = createArmyRoster(roster);
  const commanderRoster = createCommanderRoster(roster);

  for (const slot of currentFormation.slots) {
    if (slot.occupantType === "army") {
      getArmyUnitDeploymentStats(armyRoster, slot.occupantId);
    } else {
      getCommanderDeploymentStats(commanderRoster, slot.occupantId);
    }
  }

  return currentFormation;
}

function applySlotModifiers(baseCombatant, slot) {
  const flanking =
    ["left", "right"].includes(slot.lane) &&
    ["flanker", "ranged"].includes(baseCombatant.role);
  const attackMultiplier =
    slot.modifiers.attackMultiplier *
    (flanking ? FLANKING_ATTACK_MULTIPLIER : 1);

  const stats = {
    attack: round(baseCombatant.stats.attack * attackMultiplier),
    defense: round(
      baseCombatant.stats.defense * slot.modifiers.defenseMultiplier,
    ),
    health: round(baseCombatant.stats.health * slot.modifiers.healthMultiplier),
    speed: baseCombatant.stats.speed,
  };

  return {
    ...baseCombatant,
    slotId: slot.id,
    row: slot.row,
    lane: slot.lane,
    targetPriority: slot.targetPriority,
    flankingBonus: flanking
      ? {
          attackMultiplier: FLANKING_ATTACK_MULTIPLIER,
        }
      : null,
    stats,
    combatPower: round(
      stats.attack * 2 + stats.defense * 1.6 + stats.health * 0.12 + stats.speed,
    ),
  };
}

function getBaseCombatant(slot, armyRoster, commanderRoster) {
  if (slot.occupantType === "army") {
    return getArmyUnitDeploymentStats(armyRoster, slot.occupantId);
  }

  return getCommanderDeploymentStats(commanderRoster, slot.occupantId);
}

function buildFormationCombatInput(formation, roster) {
  const currentFormation = validateFormation(formation, roster);
  const armyRoster = createArmyRoster(roster);
  const commanderRoster = createCommanderRoster(roster);
  const combatants = currentFormation.slots.map((entry) => {
    const slot = getFormationSlot(entry.slotId);
    const baseCombatant = getBaseCombatant(entry, armyRoster, commanderRoster);
    return applySlotModifiers(baseCombatant, slot);
  });

  return {
    combatants,
    targetingOrder: [...combatants]
      .sort((left, right) => {
        if (left.targetPriority !== right.targetPriority) {
          return left.targetPriority - right.targetPriority;
        }

        return left.slotId.localeCompare(right.slotId);
      })
      .map((combatant) => combatant.id),
    totalCombatPower: round(
      combatants.reduce((total, combatant) => total + combatant.combatPower, 0),
    ),
  };
}

function createDefaultFormation(roster) {
  const armyRoster = createArmyRoster(roster);
  const commanderRoster = createCommanderRoster(roster);
  const slots = [];

  const infantry = armyRoster.armyComposition.find(
    (entry) => entry.unitId === "infantry",
  );
  const archer = armyRoster.armyComposition.find(
    (entry) => entry.unitId === "archer",
  );
  const cavalry = armyRoster.armyComposition.find(
    (entry) => entry.unitId === "cavalry",
  );

  if (infantry) {
    slots.push({
      slotId: FORMATION_SLOT_IDS.FRONT_CENTER,
      occupantType: "army",
      occupantId: infantry.unitId,
    });
  }
  if (archer) {
    slots.push({
      slotId: FORMATION_SLOT_IDS.BACK_LEFT,
      occupantType: "army",
      occupantId: archer.unitId,
    });
  }
  if (cavalry) {
    slots.push({
      slotId: FORMATION_SLOT_IDS.FRONT_RIGHT,
      occupantType: "army",
      occupantId: cavalry.unitId,
    });
  }
  if (commanderRoster.activeCommanderIds[0]) {
    slots.push({
      slotId: FORMATION_SLOT_IDS.BACK_CENTER,
      occupantType: "commander",
      occupantId: commanderRoster.activeCommanderIds[0],
    });
  }

  return createFormation(slots);
}

module.exports = {
  FORMATION_SLOT_IDS,
  FORMATION_SLOTS,
  createFormation,
  createDefaultFormation,
  validateFormation,
  buildFormationCombatInput,
  getFormationSlot,
};
