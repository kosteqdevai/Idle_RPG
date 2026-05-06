import { button, panel, scenes, state } from "./state.mjs";

export function renderArmyRosterScreen() {
  const units = state.armyUnits
    .map((unit) => {
      const corpses = state.resources.corpses[unit.corpseType] ?? 0;
      return `<li>
        <strong>${unit.name}</strong>
        <span>Qty ${unit.quantity} | Power ${unit.power} | Corpses ${corpses}/${unit.corpseCost}</span>
        <button type="button" data-action="raise-unit" data-unit-id="${unit.id}">Raise</button>
      </li>`;
    })
    .join("");
  const totalArmyPower = state.armyUnits.reduce(
    (total, unit) => total + unit.power * unit.quantity,
    0,
  );
  const totalCorpses = Object.values(state.resources.corpses).reduce(
    (total, quantity) => total + quantity,
    0,
  );

  return panel(
    "Army Roster",
    `<p>Raised army power ${totalArmyPower}. Corpses ${totalCorpses}.</p>
     <ul class="list army-raise-list">${units}</ul>
     <div class="actions">${button("Hub", scenes.hub)}</div>`,
  );
}
