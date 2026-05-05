const {
  createHero,
  awardHeroExperience,
  calculateHeroPower,
  calculateHeroVisualProgression,
  getExperienceForLevel,
  getLevelForExperience,
} = require("../../domain/hero.js");

describe("hero entity and growth model", () => {
  test("creates the starting hero with stats, level, power, combat attributes, and visual state", () => {
    const hero = createHero();

    expect(hero).toMatchObject({
      id: "hero",
      level: 1,
      experience: 0,
      stats: {
        attack: 10,
        defense: 6,
        health: 100,
      },
      power: 52.2,
      visualProgression: 0,
      combat: {
        attackIntervalSeconds: 1.6,
        damagePerSecond: 6.25,
        mitigation: 0.024,
        maxHealth: 100,
        targetPriority: "frontline",
      },
    });
  });

  test("derives level from total experience using deterministic costs", () => {
    expect(getExperienceForLevel(1)).toBe(0);
    expect(getExperienceForLevel(2)).toBe(100);
    expect(getExperienceForLevel(3)).toBe(235);

    expect(getLevelForExperience(0)).toBe(1);
    expect(getLevelForExperience(99)).toBe(1);
    expect(getLevelForExperience(100)).toBe(2);
    expect(getLevelForExperience(235)).toBe(3);
  });

  test("awardHeroExperience returns a stronger immutable hero when levels increase", () => {
    const startingHero = createHero();
    const leveledHero = awardHeroExperience(startingHero, 235);

    expect(startingHero.level).toBe(1);
    expect(leveledHero.level).toBe(3);
    expect(leveledHero.experience).toBe(235);
    expect(leveledHero.stats.attack).toBeGreaterThan(startingHero.stats.attack);
    expect(leveledHero.stats.defense).toBeGreaterThan(startingHero.stats.defense);
    expect(leveledHero.stats.health).toBeGreaterThan(startingHero.stats.health);
    expect(leveledHero.power).toBeGreaterThan(startingHero.power);
    expect(leveledHero.combat.damagePerSecond).toBeGreaterThan(
      startingHero.combat.damagePerSecond,
    );
  });

  test("calculates power from stats instead of storing unrelated progression values", () => {
    const hero = createHero({
      level: 4,
      experience: getExperienceForLevel(4),
    });

    expect(hero.power).toBe(calculateHeroPower(hero.stats));
  });

  test("visual progression is a continuous function of power without fixed tier thresholds", () => {
    const lowPower = calculateHeroVisualProgression(52.2);
    const midPower = calculateHeroVisualProgression(210);
    const highPower = calculateHeroVisualProgression(560);

    expect(lowPower).toBe(0);
    expect(midPower).toBeGreaterThan(lowPower);
    expect(highPower).toBeGreaterThan(midPower);
    expect(highPower).toBeLessThan(1);
    expect(calculateHeroVisualProgression(561)).toBeGreaterThan(highPower);
  });

  test("rejects invalid experience and level inputs", () => {
    expect(() => createHero({ experience: -1 })).toThrow(RangeError);
    expect(() => createHero({ level: 0 })).toThrow(RangeError);
    expect(() => getExperienceForLevel(1.5)).toThrow(RangeError);
    expect(() => getLevelForExperience(-1)).toThrow(RangeError);
  });
});
