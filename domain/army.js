const {
  ARMY_ARCHETYPE_IDS,
  ARMY_UNIT_ARCHETYPES,
  REALM_RACES,
  ZONE_BASE_ENEMY_COUNTS,
  ZONE_UNIT_DROP_WEIGHTS,
} = require("../config/army.js");

function clone(value) {
  return structuredClone(value);
}

function round(value, places = 4) {
  const scale = 10 ** places;
  return Math.round(value * scale) / scale;
}

function assertNonNegativeInteger(value, name) {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer`);
  }
}

function getArmyUnitArchetype(archetypeId) {
  const archetype = ARMY_UNIT_ARCHETYPES.find((unit) => unit.id === archetypeId);

  if (!archetype) {
    throw new RangeError(`unknown army archetype id: ${archetypeId}`);
  }

  return archetype;
}

function getArmyUnitsForRealm(realmId) {
  const race = REALM_RACES[realmId];
  if (!race) {
    throw new RangeError(`unknown realm race for realm id: ${realmId}`);
  }

  return ARMY_UNIT_ARCHETYPES.filter((unit) => unit.realmId === realmId);
}

function calculateArmyUnitVisualProgression(unit) {
  const quantity = unit.quantity ?? 0;
  if (quantity === 0) {
    return 0;
  }

  return round(1 - Math.exp(-(unit.power * quantity) / 900));
}

function createArmyUnit(archetypeId, overrides = {}) {
  const archetype = getArmyUnitArchetype(archetypeId);
  const quantity = overrides.quantity ?? 0;
  assertNonNegativeInteger(quantity, "quantity");

  const unit = {
    id: overrides.id ?? archetype.id,
    archetypeId: archetype.id,
    name: archetype.name,
    race: archetype.race,
    tier: archetype.tier,
    tierKey: archetype.tierKey,
    power: archetype.power,
    quantity,
    corpseType: archetype.corpseType,
    corpseCost: archetype.corpseCost,
  };

  return {
    ...unit,
    visualProgression: calculateArmyUnitVisualProgression(unit),
  };
}

function createStartingArmyRoster(overrides = {}) {
  return createArmyRoster({
    armyUnits:
      overrides.armyUnits ??
      ARMY_UNIT_ARCHETYPES.map((unit) => createArmyUnit(unit.id)),
    armyComposition: overrides.armyComposition ?? [],
    activeFormationUnitIds: overrides.activeFormationUnitIds ?? [],
  });
}

function createArmyRoster(overrides = {}) {
  const armyUnits = clone(overrides.armyUnits ?? []);
  const armyComposition = clone(overrides.armyComposition ?? []);
  const activeFormationUnitIds = clone(overrides.activeFormationUnitIds ?? []);

  const normalizedUnits = armyUnits.map((unit) =>
    createArmyUnit(unit.archetypeId ?? unit.id, unit),
  );
  const unitIds = new Set(normalizedUnits.map((unit) => unit.id));
  if (unitIds.size !== normalizedUnits.length) {
    throw new RangeError("army roster cannot contain duplicate units");
  }

  for (const entry of armyComposition) {
    if (!unitIds.has(entry.unitId)) {
      throw new RangeError("army composition units must exist in roster");
    }
    assertNonNegativeInteger(entry.count, "army composition count");
  }

  for (const unitId of activeFormationUnitIds) {
    if (!unitIds.has(unitId)) {
      throw new RangeError("active formation units must exist in roster");
    }
  }

  return {
    armyUnits: normalizedUnits,
    armyComposition,
    activeFormationUnitIds,
  };
}

function setArmyComposition(roster, armyComposition) {
  return createArmyRoster({
    ...createArmyRoster(roster),
    armyComposition,
  });
}

function setActiveFormationUnitIds(roster, activeFormationUnitIds) {
  return createArmyRoster({
    ...createArmyRoster(roster),
    activeFormationUnitIds,
  });
}

function calculateArmyUnitPower(unit) {
  return unit.power;
}

function calculateArmyRosterPower(roster) {
  return round(
    createArmyRoster(roster).armyUnits.reduce(
      (total, unit) => total + unit.power * unit.quantity,
      0,
    ),
  );
}

function calculateArmySquadStats(roster) {
  const currentRoster = createArmyRoster(roster);
  const totalQuantity = currentRoster.armyUnits.reduce(
    (total, unit) => total + unit.quantity,
    0,
  );

  return {
    power: calculateArmyRosterPower(currentRoster),
    unitCount: totalQuantity,
    visualProgression:
      totalQuantity === 0
        ? 0
        : round(
            currentRoster.armyUnits.reduce(
              (total, unit) => total + unit.visualProgression * unit.quantity,
              0,
            ) / totalQuantity,
          ),
  };
}

function deleteArmyUnit(roster, unitId) {
  const currentRoster = createArmyRoster(roster);

  if (currentRoster.activeFormationUnitIds.includes(unitId)) {
    throw new Error("active formation units cannot be deleted from roster");
  }

  return createArmyRoster({
    armyUnits: currentRoster.armyUnits.filter((unit) => unit.id !== unitId),
    armyComposition: currentRoster.armyComposition.filter(
      (entry) => entry.unitId !== unitId,
    ),
    activeFormationUnitIds: currentRoster.activeFormationUnitIds,
  });
}

function createCorpseResources(resources = {}) {
  return clone(resources.corpses ?? {});
}

function raiseArmyUnit(roster, resources, unitId) {
  const currentRoster = createArmyRoster(roster);
  const unit = currentRoster.armyUnits.find((armyUnit) => armyUnit.id === unitId);

  if (!unit) {
    throw new RangeError("army unit must exist in roster");
  }

  const corpseCost = unit.corpseCost;
  const corpses = createCorpseResources(resources);
  const availableCorpses = corpses[unit.corpseType] ?? 0;
  if (availableCorpses < corpseCost) {
    throw new RangeError(`not enough ${unit.name} corpses to raise unit`);
  }

  const raisedUnit = createArmyUnit(unit.archetypeId, {
    ...unit,
    quantity: unit.quantity + 1,
  });
  const nextCorpses = {
    ...corpses,
    [unit.corpseType]: availableCorpses - corpseCost,
  };

  return {
    roster: createArmyRoster({
      ...currentRoster,
      armyUnits: currentRoster.armyUnits.map((armyUnit) =>
        armyUnit.id === unitId ? raisedUnit : armyUnit,
      ),
    }),
    resources: {
      gold: resources.gold ?? 0,
      essence: resources.essence ?? 0,
      realmShards: resources.realmShards ?? 0,
      corpses: nextCorpses,
    },
    raisedUnit,
    corpseCost,
  };
}

function chooseWeightedUnit(units, weights, roll) {
  const totalWeight = weights.reduce((total, weight) => total + weight, 0);
  let cursor = roll * totalWeight;

  for (let index = 0; index < units.length; index += 1) {
    cursor -= weights[index];
    if (cursor <= 0 && weights[index] > 0) {
      return units[index];
    }
  }

  return units.findLast((_, index) => weights[index] > 0);
}

function getZoneCorpseDrop(zone, roll) {
  const units = getArmyUnitsForRealm(zone.realmId);
  const weights = ZONE_UNIT_DROP_WEIGHTS[zone.index];
  const baseCount = ZONE_BASE_ENEMY_COUNTS[zone.index];
  if (!weights || !baseCount) {
    throw new RangeError("zone corpse drops require a designed zone index 1-5");
  }

  const unit = chooseWeightedUnit(units, weights, roll);
  const quantity = Math.max(1, baseCount - Math.floor((unit.tier - 1) / 2));

  return {
    corpseType: unit.corpseType,
    unitId: unit.id,
    unitName: unit.name,
    quantity,
  };
}

module.exports = {
  ARMY_ARCHETYPE_IDS,
  ARMY_UNIT_ARCHETYPES,
  REALM_RACES,
  createArmyUnit,
  createArmyRoster,
  createStartingArmyRoster,
  setArmyComposition,
  setActiveFormationUnitIds,
  calculateArmySquadStats,
  calculateArmyUnitPower,
  calculateArmyRosterPower,
  calculateArmyUnitVisualProgression,
  deleteArmyUnit,
  raiseArmyUnit,
  getArmyUnitArchetype,
  getArmyUnitsForRealm,
  getZoneCorpseDrop,
};
