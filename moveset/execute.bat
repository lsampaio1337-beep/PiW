@echo off
echo Installing dependencies...
npm install axios cheerio
echo Running fetch_movesets.js...
node fetch_movesets.js
echo Successfully finished. The data has been saved to moveset\movesets.json.
pause
