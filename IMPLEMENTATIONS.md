# IMPLEMENTATIONS.md — What was built and why
# Updated by Codex after every gap closes. Never edited manually.
# Format: one entry per gap, in closing order. Changelog appended if gap is reopened.

## GAP-001 — Core game session state
closed_on: 2026-05-05

### What was built
- Added a pure domain session model with `createGameSession`, `normalizeInitialState`, `DEFAULT_STATE`, and `SESSION_STATUS`.
- Session state now includes status, timestamps, resources, hero, commander, army, world, formation, and last outcome fields.

### Files created
domain/session.js
tests/domain/session.test.js

### Files modified
GAP_ANALYSIS.md — status set to closed

### Test summary
7 tests in tests/domain/session.test.js — session defaults, overrides, timestamps, defensive copies, and validation behavior.

### Implementation notes
Implementation inferred from domain/session.js and its mirrored test file.

---
### CHANGELOG

## GAP-027 — Corpse-based army roster redesign
closed_on: 2026-05-05

### What was built
- Replaced level/stat/Gold-upgrade army units with realm race unit tiers that use only `power`, `quantity`, `corpseType`, and `corpseCost`.
- Added typed corpse resources and combat corpse drops using realm-specific weighted zone tables and zone-band enemy counts.
- Changed army combat contribution to auto-deployed `quantity * power` while formation stays dormant/read-only.
- Reworked army roster UI actions from Gold upgrades to corpse-based raising, including browser feedback and corpse inventory display.

### Files created
none

### Files modified
config/army.js — added realm races, five-tier unit ladder, corpse costs, and zone drop tables
domain/army.js — replaced the old squad upgrade model with corpse-raised unit quantities and army power helpers
domain/resources.js — added typed corpse storage and combat corpse reward application
domain/combat.js — added army quantity power and deterministic corpse drops to combat rewards
domain/formation.js — made army formation dormant while retaining commander formation contribution
domain/session.js — new sessions now know every army unit at quantity 0 and include corpse resources
domain/commanders.js — commander summoning now preserves corpse resources
domain/world.js — realm unlocks now preserve corpse resources
ui/armyRosterScreen.js — army screen now exposes corpse inventory and raise actions
ui/formationScreen.js — formation screen is read-only/dormant and reports auto-deployed army power
ui/progressionStatsScreen.js — army progression reports quantity and total Power
ui/browser/state.mjs — browser seed state now starts all army units at quantity 0 with empty corpses
ui/browser/combatScreen.mjs — browser combat awards and displays typed corpse drops
ui/browser/armyRosterScreen.mjs — browser army screen raises units from corpses
ui/browser/formationScreen.mjs — browser formation screen explains dormant auto-deployment
ui/browser/app.mjs — browser click handling now raises units instead of upgrading Infantry
ui/browser/mainHubScreen.mjs — hub shows total corpse count
ui/browser/progressionStatsScreen.mjs — progression shows raised army Power
index.html — refreshed the browser app module query for the army redesign
tests/domain/army.test.js — covered zero-quantity rosters, Power-only units, raising, and corpse drops
tests/domain/combat.test.js — covered corpse rewards and quantity-based army power
tests/domain/resources.test.js — covered typed corpse resources and combat reward sources
tests/domain/formation.test.js — covered dormant formation behavior
tests/domain/session.test.js — updated new-game and resource expectations for corpse armies
tests/domain/world.test.js — updated realm unlock resource expectations for corpse preservation
tests/domain/persistence.test.js — updated save/load fixtures for corpse-based army state
tests/domain/offline.test.js — updated resource expectations for corpse resource preservation
tests/domain/commanders.test.js — covered commander summoning with corpse resource preservation
tests/ui/armyRosterScreen.test.js — covered corpse inventory and raising flow
tests/ui/formationScreen.test.js — covered read-only dormant formation state
tests/ui/combatScreen.test.js — covered corpse rewards applied through combat finish
tests/ui/mainHubScreen.test.js — updated resource surface for corpses
tests/ui/progressionStatsScreen.test.js — covered quantity/Power army progression
tests/ui/visualProgressionPipeline.test.js — updated army placeholder expectations for new unit ids
tests/ui/browserApp.test.js — covered browser corpse drops, raise action, and dormant formation flow
tests/ui/offlineReturnScreen.test.js — updated offline resource shape with corpses

