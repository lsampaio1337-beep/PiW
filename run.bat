@echo off
cd /d "%~dp0"
echo ===================================================
echo             Idle Pokemon World - Launcher
echo ===================================================
echo.
echo Please wait while the game installs dependencies and starts up...

REM Install dependencies
echo [1/2] Installing dependencies...
call npm install --no-audit --no-fund
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Failed to install dependencies.
    echo Please check the output above for details.
    pause
    goto :EOF
)

REM Start game
echo [2/2] Starting the game!
call npm start
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Game crashed or failed to start.
    echo Please copy the error report above.
    pause
    goto :EOF
)

echo.
echo Game closed normally.
pause
