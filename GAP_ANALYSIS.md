## GAP-001 — Core game session state
phase: 1
status: closed
blocked_by: none
closes_when: Jest tests prove a pure domain session can initialize a new game, advance deterministic ticks, pause/resume autonomous progress, and expose current realm, zone, roster, formation, resources, and visual progression state without importing Phaser or browser APIs.
escalate_if: the session loop requires rendering, real time, or browser storage to define its behavior.
do_not: do not create Phaser scenes, UI components, localStorage persistence, or asset files in this gap.

## GAP-002 — Hero entity and growth model
phase: 1
status: closed
blocked_by: GAP-001
closes_when: Jest tests prove the hero has stats, level progression, autonomous combat attributes, power calculation, and a continuous visual progression value derived from power rather than fixed sprite tiers.
escalate_if: hero growth needs final economy tuning values that cannot be safely represented as configurable constants.
do_not: do not render the hero, choose final art, or hardcode visual sprite thresholds.

## GAP-003 — Commander roster and summoning model
phase: 1
status: closed
blocked_by: GAP-001
closes_when: Jest tests prove commanders are permanent once summoned, the roster caps at 10 total, deployment caps at 4 active slots, summoning consumes Essence only, and commander visual progression values remain data-driven.
escalate_if: commander uniqueness, archetypes, or visual distinction are needed before the roster and summoning rules can be tested.
do_not: do not add Gold costs, deletion rules, commander UI, or final commander artwork.

## GAP-004 — Army unit roster and squad composition
phase: 1
status: closed
blocked_by: GAP-001
closes_when: Jest tests prove the army roster can hold zone-agnostic unit archetypes, define player composition, calculate squad stats, reject deletion of units assigned to active formation, and expose continuous visual progression values.
escalate_if: DL-001 is unresolved when baseline squad size or unit archetypes must be encoded.
do_not: do not build drag-and-drop formation UI, sprite assets, or zone-specific army definitions.

## GAP-005 — Realm and zone progression model
phase: 1
status: closed
blocked_by: GAP-001
closes_when: Jest tests prove the game defines 3 initial realms with 5 designed zones each, supports Realm Shard unlock requirements, tracks current progress, and represents the Realm of Infinity as endless escalation data without procedural zone generation.
escalate_if: designed zone content needs final balance tables that are not inferable from PROJECT.md.
do_not: do not generate procedural zones, render a map, or add narrative or quest systems.

## GAP-006 — Formation modifiers and targeting rules
phase: 1
status: closed
blocked_by: GAP-002, GAP-003, GAP-004
closes_when: Jest tests prove pre-zone formations validate deployed commanders and army squads, apply positional buffs, targeting priority, and flanking bonuses, and measurably affect combat inputs without active player input during fights.
escalate_if: two incompatible formation grid shapes or targeting models are equally reasonable after reading existing decisions.
do_not: do not implement drag-and-drop UI or any manual combat abilities.

## GAP-007 — Autonomous combat engine
phase: 1
status: closed
blocked_by: GAP-002, GAP-003, GAP-004, GAP-005, GAP-006
closes_when: Jest or Phaser headless tests prove autonomous combat resolves a zone from deterministic inputs, includes hero, commanders, and army squads, produces win/loss results, resource drops, and combat logs, and shows formation changes can alter outcome probability.
escalate_if: combat tests require mocking a Phaser renderer or input system.
do_not: do not add active abilities, PvP, multiplayer, or UI rendering.

## GAP-008 — Resource economy and reward rules
phase: 1
status: closed
blocked_by: GAP-005, GAP-007
closes_when: Jest tests prove Gold, Essence, and Realm Shards accrue from the correct combat sources, Essence remains the only commander summoning cost, Realm Shards unlock realms, and Gold cannot substitute for either specialized currency.
escalate_if: reward rates require final monetization or live-ops assumptions.
do_not: do not add in-app purchases, premium currencies, or quest rewards.

## GAP-009 — Offline progress engine
phase: 1
status: closed
blocked_by: GAP-005, GAP-008
closes_when: Jest tests prove offline progress awards Gold and Essence based on last active zone, caps elapsed time at 8 hours, excludes offline combat resolution, and returns a summary suitable for an offline return screen.
escalate_if: offline rewards require simulating combat outcomes instead of resource-only accrual.
do_not: do not unlock zones, resolve battles, or mutate formations while offline.

## GAP-010 — Storage abstraction and persistence
phase: 1
status: closed
blocked_by: GAP-001, GAP-002, GAP-003, GAP-004, GAP-005, GAP-006, GAP-008, GAP-009
closes_when: Jest tests prove save/load serializes and restores full game state, including roster, formation, zone progress, resources, offline timestamps, and visual progression values through a storage adapter interface that can swap localStorage for future mobile storage.
escalate_if: persistence requires binding domain logic directly to browser localStorage or Phaser APIs.
do_not: do not implement mobile AsyncStorage, cloud saves, or UI load screens in this gap.

