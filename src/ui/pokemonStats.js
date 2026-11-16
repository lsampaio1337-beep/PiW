import * as mathEngine from '../mathEngine.js';
import { getSpeciesDataHtml, buildEvolutionLineHtml, formatType } from "./pokedex.js";
import { state } from '../state.js';
import { updateUI, showModal } from '../ui.js';
import { escapeHTML } from '../utils/stringUtils.js';


function getPokemonConfig(id, state) {
    if (!state?.config) return undefined;
    if (state.config.pokemonMap) {
        return state.config.pokemonMap.get(Number(id)) || state.config.pokemonMap.get(id);
    }
    return state.config.pokemonData?.find(d => Number(d.id) === Number(id) || d.id === id);
}

function applyEvolvedBaseStats(mon, baseData) {
    mon.id = baseData.id;
    mon.name = baseData.name;
    mon.types = [...(baseData.types || [])];
    mon.bst = baseData.hp + baseData.atk + baseData.def + baseData.spa + baseData.spd + baseData.spe;

    const v = mon.vitamins || {};
    mon.maxHp = mathEngine.calculateHP(baseData.hp, mon.ivs.hp, mon.level, mon.quality, v.hp || 0);
    mon.currentStats.hp = mon.maxHp;
    mon.currentStats.atk = mathEngine.calculateStat(baseData.atk, mon.ivs.atk, mon.level, mon.quality, v.atk || 0);
    mon.currentStats.def = mathEngine.calculateStat(baseData.def, mon.ivs.def, mon.level, mon.quality, v.def || 0);
    mon.currentStats.spa = mathEngine.calculateStat(baseData.spa, mon.ivs.spa, mon.level, mon.quality, v.spa || 0);
    mon.currentStats.spd = mathEngine.calculateStat(baseData.spd, mon.ivs.spd, mon.level, mon.quality, v.spd || 0);
    mon.currentStats.spe = mathEngine.calculateStat(baseData.spe, mon.ivs.spe, mon.level, mon.quality, v.spe || 0);
    mon.currentHp = mon.maxHp;

    const totalIV = mon.ivs.hp + mon.ivs.atk + mon.ivs.def + mon.ivs.spa + mon.ivs.spd + mon.ivs.spe;
    mon.evxp = mathEngine.calculateEVXP(mon.bst, mon.level, mon.quality, totalIV);
    mon.evm = mathEngine.calculateEVM(mon.bst, mon.level, mon.quality, totalIV);
    mon.pp = mathEngine.calculatePP(mon.bst, mon.level, mon.quality, totalIV);
}

function markEvolvedSpeciesCaught(speciesName, isShiny) {
    if (!state.stats.caughtSpecies) state.stats.caughtSpecies = {};
    if (!state.stats.caughtSpecies[speciesName]) {
        state.stats.caughtSpeciesCount = (state.stats.caughtSpeciesCount || 0) + 1;
        state.stats.caughtSpecies[speciesName] = true;
        state.stats.caught++;
    }

    if (isShiny) {
        if (!state.stats.caughtShiniesSpecies) state.stats.caughtShiniesSpecies = {};
        if (!state.stats.caughtShiniesSpecies[speciesName]) {
            state.stats.caughtShiniesSpeciesCount = (state.stats.caughtShiniesSpeciesCount || 0) + 1;
            state.stats.caughtShiniesSpecies[speciesName] = true;
        }
    }
}

