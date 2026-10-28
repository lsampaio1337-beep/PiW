@echo off
echo Starting PokemonDB Sprites Scraper...
echo.

set TEST_MODE=0
if "%1"=="--test" set TEST_MODE=1

if %TEST_MODE%==1 (
    echo Running in TEST mode (processing subset of Pokemon)...
    python download_sprites_test.py
) else (
    echo Running in FULL mode (processing all Pokemon)...
    python download_sprites_full.py
)

echo.
echo Process complete!
pause