### Test summary
Updated domain and UI/browser coverage — 120 tests pass, covering zero-quantity starts, typed corpse drops, corpse spending, quantity-based army power, and dormant formation presentation.

### Implementation notes
The redesign keeps corpses as a nested resource family instead of overloading Gold/Essence/Realm Shards. Combat drops corpses on every result, while raised army power is automatically counted in combat; old army composition and active formation arrays remain as empty compatibility fields so persistence and scene state shapes stay stable.

---
### CHANGELOG

## GAP-026 — Combat XP and Essence drops
closed_on: 2026-05-05

### What was built
- Added `heroExperience` to domain combat rewards with win/loss scaling from combat balance constants.
- Split Essence drops onto an independent deterministic roll so Essence can drop on any combat, including losses.
- Updated the combat scene finish flow to apply awarded hero XP through `awardHeroExperience`, preserving existing hero progression rules.
- Updated the production browser combat loop to award XP, update hero level/stats, display XP progress, and show rare Essence drops in combat summaries/history.

### Files created
none

### Files modified
config/combat.js — added XP reward balance constants
domain/combat.js — combat rewards now include hero XP and independent Essence roll data
ui/combatScreen.js — finishing combat now applies hero XP to domain state
ui/browser/state.mjs — browser hero state now tracks experience
ui/browser/combatScreen.mjs — browser combat now awards/displays XP and rare Essence drops
ui/browser/mainHubScreen.mjs — hub shows current hero XP
ui/browser/progressionStatsScreen.mjs — progression screen shows hero level and XP
index.html — refreshed module query and widened combat reward summary layout
tests/domain/combat.test.js — covered XP rewards and Essence drops on losses
tests/ui/combatScreen.test.js — covered XP application after finishing combat
tests/ui/browserApp.test.js — covered browser XP gain, level-up, and visible Essence drop
tests/entryHtml.test.js — covered updated combat summary layout
GAP_ANALYSIS.md — added and closed the combat XP/Essence gap

### Test summary
1 test added and 4 tests extended — coverage proves combat XP exists, XP mutates hero progression on finish, browser battles visibly level the hero, and Essence can drop independently of win/loss.

### Implementation notes
Domain XP uses the existing hero progression function instead of adding a separate leveling path. Essence remains a normal resource reward, while `heroExperience` is intentionally ignored by `applyCombatRewards` and applied by combat scene state so currencies and hero growth stay separate.

---
### CHANGELOG

## GAP-002 — Hero entity and growth model
closed_on: 2026-05-05

### What was built
- Added hero creation, level progression, experience thresholds, stat scaling, power calculation, and visual progression helpers.
- Added hero combat attributes with base stats and level-derived growth.

### Files created
config/hero.js
domain/hero.js
tests/domain/hero.test.js

### Files modified
domain/session.js — session defaults include a hero
tests/domain/session.test.js — session expectations updated for hero state
GAP_ANALYSIS.md — status set to closed

### Test summary
6 tests in tests/domain/hero.test.js — hero defaults, experience awards, stat growth, power, and visual/combat progression.

### Implementation notes
Key functions identified: `createHero`, `awardHeroExperience`, `calculateHeroStats`, `calculateHeroPower`, `calculateHeroVisualProgression`, `calculateHeroCombatAttributes`, `getExperienceForLevel`, and `getLevelForExperience`.

---
### CHANGELOG

## GAP-003 — Commander roster and summoning model
closed_on: 2026-05-05

### What was built
- Added commander catalog constants, commander creation, roster creation, summoning, activation, deactivation, and removal.
- Added commander stat, power, experience, and visual progression helpers.

### Files created
config/commanders.js
domain/commanders.js
tests/domain/commanders.test.js

### Files modified
domain/session.js — session defaults include commander roster state
tests/domain/session.test.js — session expectations updated for commanders
GAP_ANALYSIS.md — status set to closed

### Test summary
8 tests in tests/domain/commanders.test.js — catalog creation, roster limits, summon costs, active slots, removal, level scaling, and visual progression.

