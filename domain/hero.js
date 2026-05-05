const {
  HERO_BASE_STATS,
  HERO_STAT_GROWTH,
  HERO_POWER_WEIGHTS,
  HERO_EXPERIENCE,
  HERO_COMBAT,
  HERO_VISUAL_PROGRESSION,
} = require("../config/hero.js");

function round(value, places = 4) {
  const scale = 10 ** places;
  return Math.round(value * scale) / scale;
}

function assertNonNegativeInteger(value, name) {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer`);
  }
}

function getExperienceForLevel(level) {
  if (!Number.isInteger(level) || level < 1) {
    throw new RangeError("level must be a positive integer");
  }

  if (level === 1) {
    return 0;
  }

  let total = 0;
  for (let nextLevel = 2; nextLevel <= level; nextLevel += 1) {
    total += Math.round(
      HERO_EXPERIENCE.firstLevelCost *
        HERO_EXPERIENCE.growthFactor ** (nextLevel - 2),
    );
  }

  return total;
}

function getLevelForExperience(experience) {
  assertNonNegativeInteger(experience, "experience");

  let level = 1;
  while (experience >= getExperienceForLevel(level + 1)) {
    level += 1;
  }

  return level;
}

function calculateHeroStats(level) {
  if (!Number.isInteger(level) || level < 1) {
    throw new RangeError("level must be a positive integer");
  }

  const levelOffset = level - 1;

  return {
    attack: HERO_BASE_STATS.attack + HERO_STAT_GROWTH.attack * levelOffset,
    defense: HERO_BASE_STATS.defense + HERO_STAT_GROWTH.defense * levelOffset,
    health: HERO_BASE_STATS.health + HERO_STAT_GROWTH.health * levelOffset,
  };
}

function calculateHeroPower(stats) {
  return round(
    stats.attack * HERO_POWER_WEIGHTS.attack +
      stats.defense * HERO_POWER_WEIGHTS.defense +
      stats.health * HERO_POWER_WEIGHTS.health,
  );
}

function calculateHeroVisualProgression(power) {
  const powerAboveBaseline = Math.max(
    0,
    power - HERO_VISUAL_PROGRESSION.baselinePower,
  );

  return round(
    1 - Math.exp(-powerAboveBaseline / HERO_VISUAL_PROGRESSION.curvePower),
  );
}

function calculateHeroCombatAttributes(level, stats) {
  const attackIntervalSeconds = Math.max(
    HERO_COMBAT.minimumAttackIntervalSeconds,
    HERO_COMBAT.baseAttackIntervalSeconds -
      HERO_COMBAT.speedGainPerLevel * (level - 1),
  );
  const mitigation = Math.min(
    HERO_COMBAT.maximumMitigation,
    stats.defense * HERO_COMBAT.mitigationPerDefensePoint,
  );

  return {
    attackIntervalSeconds: round(attackIntervalSeconds),
    damagePerSecond: round(stats.attack / attackIntervalSeconds),
    mitigation: round(mitigation),
    maxHealth: stats.health,
    targetPriority: "frontline",
  };
}

function createHero(overrides = {}) {
  const experience = overrides.experience ?? 0;
  assertNonNegativeInteger(experience, "experience");

  const level = overrides.level ?? getLevelForExperience(experience);
  if (!Number.isInteger(level) || level < 1) {
    throw new RangeError("level must be a positive integer");
  }

  const stats = overrides.stats ?? calculateHeroStats(level);
  const power = calculateHeroPower(stats);
  const visualProgression = calculateHeroVisualProgression(power);

  return {
    id: overrides.id ?? "hero",
    level,
    experience,
    stats,
    power,
    combat: calculateHeroCombatAttributes(level, stats),
    visualProgression,
  };
}

function awardHeroExperience(hero, experienceGained) {
  assertNonNegativeInteger(experienceGained, "experienceGained");

  return createHero({
    ...hero,
    experience: hero.experience + experienceGained,
    level: undefined,
    stats: undefined,
  });
}

module.exports = {
  createHero,
  awardHeroExperience,
  calculateHeroStats,
  calculateHeroPower,
  calculateHeroVisualProgression,
  calculateHeroCombatAttributes,
  getExperienceForLevel,
  getLevelForExperience,
};
