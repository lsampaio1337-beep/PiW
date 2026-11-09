@echo off
echo Installing required dependencies...
npm install puppeteer cheerio
echo.
echo Running Hisui Route Fetcher...
node scripts/fetch_hisui.js
echo.
echo Finished!
pause