### Implementation notes
Key functions identified: `createCommander`, `createCommanderRoster`, `summonCommander`, `activateCommander`, `deactivateCommander`, `removeCommander`, `calculateCommanderStats`, `calculateCommanderPower`, `calculateCommanderVisualProgression`, `getCommanderExperienceForLevel`, and `getCommanderLevelForExperience`.

---
### CHANGELOG

## GAP-004 — Army unit roster and squad composition
closed_on: 2026-05-05

### What was built
- Added army archetype constants, army unit creation, starting roster creation, squad composition, and active formation selection.
- Added army stat, power, experience, level, and visual progression helpers.

### Files created
config/army.js
domain/army.js
tests/domain/army.test.js

### Files modified
domain/session.js — session defaults include army roster state
tests/domain/session.test.js — session expectations updated for army state
GAP_ANALYSIS.md — status set to closed

### Test summary
8 tests currently in tests/domain/army.test.js — roster defaults, composition rules, active formation selection, stat/power scaling, deletion behavior, and upgrade behavior.

### Implementation notes
Key functions identified: `createArmyUnit`, `createArmyRoster`, `createStartingArmyRoster`, `setArmyComposition`, `setActiveFormationUnitIds`, `calculateArmySquadStats`, `calculateArmyUnitStats`, `calculateArmyUnitPower`, `calculateArmyUnitVisualProgression`, `deleteArmyUnit`, `getArmyUnitUpgradeCost`, `upgradeArmyUnit`, `getArmyUnitArchetype`, `getArmyUnitExperienceForLevel`, and `getArmyUnitLevelForExperience`.

---
### CHANGELOG

## GAP-005 — Realm and zone progression model
closed_on: 2026-05-05

### What was built
- Added realm constants for finite realms and the Realm of Infinity.
- Added world progression creation, zone lookup/status, realm unlocks, zone completion, and infinity encounter generation.

### Files created
config/realms.js
domain/world.js
tests/domain/world.test.js

### Files modified
domain/session.js — session defaults include world progression
tests/domain/session.test.js — session expectations updated for world state
GAP_ANALYSIS.md — status set to closed

### Test summary
7 tests in tests/domain/world.test.js — starting realm state, zone status, entry checks, completion, realm unlocks, designed zones, and infinity encounters.

### Implementation notes
Key functions identified: `createWorldProgression`, `getRealm`, `getZone`, `getDesignedZones`, `getZoneStatus`, `canEnterZone`, `completeZone`, `canUnlockRealm`, `unlockRealm`, `isRealmUnlocked`, and `getInfinityEncounter`.

---
### CHANGELOG

## GAP-006 — Formation modifiers and targeting rules
closed_on: 2026-05-05

### What was built
- Added formation slot constants and default formation creation.
- Added formation validation and combat-input projection from hero, commanders, and army units.

### Files created
config/formation.js
domain/formation.js
tests/domain/formation.test.js

### Files modified
domain/session.js — session defaults include formation state
tests/domain/session.test.js — session expectations updated for formation state
GAP_ANALYSIS.md — status set to closed

### Test summary
5 tests in tests/domain/formation.test.js — default slots, validation, duplicate prevention, combat input, and slot lookup.

### Implementation notes
Key functions identified: `createFormation`, `createDefaultFormation`, `validateFormation`, `buildFormationCombatInput`, and `getFormationSlot`.

---
### CHANGELOG

## GAP-007 — Autonomous combat engine
closed_on: 2026-05-05

### What was built
- Added deterministic combat resolution for formation combatants against realm/zone encounters.
- Added win probability and deterministic roll helpers.

### Files created
config/combat.js
domain/combat.js
tests/domain/combat.test.js

### Files modified
GAP_ANALYSIS.md — status set to closed

### Test summary
5 tests in tests/domain/combat.test.js — deterministic outcomes, win/loss behavior, probability bounds, and missing-input guards.

### Implementation notes
Key functions identified: `resolveCombat`, `calculateWinProbability`, and `deterministicRoll`.

---
### CHANGELOG

## GAP-008 — Resource economy and reward rules
closed_on: 2026-05-05

