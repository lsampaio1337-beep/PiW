const fs = require('fs');
let content = fs.readFileSync('src/ui/topbar.js', 'utf8');

const regex = /if\s*\(req\.catchEachFromSlotMachine\)\s*\{[\s\S]*?\}(?=\s*if\s*\(req\.earnBadge\))/g;

const newLogic = `if (req.catchEachFromSlotMachine) {
        let caughtCount = 0;
        let cStats = state.stats.caughtSpecies || {};

        if (req.catchEachFromSlotMachine.machines) {
            for (let machine of req.catchEachFromSlotMachine.machines) {
                if (machine.some(s => cStats[s] >= 1)) {
                    caughtCount++;
                }
            }
        }
        let requiredTotal = req.catchEachFromSlotMachine.count || 5;
        if (caughtCount < requiredTotal) isMet = false;
        textParts.push(\`Catch 1 Pokemon from each Slot Machine \${countDisplay(caughtCount, requiredTotal)}\${getStatusHtml(caughtCount >= requiredTotal)}\`);
    }`;

content = content.replace(regex, newLogic + "\n    ");

fs.writeFileSync('src/ui/topbar.js', content);
console.log("Fixed topbar logic");
