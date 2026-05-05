const HERO_BASE_STATS = Object.freeze({
  attack: 10,
  defense: 6,
  health: 100,
});

const HERO_STAT_GROWTH = Object.freeze({
  attack: 3,
  defense: 2,
  health: 18,
});

const HERO_POWER_WEIGHTS = Object.freeze({
  attack: 2.4,
  defense: 1.7,
  health: 0.18,
});

const HERO_EXPERIENCE = Object.freeze({
  firstLevelCost: 100,
  growthFactor: 1.35,
});

const HERO_COMBAT = Object.freeze({
  baseAttackIntervalSeconds: 1.6,
  minimumAttackIntervalSeconds: 0.75,
  speedGainPerLevel: 0.025,
  mitigationPerDefensePoint: 0.004,
  maximumMitigation: 0.75,
});

const HERO_VISUAL_PROGRESSION = Object.freeze({
  baselinePower: 52.2,
  curvePower: 850,
});

module.exports = {
  HERO_BASE_STATS,
  HERO_STAT_GROWTH,
  HERO_POWER_WEIGHTS,
  HERO_EXPERIENCE,
  HERO_COMBAT,
  HERO_VISUAL_PROGRESSION,
};
