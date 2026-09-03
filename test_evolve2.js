const assert = require('assert');

let state = {
    backpack: {
        stones: {
            "Fire Stone": 3,
            "Water Stone": 0
        }
    }
};

let p = {
    level: 16, // ceil(16 * 0.1) = 2. Dual type = 2 per type.
    types: ["Fire", "Water"]
};

let evo = {
    level: 16
};

function getEvolveRequirements(p, evo, state) {
    const requiredLevel = evo.level;
    const baseStones = Math.ceil(p.level * 0.1);
    const stonesReq = p.types.length === 1 ? baseStones * 2 : baseStones;

    let hasStones = true;
    let missingStonesHtml = "";

    for (const type of p.types) {
        const stoneName = type + " Stone";
        state.backpack.stones[stoneName] = state.backpack.stones[stoneName] || 0; // safe fallback
        const hasCount = state.backpack.stones[stoneName];
        if (hasCount < stonesReq) {
            hasStones = false;
        }
        missingStonesHtml += `${stonesReq}<img src="Assets/Items/Stones/${stoneName}.png" style="width: 16px; height: 16px; vertical-align: middle; margin-left: 2px; margin-right: 5px;" title="${stoneName}">`;
    }

    const hasLevel = p.level >= requiredLevel;

    return {
        canEvolve: hasLevel && hasStones,
        hasLevel,
        hasStones,
        requiredLevel,
        stonesReq,
        missingStonesHtml: missingStonesHtml.trim()
    };
}

let req = getEvolveRequirements(p, evo, state);
console.log(req);