## GAP-010b — MVP vertical slice (browser playable)
phase: 1
status: closed
blocked_by: GAP-007, GAP-008, GAP-009, GAP-010
closes_when: A single HTML file loads in the browser showing: hero stats, one active zone with autonomous combat resolving in real time, resource counters updating after combat, one army unit visible in formation, and visual progression value displayed as a number or bar — all wired to domain state with no placeholder data.
escalate_if: rendering one combat loop requires changing closed domain architecture from GAP-001 through GAP-010.
do_not: do not build full scene routing, commander UI, zone map, offline return screen, or any Phase 2 components — this is a single throwaway HTML file to validate the domain feels right before Phase 2 begins.

## GAP-011 — Phaser scene state routing
phase: 2
status: closed
blocked_by: GAP-001, GAP-010
closes_when: scene state tests prove Phaser scene routing can move between title/load, hub, zone map, formation, combat, commander roster, army roster, progression stats, and offline return states using domain state without duplicating game logic.
escalate_if: scene routing requires changing the closed domain session architecture.
do_not: do not build full screen layouts, final art, or rendering-heavy tests.

## GAP-012 — Title and load screen
phase: 2
status: closed
blocked_by: GAP-010, GAP-011
closes_when: scene state tests prove the title/load scene can start a new game, load a saved game through the storage abstraction, and route to offline return or main hub as appropriate.
escalate_if: save discovery cannot be expressed through the storage adapter created in GAP-010.
do_not: do not add account login, cloud saves, or final title art.

## GAP-013 — Main hub screen
phase: 2
status: closed
blocked_by: GAP-011, GAP-002, GAP-005, GAP-008
closes_when: scene state tests prove the main hub presents hero status, current realm and zone, resources, and navigation targets while reading from domain state only.
escalate_if: hub behavior requires new domain state not covered by closed Phase 1 gaps.
do_not: do not implement combat playback, formation editing, or roster management in this gap.

## GAP-014 — Zone map screen
phase: 2
status: closed
blocked_by: GAP-011, GAP-005, GAP-008
closes_when: scene state tests prove the zone map presents realm selection, zone lock/unlock state, Realm Shard requirements, and selected-zone routing without mutating combat outcomes.
escalate_if: map behavior requires procedural zone generation.
do_not: do not create procedural zones, combat simulation, or final realm background art.

## GAP-015 — Pre-combat formation screen
phase: 2
status: closed
blocked_by: GAP-011, GAP-006
closes_when: scene state tests prove the formation screen can select army composition, assign commanders and units to formation positions, validate illegal placements, and pass a valid formation into combat setup.
escalate_if: the required formation interaction model conflicts with the domain grid or targeting rules from GAP-006.
do_not: do not resolve combat, add active combat controls, or change formation domain rules.

## GAP-016 — Combat scene
phase: 2
status: closed
blocked_by: GAP-011, GAP-007, GAP-008
closes_when: scene state tests prove the combat scene can consume an autonomous combat result stream, show current participants, expose resource gains, and route to hub or next zone without accepting active combat input.
escalate_if: visual playback requires changing combat engine outputs.
do_not: do not add player-triggered abilities, multiplayer, or rendering assertions beyond scene state tests.

## GAP-017 — Commander roster screen
phase: 2
status: closed
blocked_by: GAP-011, GAP-003, GAP-008
closes_when: scene state tests prove the commander roster screen lists summoned commanders, manages up to 4 active slots, handles Essence-only summoning, and reports roster cap errors.
escalate_if: DL-003 is unresolved when commander visual distinction affects roster presentation.
do_not: do not add Gold summoning costs, commander deletion, or final commander sprite assets.

## GAP-018 — Army roster screen
phase: 2
status: closed
blocked_by: GAP-011, GAP-004, GAP-008
closes_when: scene state tests prove the army roster screen lists global units, supports upgrades through Gold where allowed by domain rules, blocks deleting active formation units, and exposes unit visual progression data.
escalate_if: upgrades require economy rules not represented by GAP-008.
do_not: do not create zone-specific units, commander management, or final unit artwork.

## GAP-019 — Progression and stats screen
phase: 2
status: closed
blocked_by: GAP-011, GAP-002, GAP-003, GAP-004
closes_when: scene state tests prove the progression screen can display hero, commander, and army growth data plus continuous visual progression values without hardcoded tier thresholds.
escalate_if: progression display requires renderer-specific data in the domain layer.
do_not: do not hard-swap sprites at fixed thresholds or add narrative systems.

