import { button, panel, scenes, state } from "./state.mjs";

export function renderFormationScreen() {
  const raisedUnits = state.armyUnits
    .filter((unit) => unit.quantity > 0)
    .map((unit) => `<li><strong>${unit.name}</strong><span>${unit.quantity} x ${unit.power} Power</span></li>`)
    .join("");
  const totalPower = state.armyUnits.reduce(
    (total, unit) => total + unit.power * unit.quantity,
    0,
  );

  return panel(
    "Formation",
    `<p>Formation is dormant. Combat auto-deploys every raised unit.</p>
     <p>Auto-deployed army power ${totalPower}.</p>
     <ul class="list">${raisedUnits || "<li><strong>No raised army</strong><span>Win corpses in combat, then raise units.</span></li>"}</ul>
     <div class="actions">
       ${button("Start Combat", scenes.combat)}
       ${button("Army", scenes.army)}
       ${button("Hub", scenes.hub)}
     </div>`,
  );
}