### What was built
- Added resource creation, additive resource updates, combat rewards, and combat reward source summaries.
- Added spend helpers for commander summoning and realm unlock resources.

### Files created
domain/resources.js
tests/domain/resources.test.js

### Files modified
domain/session.js — session defaults include resource state
GAP_ANALYSIS.md — status set to closed

### Test summary
6 tests in tests/domain/resources.test.js — default resources, addition, combat rewards, reward sources, summon spending, and realm unlock spending.

### Implementation notes
Key exports identified: `RESOURCE_TYPES`, `createResources`, `addResources`, `applyCombatRewards`, `getCombatRewardSources`, `spendCommanderSummonResources`, and `spendRealmUnlockResources`.

---
### CHANGELOG

## GAP-009 — Offline progress engine
closed_on: 2026-05-05

### What was built
- Added offline progress calculation with capped elapsed time and encounter estimates.
- Added state application that returns updated resources and offline summary data.

### Files created
config/offline.js
domain/offline.js
tests/domain/offline.test.js

### Files modified
GAP_ANALYSIS.md — status set to closed

### Test summary
5 tests in tests/domain/offline.test.js — elapsed clamping, no-progress cases, reward summaries, and state application.

### Implementation notes
Key functions identified: `calculateOfflineProgress` and `applyOfflineProgress`.

---
### CHANGELOG

## GAP-010 — Storage abstraction and persistence
closed_on: 2026-05-05

### What was built
- Added in-memory storage adapter and save/load/delete helpers.
- Added state serialization and deserialization with parse failure handling.

### Files created
domain/persistence.js
tests/domain/persistence.test.js

### Files modified
GAP_ANALYSIS.md — status set to closed

### Test summary
5 tests in tests/domain/persistence.test.js — memory storage, serialization round trips, save/load, delete, and corrupt payload handling.

### Implementation notes
Key exports identified: `DEFAULT_SAVE_KEY`, `MemoryStorageAdapter`, `serializeGameState`, `deserializeGameState`, `saveGame`, `loadGame`, and `deleteSave`.

---
### CHANGELOG

## GAP-010b — MVP vertical slice (browser playable)
closed_on: 2026-05-05

### What was built
- Added a standalone browser-playable MVP HTML entry in src/mvp.html.
- Added tests that inspect the MVP HTML for expected playable structure and script references.

### Files created
src/mvp.html
tests/domain/mvp-html.test.js

### Files modified
GAP_ANALYSIS.md — status set to closed

### Test summary
3 tests in tests/domain/mvp-html.test.js — MVP document structure, gameplay copy, and script affordances.

### Implementation notes
Implementation inferred from gap title and src/mvp.html; files are identified, but no exported functions exist in this HTML-only vertical slice.

---
### CHANGELOG

## GAP-011 — Phaser scene state routing
closed_on: 2026-05-05

### What was built
- Added scene identifiers, route definitions, and scene router creation.
- Added transition helpers and history/back behavior for screen state.

### Files created
ui/sceneRouter.js
tests/ui/sceneRouter.test.js

### Files modified
GAP_ANALYSIS.md — status set to closed

### Test summary
6 tests in tests/ui/sceneRouter.test.js — initial route, transitions, history, route metadata, invalid scenes, and state snapshots.

### Implementation notes
Key exports identified: `SCENE_IDS`, `ROUTES`, and `createSceneRouter`.

---
### CHANGELOG

## GAP-012 — Title and load screen
closed_on: 2026-05-05

### What was built
- Added title/load screen state derivation.
- Added actions for starting a new session and loading an existing session through persistence.

### Files created
ui/titleLoadScreen.js
tests/ui/titleLoadScreen.test.js

### Files modified
GAP_ANALYSIS.md — status set to closed

### Test summary
5 tests in tests/ui/titleLoadScreen.test.js — initial view state, new session flow, load flow, missing save behavior, and route changes.

### Implementation notes
Key export identified: `createTitleLoadScreen`.

---
### CHANGELOG

## GAP-013 — Main hub screen
closed_on: 2026-05-05

### What was built
- Added main hub view model summarizing hero, commander, army, world, and resources.
- Added screen actions for routing to combat, map, roster, progression, and offline views.

