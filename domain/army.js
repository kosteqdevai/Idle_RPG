const {
  ARMY_ARCHETYPE_IDS,
  ARMY_SQUAD_ARCHETYPE_CAP,
  ARMY_UNIT_ARCHETYPES,
  ARMY_UNIT_STAT_GROWTH,
  ARMY_POWER_WEIGHTS,
  ARMY_EXPERIENCE,
  ARMY_VISUAL_PROGRESSION,
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

function getArmyUnitExperienceForLevel(level) {
  if (!Number.isInteger(level) || level < 1) {
    throw new RangeError("level must be a positive integer");
  }

  if (level === 1) {
    return 0;
  }

  let total = 0;
  for (let nextLevel = 2; nextLevel <= level; nextLevel += 1) {
    total += Math.round(
      ARMY_EXPERIENCE.firstLevelCost *
        ARMY_EXPERIENCE.growthFactor ** (nextLevel - 2),
    );
  }

  return total;
}

function getArmyUnitLevelForExperience(experience) {
  assertNonNegativeInteger(experience, "experience");

  let level = 1;
  while (experience >= getArmyUnitExperienceForLevel(level + 1)) {
    level += 1;
  }

  return level;
}

function calculateArmyUnitStats(archetypeId, level) {
  const archetype = getArmyUnitArchetype(archetypeId);
  if (!Number.isInteger(level) || level < 1) {
    throw new RangeError("level must be a positive integer");
  }

  const levelOffset = level - 1;

  return {
    attack: round(
      archetype.baseStats.attack + ARMY_UNIT_STAT_GROWTH.attack * levelOffset,
    ),
    defense: round(
      archetype.baseStats.defense +
        ARMY_UNIT_STAT_GROWTH.defense * levelOffset,
    ),
    health: round(
      archetype.baseStats.health + ARMY_UNIT_STAT_GROWTH.health * levelOffset,
    ),
    speed: round(
      archetype.baseStats.speed + ARMY_UNIT_STAT_GROWTH.speed * levelOffset,
    ),
  };
}

function calculateArmyUnitPower(stats) {
  return round(
    stats.attack * ARMY_POWER_WEIGHTS.attack +
      stats.defense * ARMY_POWER_WEIGHTS.defense +
      stats.health * ARMY_POWER_WEIGHTS.health +
      stats.speed * ARMY_POWER_WEIGHTS.speed,
  );
}

function calculateArmyUnitVisualProgression(archetypeId, power) {
  const baselinePower =
    ARMY_VISUAL_PROGRESSION.baselinePowerByArchetype[archetypeId];
  if (baselinePower === undefined) {
    throw new RangeError(`unknown army archetype id: ${archetypeId}`);
  }

  const powerAboveBaseline = Math.max(0, power - baselinePower);

  return round(
    1 - Math.exp(-powerAboveBaseline / ARMY_VISUAL_PROGRESSION.curvePower),
  );
}

function createArmyUnit(archetypeId, overrides = {}) {
  const archetype = getArmyUnitArchetype(archetypeId);
  const experience = overrides.experience ?? 0;
  assertNonNegativeInteger(experience, "experience");

  const level = overrides.level ?? getArmyUnitLevelForExperience(experience);
  if (!Number.isInteger(level) || level < 1) {
    throw new RangeError("level must be a positive integer");
  }

  const stats = overrides.stats ?? calculateArmyUnitStats(archetypeId, level);
  const power = calculateArmyUnitPower(stats);

  return {
    id: overrides.id ?? archetype.id,
    archetypeId: archetype.id,
    name: archetype.name,
    role: archetype.role,
    level,
    experience,
    stats,
    power,
    visualProgression: calculateArmyUnitVisualProgression(archetype.id, power),
  };
}

function createStartingArmyRoster() {
  return createArmyRoster({
    armyUnits: [
      createArmyUnit(ARMY_ARCHETYPE_IDS.INFANTRY),
      createArmyUnit(ARMY_ARCHETYPE_IDS.ARCHER),
      createArmyUnit(ARMY_ARCHETYPE_IDS.CAVALRY),
    ],
    armyComposition: [
      { unitId: ARMY_ARCHETYPE_IDS.INFANTRY, count: 6 },
      { unitId: ARMY_ARCHETYPE_IDS.ARCHER, count: 4 },
      { unitId: ARMY_ARCHETYPE_IDS.CAVALRY, count: 2 },
    ],
  });
}

function createArmyRoster(overrides = {}) {
  const armyUnits = clone(overrides.armyUnits ?? []);
  const armyComposition = clone(overrides.armyComposition ?? []);
  const activeFormationUnitIds = clone(overrides.activeFormationUnitIds ?? []);

  const unitIds = new Set(armyUnits.map((unit) => unit.id));
  if (unitIds.size !== armyUnits.length) {
    throw new RangeError("army roster cannot contain duplicate units");
  }

  const compositionIds = new Set();
  for (const entry of armyComposition) {
    if (!unitIds.has(entry.unitId)) {
      throw new RangeError("army composition units must exist in roster");
    }
    if (!Number.isInteger(entry.count) || entry.count <= 0) {
      throw new RangeError("army composition counts must be positive integers");
    }
    compositionIds.add(entry.unitId);
  }

  if (compositionIds.size > ARMY_SQUAD_ARCHETYPE_CAP) {
    throw new RangeError("army squad archetype cap exceeded");
  }

  for (const unitId of activeFormationUnitIds) {
    if (!unitIds.has(unitId)) {
      throw new RangeError("active formation units must exist in roster");
    }
  }

  return {
    armyUnits,
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

function calculateArmySquadStats(roster) {
  const currentRoster = createArmyRoster(roster);
  const stats = {
    attack: 0,
    defense: 0,
    health: 0,
    speed: 0,
    power: 0,
    unitCount: 0,
    visualProgression: 0,
  };

  for (const entry of currentRoster.armyComposition) {
    const unit = currentRoster.armyUnits.find(
      (armyUnit) => armyUnit.id === entry.unitId,
    );
    stats.attack += unit.stats.attack * entry.count;
    stats.defense += unit.stats.defense * entry.count;
    stats.health += unit.stats.health * entry.count;
    stats.speed += unit.stats.speed * entry.count;
    stats.power += unit.power * entry.count;
    stats.visualProgression += unit.visualProgression * entry.count;
    stats.unitCount += entry.count;
  }

  if (stats.unitCount === 0) {
    return stats;
  }

  return {
    attack: round(stats.attack),
    defense: round(stats.defense),
    health: round(stats.health),
    speed: round(stats.speed / stats.unitCount),
    power: round(stats.power),
    unitCount: stats.unitCount,
    visualProgression: round(stats.visualProgression / stats.unitCount),
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

module.exports = {
  ARMY_ARCHETYPE_IDS,
  ARMY_SQUAD_ARCHETYPE_CAP,
  ARMY_UNIT_ARCHETYPES,
  createArmyUnit,
  createArmyRoster,
  createStartingArmyRoster,
  setArmyComposition,
  setActiveFormationUnitIds,
  calculateArmySquadStats,
  calculateArmyUnitStats,
  calculateArmyUnitPower,
  calculateArmyUnitVisualProgression,
  deleteArmyUnit,
  getArmyUnitArchetype,
  getArmyUnitExperienceForLevel,
  getArmyUnitLevelForExperience,
};
