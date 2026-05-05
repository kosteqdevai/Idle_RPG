const FORMATION_SLOT_IDS = Object.freeze({
  FRONT_LEFT: "front-left",
  FRONT_CENTER: "front-center",
  FRONT_RIGHT: "front-right",
  BACK_LEFT: "back-left",
  BACK_CENTER: "back-center",
  BACK_RIGHT: "back-right",
});

const FORMATION_SLOTS = Object.freeze([
  Object.freeze({
    id: FORMATION_SLOT_IDS.FRONT_LEFT,
    row: "front",
    lane: "left",
    targetPriority: 1,
    modifiers: Object.freeze({
      attackMultiplier: 1.05,
      defenseMultiplier: 1.2,
      healthMultiplier: 1.1,
    }),
  }),
  Object.freeze({
    id: FORMATION_SLOT_IDS.FRONT_CENTER,
    row: "front",
    lane: "center",
    targetPriority: 0,
    modifiers: Object.freeze({
      attackMultiplier: 1,
      defenseMultiplier: 1.35,
      healthMultiplier: 1.15,
    }),
  }),
  Object.freeze({
    id: FORMATION_SLOT_IDS.FRONT_RIGHT,
    row: "front",
    lane: "right",
    targetPriority: 1,
    modifiers: Object.freeze({
      attackMultiplier: 1.05,
      defenseMultiplier: 1.2,
      healthMultiplier: 1.1,
    }),
  }),
  Object.freeze({
    id: FORMATION_SLOT_IDS.BACK_LEFT,
    row: "back",
    lane: "left",
    targetPriority: 3,
    modifiers: Object.freeze({
      attackMultiplier: 1.2,
      defenseMultiplier: 0.9,
      healthMultiplier: 1,
    }),
  }),
  Object.freeze({
    id: FORMATION_SLOT_IDS.BACK_CENTER,
    row: "back",
    lane: "center",
    targetPriority: 4,
    modifiers: Object.freeze({
      attackMultiplier: 1.15,
      defenseMultiplier: 1,
      healthMultiplier: 1,
    }),
  }),
  Object.freeze({
    id: FORMATION_SLOT_IDS.BACK_RIGHT,
    row: "back",
    lane: "right",
    targetPriority: 3,
    modifiers: Object.freeze({
      attackMultiplier: 1.2,
      defenseMultiplier: 0.9,
      healthMultiplier: 1,
    }),
  }),
]);

const FLANKING_ATTACK_MULTIPLIER = 1.15;

module.exports = {
  FORMATION_SLOT_IDS,
  FORMATION_SLOTS,
  FLANKING_ATTACK_MULTIPLIER,
};