### Files created
ui/mainHubScreen.js
tests/ui/mainHubScreen.test.js

### Files modified
GAP_ANALYSIS.md — status set to closed

### Test summary
4 tests in tests/ui/mainHubScreen.test.js — view model summaries, action routing, locked combat state, and state preservation.

### Implementation notes
Key functions identified: `createMainHubViewModel` and `createMainHubScreen`.

---
### CHANGELOG

## GAP-014 — Zone map screen
closed_on: 2026-05-05

### What was built
- Added zone map view model for realms, zone statuses, and unlock state.
- Added screen actions for selecting zones, unlocking realms, and returning to hub.

### Files created
ui/zoneMapScreen.js
tests/ui/zoneMapScreen.test.js

### Files modified
GAP_ANALYSIS.md — status set to closed

### Test summary
4 tests in tests/ui/zoneMapScreen.test.js — zone summaries, selection rules, realm unlock routing, and locked-zone behavior.

### Implementation notes
Key functions identified: `createZoneMapViewModel` and `createZoneMapScreen`.

---
### CHANGELOG

## GAP-015 — Pre-combat formation screen
closed_on: 2026-05-05

### What was built
- Added formation view model exposing slots, combatants, and validation messages.
- Added screen actions for assigning units, clearing slots, starting combat, and returning to hub.

### Files created
ui/formationScreen.js
tests/ui/formationScreen.test.js

### Files modified
GAP_ANALYSIS.md — status set to closed

### Test summary
5 tests in tests/ui/formationScreen.test.js — slot summaries, assignment, duplicate handling, combat gating, and route changes.

### Implementation notes
Key functions identified: `createFormationViewModel` and `createFormationScreen`.

---
### CHANGELOG

## GAP-016 — Combat scene
closed_on: 2026-05-05

### What was built
- Added combat view model for selected encounter, formation participants, and predicted outcome.
- Added combat screen action to resolve a combat round and route after completion.

### Files created
ui/combatScreen.js
tests/ui/combatScreen.test.js

### Files modified
GAP_ANALYSIS.md — status set to closed

### Test summary
4 tests in tests/ui/combatScreen.test.js — combat view model, win resolution, loss resolution, and missing encounter handling.

### Implementation notes
Key functions identified: `createCombatViewModel` and `createCombatScreen`.

---
### CHANGELOG

## GAP-017 — Commander roster screen
closed_on: 2026-05-05

### What was built
- Added commander roster view model for owned commanders, active slots, summon availability, and visual sprite keys.
- Added roster actions for summoning, activating, deactivating, and returning to hub.

### Files created
ui/commanderRosterScreen.js
tests/ui/commanderRosterScreen.test.js

### Files modified
GAP_ANALYSIS.md — status set to closed

### Test summary
6 tests in tests/ui/commanderRosterScreen.test.js — roster summaries, summon state, activation, deactivation, sprite keys, and routing.

### Implementation notes
Key functions identified: `createCommanderRosterScreen`, `createCommanderRosterViewModel`, `getCommanderSpriteLevel`, and `getCommanderSpriteKey`.

---
### CHANGELOG

## GAP-018 — Army roster screen
closed_on: 2026-05-05

### What was built
- Added army roster view model with roster, squad composition, upgrade costs, and active formation state.
- Added screen actions for composition changes, active formation changes, unit upgrades, and returning to hub.

### Files created
ui/armyRosterScreen.js
tests/ui/armyRosterScreen.test.js

### Files modified
config/army.js — added upgrade-related constants
domain/army.js — added army unit upgrade helpers
tests/domain/army.test.js — added current upgrade coverage
GAP_ANALYSIS.md — status set to closed

### Test summary
5 tests in tests/ui/armyRosterScreen.test.js plus 8 tests currently in tests/domain/army.test.js — army screen flows and domain army behavior including upgrades.

### Implementation notes
Key screen functions identified: `createArmyRosterScreen` and `createArmyRosterViewModel`. Domain upgrade functions identified: `getArmyUnitUpgradeCost` and `upgradeArmyUnit`.

---
### CHANGELOG

