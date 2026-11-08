const fs = require('fs');
let paldeaRoutesContent = fs.readFileSync('config/paldeaRoutes.js', 'utf8');

// The reviewer noticed the old Z1 to Z9 challenges are still in the paldeaUnlocks array!
// Let's remove them properly.

// Look for where paldeaUnlocks starts.
let parts = paldeaRoutesContent.split('export const paldeaUnlocks = [');
if (parts.length > 1) {
    let unlocksArray = parts[1];

    // We need to strip out Extra Challenge Z1 through Extra Challenge Z9
    // And also ensure Extra Challenge Z01 to Z07 are the ONLY Extra Challenge Z challenges there.
    // The easiest way is to use a regex that matches the old Z1 to Z9 objects and deletes them.
    // The old ones have "challengeName": "Extra Challenge ZX" where X is a single digit 1-9.

    unlocksArray = unlocksArray.replace(/,\n\s*{\n\s*"challengeName": "Extra Challenge Z[1-9]"[\s\S]*?(?=\}\s*,\s*\{\s*"challengeName"|\}\s*\])/g, '');

    paldeaRoutesContent = parts[0] + 'export const paldeaUnlocks = [' + unlocksArray;
    fs.writeFileSync('config/paldeaRoutes.js', paldeaRoutesContent);
    console.log("Fixed dangling references.");
}
