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

set TEST_MODE=0
if "%1"=="--test" set TEST_MODE=1

if %TEST_MODE%==1 (
    echo.
    echo Running in TEST mode (processing subset of Pokemon)...
    python download_sprites_test.py
) else (
    echo.
    echo Running in FULL mode (processing all Pokemon)...
    python download_sprites_full.py
)

echo.
echo Process complete!
pause