## GAP-019 — Progression and stats screen
closed_on: 2026-05-05

### What was built
- Added progression/stats view model for hero, commanders, army, world, and aggregate power summaries.
- Added screen actions for routing back to the hub.

### Files created
ui/progressionStatsScreen.js
tests/ui/progressionStatsScreen.test.js

### Files modified
GAP_ANALYSIS.md — status set to closed

### Test summary
4 tests in tests/ui/progressionStatsScreen.test.js — progression summaries, power totals, empty roster handling, and routing.

### Implementation notes
Key functions identified: `createProgressionStatsScreen` and `createProgressionStatsViewModel`.

---
### CHANGELOG

## GAP-020 — Offline return screen
closed_on: 2026-05-05

### What was built
- Added offline return view model for elapsed time, encounters, rewards, and capped progress display.
- Added screen actions for applying offline progress and continuing to the hub.

### Files created
ui/offlineReturnScreen.js
tests/ui/offlineReturnScreen.test.js

### Files modified
GAP_ANALYSIS.md — status set to closed

### Test summary
4 tests in tests/ui/offlineReturnScreen.test.js — reward summaries, no-progress state, applying progress, and routing.

### Implementation notes
Key functions identified: `createOfflineReturnScreen` and `createOfflineReturnViewModel`.

---
### CHANGELOG

## GAP-021 — Placeholder asset and visual progression pipeline
closed_on: 2026-05-05

### What was built
- Added placeholder asset manifest and naming conventions for commanders, army units, realms, UI, effects, and audio.
- Added visual render data helpers that map domain progression to asset paths and interpolated visual properties.

### Files created
assets/manifest.js
ui/visualProgressionPipeline.js
tests/ui/visualProgressionPipeline.test.js

### Files modified
GAP_ANALYSIS.md — status set to closed

### Test summary
4 tests in tests/ui/visualProgressionPipeline.test.js — interpolation, commander assets, army assets, realm assets, and render data shape.

### Implementation notes
Key exports identified: `PIXEL_ART_STYLE`, `PLACEHOLDER_ASSETS`, `interpolateVisualProperties`, `getCommanderAssetPath`, `getArmyAssetPath`, `getRealmAssetPath`, and `createVisualRenderData`.

---
### CHANGELOG

## GAP-022 — Web release polish and mobile-readiness pass
closed_on: 2026-05-05

### What was built
- Added release readiness checks for browser markup and out-of-scope feature markers.
- Added README release instructions and current browser launch guidance.

### Files created
src/releaseReadiness.js
tests/releaseReadiness.test.js

### Files modified
README.md — added/revised release and local run guidance
GAP_ANALYSIS.md — status set to closed

### Test summary
1 test in tests/releaseReadiness.test.js — release readiness check passes for the current browser entry.

### Implementation notes
Key exports identified: `OUT_OF_SCOPE_PATTERNS` and `checkWebReleaseReadiness`.

---
### CHANGELOG

## GAP-ENTRY — Production browser entry point
closed_on: 2026-05-05

### What was built
- Added index.html as the production browser entry point.
- Added browser ES module runtime state, routing, app initialization, and screen render modules.
- Added tests for the production entry document.

### Files created
index.html
ui/browser/state.mjs
ui/browser/sceneRouter.mjs
ui/browser/app.mjs
ui/browser/titleLoadScreen.mjs
ui/browser/mainHubScreen.mjs
ui/browser/zoneMapScreen.mjs
ui/browser/formationScreen.mjs
ui/browser/combatScreen.mjs
ui/browser/commanderRosterScreen.mjs
ui/browser/armyRosterScreen.mjs
ui/browser/progressionStatsScreen.mjs
ui/browser/offlineReturnScreen.mjs
tests/entryHtml.test.js

### Files modified
GAP_ANALYSIS.md — production entry gap closed

### Test summary
3 tests in tests/entryHtml.test.js — index document module wiring, mount element, and browser app import expectations.