## GAP-020 — Offline return screen
phase: 2
status: closed
blocked_by: GAP-011, GAP-009, GAP-010
closes_when: scene state tests prove the offline return screen appears after eligible load, summarizes capped Gold and Essence gains, confirms no offline combat occurred, and routes back to the main hub.
escalate_if: offline summary requires replaying skipped combat.
do_not: do not award Realm Shards offline or unlock zones from offline progress.

## GAP-021 — Placeholder asset and visual progression pipeline
phase: 3
status: closed
blocked_by: GAP-016, GAP-017, GAP-018, GAP-019
closes_when: asset and scene state checks prove placeholder sprites, overlays, particles, and visual progression inputs exist for hero, commanders, army units, and realms, with renderer interpolation driven by domain progression values.
escalate_if: DL-002 or DL-003 remains unresolved before asset style or commander asset structure is finalized.
do_not: do not replace continuous progression with fixed tier sprite swaps or add production art outside the agreed style.

## GAP-022 — Web release polish and mobile-readiness pass
phase: 3
status: closed
blocked_by: GAP-012, GAP-013, GAP-014, GAP-015, GAP-016, GAP-017, GAP-018, GAP-019, GAP-020, GAP-021
closes_when: release checks prove the web build runs end-to-end, the Phaser scenes fit short idle sessions, storage remains adapter-based for a future mobile pivot, and out-of-scope systems are absent.
escalate_if: polish requires adding monetization, multiplayer, quests, procedural zones, or platform-specific mobile storage.
do_not: do not implement iOS or Android builds, in-app purchases, PvP, narrative dialogue, or procedural content.

## GAP-ENTRY — Production browser entry point
phase: 3
status: closed
blocked_by: GAP-012, GAP-013, GAP-014, GAP-015, GAP-016, GAP-017, GAP-018, GAP-019, GAP-020
closes_when: A file index.html exists at the repo root, imports all ui/ scene modules as ES modules (type=module, no bundler), initialises the scene router, and renders the full game starting from the title/load screen — all screens navigable at localhost without webpack, vite, or any build step.
escalate_if: scene routing requires a bundler that is not yet configured.
do_not: do not add webpack, vite, parcel, or any build tooling. Keep it vanilla ES modules only.

## GAP-023 — Browser interaction audit fixes
phase: 2
status: closed
blocked_by: GAP-012, GAP-013, GAP-014, GAP-015, GAP-016, GAP-017, GAP-018, GAP-019, GAP-020, GAP-ENTRY
closes_when: Browser interaction tests and a localhost browser pass prove every production browser button either navigates to a visibly different screen or renders visible success/error/status feedback after the click.
escalate_if: fixing visible browser feedback requires changing closed domain contracts or adding a bundler.
do_not: do not add rendering-heavy tests, Phaser, webpack, vite, parcel, or production art.

## GAP-024 — Commander icon and art set
phase: 3
status: closed
blocked_by: GAP-021, GAP-017, DL-003
closes_when: The repo contains unique pixel-art commander icons and three progression sprite files for every commander in config/commanders.js, the asset manifest resolves those files, and the commander roster surfaces the art without adding a build step.
escalate_if: commander art requires changing the resolved unique-sprite decision or replacing continuous visual progression with hard tier logic in domain state.
do_not: do not add a bundler, Phaser rendering assertions, commander deletion, Gold summoning costs, or non-pixel-art production assets.

## GAP-025 — Combat browser polish fixes
phase: 3
status: closed
blocked_by: GAP-ENTRY, GAP-023
closes_when: The production browser starts the hero at level 1, combat renders a visible animated hero-versus-enemy arena, and prior combat results stay in a side tracker with a stable main combat layout after repeated rounds.
escalate_if: stabilizing combat presentation requires changing closed domain combat outputs or adding a bundler.
do_not: do not add active combat controls, Phaser, webpack, vite, parcel, or production art.

## GAP-026 — Combat XP and Essence drops
phase: 3
status: closed
blocked_by: GAP-007, GAP-008, GAP-016, GAP-025
closes_when: Combat rewards include hero XP, finishing combat applies that XP to hero progression, and every production browser combat has a visible small independent chance to drop Essence while still awarding Gold.
escalate_if: XP rewards require changing closed hero progression rules or introducing active combat input.
do_not: do not add quests, premium currency, active abilities, or new build tooling.

## GAP-027 — Corpse-based army roster redesign
phase: 3
status: closed
blocked_by: GAP-007, GAP-008, GAP-016, GAP-026
closes_when: New games initialize all realm army unit types at quantity 0, combat rewards typed corpses from weighted realm/zone drops, army power is calculated from raised quantities times unit Power, raising units spends matching corpses, and formation is read-only/dormant in the browser.
escalate_if: corpse-based army growth requires adding active combat controls, quests, procedural zones, or build tooling.
do_not: do not restore Gold army upgrades, starter army quantities, multi-stat army units, manual formation editing, or active combat abilities.
