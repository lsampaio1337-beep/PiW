# Agent Notes

## UI / Frontend
* **QTier Color Guide:** Future features should use the following colors for QTier glows:
  * Shiny: #Rainbow (Animated)
  * Epic: #7A00FF
  * Rare: #0000FF
  * Uncommon: #00FFFF
  * Regular: #7AFFFF
  * Weak: No Glow
* **Inline Handlers & Refactoring:** The project heavily relies on inline HTML event handlers (e.g., `onclick="window.showTrainerStats()"`) and lacks a modern JavaScript bundler. Any refactored or newly extracted UI functions must be manually re-attached to the global `window` object to prevent breaking the frontend.
* **XSS Prevention:** When dynamically parsing and inserting HTML content, use `new DOMParser().parseFromString(htmlContent, 'text/html')` instead of `document.createRange().createContextualFragment()` or `innerHTML` to prevent fetching external resources and executing inline handlers like `<img onerror>`.
* **Animations:** In `src/ui/battle.js`, the wild Pokémon entry animation (`elEnemySide`) visually slides exactly 65% of its container width. Background scrolling increments (`moveDistance`) should be synchronized to this 65% value.
* **Global Badge Mapping:** When mapping local badge counts to global `gymIndex` values for UI elements, use `window.getGlobalBadgeInfo(gymIndex)` or the regional offset (Kanto: 0-7, League: 8, Johto: 9-16, Sinnoh: 17-24, Unova: 25-32).

## Asset Management
* **Image Assets:** Background image assets in `Assets/BG/` use non-prefixed filenames (e.g., `Casino.png`). Battle-specific backgrounds are in `Assets/BG/BattleMode/`. Image asset filenames related to the Pokemon League still use legacy naming conventions (e.g., `IndigoPlateau.png`, `BG-Elite4-1Lorelei.png`). Regional medal image assets are stored in `Assets/Extra/Medals/`.

## Architecture & Performance
* **Window Manager:** The custom `WindowManager` (`src/windowManager.js`) executes inline HTML event handlers by parsing them with strict regular expressions. Handlers with strings containing special characters not in the regex allowed character class will silently fail.
* **Combat Systems:** Avoid deep cloning (`JSON.parse(JSON.stringify())` or `structuredClone()`) for complex objects like `Encounter`. Use destructuring and spread syntax for specific nested properties (`types`, `ivs`, `evs`, `currentStats`, `moves`) to maximize speed. The `moves` configuration objects only contain primitive types, so shallow copy is safe.
* **Map Optimization:** When optimizing array `.find()` lookups with `Map` creations, apply them only for repeated lookups inside loops. A `Map` for a single isolated lookup is a de-optimization.
* **Electron Window:** To fix transparency issues in Electron without disabling hardware acceleration entirely, conditionally apply `app.disableHardwareAcceleration()` and `app.commandLine.appendSwitch('enable-transparent-visuals')` in `main.js` only for Linux.
* **Standalone Scripts:** Standalone Node.js scripts must use the `.mjs` extension to support ES module imports.

## Game Logic & Configuration Data
* **Base Stats & Quality:** Base Stat Total (BST) is the sum of `hp`, `atk`, `def`, `spa`, `spd`, and `spe`. The 'Quality' parameter (Weak, Regular, Epic, etc.) is pre-factored into stats and should not be a direct modifier in damage formulas. Quality is stored as dynamic stats under `state.stats.challengeCaughtSpecific` (e.g., 'Pineco_Weak').
* **Terminology:** The terms 'Elite Four', 'Elite 4', 'Indigo Plateau', and 'Ever Grande City' have been standardized to '{Region} Pokemon League' across map coordinates, route area IDs, and gym names.
* **Gym Configurations:** In `config/gyms.js`, the Pokemon League and Champion are sequential in the same array as gyms. Use generic numbered names for regular gym members (e.g., 'Gym Trainer #1'). The gym's `name` must exactly match the `areaId` in route configs and the `name` in map coordinates.
* **Route Encounters:** When processing route encounter data, filter out routes identical to or with only 1 different Pokémon from ANY previously listed route across the entire region. Required columns in spreadsheets: `Route / Place`, `Pokemon Name`, `Level`, `BST`, `Method`, `% of appearance`, and `1st?`.
* **Challenges:** In challenge config objects, unlock strings must perfectly match the `areaId` of the target challenge. `requireCompletedChallenges` relies on checking `state.stats.completedChallengeIds` via `getChallengeData`. Champion defeat requirements should use region-specific flags (e.g., `defeatJohtoChampion`). Map route sequence must strictly match chronological main storyline progression.

## Region Specific Progression
* **Johto (Region 2):** Canonical gym order: Violet, Azalea, Goldenrod, Ecruteak, Cianwood, Olivine, Mahogany, Blackthorn. Route sequence: Cianwood Gym -> Safari Zone -> Olivine Gym -> Mount Mortar -> Mahogany Gym -> Ice Path.
* **Hoenn (Region 3):** Uses Pokémon Emerald roster (Juan as 8th Gym Leader, Wallace as Champion).
* **Sinnoh (Region 4):** Uses Pokémon Platinum progression.
* **Unova (Region 5):** Uses Pokémon Black 2 / White 2 progression.
* **Kalos (Region 6):** Uses X and Y storyline. Merges version exclusives, methods standardized to 'walk', 'water', and 'static'. Includes locations with no wild Pokémon.
* **Alola (Region 7):** Uses Ultra Sun/Ultra Moon storyline. Gyms consist of 11 bosses (7 Captains, 4 Kahunas) followed by the League (Hau). Uses Gen 7 Regional Pokédex IDs, methods strictly 'walk' and 'water'.
* **Galar (Region 8):** Includes base game and DLC areas (Isle of Armor, Crown Tundra). Averages weather conditions, combines version exclusives, groups 'walking', 'overworld', 'grass', and 'cave' into 'walk'. League equivalents modeled as Champion Cup battles.
* **Hisui (Region 9):** Currently skipped/unsupported. Route data defaults method to 'Walk', equal spawn percentages, leaves missing levels blank, includes BST derived from National Dex.
* **Paldea (Region 10):** Uses community-recommended level-based path. Uses only Gen 9 data mapped to Regional IDs. Methods restricted to Walk and Water.

## Testing Guidelines
* **Test Runner:** Execute tests using `pnpm test` (not `npm test`) to properly resolve environments (like `jest-environment-jsdom`) and workspaces.
* **Test Isolation:** When unit testing modules in `src/ui/`, explicitly mock complex dependencies like `src/state.js` and `src/ui.js` using `jest.mock()`.
* **Test DOM & Globals:** When testing modules interacting with browser globals (like `window`), mock `global.window`. `document.getElementById` is globally mocked in `jest.setup.js`; override locally if needed to prevent false positive matches.
* **Test Directory:** Place tests in `tests/` and mirror the directory structure of `src/`.

## Dependency Management
* **Package Manager:** Use pnpm. Do not generate or commit package-lock.json files; rely exclusively on pnpm-lock.yaml.
* **Multiplayer / WebRTC:** Handled in `src/ui/multiplayer.js`. Region locking enforced immediately via data channel based on `state.currentRegionName`.
