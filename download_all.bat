@echo off
setlocal
echo Checking for Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js is not installed. Installing...
    winget install -e --id OpenJS.NodeJS --accept-package-agreements --accept-source-agreements
    if %errorlevel% neq 0 (
        echo Failed to install Node.js automatically.
        echo Please install it manually from https://nodejs.org/
        pause
        goto :EOF
    )
    echo Node.js installed successfully. Please restart the batch file if the command is still not recognized.
    echo Refreshing environment variables...
    call refreshenv 2>nul
)

echo Running the pokemon sprites scraper for ALL pokemon...
node download_sprites.js

echo Done!
pause
