const fs = require("node:fs");
const path = require("node:path");

describe("MVP vertical slice HTML", () => {
  const htmlPath = path.join(__dirname, "../../src/mvp.html");
  const html = fs.readFileSync(htmlPath, "utf8");

  test("is a single browser-loadable HTML file with the required MVP surfaces", () => {
    expect(html).toContain("<!doctype html>");
    expect(html).toContain('id="hero-level"');
    expect(html).toContain('id="zone-name"');
    expect(html).toContain('id="gold"');
    expect(html).toContain('id="essence"');
    expect(html).toContain('id="formation-list"');
    expect(html).toContain('id="visual-progress"');
  });

  test("contains an autonomous combat loop wired to domain-shaped state", () => {
    expect(html).toContain("const state = {");
    expect(html).toContain('id: "verdant-kingdom-1"');
    expect(html).toContain("resolveRound");
    expect(html).toContain("window.setInterval(resolveRound, 1000)");
    expect(html).toContain("state.resources.gold +=");
    expect(html).toContain("state.resources.essence +=");
  });

  test("does not introduce Phase 2 scene routing or commander UI", () => {
    expect(html).not.toMatch(/Phaser/i);
    expect(html).not.toMatch(/commander roster/i);
    expect(html).not.toMatch(/zone map/i);
  });
});
