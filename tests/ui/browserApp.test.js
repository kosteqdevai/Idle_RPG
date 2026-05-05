const path = require("node:path");
const { pathToFileURL } = require("node:url");

class TestContainer {
  constructor() {
    this.innerHTML = "";
    this.listeners = new Map();
  }

  addEventListener(type, listener) {
    this.listeners.set(type, listener);
  }

  click(dataset) {
    const target = {
      dataset,
      closest() {
        return target;
      },
    };

    this.listeners.get("click")({ target });
  }
}

describe("production browser app interactions", () => {
  test("all audited browser controls navigate or render visible state feedback", async () => {
    const appPath = path.join(__dirname, "..", "..", "ui", "browser", "app.mjs");
    const { initialiseGame } = await import(pathToFileURL(appPath).href);
    const container = new TestContainer();

    initialiseGame(container);

    expect(container.innerHTML).toContain("Idle RPG");

    container.click({ scene: "main-hub" });
    expect(container.innerHTML).toContain("Main Hub");

    container.click({ scene: "zone-map" });
    expect(container.innerHTML).toContain("Zone Map");

    container.click({ scene: "formation" });
    expect(container.innerHTML).toContain("Formation");

    container.click({ scene: "combat" });
    expect(container.innerHTML).toContain("Combat");
    expect(container.innerHTML).toContain("Won Greenwatch Fields");

    container.click({ action: "combat-round" });
    expect(container.innerHTML.match(/Won Greenwatch Fields/g)).toHaveLength(2);

    container.click({ scene: "zone-map" });
    expect(container.innerHTML).toContain("Zone Map");

    container.click({ scene: "main-hub" });
    expect(container.innerHTML).toContain("Zone Map");

    const offlineContainer = new TestContainer();
    initialiseGame(offlineContainer);

    offlineContainer.click({ scene: "offline-return" });
    expect(offlineContainer.innerHTML).toContain("Offline Return");

    offlineContainer.click({ action: "collect-offline" });
    expect(offlineContainer.innerHTML).toContain("Offline rewards collected.");
    expect(offlineContainer.innerHTML).toContain("Gold 53");

    const rosterContainer = new TestContainer();
    initialiseGame(rosterContainer);

    rosterContainer.click({ scene: "main-hub" });
    expect(rosterContainer.innerHTML).toContain("Main Hub");

    rosterContainer.click({ scene: "army-roster" });
    expect(rosterContainer.innerHTML).toContain("Army Roster");

    rosterContainer.click({ action: "upgrade-infantry" });
    expect(rosterContainer.innerHTML).toContain("Infantry upgraded to level 2.");
    expect(rosterContainer.innerHTML).toContain("Lv 2");

    rosterContainer.click({ action: "upgrade-infantry" });
    expect(rosterContainer.innerHTML).toContain("Need");
    expect(rosterContainer.innerHTML).toContain("Gold to upgrade Infantry.");

    rosterContainer.click({ scene: "main-hub" });
    rosterContainer.click({ scene: "commander-roster" });
    expect(rosterContainer.innerHTML).toContain("assets/commanders/icons/infinity-herald.svg");
    rosterContainer.click({ action: "summon-commander" });
    expect(rosterContainer.innerHTML).toContain("Vanguard Captain summoned.");
    expect(rosterContainer.innerHTML).toContain("Vanguard Captain");
    expect(rosterContainer.innerHTML).toContain("assets/commanders/sprites/vanguard-captain-lv1.svg");

    rosterContainer.click({ action: "summon-commander" });
    expect(rosterContainer.innerHTML).toContain("Commander already summoned.");

    rosterContainer.click({ scene: "main-hub" });
    rosterContainer.click({ scene: "progression-stats" });
    expect(rosterContainer.innerHTML).toContain("Progression");
  });
});