### Implementation notes
Key browser exports identified: `initialiseGame` and `renderApp` from ui/browser/app.mjs, `createSceneRouter` from ui/browser/sceneRouter.mjs, shared browser helpers from ui/browser/state.mjs, and per-screen render functions including `renderTitleLoadScreen`, `renderMainHubScreen`, `renderZoneMapScreen`, `renderFormationScreen`, `renderCombatScreen`, `renderCommanderRosterScreen`, `renderArmyRosterScreen`, `renderProgressionStatsScreen`, and `renderOfflineReturnScreen`.

---
### CHANGELOG

## GAP-023 — Browser interaction audit fixes
closed_on: 2026-05-05

### What was built
- Added visible browser status feedback through `state.message`, rendered by `panel`.
- Added `createInitialBrowserState` and `resetBrowserState` so each `initialiseGame(container)` mount starts from a clean title-screen state.
- Updated `initialiseGame` to handle nested button clicks safely with `closest("button")`, collect offline rewards once, report commander summon success/errors, and report army upgrade success/errors.
- Updated the browser army roster to display current Gold and the Infantry upgrade cost before and after clicks.

### Files created
tests/ui/browserApp.test.js

### Files modified
ui/browser/state.mjs — added resettable browser state and shared visible status rendering
ui/browser/app.mjs — added browser action feedback, offline collection guard, and robust button targeting
ui/browser/armyRosterScreen.mjs — surfaced Gold and upgrade cost so upgrade clicks visibly change the screen
ui/browser/commanderRosterScreen.mjs — clarified the summon button cost in the visible label
package.json — enabled Jest VM modules so `.mjs` browser modules can be tested directly
GAP_ANALYSIS.md — added and closed the audit fix gap

### Test summary
1 test added — production browser app interaction audit covering title, offline return, hub navigation, zone map, formation, combat round resolution, army upgrades, commander summoning, duplicate/insufficient-resource feedback, and progression navigation.

### Implementation notes
The audit found that browser controls could fail silently when resource requirements were not met, especially repeated army upgrades. The fix keeps the vanilla ES module entry and avoids adding renderer-heavy tests by exercising `initialiseGame(container)` with a minimal container in Jest, then confirming the same flow manually at localhost.

---
### CHANGELOG

## GAP-024 — Commander icon and art set
closed_on: 2026-05-05

### What was built
- Added a unique pixel-art icon and three progression sprite SVGs for every commander in `COMMANDER_CATALOG`.
- Added commander art metadata and helpers for icon paths, sprite paths, palettes, motifs, silhouettes, and level progression notes.
- Updated the visual progression pipeline and commander roster view model to expose production commander art paths.
- Updated the vanilla browser commander roster to show summoned commander sprites and the full commander icon catalog.

### Files created
assets/commanderArt.js
assets/commanders/icons/cavalry-banneret.svg
assets/commanders/icons/ember-tactician.svg
assets/commanders/icons/falcon-scoutmaster.svg
assets/commanders/icons/infinity-herald.svg
assets/commanders/icons/iron-chaplain.svg
assets/commanders/icons/longbow-marshal.svg
assets/commanders/icons/royal-standardbearer.svg
assets/commanders/icons/shield-sergeant.svg
assets/commanders/icons/siege-overseer.svg
assets/commanders/icons/vanguard-captain.svg
assets/commanders/sprites/cavalry-banneret-lv1.svg
assets/commanders/sprites/cavalry-banneret-lv2.svg
assets/commanders/sprites/cavalry-banneret-lv3.svg
assets/commanders/sprites/ember-tactician-lv1.svg
assets/commanders/sprites/ember-tactician-lv2.svg
assets/commanders/sprites/ember-tactician-lv3.svg
assets/commanders/sprites/falcon-scoutmaster-lv1.svg
assets/commanders/sprites/falcon-scoutmaster-lv2.svg
assets/commanders/sprites/falcon-scoutmaster-lv3.svg
assets/commanders/sprites/infinity-herald-lv1.svg
assets/commanders/sprites/infinity-herald-lv2.svg
assets/commanders/sprites/infinity-herald-lv3.svg
assets/commanders/sprites/iron-chaplain-lv1.svg
assets/commanders/sprites/iron-chaplain-lv2.svg
assets/commanders/sprites/iron-chaplain-lv3.svg
assets/commanders/sprites/longbow-marshal-lv1.svg
assets/commanders/sprites/longbow-marshal-lv2.svg
assets/commanders/sprites/longbow-marshal-lv3.svg
assets/commanders/sprites/royal-standardbearer-lv1.svg
assets/commanders/sprites/royal-standardbearer-lv2.svg
assets/commanders/sprites/royal-standardbearer-lv3.svg
assets/commanders/sprites/shield-sergeant-lv1.svg
assets/commanders/sprites/shield-sergeant-lv2.svg
assets/commanders/sprites/shield-sergeant-lv3.svg
assets/commanders/sprites/siege-overseer-lv1.svg
assets/commanders/sprites/siege-overseer-lv2.svg
assets/commanders/sprites/siege-overseer-lv3.svg
assets/commanders/sprites/vanguard-captain-lv1.svg
assets/commanders/sprites/vanguard-captain-lv2.svg
assets/commanders/sprites/vanguard-captain-lv3.svg
tests/assets/commanderArt.test.js

