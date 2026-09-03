const fs = require('fs');
let content = fs.readFileSync('config/routes.js', 'utf8');

// Fix 1: Separate unlocks
content = content.replace(/"unlocks": \[\s*"Route 14, 15"\s*\]/g, '"unlocks": ["Route 14", "Route 15"]');

// We also need to fix the areaId for Route 14 & 15 so it works right (probably duplicate the challenge for both or leave it on Route 14?)
// Let's duplicate it or assign it to Route 14 and have Route 15 just have no unlocks, wait no,
// The user said: "14 and 15 are diferent routes and will be unlocked at the same time"
// So the challenge is given *when* we are on Route 14 or 15 (it unlocks Fuchsia gym). Let's just use Route 14.
content = content.replace(/"areaId": "Route 14, 15"/g, '"areaId": "Route 14"'); // Actually, since we're just checking index, it works as Route 14.

fs.writeFileSync('config/routes.js', content);
