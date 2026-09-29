const fs = require('fs');

const content = fs.readFileSync('src/ui/calendar.js', 'utf8');
const searchStr = 'checkAnyDailyChallengeCompleted';
const lines = content.split('\n');
const idx = lines.findIndex(l => l.includes(searchStr));
if (idx !== -1) {
    console.log(lines.slice(Math.max(0, idx - 10), idx + 10).join('\n'));
} else {
    console.log("NOT FOUND IN calendar");
}
