const fs = require('fs');
let file = fs.readFileSync('src/ui/backpack/index.js', 'utf8');

// The original code had:
// <div onclick="document.getElementById('backpack-content-area').style.display='none'" style="position: absolute; top:0; left:0; width:100%; height:100%; z-index: 1;"></div>
// It sits behind the pockets.
// Let's modify the modal logic to capture the event without getting blocked.
// Actually, it sits at z-index: 1, and the pocket buttons wrapper is at z-index: 2.
// The pockets are inside `<div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2;">`
// Because of this full-width/height z-index 2 div, clicks on the background are caught by it and don't bubble to the z-index 1 div.

const regex = /<div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2;">/;
file = file.replace(regex, `<div onclick="document.getElementById('backpack-content-area').style.display='none'" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2;">`);

// And we remove the original z-index:1 div
file = file.replace(/<div onclick="document\.getElementById\('backpack-content-area'\)\.style\.display='none'" style="position: absolute; top:0; left:0; width:100%; height:100%; z-index: 1;"><\/div>/, '');

// Since the click handler on the z-index 2 wrapper will close the window, we MUST prevent bubbling from the pockets.
file = file.replace(/onclick="window\.renderBackpackTab\('pokeballs'\)"/g, `onclick="event.stopPropagation(); window.renderBackpackTab('pokeballs')"`);
file = file.replace(/onclick="window\.renderBackpackTab\('pokemon'\)"/g, `onclick="event.stopPropagation(); window.renderBackpackTab('pokemon')"`);
file = file.replace(/onclick="window\.renderBackpackTab\('potions'\)"/g, `onclick="event.stopPropagation(); window.renderBackpackTab('potions')"`);
file = file.replace(/onclick="window\.renderBackpackTab\('stones'\)"/g, `onclick="event.stopPropagation(); window.renderBackpackTab('stones')"`);

// The backpack-content-area itself is z-index 5, it should also stop propagation just in case.
file = file.replace(/id="backpack-content-area"/, `id="backpack-content-area" onclick="event.stopPropagation()"`);

fs.writeFileSync('src/ui/backpack/index.js', file);
