@echo off
cd /d "%~dp0"

REM Cleanup any leftover ready flag from a previous dirty exit
if exist "game_ready.txt" del "game_ready.txt"

echo ===================================================
echo             Idle Pokemon World - Launcher
echo ===================================================
echo.

REM Check if we are in the right folder, sometimes zip extraction puts everything in a subfolder
if not exist "package.json" (
    REM Try to find a subfolder that might contain it, typically "PiW" or similar
    for /d %%D in (*) do (
        if exist "%%D\package.json" (
            echo Found game files inside %%D, switching directory...
            cd "%%D"
            goto START_SETUP
        )
    )

    echo [ERROR] Could not find package.json in the current folder!
    echo Please make sure you extracted all the files from the ZIP correctly,
    echo and that this run.bat file is in the same folder as package.json and the src folder.
    echo Current folder: %CD%
    pause
    goto :EOF
)

:START_SETUP
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

echo Set WshShell = CreateObject("WScript.Shell") > launch_hidden.vbs
echo WshShell.Run "cmd /c npm start", 0, False >> launch_hidden.vbs
cscript //nologo launch_hidden.vbs
del launch_hidden.vbs

echo Waiting for the game window to open...
:WAIT_LOOP
timeout /t 1 /nobreak >nul
if not exist "game_ready.txt" goto WAIT_LOOP
del game_ready.txt

REM Exit to close the terminal automatically
exit
