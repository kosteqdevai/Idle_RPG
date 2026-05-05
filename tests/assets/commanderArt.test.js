const fs = require("node:fs");
const path = require("node:path");
const { COMMANDER_CATALOG } = require("../../config/commanders.js");
const {
  getCommanderArt,
  getCommanderIconPath,
  getCommanderSpritePath,
  listCommanderArt,
} = require("../../assets/commanderArt.js");

function readAsset(relativePath) {
  return fs.readFileSync(path.join(__dirname, "..", "..", relativePath), "utf8");
}

describe("commander icon and art assets", () => {
  test("defines art direction and asset paths for every commander", () => {
    const art = listCommanderArt();

    expect(art).toHaveLength(COMMANDER_CATALOG.length);
    expect(art.map((entry) => entry.id)).toEqual(
      COMMANDER_CATALOG.map((commander) => commander.id),
    );
    expect(getCommanderArt("infinity-herald")).toMatchObject({
      iconMotif: "infinity loop",
      iconPath: "assets/commanders/icons/infinity-herald.svg",
    });
  });

  test("ships one icon and three sprite levels for each commander", () => {
    for (const commander of COMMANDER_CATALOG) {
      expect(readAsset(getCommanderIconPath(commander.id))).toContain(
        `aria-label="${commander.name} icon"`,
      );

      for (const level of [1, 2, 3]) {
        const sprite = readAsset(getCommanderSpritePath(commander.id, level));
        expect(sprite).toContain("<svg");
        expect(sprite).toContain(`level ${level} sprite`);
        expect(sprite).toContain('shape-rendering="crispEdges"');
      }
    }
  });

  test("rejects unknown commanders and invalid visual levels", () => {
    expect(() => getCommanderIconPath("missing")).toThrow(/Unknown commander/);
    expect(() => getCommanderSpritePath("vanguard-captain", 4)).toThrow(/1, 2, or 3/);
  });
});
