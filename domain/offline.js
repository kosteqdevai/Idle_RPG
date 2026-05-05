const { OFFLINE_PROGRESS } = require("../config/offline.js");
const { getZone } = require("./world.js");
const { addResources, createResources } = require("./resources.js");

function assertDateLike(value, name) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new RangeError(`${name} must be a valid date`);
  }

  return date;
}

function calculateOfflineProgress({ lastSeenAt, now, lastActiveZoneId }) {
  const start = assertDateLike(lastSeenAt, "lastSeenAt");
  const end = assertDateLike(now, "now");
  const zone = getZone(lastActiveZoneId);
  const rawElapsedSeconds = Math.max(
    0,
    Math.floor((end.getTime() - start.getTime()) / 1000),
  );
  const cappedElapsedSeconds = Math.min(
    rawElapsedSeconds,
    OFFLINE_PROGRESS.capSeconds,
  );
  const cappedHours = cappedElapsedSeconds / 3600;
  const gold = Math.floor(
    zone.enemyPower * OFFLINE_PROGRESS.goldPerEnemyPowerPerHour * cappedHours,
  );
  const essence = Math.floor(
    (OFFLINE_PROGRESS.essenceBasePerHour +
      zone.index * OFFLINE_PROGRESS.essencePerZoneIndexPerHour) *
      cappedHours,
  );

  return {
    lastActiveZoneId,
    rawElapsedSeconds,
    cappedElapsedSeconds,
    wasCapped: rawElapsedSeconds > cappedElapsedSeconds,
    rewards: {
      gold,
      essence,
      realmShards: 0,
    },
    resolvedCombat: false,
  };
}

function applyOfflineProgress(resources, offlineProgress) {
  if (offlineProgress.resolvedCombat) {
    throw new RangeError("offline progress must not resolve combat");
  }

  const rewards = createResources(offlineProgress.rewards);
  if (rewards.realmShards !== 0) {
    throw new RangeError("offline progress cannot award Realm Shards");
  }

  return {
    resources: addResources(resources, rewards),
    summary: {
      lastActiveZoneId: offlineProgress.lastActiveZoneId,
      elapsedSeconds: offlineProgress.cappedElapsedSeconds,
      wasCapped: offlineProgress.wasCapped,
      rewards,
      resolvedCombat: false,
    },
  };
}

module.exports = {
  calculateOfflineProgress,
  applyOfflineProgress,
};
