    // Storage Card Update
    const storageImg = document.getElementById('smartwatch-storage-img');
    const storageCount = document.getElementById('smartwatch-storage-count');
    const storageOverlay = document.getElementById('smartwatch-storage-full-overlay');

    if (storageImg && storageCount && storageOverlay) {
        const boxTier = state.stats?.upgrades?.boxTier || 0;
        storageImg.src = `./Assets/Items/Upgrades/Storage${Math.max(1, boxTier)}.png`;

        const partyLength = state.party ? state.party.length : 0;
        const storageLength = state.storage ? state.storage.length : 0;
        const safeLength = state.safe ? state.safe.length : 0;
        const breedLength = state.breeding ? state.breeding.length : 0;
        const currentTotal = partyLength + storageLength + safeLength + breedLength;

        // As defined: max number allowed is the max capacity of the box/storage? Wait, no, the box capacity is just for the box.
        // Wait, "there is max number of pokemon alloweded on backpack (party, daycare, storage, safe)... this is the %%"
        // Let's sum max capacity of all those locations. Party max is 6. Daycare max is 2. Safe is unbounded? Or does Safe have a capacity?
        // Let's use getCapacity(state, 'box') + 6 + 2 + state.safe.length for now? Wait, no, getCapacity(state, 'box') calculates just the box.
        // If there is an overall limit, let's see. Let's look at battleSystem.js catch limit.
