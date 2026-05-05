import { button, panel, scenes, state } from "./state.mjs";

export function renderArmyRosterScreen() {
  const units = state.armyUnits
    .map((unit) => `<li><strong>${unit.name}</strong><span>Lv ${unit.level} · Power ${unit.power.toFixed(1)}</span></li>`)
    .join("");
  const infantry = state.armyUnits.find((unit) => unit.id === "infantry");
  const upgradeCost = Math.round(30 * 1.65 ** (infantry.level - 1));

  return panel(
    "Army Roster",
    `<p>Gold ${state.resources.gold}. Infantry upgrade cost ${upgradeCost} Gold.</p>
     <ul class="list">${units}</ul>
     <div class="actions">
       <button type="button" data-action="upgrade-infantry">Upgrade Infantry</button>
       ${button("Hub", scenes.hub)}
     </div>`,
  );
}
