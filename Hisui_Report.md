# Hisui Region - Paths and Challenges Adjustments Report

This document reports all the final modifications made to the `Hisui_Paths.xlsx` spreadsheet based on the final structural requirements.

## 1. Gym Placement & Main Progression Fixes
* **Gym - Arcanine:** Locked at Main Challenge 26. (Unlocks Veilstone Cape).
* **Gym - Electrode:** Locked at Main Challenge 37. (Unlocks Clamberclaw Cliffs).
* **Gym - Avalugg:** Locked at Main Challenge 48. (Unlocks Icebound Falls).
* **Adaman, Irida, Ingo:** Removed from the Main Progression to de-clutter the storyline. They have been placed in the Extra Challenge routes where they fit natively.
* **Pokemon League:** Adjusted to route 50 to cap off the main sequence perfectly.

## 2. Route & Pokemon Relocations
* **Scarlet Bog (Route 19):** Manually removed `Hippopotas` and `Electrode`.
* **Space-Time Distortion:** Now includes `Electrode`, `Avalugg`, and `Arcanine` alongside `Kleavor` and `Lilligant`.
* **Firespit Island:** `Heatran` relocated here to avoid leaving it isolated in an artificial route.
* **Moonview Arena:** Added `Shaymin` alongside `Darkrai` and `Cresselia`.
* **Enforced Validation:** A strict programmatic check guarantees that no route has only 1 Pokémon. Fallbacks exist to populate sparse routes with additional scaled Pokémon.

## 3. Extra Challenge Overhaul (A through F)
Extra Challenges were completely redesigned from scratch to mirror the user's explicit template. All rewards matching the required `Masterball` counts were appended at the end of their respective chains.

* **Extra Challenge A (5 Quests):**
  * Starts after defeating Gym Arcanine.
  * Unlocks: Gym Warden Ingo, Cobalt Fishing Spot, Ginkgo Landing, Shrouded Ruins, Sandgem Flats.
* **Extra Challenge B (5 Quests):**
  * Starts after defeating Gym Electrode.
  * Unlocks: Coronet Fishing Spot, Cloudpool Ridge routes, and **Space-Time Distortion** at quest 4.
  * Final Quest (B 5): Requires capturing Kleavor, Arcanine, Lilligant, Electrode, Avalugg. (Reward: 1 Masterball).
* **Extra Challenge C (4 Quests):**
  * Starts after defeating Gym Avalugg.
  * Unlocks: Wayward Cave, Seagrass Haven, and **Moonview Arena** at quest 3.
  * Final Quest (C 4): Requires capturing Darkrai, Shaymin, Cresselia. (Reward: 1 Masterball).
* **Extra Challenge D (4 Quests):**
  * Starts after defeating Gym Avalugg.
  * Unlocks: Alabaster Fishing Spot, Worn Bridge, and **Incarnate Fields** at quest 3.
  * Final Quest (D 4): Requires capturing Tornadus, Thundurus, Landorus, Enamorus. (Reward: 2 Masterball).
* **Extra Challenge E (4 Quests):**
  * Starts after defeating Gym Avalugg.
  * Unlocks: Lake Verity, Lake Valor, and **Lake of Trials** at quest 3.
  * Final Quest (E 4): Requires capturing Uxie, Mesprit, Azelf. (Reward: 2 Masterball).
* **Extra Challenge F (4 Quests):**
  * Starts after defeating Gym Avalugg.
  * Unlocks: Gym Adaman, Gym Irida, and **Citadel of Etertime** at quest 3.
  * Final Quest (F 4): Requires capturing Arceus, Dialga, Palkia, Giratina. (Reward: 3 Masterball).
