const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(
  /<div id="player-side".*?>/,
  '<div id="player-side" style="position: absolute; transform: translateY(-100%); top: 80%; right: 25%;">'
);

html = html.replace(
  /<div id="enemy-side".*?>/,
  '<div id="enemy-side" style="position: absolute; transform: translateY(-100%); top: 80%; left: 35%; display: flex; align-items: center;">'
);

fs.writeFileSync('index.html', html);
