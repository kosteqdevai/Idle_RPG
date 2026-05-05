## DL-001 — Baseline army squad structure
blocking: GAP-004
question: What baseline army squad size and starting unit archetypes should the Phase 1 domain model support?
options: Small squads with 3 archetypes (infantry, archer, cavalry) | Larger squads with 5 archetypes (infantry, archer, cavalry, mage, siege)
impact: This determines the army roster schema, composition validation, formation slots, and the minimum combat test fixtures.

resolved: Small squads with 3 archetypes (infantry, archer, cavalry)

## DL-002 — Pixel art confirmation
blocking: GAP-021
question: Should the initial visual asset pipeline assume pixel art for all 2D sprites and realm themes?
options: Yes, use pixel art placeholders and style constraints | No, use a different 2D style before asset work begins
impact: This determines placeholder sprite dimensions, scaling rules, shader treatment, and production art direction for the Phaser renderer.

## DL-003 — Commander visual distinction
blocking: GAP-017
question: Should commanders use unique sprites distinct from army units, or visually upgraded variants of army-unit sprites?
options: Unique commander sprites | Scaled or embellished army-unit sprites
impact: This affects commander roster presentation, asset pipeline scope, visual progression overlays, and how clearly commanders read in combat.
