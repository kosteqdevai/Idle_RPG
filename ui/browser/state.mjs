export const scenes = Object.freeze({
  title: "title-load",
  hub: "main-hub",
  zoneMap: "zone-map",
  formation: "formation",
  combat: "combat",
  commanders: "commander-roster",
  army: "army-roster",
  progression: "progression-stats",
  offline: "offline-return",
});

const realmRaces = Object.freeze({
  "verdant-kingdom": "human",
  "ashen-marches": "orc",
  "frostbound-keep": "undead",
  "realm-of-infinity": "voidborn",
});

const unitTiers = Object.freeze([
  Object.freeze({ tier: 1, key: "peasant", label: "Peasant", power: 5, corpseCost: 1 }),
  Object.freeze({ tier: 2, key: "soldier", label: "Soldier", power: 12, corpseCost: 1 }),
  Object.freeze({ tier: 3, key: "guard", label: "Guard", power: 24, corpseCost: 2 }),
  Object.freeze({ tier: 4, key: "knight", label: "Knight", power: 42, corpseCost: 2 }),
  Object.freeze({ tier: 5, key: "champion", label: "Champion", power: 70, corpseCost: 3 }),
]);

function titleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function createArmyUnits() {
  return Object.entries(realmRaces).flatMap(([realmId, race]) =>
    unitTiers.map((tier) => ({
      id: `${race}-${tier.key}`,
      archetypeId: `${race}-${tier.key}`,
      realmId,
      race,
      tier: tier.tier,
      name: `${titleCase(race)} ${tier.label}`,
      power: tier.power,
      quantity: 0,
      corpseType: `${race}-${tier.key}-corpse`,
      corpseCost: tier.corpseCost,
      visualProgression: 0,
    })),
  );
}

export function createInitialBrowserState() {
  return {
    currentScene: scenes.title,
    message: "Ready",
    resources: { gold: 30, essence: 25, realmShards: 0, corpses: {} },
    hero: {
      level: 1,
      experience: 0,
      attack: 10,
      defense: 6,
      health: 100,
      power: 52.2,
      visualProgression: 0,
    },
    realm: { id: "verdant-kingdom", name: "Verdant Kingdom" },
    zone: { id: "verdant-kingdom-1", name: "Greenwatch Fields", index: 1, enemyPower: 45 },
    zones: [
      { id: "verdant-kingdom-1", name: "Greenwatch Fields", status: "current" },
      { id: "verdant-kingdom-2", name: "Mossgate Ford", status: "locked" },
      { id: "verdant-kingdom-3", name: "Briarwall Outpost", status: "locked" },
    ],
    commanders: [],
    armyUnits: createArmyUnits(),
    formation: [],
    offlineSummary: {
      elapsedSeconds: 7200,
      rewards: { gold: 23, essence: 0, realmShards: 0 },
      resolvedCombat: false,
    },
    combatLog: [],
    combatRound: 0,
  };
}

export const state = createInitialBrowserState();

export function resetBrowserState() {
  Object.assign(state, createInitialBrowserState());
}

export function setScene(scene) {
  state.currentScene = scene;
}

export function panel(title, body) {
  return `<section class="panel"><h2>${title}</h2><p class="status">${state.message}</p>${body}</section>`;
}

export function button(label, scene, attrs = "") {
  return `<button type="button" data-scene="${scene}" ${attrs}>${label}</button>`;
}
