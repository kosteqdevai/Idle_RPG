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
    if (action === "upgrade-infantry") {
      const infantry = state.armyUnits.find((unit) => unit.id === "infantry");
      const upgradeCost = Math.round(30 * 1.65 ** (infantry.level - 1));
      if (state.resources.gold >= upgradeCost) {
        state.resources.gold -= upgradeCost;
        infantry.level += 1;
        infantry.power += 8;
        infantry.visualProgression = Math.min(1, infantry.visualProgression + 0.05);
        state.message = `Infantry upgraded to level ${infantry.level}.`;
      } else {
        state.message = `Need ${upgradeCost} Gold to upgrade Infantry.`;
      }
    }

    renderApp(container);
  });

  return router;
}
