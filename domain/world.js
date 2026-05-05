const {
  REALM_IDS,
  FINITE_REALMS,
  REALM_OF_INFINITY,
} = require("../config/realms.js");

const ALL_REALMS = Object.freeze([...FINITE_REALMS, REALM_OF_INFINITY]);

function clone(value) {
  return structuredClone(value);
}

function getRealm(realmId) {
  const realm = ALL_REALMS.find((candidate) => candidate.id === realmId);

  if (!realm) {
    throw new RangeError(`unknown realm id: ${realmId}`);
  }

  return realm;
}

function getFiniteRealm(realmId) {
  const realm = FINITE_REALMS.find((candidate) => candidate.id === realmId);

  if (!realm) {
    throw new RangeError(`unknown finite realm id: ${realmId}`);
  }

  return realm;
}

function getZone(zoneId) {
  for (const realm of FINITE_REALMS) {
    const zone = realm.zones.find((candidate) => candidate.id === zoneId);
    if (zone) {
      return {
        ...zone,
        realmId: realm.id,
      };
    }
  }

  throw new RangeError(`unknown designed zone id: ${zoneId}`);
}

function getDesignedZones() {
  return FINITE_REALMS.flatMap((realm) =>
    realm.zones.map((zone) => ({
      ...clone(zone),
      realmId: realm.id,
    })),
  );
}

function getFirstZoneId(realmId) {
  return getFiniteRealm(realmId).zones[0].id;
}

function createWorldProgression(overrides = {}) {
  const unlockedRealmIds = clone(overrides.unlockedRealmIds ?? [
    REALM_IDS.VERDANT_KINGDOM,
  ]);
  const completedZoneIds = clone(overrides.completedZoneIds ?? []);
  const currentRealmId = overrides.currentRealmId ?? REALM_IDS.VERDANT_KINGDOM;
  const currentZoneId =
    overrides.currentZoneId ?? getFirstZoneId(REALM_IDS.VERDANT_KINGDOM);
  const infinityDepth = overrides.infinityDepth ?? 0;

  if (!unlockedRealmIds.includes(REALM_IDS.VERDANT_KINGDOM)) {
    throw new RangeError("Verdant Kingdom must be unlocked at game start");
  }

  for (const realmId of unlockedRealmIds) {
    getRealm(realmId);
  }

  for (const zoneId of completedZoneIds) {
    getZone(zoneId);
  }

  if (!unlockedRealmIds.includes(currentRealmId)) {
    throw new RangeError("current realm must be unlocked");
  }

  if (currentRealmId === REALM_IDS.REALM_OF_INFINITY) {
    if (!Number.isInteger(infinityDepth) || infinityDepth < 0) {
      throw new RangeError("infinityDepth must be a non-negative integer");
    }
  } else {
    const zone = getZone(currentZoneId);
    if (zone.realmId !== currentRealmId) {
      throw new RangeError("current zone must belong to current realm");
    }
  }

  return {
    unlockedRealmIds,
    completedZoneIds,
    currentRealmId,
    currentZoneId:
      currentRealmId === REALM_IDS.REALM_OF_INFINITY ? null : currentZoneId,
    infinityDepth,
  };
}

function isRealmUnlocked(progression, realmId) {
  return createWorldProgression(progression).unlockedRealmIds.includes(realmId);
}

function getPreviousZoneId(zoneId) {
  const zone = getZone(zoneId);
  const realm = getFiniteRealm(zone.realmId);

  if (zone.index === 1) {
    return null;
  }

  return realm.zones[zone.index - 2].id;
}

function canEnterZone(progression, zoneId) {
  const currentProgression = createWorldProgression(progression);
  const zone = getZone(zoneId);

  if (!currentProgression.unlockedRealmIds.includes(zone.realmId)) {
    return false;
  }

  const previousZoneId = getPreviousZoneId(zoneId);
  return (
    previousZoneId === null ||
    currentProgression.completedZoneIds.includes(previousZoneId)
  );
}

