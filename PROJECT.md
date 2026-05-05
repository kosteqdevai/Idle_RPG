## What this game is

A medieval idle RPG where a hero and an army fight autonomously across escalating realms and zones. The player builds a roster of commanders and army units, sets formation before each zone, then combat resolves automatically. Progression is endless — the final destination is the Realm of Infinity. The player's sense of power is communicated through gradual visual evolution of the hero, commanders, and army units as they grow stronger.

## Target platform and engine

Platform: Web (primary), with a deliberate pivot to mobile (iOS/Android) planned post-launch
Engine: Phaser 3
Rationale: 2D, web-native, strong mobile export path, handles sprite-based visual progression cleanly

## Player persona

Casual to mid-core idle player. Sessions are short — player checks in, reviews progress, adjusts formation and roster, then leaves combat to run. Offline progress must feel meaningful. Visual change must be noticeable within a single session to sustain engagement.

## Core systems — Phase 1 scope

- Hero entity: stats, level, autonomous combat behaviour, visual progression state
- Commander entity: up to 10 total (roster cap), 4 active deployment slots, permanent once summoned, summoned via Essence (rare combat drop)
- Army unit entity: global roster, player-defined composition, zone-agnostic
- Formation system: player sets formation pre-zone; formation applies positional modifiers (buffs, targeting order, flanking bonuses) to autonomous combat resolution — no active input during fight
- Combat engine: fully autonomous resolution loop; formation and unit stats determine outcome; supports commander units and army squads
- Resource system: three types — Gold (general progression), Essence (commander summoning), Realm Shards (zone unlock)
- Offline progress engine: calculates Gold and Essence accrued since last session based on last active zone; no offline combat resolution, resources only
- Zone and realm structure: 3 realms × 5 zones each for initial build; final realm is Realm of Infinity (endless escalation); each realm has distinct visual theme
- Visual progression system: data-driven — a unit's visual state is a function of its power level, not hardcoded tier thresholds; renderer reads progression value and interpolates visual properties (scale, glow intensity, particle density, sprite overlay); built portable so web renderer and future mobile renderer share the same progression data layer
- Persistence: save/load full game state including roster, formation, zone progress, resources, visual progression values

## UI and scenes — Phase 2 scope

- Title / load screen
- Main hub: hero status, current realm and zone, resource display
- Zone map: realm selector, zone nodes with lock/unlock state
- Pre-combat formation screen: drag-and-drop unit placement, army composition picker
- Combat scene: autonomous fight plays out, visual progression visible, resource gain shown
- Commander roster screen: summoned commanders, active slot management, summon interface
- Army roster screen: global unit list, upgrade interface
- Progression / stats screen: hero and army visual evolution display
- Offline return screen: summary of resources collected since last session

## Tech stack

Language: JavaScript
Engine: Phaser 3
Visual effects: Phaser particle system + shader overlays for gradual visual progression
Persistence: localStorage for web; architecture must abstract storage layer so mobile (AsyncStorage or equivalent) can be swapped in without touching game logic
Test framework: Jest for domain logic; Phaser headless mode for combat engine tests

## Resources

- Gold: earned from all combat, drives unit upgrades and zone progression
- Essence: rare drop from combat, only resource that fuels commander summoning
- Realm Shards: dropped in specific zones, required to unlock next realm

## Business rules and constraints

- Formation has a measurable effect on combat outcome — not cosmetic; at minimum positional buffs and targeting priority must affect win/loss probability
- Visual progression is continuous and data-driven, never a hard sprite swap at fixed thresholds
- Offline resource gain is capped at 8 hours to prevent runaway economy
- Commander summon requires Essence only — no Gold cost — to keep the two economies separate
- A unit that is in active formation cannot be deleted from roster
- The storage abstraction layer must be in place before any persistence gap closes — mobile pivot must not require a logic rewrite

## Out of scope

- Active combat abilities triggered by the player during a fight
- PvP or any multiplayer system
- In-app purchases or monetisation of any kind in the initial build
- Narrative or dialogue system
- Quest or mission system beyond zone progression
- Procedurally generated zones — all zone content is designed, not generated

## Open questions

- Codex to define: baseline army squad structure (size, unit archetypes) as a DECISION entry in Phase 1
- Pixel art assumed for 2D art style — confirm before any asset gap closes
- Commander visual distinction from army units (unique sprites vs scaled army sprites) — raise as DECISION before Phase 2 commander UI gap