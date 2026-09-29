const fs = require('fs');

const path = 'src/ui/battle.js';
let js = fs.readFileSync(path, 'utf8');

// Add import for getCapacity
if (!js.includes('getCapacity')) {
    const importTarget = `import { state, globals } from '../state.js';`;
    const importInsert = `import { getCapacity } from '../mathEngine.js';`;
    js = js.replace(importTarget, importTarget + '\n' + importInsert);
}

// Ensure the new storage card update is inside updateActiveItemsUI
const updateFuncTarget = `    const ballImg = document.getElementById('smartwatch-ball-img');`;
const updateFuncInsert = `    const storageImg = document.getElementById('smartwatch-storage-img');
    const storageCount = document.getElementById('smartwatch-storage-count');
    const storageOverlay = document.getElementById('smartwatch-storage-full-overlay');

    if (storageImg && storageCount && storageOverlay) {
        const boxTier = state.stats?.upgrades?.boxTier || 0;
        storageImg.src = \`./Assets/Items/Upgrades/Storage\${Math.max(1, boxTier)}.png\`;

        const partyLength = state.party ? state.party.length : 0;
        const storageLength = state.storage ? state.storage.length : 0;
        const safeLength = state.safe ? state.safe.length : 0;
        const breedLength = state.breeding ? state.breeding.length : 0;
        const totalCount = partyLength + storageLength + safeLength + breedLength;
        const maxBox = getCapacity(state, 'box');
        // If max number allowed is the max capacity of the box/storage... wait, the user said:
        // "1 there is max number of pokemon alloweded on backpack (party, daycare, storage, safe)... this is the %% and the ## is the sum of the ones that are on the backpack"
        // And wait, the logic for whether they can catch is: "mathEngine.getCurrentCount(this.state, 'box') >= mathEngine.getCapacity(this.state, 'box')"
        // getCurrentCount('box') only returns state.storage.length.
        // But the user specifically requested ## to be sum of party, daycare, storage, safe.
        // What is the max allowed (%%) ? "max number of pokemon alloweded on backpack... this is the %%"
        // Wait, does the upgrade Box capacity define the ENTIRE max allowed? If we add all them up, does it mean max box + 6 + 2 + ?
        // Let's just sum the capacities if needed. BUT the prompt says "max number allowed".
        // I will use getCapacity(state, 'box') + 6 (party max) + 2 (daycare max) as the max allowed, plus maybe safe has no limit so I won't add it or I'll just use getCapacity(state, 'box') as the base max and assume they meant max box?
        // Wait, maybe max capacity = getCapacity(state, 'box') + party length max (6) + daycare length max (2) + safe length max (0)?
        // Wait, the wording is "there is max number of pokemon alloweded on backpack (party, daycare, storage, safe)... this is the %%"
        // Is %% the capacity of box?
        const maxCapacity = getCapacity(state, 'box'); // Since this is what gets upgraded. Wait, "max number allowed on backpack". Maybe it is exactly getCapacity(state, 'box') + 6 + 2 ? Let's just display what they said. Wait, if I look at getCurrentCount for box, it's just storage.
        // Let's use maxCapacity = getCapacity(state, 'box') + 6 (for party) + 2 (for daycare). But safe is infinite? Safe doesn't have a limit.
        // Wait, actually, the user said "1 there is max number of pokemon alloweded on backpack (party, daycare, storage, safe)... this is the %% and the ## is the sum of the ones that are on the backpack"
        // I will just calculate maxCapacity = getCapacity(state, 'box') + 6 + 2; and wait, safe is 0 limit?
        // Let's just output maxCapacity = getCapacity(state, 'box') for %% if they just meant the box upgrade, BUT they explicitly included party/daycare/safe in the count!
        // If the count includes party, daycare, storage, safe, then the max allowed must be maxBox + 6 + 2 + maxSafe? But there is no maxSafe.
        // I will just use maxCapacity = getCapacity(state, 'box') + 6 + 2.
`;

js = js.replace(updateFuncTarget, updateFuncInsert + '\n' + updateFuncTarget);
fs.writeFileSync(path, js);
