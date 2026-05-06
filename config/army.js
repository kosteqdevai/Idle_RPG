const REALM_RACES = Object.freeze({
  "verdant-kingdom": "human",
  "ashen-marches": "orc",
  "frostbound-keep": "undead",
  "realm-of-infinity": "voidborn",
});

const ARMY_UNIT_TIERS = Object.freeze([
  Object.freeze({ tier: 1, key: "peasant", label: "Peasant", power: 5, corpseCost: 1 }),
  Object.freeze({ tier: 2, key: "soldier", label: "Soldier", power: 12, corpseCost: 1 }),
  Object.freeze({ tier: 3, key: "guard", label: "Guard", power: 24, corpseCost: 2 }),
  Object.freeze({ tier: 4, key: "knight", label: "Knight", power: 42, corpseCost: 2 }),
  Object.freeze({ tier: 5, key: "champion", label: "Champion", power: 70, corpseCost: 3 }),
]);

const ZONE_UNIT_DROP_WEIGHTS = Object.freeze({
  1: Object.freeze([70, 20, 8, 2, 0]),
  2: Object.freeze([55, 25, 14, 5, 1]),
  3: Object.freeze([40, 28, 20, 10, 2]),
  4: Object.freeze([28, 27, 25, 15, 5]),
  5: Object.freeze([18, 24, 28, 20, 10]),
});

const ZONE_BASE_ENEMY_COUNTS = Object.freeze({
  1: 3,
  2: 4,
  3: 5,
  4: 6,
  5: 7,
});

function titleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function createUnitId(race, tierKey) {
  return `${race}-${tierKey}`;
}

function createCorpseType(race, tierKey) {
  return `${race}-${tierKey}-corpse`;
}

const ARMY_UNIT_ARCHETYPES = Object.freeze(
  Object.entries(REALM_RACES).flatMap(([realmId, race]) =>
    ARMY_UNIT_TIERS.map((tier) =>
      Object.freeze({
        id: createUnitId(race, tier.key),
        realmId,
        race,
        tier: tier.tier,
        tierKey: tier.key,
        name: `${titleCase(race)} ${tier.label}`,
        power: tier.power,
        corpseType: createCorpseType(race, tier.key),
        corpseCost: tier.corpseCost,
      }),
    ),
  ),
);

const ARMY_ARCHETYPE_IDS = Object.freeze(
  Object.fromEntries(
    ARMY_UNIT_ARCHETYPES.map((unit) => [
      unit.id.toUpperCase().replaceAll("-", "_"),
      unit.id,
    ]),
  ),
);

module.exports = {
  ARMY_ARCHETYPE_IDS,
  ARMY_UNIT_ARCHETYPES,
  ARMY_UNIT_TIERS,
  REALM_RACES,
  ZONE_BASE_ENEMY_COUNTS,
  ZONE_UNIT_DROP_WEIGHTS,
  createCorpseType,
  createUnitId,
};
