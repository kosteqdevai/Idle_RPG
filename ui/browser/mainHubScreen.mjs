import { button, panel, scenes, state } from "./state.mjs";

export function renderMainHubScreen() {
  return panel(
    "Main Hub",
    `<div class="stats">
       <span>Hero Lv ${state.hero.level}</span>
       <span>Hero XP ${state.hero.experience}</span>
       <span>${state.realm.name}</span>
       <span>${state.zone.name}</span>
       <span>Gold ${state.resources.gold}</span>
       <span>Essence ${state.resources.essence}</span>
     </div>
     <div class="actions">
       ${button("Zone Map", scenes.zoneMap)}
       ${button("Formation", scenes.formation)}
       ${button("Combat", scenes.combat)}
       ${button("Commanders", scenes.commanders)}
       ${button("Army", scenes.army)}
       ${button("Progression", scenes.progression)}
     </div>`,
  );
}
