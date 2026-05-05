const path = require("node:path");
const {
  checkWebReleaseReadiness,
} = require("../src/releaseReadiness.js");

describe("web release polish and mobile readiness pass", () => {
  test("verifies the web MVP runs through the expected release surfaces", () => {
    const result = checkWebReleaseReadiness({
      rootDir: path.join(__dirname, ".."),
    });

    expect(result).toMatchObject({
      mvpHtmlExists: true,
      mvpHasAutonomousCombatLoop: true,
      mvpHasIdleSessionSurfaces: true,
      storageAdapterSwappable: true,
      outOfScopePatternsAbsent: true,
      mobileBuildImplemented: false,
    });
  });
});
