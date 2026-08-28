@echo off
cd /d "%~dp0"
echo ===================================================
echo             Idle Pokemon World - Launcher
echo ===================================================
echo.
echo Please wait while the game sets up and downloads assets...
echo This might take a couple minutes on your first run.

REM Ensure npm is available
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: Node.js/npm is not installed or not in your PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    goto :EOF
)

REM Install dependencies silently, but catch errors
echo [1/3] Installing/verifying dependencies...
call npm install --no-audit --no-fund
if %ERRORLEVEL% neq 0 (
    echo Error during npm install. Check the output above.
    pause
    goto :EOF
)

REM Run the download script
echo [2/3] Checking and downloading Pokemon sprites...
call node scripts/downloadSprites.js
if %ERRORLEVEL% neq 0 (
    echo Error during asset download. Check your internet connection.
    pause
    goto :EOF
)

REM Start game
echo [3/3] Starting the game! Enjoy!
call npm start
