const COMMANDER_ROSTER_CAP = 10;
const ACTIVE_COMMANDER_SLOT_CAP = 4;
const COMMANDER_SUMMON_ESSENCE_COST = 25;

const COMMANDER_BASE_STATS = Object.freeze({
  attack: 7,
  defense: 5,
  health: 70,
  command: 4,
});

const COMMANDER_STAT_GROWTH = Object.freeze({
  attack: 2,
  defense: 1,
  health: 12,
  command: 1,
});

const COMMANDER_POWER_WEIGHTS = Object.freeze({
  attack: 2.1,
  defense: 1.5,
  health: 0.14,
  command: 3.4,
});

const COMMANDER_EXPERIENCE = Object.freeze({
  firstLevelCost: 80,
  growthFactor: 1.3,
});

const COMMANDER_VISUAL_PROGRESSION = Object.freeze({
  baselinePower: 45.6,
  curvePower: 620,
});

const COMMANDER_CATALOG = Object.freeze([
  Object.freeze({
    id: "vanguard-captain",
    name: "Vanguard Captain",
    role: "frontline",
  }),
  Object.freeze({
    id: "longbow-marshal",
    name: "Longbow Marshal",
    role: "ranged",
  }),
  Object.freeze({
    id: "cavalry-banneret",
    name: "Cavalry Banneret",
    role: "flanker",
  }),
  Object.freeze({
    id: "shield-sergeant",
    name: "Shield Sergeant",
    role: "defender",
  }),
  Object.freeze({
    id: "siege-overseer",
    name: "Siege Overseer",
    role: "support",
  }),
  Object.freeze({
    id: "ember-tactician",
    name: "Ember Tactician",
    role: "tactician",
  }),
  Object.freeze({
    id: "iron-chaplain",
    name: "Iron Chaplain",
    role: "sustain",
  }),
  Object.freeze({
    id: "falcon-scoutmaster",
    name: "Falcon Scoutmaster",
    role: "scout",
  }),
  Object.freeze({
    id: "royal-standardbearer",
    name: "Royal Standardbearer",
    role: "morale",
  }),
  Object.freeze({
    id: "infinity-herald",
    name: "Infinity Herald",
    role: "endless",
  }),
]);

module.exports = {
  COMMANDER_ROSTER_CAP,
  ACTIVE_COMMANDER_SLOT_CAP,
  COMMANDER_SUMMON_ESSENCE_COST,
  COMMANDER_BASE_STATS,
  COMMANDER_STAT_GROWTH,
  COMMANDER_POWER_WEIGHTS,
  COMMANDER_EXPERIENCE,
  COMMANDER_VISUAL_PROGRESSION,
  COMMANDER_CATALOG,
};
