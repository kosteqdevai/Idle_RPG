const { COMBAT_BALANCE } = require("../config/combat.js");
const { calculateArmyRosterPower, getZoneCorpseDrop } = require("./army.js");
const { createHero } = require("./hero.js");
const { buildFormationCombatInput } = require("./formation.js");
const { getZone } = require("./world.js");

function round(value, places = 4) {
  const scale = 10 ** places;
  return Math.round(value * scale) / scale;
}

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function deterministicRoll(seed) {
  return round((hashString(seed) % 10000) / 10000, 4);
}

function calculateWinProbability(playerPower, enemyPower) {
  const rawProbability = playerPower / (playerPower + enemyPower);

  return round(
    Math.max(
      COMBAT_BALANCE.minimumWinProbability,
      Math.min(COMBAT_BALANCE.maximumWinProbability, rawProbability),
    ),
  );
}

function calculateRewards(zone, didWin, essenceRoll, corpseRoll) {
  const essenceChance =
    COMBAT_BALANCE.essenceDropBaseChance +
    Math.min(0.18, zone.index * 0.015);
  const heroExperience = Math.max(
    1,
    Math.round(
      zone.enemyPower *
        COMBAT_BALANCE.heroExperienceMultiplier *
        (didWin ? 1 : COMBAT_BALANCE.lossExperienceMultiplier),
    ),
  );

  if (!didWin) {
    return {
      gold: Math.max(1, Math.floor(zone.enemyPower * 0.08)),
      essence: essenceRoll <= essenceChance ? 1 : 0,
      realmShards: 0,
      heroExperience,
      corpseDrop: getZoneCorpseDrop(zone, corpseRoll),
    };
  }

  return {
    gold: Math.max(
      1,
      Math.round(zone.enemyPower * COMBAT_BALANCE.baseGoldMultiplier),
    ),
    essence: essenceRoll <= essenceChance ? 1 : 0,
    realmShards: zone.shardReward,
    heroExperience,
    corpseDrop: getZoneCorpseDrop(zone, corpseRoll),
  };
}

function resolveCombat({
  hero = createHero(),
  roster,
  formation,
  zoneId,
  seed = "combat",
}) {
  if (!roster) {
    throw new TypeError("roster is required");
  }
  if (!formation) {
    throw new TypeError("formation is required");
  }

  const zone = getZone(zoneId);
  const formationInput = buildFormationCombatInput(formation, roster);
  const armyPower = calculateArmyRosterPower(roster);
  const playerPower = round(
    hero.power * COMBAT_BALANCE.heroPowerWeight +
      armyPower +
      formationInput.totalCombatPower * COMBAT_BALANCE.formationPowerWeight,
  );
  const enemyPower = zone.enemyPower;
  const winProbability = calculateWinProbability(playerPower, enemyPower);
  const roll = deterministicRoll(
    `${seed}:${zoneId}:${playerPower}:${formationInput.targetingOrder.join(",")}`,
  );
  const essenceRoll = deterministicRoll(
    `${seed}:essence:${zoneId}:${playerPower}:${formationInput.targetingOrder.join(",")}`,
  );
  const corpseRoll = deterministicRoll(`${seed}:corpse:${zoneId}:${playerPower}`);
  const didWin = roll <= winProbability;
  const rewards = calculateRewards(zone, didWin, essenceRoll, corpseRoll);

  return {
    zoneId,
    outcome: didWin ? "win" : "loss",
    didWin,
    playerPower,
    armyPower,
    enemyPower,
    winProbability,
    roll,
    participants: {
      hero: {
        id: hero.id,
        power: hero.power,
        combat: hero.combat,
      },
      formation: formationInput.combatants,
    },
    targetingOrder: formationInput.targetingOrder,
    rewards,
    log: [
      {
        type: "combat-started",
        zoneId,
        enemyPower,
        playerPower,
        armyPower,
      },
      {
        type: "targeting-order",
        targets: formationInput.targetingOrder,
      },
      {
        type: didWin ? "combat-won" : "combat-lost",
        winProbability,
        roll,
      },
      {
        type: "rewards",
        rewards,
        essenceRoll,
        corpseRoll,
      },
    ],
  };
}

module.exports = {
  resolveCombat,
  calculateWinProbability,
  deterministicRoll,
};
