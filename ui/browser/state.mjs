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

export function createInitialBrowserState() {
  return {
  currentScene: scenes.title,
  message: "Ready",
  resources: { gold: 30, essence: 25, realmShards: 0 },
  hero: { level: 4, attack: 19, defense: 12, health: 154, power: 93.72, visualProgression: 0.047 },
  realm: { id: "verdant-kingdom", name: "Verdant Kingdom" },
  zone: { id: "verdant-kingdom-1", name: "Greenwatch Fields", enemyPower: 45 },
  zones: [
    { id: "verdant-kingdom-1", name: "Greenwatch Fields", status: "current" },
    { id: "verdant-kingdom-2", name: "Mossgate Ford", status: "locked" },
    { id: "verdant-kingdom-3", name: "Briarwall Outpost", status: "locked" },
  ],
  commanders: [],
  armyUnits: [
    { id: "infantry", name: "Infantry Squad", level: 1, power: 26.7, visualProgression: 0, active: true },
    { id: "archer", name: "Archer Squad", level: 1, power: 24.79, visualProgression: 0, active: false },
    { id: "cavalry", name: "Cavalry Squad", level: 1, power: 31.18, visualProgression: 0, active: false },
  ],
  formation: [
    { slot: "front-center", unitId: "infantry" },
    { slot: "back-left", unitId: "archer" },
    { slot: "front-right", unitId: "cavalry" },
  ],
  offlineSummary: {
    elapsedSeconds: 7200,
    rewards: { gold: 23, essence: 0, realmShards: 0 },
    resolvedCombat: false,
  },
  combatLog: [],
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
