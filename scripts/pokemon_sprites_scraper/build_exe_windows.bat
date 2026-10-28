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
echo Installing PyInstaller and dependencies...
python -m pip install --upgrade pip
python -m pip install beautifulsoup4 pyinstaller

echo.
echo Building Standalone Executable (Full Mode)...
python -m PyInstaller --onefile --name "PokemonDB_Scraper_Full" download_sprites_full.py

echo.
echo Building Standalone Executable (Test Mode)...
python -m PyInstaller --onefile --name "PokemonDB_Scraper_Test" download_sprites_test.py

echo.
echo Cleaning up build folders...
rmdir /s /q build
del /q *.spec

echo.
echo ========================================================
echo Build Complete!
echo Your standalone executable files are located in the "dist" folder.
echo You can move these .exe files anywhere and double-click to run them!
echo ========================================================
pause
