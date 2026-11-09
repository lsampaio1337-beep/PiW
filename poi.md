# Fetching Bulbapedia Hisui Encounter Data

## Goal
The goal was to wipe out the inaccurate encounter data for the Hisui region (Region 9) and replace it with updated information from Bulbapedia, specifically focusing on the 5 main categories: Alabaster Icelands, Cobalt Coastlands, Coronet Highlands, Crimson Mirelands, and Obsidian Fieldlands.

## Bypassing Cloudflare
Because Bulbapedia has aggressive Cloudflare protection ("Just a moment..." pages) that blocks automated requests like `curl` or `fetch`, direct API access or HTML scraping from the live site frequently fails.

**To bypass this:**
The most reliable method to retrieve raw HTML for parsing without triggering Cloudflare blocks is to use the **Internet Archive's Wayback Machine** (web.archive.org).

1. First, search for the page on the Wayback Machine to find a recent snapshot. (e.g. `http://web.archive.org/web/20230302005021/https://bulbapedia.bulbagarden.net/wiki/Obsidian_Fieldlands`).
2. Download the snapshot's HTML using `wget -qO- <snapshot_url> > output.html`.

## Parsing Logic
The data was parsed using a Node.js script utilizing the `cheerio` library to query the DOM structure of the saved HTML files.

1. **Identifying Encounter Tables:** The script searched for the `<h2>Pokémon</h2>` header and iterated over the subsequent DOM elements.
2. **Filtering by Encounter Type:** Encounter types (e.g., "Basic", "Shaking trees") were identified via preceding `<h3>`, `<h4>`, or `<dl>` tags. As per instructions, "Mass outbreak", "Fixed Alpha", and "Space-time distortions" were ignored.
3. **Table Structure:** Valid tables were identified by the presence of a "Sub-location(s)" column header.
4. **Row Extraction:**
   - **Pokémon Name & Form:** Extracted from the 3rd column (`tds.eq(2)`). If a `<small>` tag was present, it indicated a specific form (e.g., Hisuian).
   - **Levels:** Extracted from the 5th column (`tds.eq(4)`). Regex (`/(\d+)\s*-\s*(\d+)/`) was used to parse ranges (e.g., "6-13"). Single numbers or "?" were parsed appropriately.
   - **Presence (Fixed Alpha):** Checked the 8th column (`tds.eq(7)`) for an `Alpha_icon.png` or explicit text mentioning "Mass outbreak", skipping the row if found.
   - **Locations:** The "Sub-location(s)" column could contain multiple `<a>` tags. Each was iterated, and the category name (e.g., "Obsidian Fieldlands") was appended to the route name to form the final location ID.
5. **ID Resolution:** A custom helper function mapped the extracted name and form to the internal 0-indexed integer keys found in `data/pokemon.json`.

## Generating the Config
The parsed encounters were grouped by the unique Location ID. For each location:
1. Probabilities were calculated by counting occurrences of each unique Pokémon + level range combination and normalizing the sum to `1.0`.
2. The `hisuiRoutes` and `hisuiUnlocks` string configurations were constructed dynamically.
3. Gyms and existing post-game content (like "Etertime Citadel") were manually preserved and appended to the generated lists.
4. Gym progression requirements were ensured to use the `earnBadge` condition (e.g., `{ earnBadge: { badgeCount: 70, name: "Avalugg Badge" } }`) instead of `defeatCountRoute`, avoiding progression soft-locks.
