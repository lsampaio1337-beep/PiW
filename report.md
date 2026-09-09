# Update Report: Game Mechanics, Config, and Economy Overhaul

## 1. Configs & Data Updates
- **Type Effectiveness:** Verified and confirmed `config/types.js` matches the exactly requested type multipliers.
- **Pokémon Stats & Learnsets:** Generated and overwrote `config/pokemonData.js` with updated stats (HP, Atk, Def, Spa, Spd, Spe), typings, evolutions, and movesets for all 151 Pokémon based on the provided list.
- **Routes & Encounters:** Rebuilt `config/routes.js` dynamically from the provided route encounters table, strictly matching encounter locations, minimum/maximum levels, and spawn chances.
- **Gym & Elite 4 Data:** Updated `config/gyms.js` with the correct team compositions, levels, and leaders for all Gyms and the Indigo Plateau/Elite 4 based on the table.
- **Balance & Shop Prices:** Updated `config/balance.js` prices for Balls and Potions and injected the missing "Expansions" catalog (Bag, Box, and Potion Satchel upgrades) into the shop data. Verified the `qualityTiers` map accurately to the requested multiplier ranges and roll max limits.

## 2. Math Engine & Formulas
- Extracted and modified all core game formulas in `src/mathEngine.js`:
  - `calculateHP` and `calculateStat`: Updated formulas.
  - `calculateDamage`: Implemented strictly ignoring Quality (Q) modifiers.
  - `calculateReqXP` & `calculateTotalXP`: Replaced the legacy single-formula XP calculation with a scaling delta approach using `ReqXP(L)`.
  - `calculateEVXP` & `calculateEVM` & `calculatePP`: Separated the single monolithic "EV" value into distinct Battle Experience, Gold dropped, and Sale values matching the individual formulas provided.
  - `calculateCatchChance`: Added inputs for Quality and TotalIV to respect the new robust formula, clamping chances between 1% and 100%, while retaining Masterball bypass.
  - `generateQuality`: Updated bounds and limits with accurate Quality Booster limits based on Professor Oak's task completions.
  - `generateIVs`: Implemented strictly accurate multiplicative modifiers via the newly provided IV Boosters and Shiny IV Boosters from Professor Oak.

## 3. Core Mechanics & UI Adjustments
- **Evolutions:** Patched `src/ui/pokemonStats.js` to ensure the required number of stones to evolve a Pokémon dynamically scales to exactly 20% of their current level.
- **Battle & Loot:** Integrated the new `EVM`, `EVXP`, and `PP` tracking into `src/battleSystem.js`. Rebuilt the item drop generation (Pokéballs and Potions) to use `(2.0 + 8.0 * (TotalIV / 600))%` and adjusted Evolution Stone drops to rely correctly on Quality breakpoints (Uncommon 1%, Rare 2%, Epic 3%, Shiny 100%).
- **Market & Backpack Selling:** Switched the calculation of Pokémon sell prices across the game (PokeMarket, Backpack selected sell) to uniquely rely on the new `calculatePP()` function instead of using arbitrary combined values.

## 4. Oak Tasks & Daily Calendar
- **Professor Oak's Tasks:** Completely updated `src/ui.js` tasks with new thresholds, rewards, and text matching the updated task progression system, specifically modifying:
  - Quality Boosters (Weak+ to Epic+)
  - Catch Rate Boosters (Low Catch to Master Catch)
  - Level Boosters (Low Level to Master Level)
  - Shiny Boosters (See / Catch variants)
  - IV Boosters (Low IV to Master IV under bounds)
- **Daily Rewards Calendar:** Overhauled `src/ui/calendar.js` static arrays for Week 1, Week 2, and Week 3+ to accurately provide the corrected items, properly assigning Ultra Potions on Week 1 and Week 2 Day 7 endings.

All changes have been successfully compiled and saved to the primary `src/` and `config/` directories.
