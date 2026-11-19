# Regional Excel Data Documentation

This document explains the structure and logic behind the auto-generated regional `.xlsx` files (`$Number_$RegionName_$Counter.xlsx`, e.g., `1_Kanto_1.xlsx`, where `$Number` is the region number, `$RegionName` is the region name, and `$Counter` is `1` if no file matching this style exists, or `max(Counter) + 1` if any file with this style already exists—e.g., if `1_Kanto.xlsx` exists, create `1_Kanto_1.xlsx`; if `1_Kanto_33.xlsx` exists, create `1_Kanto_34.xlsx`). These files provide a comprehensive overview of regional progression, route balance, challenges, and missing Pokémon.

All generated `.xlsx` files based on these instructions should be stored in the `xdata/` folder at the root of the project.

The workbook contains three sheets: **Routes**, **Challenges**, and **Missing PK**.

---

## Sheet 1: Routes

This sheet analyzes the spawn encounters, level scaling, and statistical balance for every location that contains wild Pokémon.

*   **Unlocked at:** The name of the Challenge that unlocked this route. It is blank for starting locations like Professor Lab, the first route, or PC/PM.
*   **Challenge:** The name of the Challenge that is completed at this route (or unlocked along with this route).
*   **Route:** The primary name of the route (e.g., "Route 1").
*   **Route (Secondary):** A secondary identifier for the route, if applicable (often blank; column is removed if entirely blank across the sheet).
*   **Pokemon Name:** The name of the Pokémon spawning on the route. Alternate forms/variations (e.g., `Zygarde 10%`, `Zygarde Complete`) are displayed with their form-specific name rather than being skipped.
*   **First?:** Indicates if this is the first time the player can encounter this Pokémon in the region.
    *   *Blank*: This is the first time the Pokémon appears.
    *   `NO $`: The Pokémon has already appeared in a previous route, where `$` is the previous number of times it has appeared (e.g., "NO 1" on its second appearance).
    *   *Chronology Logic:* Main Challenges (1 to N) are checked first. Extra Challenges (A1, A2... B1, B2...) branch off from a specific Main Challenge. The "First?" check for an Extra Challenge only looks at the preceding Extra Challenges in its chain and the Main Challenges up to the point where the Extra chain branched off.
*   **Type 1** / **Type 2:** The elemental types of the Pokémon (using form-specific types for alternate variations). If a Pokémon only has one type, it is duplicated in both columns.
*   **LvlMin** / **LvlMax:** The natural level bounds of the Pokémon on the route.
    *   *Scaling:* Base levels scale linearly from 1 to 80 across the Main Challenges before the Pokémon League. Post-league Extra Challenges scale up to 100.
    *   *Interval size:* If `min < 12`, interval is 2. If `12 <= min < 30`, interval is 3. If `min >= 30`, interval is 10% of the minimum level rounded down (capped at a max interval of 8).
