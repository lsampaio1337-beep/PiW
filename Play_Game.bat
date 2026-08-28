@echo off
echo ===================================================
echo             Idle Pokemon World - Launcher
echo ===================================================
echo.
echo Installing required dependencies (this may take a moment)...
call npm install --no-audit --no-fund

echo.
echo Checking and downloading Pokemon sprites...
call node scripts/downloadSprites.js

echo.
echo Starting the game! Enjoy!
call npm start
