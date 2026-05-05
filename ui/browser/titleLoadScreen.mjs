import { button, panel, scenes, state } from "./state.mjs";

export function renderTitleLoadScreen() {
  return panel(
    "Idle RPG",
    `<p>Medieval idle progression prototype.</p>
     <div class="actions">
       ${button("New Game", scenes.hub)}
       ${button("Load Game", state.offlineSummary ? scenes.offline : scenes.hub)}
     </div>`,
  );
}
