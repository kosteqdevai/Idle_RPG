const { createHero } = require("./hero.js");
const { createCommanderRoster } = require("./commanders.js");
const { createArmyRoster } = require("./army.js");

const SESSION_STATUS = Object.freeze({
  RUNNING: "running",
  PAUSED: "paused",
});

const DEFAULT_STATE = Object.freeze({
  status: SESSION_STATUS.RUNNING,
  tick: 0,
  elapsedSeconds: 0,
  realm: {
    id: "verdant-kingdom",
    name: "Verdant Kingdom",
    index: 1,
  },
  zone: {
    id: "verdant-kingdom-1",
    name: "Greenwatch Fields",
    index: 1,
  },
  roster: {
    hero: createHero(),
    commanders: [],
    activeCommanderIds: [],
    armyUnits: [],
    armyComposition: [],
    activeFormationUnitIds: [],
  },
  formation: {
    slots: [],
  },
  resources: {
    gold: 0,
    essence: 0,
    realmShards: 0,
  },
  visualProgression: {
    hero: 0,
    commanders: {},
    armyUnits: {},
  },
});

function clone(value) {
  return structuredClone(value);
}

function normalizeInitialState(initialState = {}) {
  const state = clone(DEFAULT_STATE);
  const initialHero = clone(initialState.roster?.hero ?? {});
  const heroLevel =
    initialHero.level ??
    (initialHero.experience === undefined ? state.roster.hero.level : undefined);
  const heroStats = initialHero.stats
    ? {
        ...state.roster.hero.stats,
        ...initialHero.stats,
      }
    : undefined;
  const hero = createHero({
    ...state.roster.hero,
    ...initialHero,
    level: heroLevel,
    stats: heroStats,
  });
  const commanderRoster = createCommanderRoster({
    commanders: clone(initialState.roster?.commanders ?? state.roster.commanders),
    activeCommanderIds: clone(
      initialState.roster?.activeCommanderIds ?? state.roster.activeCommanderIds,
    ),
  });
  const armyRoster = createArmyRoster({
    armyUnits: clone(initialState.roster?.armyUnits ?? state.roster.armyUnits),
    armyComposition: clone(
      initialState.roster?.armyComposition ?? state.roster.armyComposition,
    ),
    activeFormationUnitIds: clone(
      initialState.roster?.activeFormationUnitIds ??
        state.roster.activeFormationUnitIds,
    ),
  });

  return {
    ...state,
    ...clone(initialState),
    realm: {
      ...state.realm,
      ...clone(initialState.realm ?? {}),
    },
    zone: {
      ...state.zone,
      ...clone(initialState.zone ?? {}),
    },
    roster: {
      ...state.roster,
      ...clone(initialState.roster ?? {}),
      hero,
      commanders: commanderRoster.commanders,
      activeCommanderIds: commanderRoster.activeCommanderIds,
      armyUnits: armyRoster.armyUnits,
      armyComposition: armyRoster.armyComposition,
      activeFormationUnitIds: armyRoster.activeFormationUnitIds,
    },
    formation: {
      ...state.formation,
      ...clone(initialState.formation ?? {}),
    },
    resources: {
      ...state.resources,
      ...clone(initialState.resources ?? {}),
    },
    visualProgression: {
      ...state.visualProgression,
      ...clone(initialState.visualProgression ?? {}),
      hero:
        initialState.visualProgression?.hero ??
        initialState.roster?.hero?.visualProgression ??
        hero.visualProgression,
      commanders: {
        ...state.visualProgression.commanders,
        ...clone(initialState.visualProgression?.commanders ?? {}),
      },
      armyUnits: {
        ...state.visualProgression.armyUnits,
        ...clone(initialState.visualProgression?.armyUnits ?? {}),
      },
    },
  };
}

function createGameSession(initialState = {}) {
  let state = normalizeInitialState(initialState);

  function snapshot() {
    return clone(state);
  }

  return {
    snapshot,
    tick(tickCount = 1) {
      if (!Number.isInteger(tickCount) || tickCount < 0) {
        throw new RangeError("tickCount must be a non-negative integer");
      }

      if (state.status === SESSION_STATUS.PAUSED || tickCount === 0) {
        return snapshot();
      }

      state = {
        ...state,
        tick: state.tick + tickCount,
        elapsedSeconds: state.elapsedSeconds + tickCount,
      };

      return snapshot();
    },
    pause() {
      state = {
        ...state,
        status: SESSION_STATUS.PAUSED,
      };

      return snapshot();
    },
    resume() {
      state = {
        ...state,
        status: SESSION_STATUS.RUNNING,
      };

      return snapshot();
    },
  };
}

module.exports = {
  createGameSession,
  DEFAULT_STATE,
  SESSION_STATUS,
};
