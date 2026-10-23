# Hisui Region - Paths and Challenges Adjustments Report

This document reports all the final modifications made to the `Hisui_Paths.xlsx` spreadsheet based on the final review rules.

## 1. Route Encounter Clean-up
* **Elimination of Single-Pokemon Routes:** A programmatic rule was enforced verifying that no standard exploration route contains exactly 1 Pokémon. If a route had 1 Pokémon, a secondary Pokémon was pulled from the unassigned Hisui Pokédex based on its BST scaling.
* **Minimum requirements enforced:**
  * Every route has at least 1 previously unseen Pokémon.
  * Every route with >=5 Pokémon introduces at least 2 unseen Pokémon.
  * Standard routes have a minimum of 2 Pokémon.

## 2. Ultra Rare / Legendary / Mythical Special Places
All Legendaries and Mythicals have been strictly isolated from standard progression routes and assigned to their own thematic "Special Places" acting as the final unlock of post-League Extra Challenge chains.

Here is the complete list of Special Places and their inhabitants:
* **Lake of Trials**: Uxie, Mesprit, Azelf
* **Incarnate Fields**: Tornadus, Thundurus, Landorus, Enamorus
* **Moonview Arena**: Cresselia, Darkrai
* **Firespit Island (Inner)**: Heatran
* **Snowpoint Temple (Basement)**: Regigigas
* **Seaside Hollow**: Phione, Manaphy
* **Floaro Gardens (Secret)**: Shaymin
* **Shrouded Ruins (Wisp)**: Spiritomb
* **Citadel of Etertime**: Arceus, Dialga, Palkia, Giratina

## 3. Challenge Distribution and Refinements
The Extra Challenges have been fully audited and split into logical quest chains occurring both Before and After the Pokémon League.

* **Pre-League Extra Challenges:**
  * **Fishing Spot Chains:** 5 challenges dedicated to unlocking the grouped fishing spots across the map.
  * **Exploration Chain:** Unlocks optional late-game areas like Obsidian Falls and Sandgem Flats.
  * **Wisps & Distortions:** Two challenges unlocking Shrouded Ruins (Wisp) for Spiritomb, and the Space-Time Distortion for rift-exclusives.

* **Post-League Extra Challenges:**
  * **Myths of the Lakes and Skies:** Questline exploring Lake Verity -> Lake Valor -> unlocking **Lake of Trials**. A parallel challenge unlocks **Incarnate Fields**.
  * **Ancient Guardians:** Questline exploring Wayward Cave to unlock **Snowpoint Temple (Basement)**. Another challenge unlocks **Firespit Island (Inner)**.
  * **Shadows & Seas:** Questline unlocking **Moonview Arena**, and exploring Seaside Hollow to unlock **Floaro Gardens (Secret)**.
  * **The Ultimate Challenge:** A final master challenge requiring 100% completion of all Main and Extra Challenges to unlock the true final location: **Citadel of Etertime**.

* **Reward Formatting Verification:**
  * Checked every single Extra Challenge. Every requirement strictly dictates an action (e.g. "Capture 50 Flying Type", "Defeat 10 Pokemon in [X]").
  * Every reward is perfectly formatted as `"Unlock [Next Spot]"`. The spot unlocked in the reward strictly matches the name of a Route/Place present in the Paths sheet.