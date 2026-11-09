# Scraping Serebii Location Data

To update or recreate region data from Serebii.net for the Pokémon Idle game, you can use the following approach. This method parses the HTML tables on Serebii's Pokearth pages and converts them into the game's route configuration format (e.g., `config/hisuiRoutes.js`).

## Prerequisites

1.  **Node.js or Python Environment**: The example scripts use Python for HTML parsing and JSON generation, and Node.js for safely updating the Javascript config files.
2.  **Required Libraries**:
    *   Python: `beautifulsoup4` (install via `pip install beautifulsoup4`)
    *   Node.js: Standard built-in modules (`fs`).

## Process

### Step 1: Identify Target Categories and Allowed Spawns
First, list the Serebii URL categories for the region you want to scrape, along with the specific encounter types you want to keep. In the Hisui update, we filtered for standard spawns, flying, shaking trees/ore, and Unown notes, while explicitly ignoring Alphas and Mass Outbreaks.

```python
CATEGORIES = [
    ("Alabaster Icelands", "https://www.serebii.net/pokearth/hisui/alabastericelands.shtml"),
    # Add other categories here...
]

ALLOWED_ENCOUNTER_TYPES = [
    "Standard Spawn",
    "Standard Spawn - In Air",
    # Add other allowed types here...
]
```

### Step 2: Write a Python Scraper (`parse_and_generate.py`)
Create a Python script that fetches the HTML, extracts the sub-area links, and parses the encounter tables.

*   **Handling Serebii Tables**: Serebii structures its data using `<table class="extradextable">`. The type of encounter is found in `<td class="interact">`.
*   **Filtering**: Skip rows where the Pokémon name includes "Alpha" or an `alt="Alpha"` image tag.
*   **Probability Aggregation**: Serebii often splits encounters by time of day or weather (resulting in multiple tables for the same Pokemon). Group encounters by Pokemon Name and Level Range, calculate the average probability across all tables, and normalize the final probabilities so they sum to 1.0.
*   **ID Mapping**: Use `data/pokemon.json` to map the scraped Pokémon names to their internal integer IDs.

Output the scraped data to a temporary JSON file (e.g., `new_routes.json`).

### Step 3: Write a Node Updater (`replace.js`)
Instead of performing raw string/regex replacements on the JS config files (which easily corrupts the file), use Node to safely evaluate and rewrite the configurations.

*   **Eval and Export**: Temporarily replace `export const` with `const` in the JS file and append `module.exports` so you can `require()` it.
*   **Name Mapping**: Create an `oldToNew` dictionary to map existing route names to the newly scraped route names (e.g., appending the category suffix). Map split routes (like "Route North" / "Route South") to the single scraped base route if necessary.
*   **Safe Merging**: Iterate through the original `hisuiRoutes`. If a route exists in your scraped JSON, update its `pokes` array. If it doesn't exist (e.g., Gyms, Space-Time Distortions, Fishing Spots), **keep the original entry untouched**. Never blindly overwrite the whole object, as you will delete game-specific logic.
*   **Update Unlocks**: Iterate through `hisuiUnlocks`. Update `areaId`, the `unlocks` array, and `requirements.routeName` references using your `oldToNew` mapping dictionary. Deduplicate the `unlocks` array since merged routes might result in duplicate unlock targets.
*   **Stringify and Write**: Serialize the objects back to formatted JSON and prepend `export const variableName = ` before writing back to the config file.

### Step 4: Verification
After updating the configuration:
1.  Run the tests: `npm test`
2.  Check for progression breaks: `node scripts/check_routes_order.js <region_id>`
3.  Check for dangling unlocks: Run a quick script to verify that every string inside `unlock.unlocks` and `unlock.areaId` corresponds exactly to a top-level key in your modified routes object.
4.  Generate regional data (optional): `node scripts/generate_region_xlsx.js <region_id>`
