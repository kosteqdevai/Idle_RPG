import { button, panel, scenes, state } from "./state.mjs";

const HERO_EXPERIENCE = Object.freeze({
  firstLevelCost: 100,
  growthFactor: 1.35,
});

const HERO_POWER_WEIGHTS = Object.freeze({
  attack: 2.4,
  defense: 1.7,
  health: 0.18,
});

const ESSENCE_DROP_CHANCE = 0.16;
const HERO_XP_MULTIPLIER = 0.35;

function round(value, places = 4) {
  const scale = 10 ** places;
  return Math.round(value * scale) / scale;
}

function getExperienceForLevel(level) {
  if (level === 1) {
    return 0;
  }

  let total = 0;
  for (let nextLevel = 2; nextLevel <= level; nextLevel += 1) {
    total += Math.round(
      HERO_EXPERIENCE.firstLevelCost *
        HERO_EXPERIENCE.growthFactor ** (nextLevel - 2),
    );
  }

  return total;
}

function getLevelForExperience(experience) {
  let level = 1;
  while (experience >= getExperienceForLevel(level + 1)) {
    level += 1;
  }
  return level;
}

function calculateHeroPower() {
  return round(
    state.hero.attack * HERO_POWER_WEIGHTS.attack +
      state.hero.defense * HERO_POWER_WEIGHTS.defense +
      state.hero.health * HERO_POWER_WEIGHTS.health,
  );
}

function updateHeroFromExperience() {
  const nextLevel = getLevelForExperience(state.hero.experience);
  if (nextLevel === state.hero.level) {
    return;
  }

  const levelOffset = nextLevel - 1;
  state.hero.level = nextLevel;
  state.hero.attack = 10 + 3 * levelOffset;
  state.hero.defense = 6 + 2 * levelOffset;
  state.hero.health = 100 + 18 * levelOffset;
  state.hero.power = calculateHeroPower();
}

function deterministicEssenceRoll(round) {
  return ((round * 37 + state.zone.enemyPower * 13 + 77) % 100) / 100;
}

export function getHeroXpProgress() {
  const nextLevelExperience = getExperienceForLevel(state.hero.level + 1);
  return {
    current: state.hero.experience,
    next: nextLevelExperience,
    remaining: Math.max(0, nextLevelExperience - state.hero.experience),
  };
}

export function resolveBrowserCombatRound() {
  const damage = state.hero.attack + state.armyUnits.reduce((total, unit) => total + unit.power * 0.2, 0);
  const won = damage >= state.zone.enemyPower * 0.5;
  const gold = won ? Math.round(state.zone.enemyPower * 0.55) : 1;
  const heroExperience = Math.max(1, Math.round(state.zone.enemyPower * HERO_XP_MULTIPLIER));
  state.combatRound += 1;
  const essenceRoll = deterministicEssenceRoll(state.combatRound);
  const essence = essenceRoll < ESSENCE_DROP_CHANCE ? 1 : 0;
  state.resources.gold += gold;
  state.resources.essence += essence;
  state.hero.experience += heroExperience;
  updateHeroFromExperience();
  state.hero.visualProgression = Math.min(1, state.hero.visualProgression + 0.01);
  state.message = `${won ? "Won" : "Survived"} ${state.zone.name}: +${gold} Gold, +${heroExperience} XP${
    essence > 0 ? ", +1 Essence" : ""
  }`;
  state.combatLog.unshift({
    round: state.combatRound,
    outcome: won ? "Won" : "Survived",
    zoneName: state.zone.name,
    gold,
    essence,
    heroExperience,
    damage: Math.round(damage),
    enemyPower: state.zone.enemyPower,
  });
}

export function renderCombatScreen() {
  if (state.combatLog.length === 0) {
    resolveBrowserCombatRound();
  }

  const latest = state.combatLog[0];
  const history = state.combatLog
    .map(
      (entry) =>
        `<li>
          <span>#${entry.round} ${entry.outcome} ${entry.zoneName}</span>
          <strong>+${entry.gold} Gold, +${entry.heroExperience} XP${entry.essence > 0 ? ", +1 Essence" : ""}</strong>
        </li>`,
    )
    .join("");
  const xpProgress = getHeroXpProgress();

  return panel(
    "Combat",
    `<div class="combat-layout">
       <div class="combat-arena" aria-label="Autonomous combat visualization">
         <div class="combat-stage" data-round="${latest.round}">
           <div class="combatant hero">
             <span class="combat-sprite"></span>
             <strong>Hero Lv ${state.hero.level}</strong>
             <small>${Math.round(state.hero.power)} power - ${xpProgress.current}/${xpProgress.next} XP</small>
           </div>
           <div class="strike-line"></div>
           <div class="combatant enemy">
             <span class="combat-sprite"></span>
             <strong>${state.zone.name}</strong>
             <small>${state.zone.enemyPower} power</small>
           </div>
         </div>
         <div class="combat-summary">
           <span>Last strike</span>
           <strong>${latest.damage} damage</strong>
           <span>Reward</span>
           <strong>+${latest.gold} Gold, +${latest.heroExperience} XP${latest.essence > 0 ? ", +1 Essence" : ""}</strong>
           <span>Essence chance</span>
           <strong>${Math.round(ESSENCE_DROP_CHANCE * 100)}%</strong>
         </div>
       </div>
       <aside class="combat-history" aria-label="Prior combats">
         <h3>Prior Combats</h3>
         <ul>${history}</ul>
       </aside>
     </div>
     <div class="actions">
       <button type="button" data-action="combat-round">Resolve Round</button>
       ${button("Hub", scenes.hub)}
       ${button("Zone Map", scenes.zoneMap)}
     </div>`,
  );
}
