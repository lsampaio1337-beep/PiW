const fs = require('fs');

const uiContent = fs.readFileSync('src/ui/dailyChallenges.js', 'utf8');
const searchStr = 'window.trackDailyChallenge = function';
const lines = uiContent.split('\n');
const idx = lines.findIndex(l => l.includes(searchStr));
if (idx !== -1) {
    console.log(lines.slice(Math.max(0, idx - 5), idx + 20).join('\n'));
} else {
    console.log("NOT FOUND");
}
