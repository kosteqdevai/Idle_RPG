import { button, panel, scenes, state } from "./state.mjs";

export function renderProgressionStatsScreen() {
  const progress = Math.round(state.hero.visualProgression * 100);
  const armyPower = state.armyUnits.reduce(
    (total, unit) => total + unit.power * unit.quantity,
    0,
  );

  return panel(
    "Progression",
    `<p>Hero level ${state.hero.level} - ${state.hero.experience} XP</p>
     <p>Raised army power: ${armyPower}</p>
     <p>Hero visual progression: ${progress}%</p>
     <progress max="1" value="${state.hero.visualProgression}"></progress>
     <p>Continuous values drive scale, glow, particles, and overlays.</p>
     <div class="actions">${button("Hub", scenes.hub)}</div>`,
  );
}
