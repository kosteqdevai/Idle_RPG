const {
  COMMANDER_SUMMON_ESSENCE_COST,
} = require("./commanders.js");
const { getZone } = require("./world.js");

const RESOURCE_TYPES = Object.freeze({
  GOLD: "gold",
  ESSENCE: "essence",
  REALM_SHARDS: "realmShards",
});

function assertNonNegativeInteger(value, name) {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer`);
  }
}

function createResources(overrides = {}) {
  const resources = {
    gold: overrides.gold ?? 0,
    essence: overrides.essence ?? 0,
    realmShards: overrides.realmShards ?? 0,
  };

  assertNonNegativeInteger(resources.gold, "gold");
  assertNonNegativeInteger(resources.essence, "essence");
  assertNonNegativeInteger(resources.realmShards, "realmShards");

  return resources;
}

function addResources(resources, delta) {
  const currentResources = createResources(resources);
  const resourceDelta = createResources(delta);

  return {
    gold: currentResources.gold + resourceDelta.gold,
    essence: currentResources.essence + resourceDelta.essence,
    realmShards: currentResources.realmShards + resourceDelta.realmShards,
  };
}

function getCombatRewardSources(zoneId, combatRewards) {
  const zone = getZone(zoneId);
  const rewards = createResources(combatRewards);

  return {
    gold: rewards.gold > 0 ? "combat" : "none",
    essence: rewards.essence > 0 ? "rare-combat-drop" : "none",
    realmShards:
      rewards.realmShards > 0 && rewards.realmShards === zone.shardReward
        ? "specific-zone-drop"
        : "none",
  };
}

function applyCombatRewards(resources, zoneId, combatRewards) {
  const sources = getCombatRewardSources(zoneId, combatRewards);
  const rewards = createResources(combatRewards);

  if (rewards.realmShards > 0 && sources.realmShards !== "specific-zone-drop") {
    throw new RangeError("Realm Shards must come from the zone shard reward");
  }

  return {
    resources: addResources(resources, rewards),
    sources,
  };
}

function spendCommanderSummonResources(resources) {
  const currentResources = createResources(resources);

  if (currentResources.essence < COMMANDER_SUMMON_ESSENCE_COST) {
    throw new RangeError("commander summoning requires Essence");
  }

  return {
    ...currentResources,
    essence: currentResources.essence - COMMANDER_SUMMON_ESSENCE_COST,
  };
}

function spendRealmUnlockResources(resources, shardCost) {
  const currentResources = createResources(resources);
  assertNonNegativeInteger(shardCost, "shardCost");

  if (currentResources.realmShards < shardCost) {
    throw new RangeError("realm unlock requires Realm Shards");
  }

  return {
    ...currentResources,
    realmShards: currentResources.realmShards - shardCost,
  };
}

module.exports = {
  RESOURCE_TYPES,
  createResources,
  addResources,
  applyCombatRewards,
  getCombatRewardSources,
  spendCommanderSummonResources,
  spendRealmUnlockResources,
};
