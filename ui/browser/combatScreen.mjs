import { button, panel, scenes, state } from "./state.mjs";

export function resolveBrowserCombatRound() {
  const damage = state.hero.attack + state.armyUnits.reduce((total, unit) => total + unit.power * 0.2, 0);
  const won = damage >= state.zone.enemyPower * 0.5;
  const gold = won ? Math.round(state.zone.enemyPower * 0.55) : 1;
  state.resources.gold += gold;
  state.hero.visualProgression = Math.min(1, state.hero.visualProgression + 0.01);
  state.combatLog.unshift(`${won ? "Won" : "Survived"} ${state.zone.name}: +${gold} Gold`);
}

export function renderCombatScreen() {
  if (state.combatLog.length === 0) {
    resolveBrowserCombatRound();
  }

  return panel(
    "Combat",
    `<p>Autonomous combat only. No active abilities.</p>
     <ul class="list">${state.combatLog.map((line) => `<li>${line}</li>`).join("")}</ul>
     <div class="actions">
       <button type="button" data-action="combat-round">Resolve Round</button>
       ${button("Hub", scenes.hub)}
       ${button("Zone Map", scenes.zoneMap)}
     </div>`,
  );
}
