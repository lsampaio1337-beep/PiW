@echo off
cd /d "%~dp0"
echo Starting PokemonDB Sprites Scraper in FULL mode...
python download_sprites_full.py
echo.
echo Process complete!
pause
