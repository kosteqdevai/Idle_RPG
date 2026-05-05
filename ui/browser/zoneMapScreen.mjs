import { button, panel, scenes, state } from "./state.mjs";

export function renderZoneMapScreen() {
  const zones = state.zones
    .map((zone) => `<li><strong>${zone.name}</strong><span>${zone.status}</span></li>`)
    .join("");

  return panel(
    "Zone Map",
    `<p>${state.realm.name} requires Realm Shards for later realm unlocks.</p>
     <ul class="list">${zones}</ul>
     <div class="actions">
       ${button("Prepare Formation", scenes.formation)}
       ${button("Hub", scenes.hub)}
     </div>`,
  );
}
