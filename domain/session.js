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
    hero: {
      id: "hero",
      level: 1,
      stats: {
        attack: 10,
        defense: 6,
        health: 100,
      },
      visualProgression: 0,
    },
    commanders: [],
    armyUnits: [],
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
      hero: {
        ...state.roster.hero,
        ...clone(initialState.roster?.hero ?? {}),
        stats: {
          ...state.roster.hero.stats,
          ...clone(initialState.roster?.hero?.stats ?? {}),
        },
      },
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
