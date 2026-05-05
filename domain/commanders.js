const {
  COMMANDER_ROSTER_CAP,
  ACTIVE_COMMANDER_SLOT_CAP,
  COMMANDER_SUMMON_ESSENCE_COST,
  COMMANDER_BASE_STATS,
  COMMANDER_STAT_GROWTH,
  COMMANDER_POWER_WEIGHTS,
  COMMANDER_EXPERIENCE,
  COMMANDER_VISUAL_PROGRESSION,
  COMMANDER_CATALOG,
} = require("../config/commanders.js");

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

function getCommanderDefinition(commanderId) {
  const definition = COMMANDER_CATALOG.find(
    (commander) => commander.id === commanderId,
  );

  if (!definition) {
    throw new RangeError(`unknown commander id: ${commanderId}`);
  }

  return definition;
}

function getCommanderExperienceForLevel(level) {
  if (!Number.isInteger(level) || level < 1) {
    throw new RangeError("level must be a positive integer");
  }

  if (level === 1) {
    return 0;
  }

  let total = 0;
  for (let nextLevel = 2; nextLevel <= level; nextLevel += 1) {
    total += Math.round(
      COMMANDER_EXPERIENCE.firstLevelCost *
        COMMANDER_EXPERIENCE.growthFactor ** (nextLevel - 2),
    );
  }

  return total;
}

function getCommanderLevelForExperience(experience) {
  assertNonNegativeInteger(experience, "experience");

  let level = 1;
  while (experience >= getCommanderExperienceForLevel(level + 1)) {
    level += 1;
  }

  return level;
}

function calculateCommanderStats(level) {
  if (!Number.isInteger(level) || level < 1) {
    throw new RangeError("level must be a positive integer");
  }

  const levelOffset = level - 1;

  return {
    attack:
      COMMANDER_BASE_STATS.attack + COMMANDER_STAT_GROWTH.attack * levelOffset,
    defense:
      COMMANDER_BASE_STATS.defense +
      COMMANDER_STAT_GROWTH.defense * levelOffset,
    health:
      COMMANDER_BASE_STATS.health + COMMANDER_STAT_GROWTH.health * levelOffset,
    command:
      COMMANDER_BASE_STATS.command +
      COMMANDER_STAT_GROWTH.command * levelOffset,
  };
}

function calculateCommanderPower(stats) {
  return round(
    stats.attack * COMMANDER_POWER_WEIGHTS.attack +
      stats.defense * COMMANDER_POWER_WEIGHTS.defense +
      stats.health * COMMANDER_POWER_WEIGHTS.health +
      stats.command * COMMANDER_POWER_WEIGHTS.command,
  );
}

function calculateCommanderVisualProgression(power) {
  const powerAboveBaseline = Math.max(
    0,
    power - COMMANDER_VISUAL_PROGRESSION.baselinePower,
  );

  return round(
    1 - Math.exp(-powerAboveBaseline / COMMANDER_VISUAL_PROGRESSION.curvePower),
  );
}

function createCommander(commanderId, overrides = {}) {
  const definition = getCommanderDefinition(commanderId);
  const experience = overrides.experience ?? 0;
  assertNonNegativeInteger(experience, "experience");

  const level = overrides.level ?? getCommanderLevelForExperience(experience);
  if (!Number.isInteger(level) || level < 1) {
    throw new RangeError("level must be a positive integer");
  }

  const stats = overrides.stats ?? calculateCommanderStats(level);
  const power = calculateCommanderPower(stats);

  return {
    id: definition.id,
    name: definition.name,
    role: definition.role,
    level,
    experience,
    stats,
    power,
    combat: {
      damagePerSecond: round(stats.attack / 1.8),
      mitigation: round(Math.min(0.65, stats.defense * 0.0035)),
      commandBonus: round(stats.command * 0.025),
      targetPriority: definition.role,
    },
    visualProgression: calculateCommanderVisualProgression(power),
  };
}

function createCommanderRoster(overrides = {}) {
  const commanders = clone(overrides.commanders ?? []);
  const activeCommanderIds = clone(overrides.activeCommanderIds ?? []);

  if (commanders.length > COMMANDER_ROSTER_CAP) {
    throw new RangeError("commander roster cap exceeded");
  }

  if (activeCommanderIds.length > ACTIVE_COMMANDER_SLOT_CAP) {
    throw new RangeError("active commander slot cap exceeded");
  }

  const commanderIds = new Set(commanders.map((commander) => commander.id));
  if (commanderIds.size !== commanders.length) {
    throw new RangeError("commander roster cannot contain duplicates");
  }

  for (const commanderId of activeCommanderIds) {
    if (!commanderIds.has(commanderId)) {
      throw new RangeError("active commanders must exist in roster");
    }
  }

  return {
    commanders,
    activeCommanderIds,
  };
}

function summonCommander(roster, resources, commanderId) {
  const currentRoster = createCommanderRoster(roster);
  const currentResources = {
    gold: resources.gold ?? 0,
    essence: resources.essence ?? 0,
    realmShards: resources.realmShards ?? 0,
  };

  if (currentResources.essence < COMMANDER_SUMMON_ESSENCE_COST) {
    throw new RangeError("not enough Essence to summon commander");
  }

  if (currentRoster.commanders.length >= COMMANDER_ROSTER_CAP) {
    throw new RangeError("commander roster cap exceeded");
  }

  if (
    currentRoster.commanders.some((commander) => commander.id === commanderId)
  ) {
    throw new RangeError("commander is already permanent in roster");
  }

  const commander = createCommander(commanderId);

  return {
    commander,
    roster: createCommanderRoster({
      ...currentRoster,
      commanders: [...currentRoster.commanders, commander],
    }),
    resources: {
      ...currentResources,
      essence: currentResources.essence - COMMANDER_SUMMON_ESSENCE_COST,
    },
  };
}

function activateCommander(roster, commanderId) {
  const currentRoster = createCommanderRoster(roster);

  if (
    !currentRoster.commanders.some((commander) => commander.id === commanderId)
  ) {
    throw new RangeError("commander must be summoned before activation");
  }

  if (currentRoster.activeCommanderIds.includes(commanderId)) {
    return currentRoster;
  }

  if (currentRoster.activeCommanderIds.length >= ACTIVE_COMMANDER_SLOT_CAP) {
    throw new RangeError("active commander slot cap exceeded");
  }

  return createCommanderRoster({
    ...currentRoster,
    activeCommanderIds: [...currentRoster.activeCommanderIds, commanderId],
  });
}

function deactivateCommander(roster, commanderId) {
  const currentRoster = createCommanderRoster(roster);

  return createCommanderRoster({
    ...currentRoster,
    activeCommanderIds: currentRoster.activeCommanderIds.filter(
      (activeCommanderId) => activeCommanderId !== commanderId,
    ),
  });
}

function removeCommander() {
  throw new Error("commanders are permanent once summoned");
}

module.exports = {
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
  calculateCommanderStats,
  calculateCommanderPower,
  calculateCommanderVisualProgression,
  getCommanderExperienceForLevel,
  getCommanderLevelForExperience,
};
