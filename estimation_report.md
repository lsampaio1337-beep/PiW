# Playtime Estimation Report: Idle Pokemon World

This document contains a mathematically modeled estimation for the active playtime required to achieve various milestones across Region 1 (Kanto) and Region 2 (Johto).

## Methodology & Assumptions

The estimations were modeled using a Node.js script (`scripts/estimation_script.mjs`) that simulates combat mathematically turn-by-turn based on the formulas found in `src/mathEngine.js` and `GameMechanics.md`.

**Key Assumptions (Heuristic Player Strategy):**
1. **Focusing on a Single Carry:** The player focuses on leveling up only their primary starter Pokémon, significantly reducing XP spread and maximizing combat efficiency.
2. **Optimal Farming & Upgrades:** The player farms the highest unlocked route for maximum XP (`EVXP`) and Money (`EVM`), and buys upgrades (Catch Bonus Candies, Rainbow Candies, Ultraballs) efficiently as soon as affordable.
3. **No Offline ZzZ Time:** The calculations represent 100% active, running playtime (no Jigglypuff Grains used).
4. **Targeting Species (Coupon Collector's Approach):** When catching all Pokémon or all Shinies, it's assumed the player specifically hunts the routes with the highest spawn rates for their missing species, rather than relying purely on random chance across the entire regional pool.
5. **Shiny Rolls:** By the mid/late game, it is assumed the player has maximized their Rainbow Candies and Oak Tasks, bringing their shiny multiplier effectively to about ~15 rolls out of 12,000 (roughly 1 in 800 odds).

---

## Region 1 (Kanto) Milestones

### 1. Beat the Kanto Pokemon League
- **Estimated Time:** **~32.2 hours**
- **Details:** This assumes leveling a single Pokémon from Level 1 up to Level 100 to confidently defeat the Champion. The early game (Levels 1-20) goes extremely quickly (under 2 hours), but the XP scaling curve drastically slows down progression past level 70.

### 2. Capture All 151 Pokémons
- **Estimated Time:** **~32.7 hours**
- **Details:** Since completing the Pokemon League unlocks nearly every route naturally, most common Pokémon will be caught passively via the auto-catcher during the 32 hours spent leveling. Hunting the remaining ~15 rare/legendary spawns specifically only takes an additional ~30-45 minutes of targeted farming with Ultraballs.

### 3. Capture All 151 Shinies
- **Estimated Time:** **~838 hours**
- **Details:** Even with maxed-out shiny roll bonuses (1 in 800), mathematically "forcing" all 151 specific shinies is a massive time sink. While you'll naturally catch some during the main campaign, finding *every specific* shiny requires sitting on their respective routes. Each targeted shiny takes approximately 5-6 hours of continuous fast-farming on average.

---

## Region 2 (Johto) Milestones

*(Note: Johto starts with the player carrying their Level 100 Pokémon from Kanto, requiring them to scale up to roughly Level 180 to beat the final Viridian Gym challenge.)*

### 1. Beat Viridian Gym (Region 2 Final Boss)
- **Estimated Time:** **~27.7 hours** (Additional time after Kanto)
- **Details:** Leveling from 100 to 180 takes slightly less time than the initial 1 to 100 grind because base stats (BST), money income (EVM), and multipliers from endgame upgrades heavily accelerate combat speed (one-shotting enemies). Total cumulative playtime from a brand-new game to beating Viridian Gym is roughly **~60 hours**.

### 2. Capture All Johto Regional Pokémons
- **Estimated Time:** **~28.0 hours** (Additional time after Kanto)
- **Details:** Similar to Kanto, the vast majority of the 100 new Johto species will be caught automatically while grinding for Viridian Gym. Sniping the remaining Johto rares adds a trivial amount of time.

### 3. Capture All Johto Regional Shinies
- **Estimated Time:** **~555 hours** (Additional time after Kanto)
- **Details:** Hunting 100 specific new shinies with an optimized setup takes substantially less time than Kanto's 151, but still demands hundreds of hours of dedicated route-farming.

---
*Generated mathematically using `scripts/estimation_script.mjs`.*