### Files modified
assets/manifest.js — commander asset patterns now point at shipped SVG icon and sprite files
ui/visualProgressionPipeline.js — commander render data now resolves production art paths and icons
ui/commanderRosterScreen.js — roster view models expose commander icon, sprite, and art direction metadata
ui/browser/commanderRosterScreen.mjs — browser roster renders summoned sprites and the commander icon catalog
ui/browser/app.mjs — summoned browser commander state includes a visual art level
index.html — added responsive pixel-art commander card styling
tests/ui/visualProgressionPipeline.test.js — updated expectations for shipped SVG art paths
tests/ui/commanderRosterScreen.test.js — covered commander icon and sprite paths in roster state
tests/ui/browserApp.test.js — covered visible commander art paths in the browser roster
GAP_ANALYSIS.md — added and closed the commander art gap

### Test summary
1 asset test file added, 3 existing tests extended — coverage verifies every commander has one icon and three crisp SVG sprite levels, art helpers reject invalid paths, and UI/browser state surfaces the shipped assets.

### Implementation notes
SVG assets keep the pixel-art direction inspectable, tiny, and browser-loadable without a bundler. The three levels remain renderer-facing art variants while domain visual progression stays continuous; no domain combat or summoning rules were changed.

---
### CHANGELOG
#### 2026-05-05 — fix: force refreshed commander art modules (reopened by browser verification)
- index.html now imports the browser app with a version query so a normal refresh loads the latest ES module graph.
- ui/browser/app.mjs now imports the commander roster module with the same version query so stale roster markup cannot hide the icon grid.
- tests/entryHtml.test.js now accepts vanilla ES module imports with an optional cache-busting query while still rejecting bundled entry points.

## GAP-025 — Combat browser polish fixes
closed_on: 2026-05-05

### What was built
- Reset the production browser seed hero to level 1 with matching level 1 stats and visual progression.
- Reworked `renderCombatScreen` to render an animated hero-versus-enemy arena, strike trail, last-round summary, and side-mounted prior combat tracker.
- Changed browser combat log entries from display strings to structured round summaries so repeated combats can be tracked without resizing the main arena.
- Added stable combat layout CSS with fixed arena/history dimensions, scrollable prior results, mobile stacking, and cache-busted entry import.

### Files created
none

### Files modified
ui/browser/state.mjs — browser initial state now starts the hero at level 1 and tracks combat round numbers
ui/browser/combatScreen.mjs — combat rendering now uses an arena, animation hooks, summary values, and side history
index.html — added combat presentation styles and refreshed the browser app module version query
tests/ui/browserApp.test.js — covered level 1 hero startup and visible combat arena/history markup after repeated rounds
tests/entryHtml.test.js — covered combat layout CSS for stable arena and side tracker presentation
GAP_ANALYSIS.md — added and closed the combat polish fix gap

### Test summary
2 tests extended/added — browser interaction coverage now asserts level 1 startup and combat tracker markup; entry HTML coverage now asserts stable combat layout and animation CSS.

### Implementation notes
The domain hero already starts at level 1, so the fix stayed in the vanilla browser seed data and rendering layer. The combat tracker is intentionally scrollable and separate from the arena so additional results do not push the core interface around.

---
### CHANGELOG
