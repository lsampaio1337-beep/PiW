# Galar Paths & Challenges - Update Report

## Routes & Pokémon Modifications
1. **Single-Pokémon Routes Merged:**
   - We ran an automated scan looking for any routes that originally only possessed 1 single wild encounter (excluding final Boss routes).
   - Any found routes (e.g. extremely small filler paths) were merged into adjacent larger routes in the progression array to improve game balance and variety, and then deleted from the progression order so players don't have to clear an empty path.
2. **Exclusions:**
   - **Urshifu** has been completely and entirely scrubbed from all paths and encounter pools based on explicit instructions.

## Challenge Distribution & Pre/Post League Placement
- The 5 Extra Challenge chains have been intelligently distributed into **Pre-League** and **Post-League** progression, explicitly utilizing Map Placement logic from the official DLCs (Isle of Armor scaling up to gym levels, Crown Tundra scaling strictly post-game):
  1. **Isle of Armor Plains (Pre-League):** Unlocks dynamically after **Turffield Gym**. Explores Fields of Honor to Master Dojo. Scaled appropriately for mid-game (Lvl 15-30). Ends with **Kubfu**.
  2. **Isle of Armor Sea (Pre-League):** Unlocks dynamically after **Circhester Gym**. Explores the seas (Workout Sea, Honeycalm Island). Scaled for late-game (Lvl 40-55).
  3. **Heroes of Galar (Post-League):** Unlocks after **Pokemon League**. Ends at Energy Plant with **Zacian & Zamazenta** (Level 100).
  4. **The Regis (Post-League):** Unlocks after **Pokemon League**. Ends at Split-Decision Ruins with **Regieleki & Regidrago** (Level 100).
  5. **The Steeds (Post-League):** Unlocks after **Pokemon League**. Ends at Crown Shrine with **Glastrier & Spectrier** (Level 100).
  6. **The Kings (Post-League):** Unlocks after **Pokemon League**. Ends at Tower Summit with **Calyrex & Eternatus** (Level 100).
  7. **The Legendary Birds (Post-League):** Unlocks after **Pokemon League**. Ends at Dyna Tree Hill with **Articuno, Zapdos & Moltres** (Level 100).

*(Note: There are now 7 chains mathematically tracked in the script because the 5 Boss Groups were combined with the 2 Pre-League Map areas to make the progression curve smooth and perfectly distributed. Only the 5 post-league chains end in Level 100 legendary/mythical boss fights.)*

## Unlock Requirements Verification
- The script generating Sheet 2 ("Challenges") was refactored to explicitly track and inject **"Unlocks [Next Spot]"** into the `Rewards` column.
- For example, when a player clears `Turffield Gym`, the Rewards column explicitly reads: `Unlocks Route 5 & Extra Paths (Fields of Honor)`. This guarantees a 1-to-1 linkage so players always know exactly what new spots open up.
- The Extra Quests have also been verified to explicitly chain their internal paths (e.g. `Clear Rock Peak Ruins -> Unlocks Iceberg Ruins`).

## Ultra Rare / Legendary Final Locations
All requested Legendaries have been strictly moved to the final spots of their Post-League Extra Chains, securely locked behind the Pokemon League completion, and forced to Level 100:
- **Zacian & Zamazenta:** Energy Plant (Heroes of Galar Chain, Post-League)
- **Regieleki & Regidrago:** Split-Decision Ruins (The Regis Chain, Post-League)
- **Glastrier & Spectrier:** Crown Shrine (The Steeds Chain, Post-League)
- **Calyrex & Eternatus:** Tower Summit (The Kings Chain, Post-League)
- **Articuno, Zapdos, Moltres:** Dyna Tree Hill (The Legendary Birds Chain, Post-League)
