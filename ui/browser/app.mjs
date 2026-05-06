import { renderArmyRosterScreen } from "./armyRosterScreen.mjs";
import { renderCombatScreen, resolveBrowserCombatRound } from "./combatScreen.mjs";
import { renderCommanderRosterScreen } from "./commanderRosterScreen.mjs?v=20260505-commanders";
import { renderFormationScreen } from "./formationScreen.mjs";
import { renderMainHubScreen } from "./mainHubScreen.mjs";
import { renderOfflineReturnScreen } from "./offlineReturnScreen.mjs";
import { renderProgressionStatsScreen } from "./progressionStatsScreen.mjs";
import { createSceneRouter } from "./sceneRouter.mjs";
import { renderTitleLoadScreen } from "./titleLoadScreen.mjs";
import { renderZoneMapScreen } from "./zoneMapScreen.mjs";
import { resetBrowserState, scenes, state } from "./state.mjs";

const renderers = {
  [scenes.title]: renderTitleLoadScreen,
  [scenes.hub]: renderMainHubScreen,
  [scenes.zoneMap]: renderZoneMapScreen,
  [scenes.formation]: renderFormationScreen,
  [scenes.combat]: renderCombatScreen,
  [scenes.commanders]: renderCommanderRosterScreen,
  [scenes.army]: renderArmyRosterScreen,
  [scenes.progression]: renderProgressionStatsScreen,
  [scenes.offline]: renderOfflineReturnScreen,
};

export function renderApp(root) {
  root.innerHTML = renderers[state.currentScene]();
}

export function initialiseGame(container) {
  resetBrowserState();
  const router = createSceneRouter(scenes.title);

  renderApp(container);
  container.addEventListener("click", (event) => {
    const target = event.target.closest?.("button") ?? event.target;
    const scene = target.dataset?.scene;
    const action = target.dataset?.action;

    if (scene) {
      router.navigate(scene);
    }
    if (action === "combat-round") {
      resolveBrowserCombatRound();
    }
    if (action === "collect-offline") {
      if (state.offlineSummary.collected) {
        state.message = "Offline rewards already collected.";
      } else {
        state.resources.gold += state.offlineSummary.rewards.gold;
        state.resources.essence += state.offlineSummary.rewards.essence;
        state.offlineSummary.collected = true;
        state.message = "Offline rewards collected.";
      }
      router.navigate(scenes.hub);
    }
    if (action === "summon-commander" && state.resources.essence >= 25 && state.commanders.length === 0) {
      state.resources.essence -= 25;
      state.commanders.push({ id: "vanguard-captain", name: "Vanguard Captain", visualLevel: 1 });
      state.message = "Vanguard Captain summoned.";
    } else if (action === "summon-commander") {
      state.message =
        state.commanders.length > 0
          ? "Commander already summoned."
          : "Need 25 Essence to summon.";
    }
    if (action === "raise-unit") {
      const unit = state.armyUnits.find((candidate) => candidate.id === target.dataset?.unitId);
      const availableCorpses = state.resources.corpses[unit.corpseType] ?? 0;
      if (availableCorpses >= unit.corpseCost) {
        state.resources.corpses[unit.corpseType] = availableCorpses - unit.corpseCost;
        unit.quantity += 1;
        unit.visualProgression = Math.min(1, 1 - Math.exp(-(unit.power * unit.quantity) / 900));
        state.message = `${unit.name} raised.`;
      } else {
        state.message = `Need ${unit.corpseCost} ${unit.name} Corpses to raise.`;
      }
    }

    renderApp(container);
  });

  return router;
}
