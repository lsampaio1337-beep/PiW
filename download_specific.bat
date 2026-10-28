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

echo Running the pokemon sprites scraper for specific ranges...
node download_sprites.js --ranges "1-3,101-103,201-203,301-303,401-403,501-503,601-603,701-703,801-803,901-903,1001-1003"

echo Done!
pause
