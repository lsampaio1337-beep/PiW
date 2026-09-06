const fs = require('fs');
let code = fs.readFileSync('src/ui.js', 'utf8');
const match = code.match(/window\.showBackpack = showBackpack;[\s\S]*?window\.renderBackpackTab = renderBackpackTab;/);
if (match) {
    console.log(match[0]);
} else {
    console.log("NOT FOUND");
}
