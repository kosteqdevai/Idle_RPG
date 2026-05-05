const REALM_IDS = Object.freeze({
  VERDANT_KINGDOM: "verdant-kingdom",
  ASHEN_MARCHES: "ashen-marches",
  FROSTBOUND_KEEP: "frostbound-keep",
  REALM_OF_INFINITY: "realm-of-infinity",
});

const FINITE_REALMS = Object.freeze([
  Object.freeze({
    id: REALM_IDS.VERDANT_KINGDOM,
    name: "Verdant Kingdom",
    index: 1,
    theme: "emerald fields and old stone roads",
    shardUnlockCost: 0,
    zones: Object.freeze([
      Object.freeze({
        id: "verdant-kingdom-1",
        name: "Greenwatch Fields",
        index: 1,
        enemyPower: 45,
        shardReward: 0,
      }),
      Object.freeze({
        id: "verdant-kingdom-2",
        name: "Mossgate Ford",
        index: 2,
        enemyPower: 65,
        shardReward: 0,
      }),
      Object.freeze({
        id: "verdant-kingdom-3",
        name: "Briarwall Outpost",
        index: 3,
        enemyPower: 90,
        shardReward: 1,
      }),
      Object.freeze({
        id: "verdant-kingdom-4",
        name: "Old King's Road",
        index: 4,
        enemyPower: 120,
        shardReward: 1,
      }),
      Object.freeze({
        id: "verdant-kingdom-5",
        name: "Crownroot Gate",
        index: 5,
        enemyPower: 155,
        shardReward: 2,
      }),
    ]),
  }),
  Object.freeze({
    id: REALM_IDS.ASHEN_MARCHES,
    name: "Ashen Marches",
    index: 2,
    theme: "charred borderlands and ember-lit keeps",
    shardUnlockCost: 3,
    zones: Object.freeze([
      Object.freeze({
        id: "ashen-marches-1",
        name: "Cinder Patrol",
        index: 1,
        enemyPower: 200,
        shardReward: 0,
      }),
      Object.freeze({
        id: "ashen-marches-2",
        name: "Blackglass Ravine",
        index: 2,
        enemyPower: 255,
        shardReward: 1,
      }),
      Object.freeze({
        id: "ashen-marches-3",
        name: "Emberfall Causeway",
        index: 3,
        enemyPower: 315,
        shardReward: 1,
      }),
      Object.freeze({
        id: "ashen-marches-4",
        name: "The Soot Barricade",
        index: 4,
        enemyPower: 390,
        shardReward: 2,
      }),
      Object.freeze({
        id: "ashen-marches-5",
        name: "Pyrehold Gate",
        index: 5,
        enemyPower: 480,
        shardReward: 3,
      }),
    ]),
  }),
  Object.freeze({
    id: REALM_IDS.FROSTBOUND_KEEP,
    name: "Frostbound Keep",
    index: 3,
    theme: "glacial towers and silver-blue siege lines",
    shardUnlockCost: 8,
    zones: Object.freeze([
      Object.freeze({
        id: "frostbound-keep-1",
        name: "Snowchain Approach",
        index: 1,
        enemyPower: 590,
        shardReward: 1,
      }),
      Object.freeze({
        id: "frostbound-keep-2",
        name: "Rimeguard Wall",
        index: 2,
        enemyPower: 720,
        shardReward: 2,
      }),
      Object.freeze({
        id: "frostbound-keep-3",
        name: "Frozen Banner Hall",
        index: 3,
        enemyPower: 875,
        shardReward: 2,
      }),
      Object.freeze({
        id: "frostbound-keep-4",
        name: "The Pale Armory",
        index: 4,
        enemyPower: 1060,
        shardReward: 3,
      }),
      Object.freeze({
        id: "frostbound-keep-5",
        name: "Throne of Rime",
        index: 5,
        enemyPower: 1280,
        shardReward: 5,
      }),
    ]),
  }),
]);

const REALM_OF_INFINITY = Object.freeze({
  id: REALM_IDS.REALM_OF_INFINITY,
  name: "Realm of Infinity",
  index: 4,
  theme: "endless prismatic battlements beyond the mortal realms",
  shardUnlockCost: 15,
  endless: true,
  escalation: Object.freeze({
    baseEnemyPower: 1500,
    powerGrowthFactor: 1.18,
    shardRewardEveryDepth: 5,
  }),
});

module.exports = {
  REALM_IDS,
  FINITE_REALMS,
  REALM_OF_INFINITY,
};
