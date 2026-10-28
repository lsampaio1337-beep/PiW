# Pokemon DB Sprites Scraper

This folder contains Python scripts to scrape base sprite images from PokemonDB for Generation 5, 6, 7, and 8.

## Requirements
You must have Python 3 installed, along with `beautifulsoup4`:
\`\`\`bash
pip install beautifulsoup4
\`\`\`

## Usage

### 1. Test Script
To run the script on a subset of Pokémon (1-3, 101-103, ..., 1001-1003):
\`\`\`bash
python3 download_sprites_test.py
\`\`\`
It will create a `sprites_download` directory with the downloaded images, and output a `report_test.md` file.

### 2. Full Script
To run the script on all Pokémon:
\`\`\`bash
python3 download_sprites_full.py
\`\`\`
It will create a `sprites_download` directory with the downloaded images, and output a `report_full.md` file.

## Report Format
The report output (`report_test.md` or `report_full.md`) contains lines in the format `#%$$$$`
- `#`: 4-digit Pokédex Number (e.g., 0001)
- `%`: `n` (normal) or `s` (shiny)
- `$$$$`: 4 bits representing whether the Gen 5, Gen 6, Gen 7, and Gen 8 sprite was found. `1` means found and downloaded, `0` means not found. Example: `1101` means Gen 5, 6, 8 were found, but Gen 7 was not.


### Windows Execution
You can also use the included `.bat` files if you are running this on Windows:
- Run `run_scraper_test.bat` to run the test script.
- Run `run_scraper_full.bat` to run the full script.
- Or use `run_scraper.bat` (and optionally pass `--test` in the command prompt).
