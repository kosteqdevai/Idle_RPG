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
    expect(container.innerHTML).toContain("Hero Lv 1");
    expect(container.innerHTML).toContain("Hero XP 0");
    expect(container.innerHTML).not.toContain("Hero Lv 4");

    container.click({ scene: "zone-map" });
    expect(container.innerHTML).toContain("Zone Map");

    container.click({ scene: "formation" });
    expect(container.innerHTML).toContain("Formation");

    container.click({ scene: "combat" });
    expect(container.innerHTML).toContain("Combat");
    expect(container.innerHTML).toContain("combat-layout");
    expect(container.innerHTML).toContain("Autonomous combat visualization");
    expect(container.innerHTML).toContain("Prior Combats");
    expect(container.innerHTML).toContain("Hero Lv 1");
    expect(container.innerHTML).toContain("+16 XP");
    expect(container.innerHTML).toContain("Essence chance");
    expect(container.innerHTML).toContain("Survived Greenwatch Fields");
    expect(container.innerHTML).toContain("Human Peasant Corpses");

    container.click({ action: "combat-round" });
    expect(container.innerHTML).toContain("#2 Survived Greenwatch Fields");
    expect(container.innerHTML).toContain("combat-history");
    expect(container.innerHTML).toContain("strike-line");
    expect(container.innerHTML).toContain("32/100 XP");

    container.click({ action: "combat-round" });
    container.click({ action: "combat-round" });
    expect(container.innerHTML).toContain("+1 Essence");

    container.click({ action: "combat-round" });
    container.click({ action: "combat-round" });
    container.click({ action: "combat-round" });
    expect(container.innerHTML).toContain("Hero Lv 2");

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

    rosterContainer.click({ scene: "combat" });
    expect(rosterContainer.innerHTML).toContain("Human Peasant Corpses");

    rosterContainer.click({ scene: "main-hub" });
    rosterContainer.click({ scene: "army-roster" });
    expect(rosterContainer.innerHTML).toContain("Army Roster");
    expect(rosterContainer.innerHTML).toContain("Qty 0");
    expect(rosterContainer.innerHTML).toContain("Corpses 3/1");

    rosterContainer.click({ action: "raise-unit", unitId: "human-peasant" });
    expect(rosterContainer.innerHTML).toContain("Human Peasant raised.");
    expect(rosterContainer.innerHTML).toContain("Qty 1");
    expect(rosterContainer.innerHTML).toContain("Corpses 2/1");

    rosterContainer.click({ action: "raise-unit", unitId: "human-guard" });
    expect(rosterContainer.innerHTML).toContain("Need 2 Human Guard Corpses to raise.");

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