*   **Sugest LvlMin** / **Sugest LvlMax:** The suggested level bounds after applying Peer-to-Peer Base Stat Total (BST) adjustments.
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
*   **BST:** The Base Stat Total of the Pokémon (using form-specific BST for alternate variations).
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
*   **Sugestion for Req:** A dynamically generated, game-engine-compatible requirement suggestion (output as valid JSON matching the `Requisite` schema in `src/ui/mainControl.js`, or a non-spawn flag for empty hubs) tailored to each route's spawn table, progression stage, and regional variety:
    *   **1. Special, Boss & Non-Wild Locations (Checked First):**
        *   **Key / Gate / Condition Challenges:** Challenges starting with `Key `, containing `Condition`, or holding `completeChallenges` without wild spawns keep/suggest `{"completeChallenges":[...]}`.
        *   **Pokémon League / Champion / Red:** Suggests `{"defeatRed":true}` for Red, `{"defeatEliteFourAndChampion":true}` for Kanto/Johto, and `{"defeat<Region>Champion":true}` for Hoenn–Paldea.
        *   **Gyms / Stadiums / Grand Trials:** Suggests `{"earnBadge":{...}}` (preserving existing badge metadata or filling leader/name from `config/gyms.js`, excluding `(High Level)` rematch zones and `Battle Tower`).
        *   **Non-Badge Bosses:** Empty-spawn entries matching a `config/gyms.js` boss (e.g., Lysandre) output `Defeat Boss: <Leader>`.
        *   **Roaming & Legendary Lairs:** `(Roaming)` challenges suggest `defeatMultipleSpecific` (or `defeatSpecific`) with `count: 1` per roamer; routes with `1–4` spawns where all have `BST >= 580` suggest `catchSpecies` (`count: 1` each, up to 3).
        *   **No Wild Spawns:** Battle facilities (`Battle`/`Tower`/`Frontier`/`Dojo`/`Hideout`) suggest scaled `defeatCountRoute`; other empty-spawn towns/hubs output `No wild spawns (Boss/Trainer/Story Req)`.
    *   **2. Tutorial Route:** The first wild-spawn Main Challenge always suggests `{"defeatCountRoute":{"route":"<Route>","count":25}}` so players are never RNG-locked before earning Pokéballs and currency.
    *   **3. Encounter Budget & Quality Probabilities:** Before scoring wild-route options, spawns across primary and secondary areas are merged per species and checked against the progression budget (`progress` in chain):
        *   *Quarter 1 (0–25%):* Target `28–50` encounters (cap `80`).
        *   *Quarter 2 (25–50%):* Target `50–85` encounters (cap `120`).
        *   *Quarter 3 (50–75%):* Target `85–130` encounters (cap `165`).
        *   *Quarter 4 (75–100%):* Target `125–175` encounters (cap `220`).
        *   *Extra / Post-Game:* Target `120–210` encounters (cap `280`).
        *   *Quality Odds Reference (base `mathEngine.js` table):* `Weak` (`12.3%`, **only Q1–Q2** so late-game Quality Boosters don't make it overly rare), `Uncommon+` (`45.1%`), `Rare+` (`20.1%`), `Rare` (`12.5%`), `Epic` (`7.5%`).
    *   **4. Wild Route Archetypes (Scored by Route Fit + Anti-Repetition):** Every valid archetype within the route's encounter budget is scored by route fit and penalized if recently used (`-60` same as previous route, `-30` two routes ago, `-15` three routes ago, plus `-6` per prior usage in the chain):
        *   **`catchSpecies` (New Pokémon Showcase):** Picks `1–3` distinct-family `First?` species (prioritizing rare `2.5%–10%` flagships or `2–3` mid-rate spawns; bumping single common spawns to `2–4` catches) while keeping total expected encounters within cap.
        *   **`catchSpeciesOr` / `catchSpeciesAnyOf` (Dual-Target Choice):** Pairs two comparable or same-type species (preferring new `5%–25%` spawns) as an "A or B" catch (`1–3` each) or shared quota (`2–6` combined).
        *   **`defeatSpecific` (Single-Species Hunt):** Targets a notable `4%–35%` spawn (preferring `BST >= 400`, evolved, or `6%–20%` spawns) with `count` scaled mathematically to `targetEnc * chance` (clamped `2–30`, or `1` if `<= 3%`), ensuring balanced encounters.
        *   **`defeatMultipleSpecific` (Multi-Target Hunt):** Picks `2–3` spawns with `>= 10%` chance (strong bonus for same evolution family pairs like `Exeggcute` + `Exeggutor`), splitting `targetEnc` cleanly (`2–15` each).
        *   **`catchByType` / `catchByQualityAndType` (Elemental Route Mastery):** Activated when a non-Normal elemental type (or Normal `>= 65%`) has `>= 40%` combined chance across `>= 2` species (or `>= 55%`), with a biome-name bonus (e.g., Water/Sea/Fishing -> `Water`, Forest/Woods -> `Bug`/`Grass`, Cave/Mountain -> `Rock`/`Ground`, Frost/Ice -> `Ice`, Tower/Pyre -> `Ghost`, Volcano -> `Fire`). Uses `catchByType` (`3–15` catches) or `catchByQualityAndType` (`Uncommon` in Q1, `Rare` in Q2–Extra, `Epic` in Q4/Extra when `>= 60%`).
        *   **Quality Hunts (`catchSpeciesByQuality`, `catchSpeciesByQualityOrHigher`, `catchByQuality`):** Uses `Weak` on low-BST (`<= 330`) staples in Q1–Q2; `Uncommon+`/`Rare+`/`Epic+` via `catchSpeciesByQualityOrHigher` on `>= 20%` spawns; or route-wide `catchByQuality` (`Uncommon+`, `Rare+`, `Epic`) on diverse routes.
        *   **`defeatCountRoute` (Endurance Checkpoint):** Always available as a scaled battle checkpoint (Q1 `30–50`, Q2 `60–100`, Q3 `100–150`, Q4 `150–225` / Victory Road `200–250`, Extra `150–300`); boosted when a route has no new Pokémon, is an endurance area (`Victory Road`, `Safari`, `Sea Route`, `Hideout`, `Underwater`), or `>= 4` routes have passed since the last route-defeat challenge.
*   **Reward Map:** The location(s) unlocked on the map by completing the challenge (`unlocks`).
*   **Reward Challenge:** The challenge(s) (`Challenge Name`) activated/unlocked when this challenge is completed — resolved from each unlocked area in `unlocks` (matching its `areaId` to the corresponding challenge) as well as any challenge whose `completeChallenges` or `completeAnyOfChallenges` depends on this challenge.
*   **Reward Gift:** Comma-separated list of all items earned and sent to the Gift Window (`state.stats.pendingGifts`) upon completion (formatted as `Item xCount`, supporting both `gifts` arrays and single `gift` entries).

---

## Sheet 3: Missing PK

This sheet lists all Pokémon native to the region (according to the regional Pokédex) that do not spawn on any route or in any Gym.

*   **Can Obtain?:** Explains if and how the player can acquire this Pokémon despite it not spawning in the wild.
    *   `No`: Impossible to obtain in the region.
    *   `Evolve`: Can be obtained by evolving a wild-caught Pokémon once.
    *   `#xEvolution`: Requires evolving a caught Pokémon multiple times (e.g., `2xEvolution`).
    *   `Breed`: Can be obtained by breeding a wild-caught Pokémon once to get its pre-evolution.
    *   `#xBreed`: Requires chain-breeding multiple times to reach this pre-evolution (e.g., `2xBreed`).
*   **Pokemon Name:** The name of the missing Pokémon.
*   **Type 1:** The primary elemental type of the Pokémon.
*   **Type 2:** The secondary elemental type of the Pokémon. If the Pokémon only has one type, it is duplicated in this column.
*   **BST:** The Base Stat Total of the missing Pokémon.

---

## Level Progression Rules

*   **Route Level Interval:** The minimum level interval (`maxLevel - minLevel`) inside each route is **2** until `minLevel` reaches **15**, after which the minimum interval is **3**.
*   **Main & Pre-League Extra Challenges:**
    *   Unlocked main storyline routes follow a linear progression.
    *   Unlocked extra challenges before the Pokémon League (e.g. unlocked by a Gym alongside a main route) start at the level of that next main route and progress linearly from there (e.g., if Route 4 is level 10, `Farm Road` starts at level 10 and subsequent routes in its chain increment linearly).
    *   Post-League extra challenges (unlocked by the Pokémon League) start at `minLevel: 78` and reach `maxLevel: 100` on the penultimate route.

