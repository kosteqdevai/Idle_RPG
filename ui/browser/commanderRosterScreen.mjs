import { button, panel, scenes, state } from "./state.mjs";

const commanderCatalog = Object.freeze([
  ["vanguard-captain", "Vanguard Captain", "frontline"],
  ["longbow-marshal", "Longbow Marshal", "ranged"],
  ["cavalry-banneret", "Cavalry Banneret", "flanker"],
  ["shield-sergeant", "Shield Sergeant", "defender"],
  ["siege-overseer", "Siege Overseer", "support"],
  ["ember-tactician", "Ember Tactician", "tactician"],
  ["iron-chaplain", "Iron Chaplain", "sustain"],
  ["falcon-scoutmaster", "Falcon Scoutmaster", "scout"],
  ["royal-standardbearer", "Royal Standardbearer", "morale"],
  ["infinity-herald", "Infinity Herald", "endless"],
]);

function iconPath(id) {
  return `assets/commanders/icons/${id}.svg`;
}

function spritePath(id, visualLevel = 1) {
  return `assets/commanders/sprites/${id}-lv${visualLevel}.svg`;
}

export function renderCommanderRosterScreen() {
  const commanders =
    state.commanders.length === 0
      ? "<p>No commanders summoned.</p>"
      : `<ul class="commander-grid">${state.commanders
          .map(
            (commander) => `<li class="commander-card">
              <img class="commander-sprite" src="${spritePath(commander.id, commander.visualLevel ?? 1)}" alt="${commander.name} sprite" />
              <span><strong>${commander.name}</strong><small>Lv ${commander.visualLevel ?? 1} art</small></span>
            </li>`,
          )
          .join("")}</ul>`;

  const icons = `<ul class="commander-grid">${commanderCatalog
    .map(
      ([id, name, role]) => `<li class="commander-card">
        <img class="commander-icon" src="${iconPath(id)}" alt="${name} icon" />
        <span><strong>${name}</strong><small>${role}</small></span>
      </li>`,
    )
    .join("")}</ul>`;

  return panel(
    "Commander Roster",
    `<p>Essence ${state.resources.essence}. Unique commander sprites use 3 visual levels.</p>
     ${commanders}
     ${icons}
     <div class="actions">
       <button type="button" data-action="summon-commander">Summon Vanguard Captain (25 Essence)</button>
       ${button("Hub", scenes.hub)}
     </div>`,
  );
}
