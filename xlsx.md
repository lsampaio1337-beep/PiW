# Regional Excel Data Documentation

This document explains the structure and logic behind the auto-generated regional `.xlsx` files (`#_$_DataCounter.xlsx` (e.g., `1_Kanto_Data14.xlsx`) where `#` is the region number and `$` is the region name). These files provide a comprehensive overview of regional progression, route balance, challenges, and missing Pokémon.

All generated `.xlsx` files based on these instructions should be stored in the `xdata/` folder at the root of the project.

The workbook contains three sheets: **Routes**, **Challenges**, and **Missing PK**.

---

## Sheet 1: Routes

This sheet analyzes the spawn encounters, level scaling, and statistical balance for every location that contains wild Pokémon.

*   **Unlocked at:** The name of the Challenge that unlocked this route. It is blank for starting locations like Professor Lab, the first route, or PC/PM.
*   **Challenge:** The name of the Challenge that is completed at this route (or unlocked along with this route).
*   **Route:** The primary name of the route (e.g., "Route 1").
*   **Route (Secondary):** A secondary identifier for the route, if applicable (often blank; column is removed if entirely blank across the sheet).
*   **Pokemon Name:** The name of the Pokémon spawning on the route.
*   **First?:** Indicates if this is the first time the player can encounter this Pokémon in the region.
    *   `NONONO`: The Pokémon has appeared in a previous route based on chronological challenge progression.
    *   *Blank*: This is the first time the Pokémon appears.
    *   *Chronology Logic:* Main Challenges (1 to N) are checked first. Extra Challenges (A1, A2... B1, B2...) branch off from a specific Main Challenge. The "First?" check for an Extra Challenge only looks at the preceding Extra Challenges in its chain and the Main Challenges up to the point where the Extra chain branched off.
*   **Level:** The natural level interval of the Pokémon on the route (`LevelMin-LevelMax`).
    *   *Scaling:* Base levels scale linearly from 1 to 80 across the Main Challenges before the Pokémon League. Post-league Extra Challenges scale up to 100.
    *   *Interval size:* If `min < 12`, interval is 2. If `12 <= min < 30`, interval is 3. If `min >= 30`, interval is 10% of the minimum level rounded down (capped at a max interval of 8).
*   **Sugested Level:** The suggested level after applying Peer-to-Peer Base Stat Total (BST) adjustments. Format is `min-max`.
*   **Peer to Peer:** Modifies the level of the Pokémon based on how its individual BST compares to the average BST of all unique Pokémon on that route.
    *   If `BST - AvgBST > 150`: +4 levels
    *   If `100 <= BST - AvgBST <= 150`: +2 levels
    *   If `50 <= BST - AvgBST < 100`: +1 level
    *   If `-50 < BST - AvgBST < 50`: Same level
    *   If `-100 <= BST - AvgBST <= -50`: -1 level
    *   If `-150 <= BST - AvgBST < -100`: -2 levels
    *   If `BST - AvgBST < -150`: -4 levels
*   **% Appearance:** The frequency or chance of encountering the Pokémon (formatted as a percentage, e.g., `25%`).
*   **% Appearance Ok?:** Analyzes if the appearance rate is balanced relative to the Pokémon's rarity and route counterparts. Blank if acceptable; contains a suggested percentage if it needs rebalancing.
*   **Pokemon/Type Ok?:** Checks if the Pokémon thematically belongs on the route. "Yes" if acceptable, "Legacy" if it appears there in the official games, or "NONONO" if it feels out of place (e.g., a Fire type in a "Sea Route").
*   **BST:** The Base Stat Total of the Pokémon.
*   **Pokemon/BST Ok?:** Verifies that the Pokémon's power level matches the game's progression. The Main Challenges are divided into four quarters:
    *   1st Quarter: BST should not exceed 400.
    *   2nd Quarter: BST should not exceed 500.
    *   3rd Quarter: BST should not be below 250.
    *   4th Quarter: BST should not be below 350.
    *   Writes "NONONO" if the Pokémon violates these bounds, otherwise blank.
*   **Map Ok?:** Checks if the route exists within the game's Map rendering logic (`MapCoordinates`).
*   **Will Unlock:** The name of the next Route/Challenge unlocked upon completing this route's requirements.
*   **Requisite:** The requirements needed to unlock the next area (e.g., Catch 5 Pidgey).
*   **Reward:** The items or gifts rewarded upon completion.

*(Note: To ensure a complete map representation, **every map coordinate spot** is included in this sheet, including standalone routes, Gyms, Pokémon Centers, and other non-spawn locations. If a map has no spawn encounters, spawn-specific columns are left blank).*

---

## Sheet 2: Challenges

This sheet outlines all the tasks players must complete to progress.

*   **Challenge Name:** The identifier for the challenge.
*   **Requisite:** The current coded requirements to complete the challenge.
*   **Sugestion for Req:** A dynamically generated suggestion for what the requirement *should* be, based on route contents to ensure engaging gameplay:
    *   If multiple new Pokémon appear, suggests catching them (capped mathematically to ensure < 200 total encounters).
    *   If a new Pokémon has a high spawn rate (>20%) but low BST/Level, suggests catching a Rare, Epic, or Weak quality variant.
    *   If a Pokémon has a very low spawn rate, suggests defeating it multiple times (calculated to force 100-150 encounters).
    *   If a new Type appears, suggests defeating that Type X times.
    *   For Gyms/League, suggests defeating the Leader/Champion.
    *   Fallback: "Defeat X Pokémon", where X scales from 25-50 (early game) to 100-150 (mid game), 200-250 (late game), and 300 (post-game).
*   **Reward Map:** The location unlocked by completing the challenge.
*   **Reward Challenge:** The subsequent challenge unlocked.
*   **Reward Gift:** Items given upon completion.

---

## Sheet 3: Missing PK

This sheet lists all Pokémon native to the region (according to the regional Pokédex) that do not spawn on any route or in any Gym.

*   **Pokemon Name:** The name of the missing Pokémon.
*   **Can Obtain?:** Explains if and how the player can acquire this Pokémon despite it not spawning in the wild.
    *   `No`: Impossible to obtain in the region.
    *   `Evolve`: Can be obtained by evolving a wild-caught Pokémon once.
    *   `#xEvolution`: Requires evolving a caught Pokémon multiple times (e.g., `2xEvolution`).
    *   `Breed`: Can be obtained by breeding a wild-caught Pokémon once to get its pre-evolution.
    *   `#xBreed`: Requires chain-breeding multiple times to reach this pre-evolution (e.g., `2xBreed`).

Last Generation Counter: 23
