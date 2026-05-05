import { button, panel, scenes, state } from "./state.mjs";

export function renderFormationScreen() {
  const formation = state.formation
    .map((entry) => `<li><strong>${entry.slot}</strong><span>${entry.unitId}</span></li>`)
    .join("");

  return panel(
    "Formation",
    `<ul class="list">${formation}</ul>
     <div class="actions">
       ${button("Start Combat", scenes.combat)}
       ${button("Hub", scenes.hub)}
     </div>`,
  );
}
