@echo off
echo Installing dependencies...
npm install axios cheerio
echo Running poipoi.js...
node poipoi.js
echo Successfully finished. The data has been saved to movesets.json inside the moveset folder.
pause
