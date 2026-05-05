import { button, panel, scenes, state } from "./state.mjs";

export function renderOfflineReturnScreen() {
  return panel(
    "Offline Return",
    `<p>${Math.floor(state.offlineSummary.elapsedSeconds / 3600)} hours away.</p>
     <p>+${state.offlineSummary.rewards.gold} Gold, +${state.offlineSummary.rewards.essence} Essence, no combat resolved.</p>
     <div class="actions">
       <button type="button" data-action="collect-offline">Collect</button>
       ${button("Hub", scenes.hub)}
     </div>`,
  );
}
