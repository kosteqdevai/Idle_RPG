const fs = require("node:fs");
const path = require("node:path");

describe("production browser entry point", () => {
  const rootDir = path.join(__dirname, "..");
  const html = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
  const appModule = fs.readFileSync(path.join(rootDir, "ui/browser/app.mjs"), "utf8");

  test("exists at repo root and boots with vanilla ES modules", () => {
    expect(html).toContain("<!doctype html>");
    expect(html).toContain('type="module"');
    expect(html).toMatch(
      /import \{ initialiseGame \} from "\.\/ui\/browser\/app\.mjs(\?[^"]+)?"/,
    );
    expect(html).not.toMatch(/vite|webpack|parcel/i);
  });

  test("browser app imports all screen modules as ES modules", () => {
    for (const moduleName of [
      "titleLoadScreen.mjs",
      "mainHubScreen.mjs",
      "zoneMapScreen.mjs",
      "formationScreen.mjs",
      "combatScreen.mjs",
      "commanderRosterScreen.mjs",
      "armyRosterScreen.mjs",
      "progressionStatsScreen.mjs",
      "offlineReturnScreen.mjs",
    ]) {
      expect(appModule).toContain(`./${moduleName}`);
    }
    expect(appModule).toContain('./sceneRouter.mjs');
    expect(appModule).toContain('createSceneRouter');
  });

  test("all browser scene modules exist under ui/browser", () => {
    for (const moduleName of [
      "state.mjs",
      "sceneRouter.mjs",
      "app.mjs",
      "titleLoadScreen.mjs",
      "mainHubScreen.mjs",
      "zoneMapScreen.mjs",
      "formationScreen.mjs",
      "combatScreen.mjs",
      "commanderRosterScreen.mjs",
      "armyRosterScreen.mjs",
      "progressionStatsScreen.mjs",
      "offlineReturnScreen.mjs",
    ]) {
      expect(fs.existsSync(path.join(rootDir, "ui/browser", moduleName))).toBe(true);
    }
  });

  test("combat presentation has stable arena and side history styles", () => {
    expect(html).toContain(".combat-layout");
    expect(html).toContain("grid-template-columns: minmax(0, 1fr) minmax(220px, 280px)");
    expect(html).toContain("grid-template-columns: auto 1fr auto 1fr auto 1fr");
    expect(html).toContain(".combat-history");
    expect(html).toContain("max-height: 242px");
    expect(html).toContain("@keyframes strike-travel");
  });
});
