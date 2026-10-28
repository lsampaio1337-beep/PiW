@echo off
echo Installing required dependencies...
call npm install playwright cheerio

echo Installing Playwright browsers...
call npx playwright install chromium

echo Running Full Scraper...
node scripts/full_scraper.js

echo Done! The pokemon_data.json and sprites/ folder have been created.
pause
