const { createGameSession } = require("./session.js");

const DEFAULT_SAVE_KEY = "idle-rpg:save";

class MemoryStorageAdapter {
  constructor(initialValues = {}) {
    this.values = new Map(Object.entries(initialValues));
  }

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    this.values.set(key, value);
  }

  removeItem(key) {
    this.values.delete(key);
  }
}

function assertStorageAdapter(storage) {
  if (
    !storage ||
    typeof storage.getItem !== "function" ||
    typeof storage.setItem !== "function"
  ) {
    throw new TypeError("storage adapter must implement getItem and setItem");
  }
}

function serializeGameState(state) {
  return JSON.stringify({
    version: 1,
    savedAt: state.savedAt ?? null,
    state,
  });
}

function deserializeGameState(serialized) {
  if (typeof serialized !== "string") {
    throw new TypeError("serialized game state must be a string");
  }

  const parsed = JSON.parse(serialized);
  if (parsed.version !== 1) {
    throw new RangeError("unsupported save version");
  }

  return createGameSession(parsed.state).snapshot();
}

function saveGame(storage, state, options = {}) {
  assertStorageAdapter(storage);

  const key = options.key ?? DEFAULT_SAVE_KEY;
  const savedAt = options.savedAt ?? new Date().toISOString();
  const normalizedState = createGameSession({
    ...state,
    savedAt,
  }).snapshot();
  const serialized = serializeGameState(normalizedState);
  storage.setItem(key, serialized);

  return {
    key,
    savedAt,
    serialized,
  };
}

function loadGame(storage, options = {}) {
  assertStorageAdapter(storage);

  const key = options.key ?? DEFAULT_SAVE_KEY;
  const serialized = storage.getItem(key);

  if (serialized === null || serialized === undefined) {
    return null;
  }

  return deserializeGameState(serialized);
}

function deleteSave(storage, options = {}) {
  assertStorageAdapter(storage);

  const key = options.key ?? DEFAULT_SAVE_KEY;
  if (typeof storage.removeItem === "function") {
    storage.removeItem(key);
  } else {
    storage.setItem(key, null);
  }
}

module.exports = {
  DEFAULT_SAVE_KEY,
  MemoryStorageAdapter,
  serializeGameState,
  deserializeGameState,
  saveGame,
  loadGame,
  deleteSave,
};
