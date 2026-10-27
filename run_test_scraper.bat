@echo off
echo Installing required dependencies...
call npm install playwright cheerio

echo Installing Playwright browsers...
call npx playwright install chromium

echo Running Test Scraper...
node scripts/test_scraper.js

echo Done! The test_data.json and test_sprites/ folder have been created.
pause
