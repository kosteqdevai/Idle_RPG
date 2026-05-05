const fs = require("node:fs");
const path = require("node:path");
const { MemoryStorageAdapter } = require("../domain/persistence.js");

const OUT_OF_SCOPE_PATTERNS = Object.freeze([
  /in-app purchase/i,
  /iap/i,
  /pvp/i,
  /multiplayer/i,
  /quest system/i,
  /procedural(ly)? generated zones/i,
  /dialogue system/i,
]);

function checkWebReleaseReadiness({ rootDir = process.cwd() } = {}) {
  const mvpPath = path.join(rootDir, "src", "mvp.html");
  const mvpHtml = fs.readFileSync(mvpPath, "utf8");
  const storage = new MemoryStorageAdapter();

  return {
    mvpHtmlExists: fs.existsSync(mvpPath),
    mvpHasAutonomousCombatLoop: mvpHtml.includes("window.setInterval(resolveRound, 1000)"),
    mvpHasIdleSessionSurfaces:
      mvpHtml.includes('id="hero-level"') &&
      mvpHtml.includes('id="formation-list"') &&
      mvpHtml.includes('id="visual-progress"'),
    storageAdapterSwappable:
      typeof storage.getItem === "function" &&
      typeof storage.setItem === "function" &&
      typeof storage.removeItem === "function",
    outOfScopePatternsAbsent: OUT_OF_SCOPE_PATTERNS.every(
      (pattern) => !pattern.test(mvpHtml),
    ),
    mobileBuildImplemented: false,
  };
}

module.exports = {
  OUT_OF_SCOPE_PATTERNS,
  checkWebReleaseReadiness,
};
