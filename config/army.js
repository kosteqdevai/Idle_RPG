const ARMY_ARCHETYPE_IDS = Object.freeze({
  INFANTRY: "infantry",
  ARCHER: "archer",
  CAVALRY: "cavalry",
});

const ARMY_SQUAD_ARCHETYPE_CAP = 3;

const ARMY_UNIT_ARCHETYPES = Object.freeze([
  Object.freeze({
    id: ARMY_ARCHETYPE_IDS.INFANTRY,
    name: "Infantry Squad",
    role: "frontline",
    baseStats: Object.freeze({
      attack: 4,
      defense: 6,
      health: 55,
      speed: 2,
    }),
  }),
  Object.freeze({
    id: ARMY_ARCHETYPE_IDS.ARCHER,
    name: "Archer Squad",
    role: "ranged",
    baseStats: Object.freeze({
      attack: 7,
      defense: 2,
      health: 32,
      speed: 3,
    }),
  }),
  Object.freeze({
    id: ARMY_ARCHETYPE_IDS.CAVALRY,
    name: "Cavalry Squad",
    role: "flanker",
    baseStats: Object.freeze({
      attack: 6,
      defense: 4,
      health: 44,
      speed: 6,
    }),
  }),
]);

const ARMY_UNIT_STAT_GROWTH = Object.freeze({
  attack: 1.4,
  defense: 1.1,
  health: 8,
  speed: 0.15,
});

const ARMY_POWER_WEIGHTS = Object.freeze({
  attack: 2,
  defense: 1.6,
  health: 0.12,
  speed: 1.25,
});

const ARMY_EXPERIENCE = Object.freeze({
  firstLevelCost: 45,
  growthFactor: 1.25,
});

const ARMY_VISUAL_PROGRESSION = Object.freeze({
  baselinePowerByArchetype: Object.freeze({
    infantry: 26.7,
    archer: 24.79,
    cavalry: 31.18,
  }),
  curvePower: 430,
});

module.exports = {
  ARMY_ARCHETYPE_IDS,
  ARMY_SQUAD_ARCHETYPE_CAP,
  ARMY_UNIT_ARCHETYPES,
  ARMY_UNIT_STAT_GROWTH,
  ARMY_POWER_WEIGHTS,
  ARMY_EXPERIENCE,
  ARMY_VISUAL_PROGRESSION,
};
