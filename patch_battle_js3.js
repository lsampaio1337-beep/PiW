const fs = require('fs');
const path = 'src/ui/battle.js';
let js = fs.readFileSync(path, 'utf8');

const targetStr = `    if (storageImg && storageCount && storageOverlay) {
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
        const maxAllowed = maxBox + 6 + 2; // Box capacity + 6 party + 2 daycare (Safe seems to have no explicit limit in capacity calculations, but we include it in sum as requested)
        storageCount.textContent = \`\${totalCount}/\${maxAllowed}\`;

        if (totalCount >= maxAllowed) {
            storageOverlay.style.display = 'block';
        } else {
            storageOverlay.style.display = 'none';
        }

    const ballImg = document.getElementById('smartwatch-ball-img');`;

const replaceStr = `    if (storageImg && storageCount && storageOverlay) {
        const boxTier = state.stats?.upgrades?.boxTier || 0;
        storageImg.src = \`./Assets/Items/Upgrades/Storage\${Math.max(1, boxTier)}.png\`;

        const partyLength = state.party ? state.party.length : 0;
        const storageLength = state.storage ? state.storage.length : 0;
        const safeLength = state.safe ? state.safe.length : 0;
        const breedLength = state.breeding ? state.breeding.length : 0;
        const totalCount = partyLength + storageLength + safeLength + breedLength;
        const maxBox = getCapacity(state, 'box');

        const maxAllowed = maxBox + 6 + 2; // Box capacity + 6 party + 2 daycare
        storageCount.textContent = \`\${totalCount}/\${maxAllowed}\`;

        if (totalCount >= maxAllowed) {
            storageOverlay.style.display = 'block';
        } else {
            storageOverlay.style.display = 'none';
        }
    }

    const ballImg = document.getElementById('smartwatch-ball-img');`;

js = js.replace(targetStr, replaceStr);
fs.writeFileSync(path, js);
