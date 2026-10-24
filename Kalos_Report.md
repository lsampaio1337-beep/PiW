# Kalos Path Rebalance & Expanded Chain Adjustments Report

## 1. Routes & Map Adjustments (Sheet 1)
- **Early-Game Extra Chain Separation:** `Cyllage City (Fishing)`, `Reflection Cave`, `Tower of Mastery`, and `Coumarine City` were systematically bypassed in the main linear sequence. They now exist distinctly to form the early parallel chain (Extra Challenge A). Their levels were re-leveled to appropriately sit between 25-45.
- **Main Sequence Gap Fixing:** Recalculated the Main Route progression scaling from Level 1 up to Level 70 natively so that skipping the aforementioned 4 spots doesn't break the natural level climb to the Kalos League.
- **Renames:**
  - Renamed `2nd spot for Extra Challenge B` to `Sea Spirit Den Outer Depths`.
  - Renamed `2nd spot for Extra Challenge C` to `2nd spot for Extra Challenge E` to match the newly shifted alphabet designations.
- **Specific Post-Game Level Adjustments:** Explicitly hardcoded the required level ranges for the Extra Chains:
  - `Starter Depot`: 40-45
  - `Starter Evolved Depot`: 45-51
  - `Kiloude City`: 50-57
  - `Friend Safari`: 55-62
  - `Battle Maison`: 63-70
  - The parallel #1, #2, #3, and #4 spots leading up to the final legendary chambers in chains C, D, and E were precisely clamped to: (70-77), (77-84), (84-91), and (91-98) respectively.

## 2. Challenges & Unlock Progression (Sheet 2)
- **Main Challenge Re-mapping:** Skipped the extracted paths seamlessly.
- **Gym Unlocks for Parallel Chains:**
  - `Cyllage City Gym` challenge was explicitly configured to unlock the next main game spot **AND** `Cyllage City (Fishing)`, acting as the gateway for Extra Challenge A.
  - `Coumarine City Gym` challenge was explicitly configured to unlock the next main game spot **AND** `Starter Depot`, acting as the gateway for Extra Challenge B.
- **Parallel Chains Remapped:**
  - **Extra Challenge A:** Formed using the extracted mid-game locations (`Cyllage City (Fishing) -> Reflection Cave -> Tower of Mastery -> Coumarine City`) culminating in a `1 Masterball` reward.
  - **Extra Challenge B:** This handles the exact starter progression requested originally in A.
  - **Extra Challenge C:** This handles the exact Sea Spirit Den progression requested originally in B.
  - **Extra Challenge D:** This remains the exact Secret Ruins / Diancie progression.
  - **Extra Challenge E:** This handles the exact Team Flare Secret HQ progression requested originally in C.
- **Final Challenge:** The `Defeat Kalos Champion` reward was explicitly coded to unlock the 1st step of the three major legendary chains: `Path to Sea Spirit Den (C)`, `Path to Secret Ruins (D)`, and `Path to Team Flare Secret HQ (E)`.

## 3. Strict Challenge Criteria Reformatting (Sheet 2)
All human-readable instructions in the `Requisite` column of Sheet 2 have been strictly converted to the requested game-engine format keywords:
- Replaced Gym Leader encounters with the explicit `earnBadge` criteria (e.g., `earnBadge: { badge: 'Bug Badge', leader: 'Viola' }`).
- Replaced standard route grinding with the explicitly mapped `defeatCountRoute` criteria (e.g., `defeatCountRoute: { route: 'Route 2', count: 25 }`). The counts scale dynamically based on the challenge tier (up to 300).
- Replaced route capture varieties with the explicit `catchSpeciesAnyOf` criteria.
- Replaced Legendary/Mythical Final Chain captures with `catchSpeciesByQuality` (e.g., `catchSpeciesByQuality: { species: ['Articuno', 'Zapdos', 'Moltres'], quality: 'Legendary', count: 1 }`).
- Replaced Starter Depot captures with exact `catchSpecies` criteria arrays mapping directly to the 6 starter Pokemon.

## 4. Strength-Based Chronological Pokemon Distribution (Sheet 1)
To ensure that early routes aren't populated by vastly overpowered or fully-evolved Pokemon (e.g. encountering Nidoqueen in Route 3):
- **Base Stat Total (BST) Sorting:** I aggregated the BST values for all ~397 normal Pokemon using the internal game configurations.
- **Chronological Mapping:** The entire pool of normal Pokemon was sorted from weakest (lowest BST) to strongest (highest BST).
- **Redistribution:** These Pokemon were then distributed sequentially from `Route 2` (Level 1-5) all the way to the final post-game chains (Level 95-100).
  - This guarantees that early locations exclusively feature unevolved, low-tier Pokemon (e.g., Caterpie, Weedle, Pidgey, Bidoof).
  - High-tier and Stage 2 evolved Pokemon (e.g., Nidoqueen, Garchomp, Tyranitar) are strictly sequestered to late-game and post-game locations where the level encounters correctly exceed their evolution requirements.

## 5. Human-Readable Challenge Formatting (Sheet 2)
As requested, all strictly coded criteria objects in the `Requisite` column have been converted back into natural, human-readable wording:
- E.g., `defeatCountRoute: { route: 'Route 2', count: 25 }` is now `Defeat 25 pokemon from Route 2`.
- E.g., `earnBadge: { badge: 'Bug Badge', leader: 'Viola' }` is now `Earn the Bug Badge from Viola`.
- E.g., `catchSpecies: { species: ['Rowlet', 'Litten', 'Popplio'], count: 1 }` is now `Catch 1 Rowlet, 1 Litten, and 1 Popplio`.
- E.g., `catchSpeciesByQuality: { species: ['Articuno', 'Zapdos', 'Moltres'], quality: 'Legendary', count: 1 }` is now `Catch 1 Legendary Articuno, 1 Legendary Zapdos, and 1 Legendary Moltres`.