function getEvolveRequirements(p, evo, state) {
    const requiredLevel = evo.level;
    const baseStones = Math.ceil(p.level * 0.2);
    const stonesReq = p.types.length === 1 ? baseStones : Math.ceil(baseStones / 2);

    let hasStones = true;
    let missingStonesHtml = "";

    for (const type of p.types) {
        const stoneName = type + " Stone";
        const hasCount = state.backpack?.stones?.[stoneName] || 0;
        if (hasCount < stonesReq) {
            hasStones = false;
        }
        missingStonesHtml += `${missingStonesHtml ? ' and ' : ''}${stonesReq}<img src="Assets/Items/Stones/${stoneName}.png" style="width: 16px; height: 16px; vertical-align: middle; margin: 0 2px;" title="${stoneName}">`;
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

export function showPokemonStatsByUuid(uuid) {
    const locations = ['party', 'breeding', 'training', 'storage', 'safe'];

    for (const location of locations) {
        const list = state[location];
        if (list) {
            const idx = list.findIndex(x => x.uuid === uuid);
            if (idx !== -1) {
                showPokemonStats(idx, location);
                return;
            }
        }
    }
}

function getActionsHtml(p, pData, location, idx) {
    let evolveHtml = "";
    if (pData.evolutions && pData.evolutions.length > 0) {
        if (pData.evolutions.length > 1) {
            const canEvolveAny = pData.evolutions.some(evo => getEvolveRequirements(p, evo, state).canEvolve);
            evolveHtml = `
                <div>
                    <button ${canEvolveAny ? '' : 'disabled'} onclick="window.showEvolveConfirmModal('${location}', ${idx})" class="stats-action-btn">Multiple<br>Evolutions</button>
                </div>
            `;
        } else {
            const evo = pData.evolutions[0];
            const req = getEvolveRequirements(p, evo, state);
            let btnText = "Evolve";
            if (!req.canEvolve) {
                btnText = `<span style="line-height:1.2;">Need lv. ${req.requiredLevel}</span><span style="line-height:1.2; display:flex; align-items:center; justify-content:center;">Need ${req.missingStonesHtml}</span>`;
            }
            evolveHtml = `
                <div>
                    <button ${req.canEvolve ? '' : 'disabled'} onclick="window.showEvolveConfirmModal('${location}', ${idx})" class="stats-action-btn">${btnText}</button>
                </div>
            `;
        }
    }

    return `<div style="margin-top: 15px; border-top: 1px solid #555; padding-top: 10px; display: flex; justify-content: center; gap: 10px;">
        ${evolveHtml}
        <div>
            <button onclick="window.showVitaminsModal('${location}', ${idx})" class="stats-action-btn">Consume<br>Vitamins</button>
        </div>
    </div>`;
}

function getVitHtml(count, imgName) {
    if (!count || count <= 0) return '';
    return ` <span style="font-size: 12px; margin-left: 2px;">${count}x<img src="Assets/Items/Vitamins/${imgName}.png" style="width: 12px; height: 12px; vertical-align: middle;"></span>`;
}

function getActualStatsHtml(p) {
    const v = p.vitamins || {};
    return `
        <div style="background: rgba(0,0,0,0.5); padding: 15px; border-radius: 8px; text-align: left; min-width: 150px; flex: 1; display: flex; flex-direction: column;">
            <h3 style="margin: 0 0 15px 0; text-align: center; border-bottom: 1px solid #555; padding-bottom: 5px;">Actual Stats</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px 10px; font-size: 14px; text-align: center; flex: 1; align-content: center;">
                <div>HP<br><b>${p.maxHp}</b>${getVitHtml(v.hp, 'HP Up')}</div>
                <div>Speed<br><b>${p.currentStats ? p.currentStats.spe : '?'}</b>${getVitHtml(v.spe, 'Carbo Speed')}</div>
                <div>Atk<br><b>${p.currentStats ? p.currentStats.atk : '?'}</b>${getVitHtml(v.atk, 'Protein Atk')}</div>
                <div>SpAtk<br><b>${p.currentStats ? p.currentStats.spa : '?'}</b>${getVitHtml(v.spa, 'Calcium SpAtk')}</div>
                <div>Def<br><b>${p.currentStats ? p.currentStats.def : '?'}</b>${getVitHtml(v.def, 'Iron Def')}</div>
                <div>SpDef<br><b>${p.currentStats ? p.currentStats.spd : '?'}</b>${getVitHtml(v.spd, 'Zinc SpDef')}</div>
            </div>
        </div>
    `;
}

function getBasicInfoHtml(p, sumIV) {
    return `
        <div style="background: rgba(0,0,0,0.5); padding: 15px; border-radius: 8px; text-align: center; flex: 1; font-size: 14px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <img src="${window.getSpriteUrl(p.id, p.qualityName === 'Shiny')}" style="width: 100px; height: 100px;"><br>
            <p style="margin: 5px 0;"><b>Type:</b> ${p.types.map(t => formatType(t)).join(' ')}</p>
            <b>Quality:</b> ${p.qualityName} (Q=${p.quality.toFixed(2)})<br>
            <b>Sum IVs:</b> ${sumIV}<br>
        </div>
    `;
}

function getIvDistributionHtml(p) {
    const ivBar = (val) => `
        <div style="background: #333; width: 100%; height: 16px; border-radius: 8px; overflow: hidden; position: relative;">
            <div style="background: #3498db; width: ${val}%; height: 100%;"></div>
            <div style="position: absolute; top: 0; left: 0; width: 100%; text-align: center; font-size: 12px; line-height: 16px; font-weight: bold; color: white; text-shadow: 1px 1px 1px black;">${val}</div>
        </div>
    `;
    return `
        <div style="background: rgba(0,0,0,0.5); padding: 15px; border-radius: 8px; text-align: left; min-width: 200px; flex: 1; display: flex; flex-direction: column;">
            <h3 style="margin: 0 0 15px 0; text-align: center; border-bottom: 1px solid #555; padding-bottom: 5px;">IV Distribution</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px 10px; font-size: 14px; text-align: center; flex: 1; align-content: center;">
                <div>HP<br>${ivBar(p.ivs.hp)}</div>
                <div>Speed<br>${ivBar(p.ivs.spe)}</div>
                <div>Atk<br>${ivBar(p.ivs.atk)}</div>
                <div>SpAtk<br>${ivBar(p.ivs.spa)}</div>
                <div>Def<br>${ivBar(p.ivs.def)}</div>
                <div>SpDef<br>${ivBar(p.ivs.spd)}</div>
            </div>
        </div>
    `;
}

function getIndividualHtml(p, sumIV, actionsHtml) {
    return `
        <div style="display: flex; justify-content: space-around; flex-wrap: wrap; align-items: stretch; gap: 10px;">
            ${getActualStatsHtml(p)}
            ${getBasicInfoHtml(p, sumIV)}
            ${getIvDistributionHtml(p)}
        </div>
        ${actionsHtml}
    `;
}

function getCollectiveHtml(pData, state) {
    const fullEvoTreeHtml = buildEvolutionLineHtml(pData, state);
    return `
        <div style="margin-top: 20px; border-top: 2px solid #fff; padding-top: 15px;">
            <h3 style="margin-top: 0;">Species Data</h3>
            ${getSpeciesDataHtml(pData, state)}
            ${fullEvoTreeHtml}
        </div>
    `;
}

export function showPokemonStats(idx, location) {
    const list = state[location];
    if (!list || !list[idx]) return;
    const p = list[idx];

    const sumIV = p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe;
    const pData = getPokemonConfig(p.id, state);
    if (!pData) return;

    const actionsHtml = getActionsHtml(p, pData, location, idx);
    const individualHtml = getIndividualHtml(p, sumIV, actionsHtml);
    const collectiveHtml = getCollectiveHtml(pData, state);

    let html = `
        <div class="content-panel" style="max-height: 80vh; overflow-y: auto; overflow-x: hidden;">
            ${individualHtml}
            ${collectiveHtml}
        </div>
    `;

    showModal(`${escapeHTML(p.name)} (Lv. ${p.level})`, html, "window-pokemon-stats");
}


export function evolvePokemon(location, idx, toId) {
    const list = state[location];
    if (!list || !list[idx]) return;

    let p = list[idx];
    const newBase = getPokemonConfig(toId, state);
    if (!newBase) return;

    // Re-verify requirements and consume stones
    const oldPData = getPokemonConfig(p.id, state);
    const evoObj = oldPData ? oldPData.evolutions?.find(e => Number(e.to) === Number(toId)) : null;
    if (evoObj) {
        const req = getEvolveRequirements(p, evoObj, state);
        if (!req.canEvolve) {
            alert("Requirements not met!");
            return;
        }

        // Nincada evolution edge case: Nincada (290) -> Ninjask (291)
        if (Number(p.id) === 290 && Number(toId) === 291) {
            let hasFreeSlot = false;
            if (location === 'party') {
                hasFreeSlot = list.length < 6;
            } else if (location === 'storage' || location === 'safe') {
                hasFreeSlot = mathEngine.getCurrentCount(state, 'box') < mathEngine.getCapacity(state, 'box');
            }

            if (!hasFreeSlot) {
                let locName = location;
                if (location === 'safe') locName = 'safe';
                if (location === 'storage') locName = 'storage';
                if (window.showGameAlert) {
                    window.showGameAlert("Need a free slot in " + locName);
                } else {
                    alert("Need a free slot in " + locName);
                }
                return;
            }
        }

        // Deduct stones
        for (const type of p.types) {
            const stoneName = type + " Stone";
            if (!state.backpack.stones) state.backpack.stones = {};
            state.backpack.stones[stoneName] = (state.backpack.stones[stoneName] || 0) - req.stonesReq;
        }
    }

    const oldName = p.name;
    applyEvolvedBaseStats(p, newBase);

    // Evolving counts as catching for the pokedex
    markEvolvedSpeciesCaught(newBase.name, p.quality >= 2);

    alert(`${oldName} evolved into ${newBase.name}!`);

    // Nincada evolution edge case: create Shedinja (292)
    if (oldPData && Number(oldPData.id) === 290 && Number(newBase.id) === 291) {
        const shedinjaBase = state.config.pokemonMap?.get(292) || state.config.pokemonMap?.get('0292') || state.config.pokemonData?.find(d => Number(d.id) === 292);
        if (shedinjaBase) {
            const shedinja = {
                ...p,
                uuid: crypto.randomUUID(),
                types: [...(shedinjaBase.types || [])],
                ivs: { ...p.ivs },
                ...(p.evs ? { evs: { ...p.evs } } : {}),
                currentStats: { ...p.currentStats },
                vitamins: p.vitamins ? { ...p.vitamins } : {},
                moves: (p.moves || []).map(m => ({ ...m }))
            };
            applyEvolvedBaseStats(shedinja, shedinjaBase);
            markEvolvedSpeciesCaught(shedinjaBase.name, shedinja.quality >= 2);

            list.push(shedinja);
        }
    }

    if (window.closeModal) {
        window.closeModal('window-pokemon-stats');
    } else {
        const overlay = document.getElementById('modal-overlay');
        if (overlay) overlay.style.display = 'none';
    }

    updateUI();

    const bpWin = document.getElementById('window-backpack');
    const bpArea = document.getElementById('backpack-content-area');
    const bpTitle = document.getElementById('backpack-pocket-title');
    if (
        bpWin && bpWin.style.display !== 'none' &&
        bpArea && bpArea.style.display !== 'none' &&
        (bpTitle?.textContent?.trim() === 'Pokémon' || document.getElementById('storage-scroll-container')) &&
        typeof window.renderBackpackTab === 'function'
    ) {
        window.renderBackpackTab('pokemon');
    }

    if (typeof window !== 'undefined' && typeof window.trackDailyChallenge === 'function') window.trackDailyChallenge('evolve_pokemon');
}

window.showVitaminsModal = function(location, idx) {
    const list = state[location];
    if (!list || !list[idx]) return;
    const p = list[idx];

export function showEvolveConfirmModal(location, idx) {
    const list = state[location];
    const p = list ? list[idx] : null;
    if (!p) return;

    const pData = POKEDEX_MAP[p.id];
    if (!pData || !pData.evolutions || pData.evolutions.length === 0) return;

    const evoLineHtml = buildEvolutionLineHtml(pData, state);
    let bodyHtml = '';

    if (pData.evolutions.length === 1) {
        const evo = pData.evolutions[0];
        const req = getEvolveRequirements(p, evo, state);
        bodyHtml = `
            <div style="margin: 15px 0; font-size: 16px; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 4px;">
                Consume ${req.missingStonesHtml}?
            </div>
            <div style="display: flex; justify-content: center; gap: 12px; margin-top: 15px;">
                <button onclick="window.closeModal('window-evolve-confirm'); window.evolvePokemon('${location}', ${idx}, ${evo.to})" style="background: #2ecc71; color: white; border: none; border-radius: 5px; padding: 8px 24px; font-weight: bold; cursor: pointer; font-size: 14px;">Yes</button>
                <button onclick="window.closeModal('window-evolve-confirm')" style="background: #e74c3c; color: white; border: none; border-radius: 5px; padding: 8px 24px; font-weight: bold; cursor: pointer; font-size: 14px;">No</button>
            </div>
        `;
    } else {
        const buttonsHtml = pData.evolutions.map(evo => {
            const req = getEvolveRequirements(p, evo, state);
            return `
                <button ${req.canEvolve ? '' : 'disabled'} onclick="window.closeModal('window-evolve-confirm'); window.evolvePokemon('${location}', ${idx}, ${evo.to})" style="background: ${req.canEvolve ? '#3498db' : '#6c7a7b'}; color: white; border: none; border-radius: 8px; padding: 10px 16px; font-weight: bold; cursor: ${req.canEvolve ? 'pointer' : 'not-allowed'}; opacity: ${req.canEvolve ? '1' : '0.6'}; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 4px; width: 100%;">
                    Consume ${req.missingStonesHtml}?
                </button>
            `;
        }).join('');

        bodyHtml = `
            <div style="display: flex; flex-direction: column; gap: 8px; margin: 15px 0;">
                ${buttonsHtml}
            </div>
            <div style="display: flex; justify-content: center; margin-top: 12px;">
                <button onclick="window.closeModal('window-evolve-confirm')" style="background: #e74c3c; color: white; border: none; border-radius: 5px; padding: 8px 24px; font-weight: bold; cursor: pointer; font-size: 14px;">No</button>
            </div>
        `;
    }

    const html = `
        <div style="text-align: center; color: white;">
            ${evoLineHtml}
            ${bodyHtml}
        </div>
    `;

    showModal(`Evolve ${escapeHTML(p.name)}`, html, "window-evolve-confirm", "500px");
}

window.showEvolveConfirmModal = showEvolveConfirmModal;

    const vitamins = [
        { name: "HP Up", stat: "hp", displayName: "HP Up", shortName: "HP" },
        { name: "Carbo Speed", stat: "spe", displayName: "Carbo", shortName: "Speed" },
        { name: "Protein Atk", stat: "atk", displayName: "Protein", shortName: "Atk" },
        { name: "Calcium SpAtk", stat: "spa", displayName: "Calcium", shortName: "SpAtk" },
        { name: "Iron Def", stat: "def", displayName: "Iron", shortName: "Def" },
        { name: "Zinc SpDef", stat: "spd", displayName: "Zinc", shortName: "SpDef" }
    ];

    if (!p.vitamins) p.vitamins = {};

    let html = `
        <div class="content-panel" style="text-align: center; color: white;">
            <p style="margin-top: 0; font-size: 14px; color: #ccc;">Each vitamin increases its stat by 1% of the final base stat.<br>(Max 20 per stat).</p>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 20px;">
    `;

    for (const v of vitamins) {
        const owned = state.backpack.stones[v.name] || 0;
        const applied = p.vitamins[v.stat] || 0;
        const isMaxed = applied >= 20;
        const canUse = owned > 0 && !isMaxed;

        let btnHtml = '';
        if (isMaxed) {
            btnHtml = `<button disabled style="background: #7f8c8d; cursor: not-allowed; padding: 5px 10px; border: none; border-radius: 4px; color: white; width: 100%;">Maxed</button>`;
        } else {
            btnHtml = `<button ${canUse ? '' : 'disabled'} onclick="window.useVitamin('${location}', ${idx}, '${v.name}', '${v.stat}')" style="${canUse ? 'background: #2ecc71; cursor: pointer;' : 'background: #7f8c8d; cursor: not-allowed;'} padding: 5px 10px; border: none; border-radius: 4px; color: white; width: 100%;">Use Vitamin (Owned: ${owned})</button>`;
        }

        html += `
            <div style="background: rgba(0,0,0,0.4); border: 1px solid #555; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; align-items: center;">
                <img src="./Assets/Items/Vitamins/${v.name}.png" style="width: 40px; height: 40px; margin-bottom: 5px;">
                <div style="font-weight: bold; margin-bottom: 5px;">${v.displayName} (+${applied}% ${v.shortName})</div>
                ${btnHtml}
            </div>
        `;
    }

    html += `
            </div>
        </div>
    `;

    showModal(`Vitamins for ${escapeHTML(p.name)}`, html, "window-vitamins", "500px");
};


window.useVitamin = function(location, idx, vitaminName, statKey) {
    const list = state[location];
    if (!list || !list[idx]) return;
    const p = list[idx];

    if (!p.vitamins) p.vitamins = {};
    if (!state.backpack.stones[vitaminName] || state.backpack.stones[vitaminName] <= 0) return;
    if ((p.vitamins[statKey] || 0) >= 20) return;

    // Consume vitamin
    state.backpack.stones[vitaminName]--;
    p.vitamins[statKey] = (p.vitamins[statKey] || 0) + 1;

    // Recalculate stats
    const pBase = getPokemonConfig(p.id, state);
    if (pBase) {
        if (statKey === 'hp') {
            const oldMax = p.maxHp;
            p.maxHp = mathEngine.calculateHP(pBase.hp, p.ivs.hp, p.level, p.quality, p.vitamins.hp);
            p.currentHp = Math.min(p.maxHp, p.currentHp + (p.maxHp - oldMax)); // Heal by difference
        } else {
            p.currentStats[statKey] = mathEngine.calculateStat(pBase[statKey], p.ivs[statKey], p.level, p.quality, p.vitamins[statKey]);
        }
    }

    updateUI();

    // Refresh modals (Stats first, then Vitamins so Vitamins stays on top)
    showPokemonStats(idx, location);
    window.showVitaminsModal(location, idx);
};
