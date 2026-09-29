const fs = require('fs');
const path = 'src/ui/battle.js';
let js = fs.readFileSync(path, 'utf8');

const targetStr = `const maxCapacity = getCapacity(state, 'box'); // Since this is what gets upgraded. Wait, "max number allowed on backpack". Maybe it is exactly getCapacity(state, 'box') + 6 + 2 ? Let's just display what they said. Wait, if I look at getCurrentCount for box, it's just storage.
        // Let's use maxCapacity = getCapacity(state, 'box') + 6 (for party) + 2 (for daycare). But safe is infinite? Safe doesn't have a limit.
        // Wait, actually, the user said "1 there is max number of pokemon alloweded on backpack (party, daycare, storage, safe)... this is the %% and the ## is the sum of the ones that are on the backpack"
        // I will just calculate maxCapacity = getCapacity(state, 'box') + 6 + 2; and wait, safe is 0 limit?
        // Let's just output maxCapacity = getCapacity(state, 'box') for %% if they just meant the box upgrade, BUT they explicitly included party/daycare/safe in the count!
        // If the count includes party, daycare, storage, safe, then the max allowed must be maxBox + 6 + 2 + maxSafe? But there is no maxSafe.
        // I will just use maxCapacity = getCapacity(state, 'box') + 6 + 2.`;

const replaceStr = `const maxAllowed = maxBox + 6 + 2; // Box capacity + 6 party + 2 daycare (Safe seems to have no explicit limit in capacity calculations, but we include it in sum as requested)
        storageCount.textContent = \`\${totalCount}/\${maxAllowed}\`;

        if (totalCount >= maxAllowed) {
            storageOverlay.style.display = 'block';
        } else {
            storageOverlay.style.display = 'none';
        }`;

js = js.replace(targetStr, replaceStr);
fs.writeFileSync(path, js);
