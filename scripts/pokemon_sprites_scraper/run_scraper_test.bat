@echo off
cd /d "%~dp0"
echo Starting PokemonDB Sprites Scraper in TEST mode...
python download_sprites_test.py
echo.
echo Process complete!
pause