function getZoneStatus(progression, zoneId) {
  const currentProgression = createWorldProgression(progression);

  if (currentProgression.completedZoneIds.includes(zoneId)) {
    return "completed";
  }

  if (currentProgression.currentZoneId === zoneId) {
    return "current";
  }

  return canEnterZone(currentProgression, zoneId) ? "available" : "locked";
}

function completeZone(progression, zoneId) {
  const currentProgression = createWorldProgression(progression);

  if (!canEnterZone(currentProgression, zoneId)) {
    throw new RangeError("zone is not available");
  }

  const zone = getZone(zoneId);
  const completedZoneIds = currentProgression.completedZoneIds.includes(zoneId)
    ? currentProgression.completedZoneIds
    : [...currentProgression.completedZoneIds, zoneId];
  const realm = getFiniteRealm(zone.realmId);
  const nextZone = realm.zones[zone.index] ?? null;

  return createWorldProgression({
    ...currentProgression,
    completedZoneIds,
    currentRealmId: zone.realmId,
    currentZoneId: nextZone?.id ?? zoneId,
  });
}

function canUnlockRealm(progression, resources, realmId) {
  const currentProgression = createWorldProgression(progression);
  const realm = getRealm(realmId);

  if (currentProgression.unlockedRealmIds.includes(realmId)) {
    return false;
  }

  if (realmId === REALM_IDS.REALM_OF_INFINITY) {
    const designedZoneIds = getDesignedZones().map((zone) => zone.id);
    const allDesignedZonesCompleted = designedZoneIds.every((zoneId) =>
      currentProgression.completedZoneIds.includes(zoneId),
    );

    return (
      allDesignedZonesCompleted &&
      (resources.realmShards ?? 0) >= realm.shardUnlockCost
    );
  }

  const previousRealm = FINITE_REALMS[realm.index - 2];
  const previousRealmComplete = previousRealm.zones.every((zone) =>
    currentProgression.completedZoneIds.includes(zone.id),
  );

  return (
    previousRealmComplete &&
    (resources.realmShards ?? 0) >= realm.shardUnlockCost
  );
}

function unlockRealm(progression, resources, realmId) {
  const currentProgression = createWorldProgression(progression);
  const realm = getRealm(realmId);
  const currentResources = {
    gold: resources.gold ?? 0,
    essence: resources.essence ?? 0,
    realmShards: resources.realmShards ?? 0,
  };

  if (!canUnlockRealm(currentProgression, currentResources, realmId)) {
    throw new RangeError("realm unlock requirements are not met");
  }

  const nextProgression = createWorldProgression({
    ...currentProgression,
    unlockedRealmIds: [...currentProgression.unlockedRealmIds, realmId],
    currentRealmId: realmId,
    currentZoneId:
      realmId === REALM_IDS.REALM_OF_INFINITY ? null : getFirstZoneId(realmId),
  });

  return {
    progression: nextProgression,
    resources: {
      ...currentResources,
      realmShards: currentResources.realmShards - realm.shardUnlockCost,
    },
  };
}

function getInfinityEncounter(depth) {
  if (!Number.isInteger(depth) || depth < 1) {
    throw new RangeError("depth must be a positive integer");
  }

  const { escalation } = REALM_OF_INFINITY;

  return {
    realmId: REALM_IDS.REALM_OF_INFINITY,
    depth,
    enemyPower: Math.round(
      escalation.baseEnemyPower * escalation.powerGrowthFactor ** (depth - 1),
    ),
    shardReward:
      depth % escalation.shardRewardEveryDepth === 0 ? 1 : 0,
  };
}

module.exports = {
  ALL_REALMS,
  FINITE_REALMS,
  REALM_IDS,
  REALM_OF_INFINITY,
  createWorldProgression,
  getRealm,
  getZone,
  getDesignedZones,
  getZoneStatus,
  canEnterZone,
  completeZone,
  canUnlockRealm,
  unlockRealm,
  isRealmUnlocked,
  getInfinityEncounter,
};
