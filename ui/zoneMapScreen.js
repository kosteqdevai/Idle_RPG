const {
  FINITE_REALMS,
  REALM_OF_INFINITY,
  getZoneStatus,
  canUnlockRealm,
} = require("../domain/world.js");
const { SCENE_IDS } = require("./sceneRouter.js");

function createZoneMapViewModel(domainState, selectedRealmId = null) {
  if (!domainState) {
    throw new TypeError("domainState is required");
  }

  const realmId = selectedRealmId ?? domainState.progression.currentRealmId;
  const finiteRealm = FINITE_REALMS.find((realm) => realm.id === realmId);
  const allRealms = [...FINITE_REALMS, REALM_OF_INFINITY];

  return {
    selectedRealmId: realmId,
    realms: allRealms.map((realm) => ({
      id: realm.id,
      name: realm.name,
      theme: realm.theme,
      shardUnlockCost: realm.shardUnlockCost,
      unlocked: domainState.progression.unlockedRealmIds.includes(realm.id),
      canUnlock: canUnlockRealm(
        domainState.progression,
        domainState.resources,
        realm.id,
      ),
      endless: realm.endless === true,
    })),
    zones: finiteRealm
      ? finiteRealm.zones.map((zone) => ({
          id: zone.id,
          name: zone.name,
          index: zone.index,
          enemyPower: zone.enemyPower,
          shardReward: zone.shardReward,
          status: getZoneStatus(domainState.progression, zone.id),
        }))
      : [],
  };
}

function createZoneMapScreen({ router } = {}) {
  if (!router) {
    throw new TypeError("router is required");
  }

  let selectedRealmId = null;

  return {
    selectRealm(realmId) {
      selectedRealmId = realmId;
      return this.getViewModel();
    },
    getViewModel() {
      return createZoneMapViewModel(
        router.snapshot().domainState,
        selectedRealmId,
      );
    },
    chooseZone(zoneId) {
      return router.navigate(SCENE_IDS.FORMATION, { zoneId });
    },
    backToHub() {
      return router.navigate(SCENE_IDS.MAIN_HUB);
    },
  };
}

module.exports = {
  createZoneMapViewModel,
  createZoneMapScreen,
};
