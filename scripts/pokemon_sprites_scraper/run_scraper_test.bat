@echo off
cd /d "%~dp0"

echo Checking for Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed or not in your PATH.
    echo Please install Python 3 from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation.
    pause
    goto :eof
)

echo.
echo Checking and installing required dependencies...
python -m pip install --upgrade pip
python -m pip install beautifulsoup4

echo.
echo Starting PokemonDB Sprites Scraper in TEST mode...
python download_sprites_test.py

echo.
echo Process complete!
pause
