function buildEvolutionLineHtml(pData, state) {
    let baseId = pData.id;
    let foundPrev = true;
    while(foundPrev) {
        foundPrev = false;
        for (const pd of state.config.pokemonData) {
            if (pd.evolutions && pd.evolutions.some(e => e.to === baseId)) {
                baseId = pd.id;
                foundPrev = true;
                break;
            }
        }
    }

    function buildTree(currentId) {
        const pd = state.config.pokemonData.find(p => p.id === currentId);
        if (!pd) return "";

        let html = `<div style="display: flex; flex-direction: column; align-items: center; margin: 5px;">
            <img src="Assets/Pokemon Sprites/${pd.id}.png" style="width: 50px; height: 50px; cursor: pointer;" onclick="window.showDexEntry(${pd.id})" title="${pd.name}">
            <span style="font-size: 10px; cursor: pointer;" onclick="window.showDexEntry(${pd.id})">${pd.name}</span>
        </div>`;

        if (pd.evolutions && pd.evolutions.length > 0) {
            html = `<div style="display: flex; align-items: center;">` + html;

            let evosHtml = `<div style="display: flex; flex-direction: column; justify-content: center; margin-left: 10px;">`;
            for (const evo of pd.evolutions) {
                evosHtml += `<div style="display: flex; align-items: center; margin: 5px 0;">
                    <div style="font-size: 10px; color: #aaa; margin-right: 5px;">Lv.${evo.level} ➔</div>
                    ${buildTree(evo.to)}
                </div>`;
            }
            evosHtml += `</div>`;
            html += evosHtml + `</div>`;
        }

        return html;
    }

    let treeHtml = buildTree(baseId);
    return `<div style="text-align: left; margin: 15px 0; font-size: 14px; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 5px; overflow-x: auto;">
        <h4 style="margin: 0 0 10px 0;">Evolution Line</h4>
        <div style="display: flex; align-items: center; justify-content: center;">
            ${treeHtml}
        </div>
    </div>`;
}

function getEvolveRequirements(p, evo, state) {
    const requiredLevel = evo.level;
    const baseStones = Math.ceil(p.level * 0.1);
    const stonesReq = p.types.length === 1 ? baseStones * 2 : baseStones;

    let hasStones = true;
    let missingStonesHtml = "";

    for (const type of p.types) {
        const stoneName = type + " Stone";
        const hasCount = state.backpack.stones[stoneName] || 0;
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
        stonesReq, // number of stones per type needed
        missingStonesHtml: missingStonesHtml.trim()
    };
}
