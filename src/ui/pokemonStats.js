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
    const toData = getPokemonConfig(evo.to, state);
    const stoneTypes = (toData && toData.types && toData.types.length > 0) ? toData.types : p.types;
    const baseStones = Math.ceil(p.level * 0.2);
    const stonesReq = stoneTypes.length === 1 ? baseStones : Math.ceil(baseStones / 2);

    let hasStones = true;
    let missingStonesHtml = "";

    for (const type of stoneTypes) {
        const stoneName = type + " Stone";
        const hasCount = state.backpack?.stones?.[stoneName] || 0;
        if (hasCount < stonesReq) {
            hasStones = false;
        }
        missingStonesHtml += `${missingStonesHtml ? ' and ' : ''}${stonesReq}<img src="Assets/Items/Stones/${stoneName}.png" style="width: 16px; height: 16px; vertical-align: middle; margin-left: 2px; margin-right: 5px;" title="${stoneName}">`;
    }

    const hasLevel = p.level >= requiredLevel;

    return {
        canEvolve: hasLevel && hasStones,
        hasLevel,
        hasStones,
        requiredLevel,
        stonesReq,
        stoneTypes,
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

function isPokemonInRegion(pd, state) {
    if (!pd) return false;
    const regionName = state.currentRegionName || 'Kanto';
    const regionIdField = regionName.toLowerCase() + '_id';
    return pd[regionIdField] !== undefined;
}

function getActionsHtml(p, pData, location, idx) {
    const btnBaseStyle = 'border: 1px solid rgba(255,255,255,0.2); border-radius: 10px; padding: 8px 18px; font-weight: bold; font-size: 13px; line-height: 1.25; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; flex-direction: column; text-align: center; min-width: 200px; min-height: 46px; box-sizing: border-box; box-shadow: 0 2px 6px rgba(0,0,0,0.35);';
    const activeBg = 'linear-gradient(135deg, #3498db, #2980b9)';
    const disabledBg = 'linear-gradient(135deg, #6c7a89, #596573)';
    let evolveHtml = "";
    if (!pData) return;
    const validEvolutions = (pData.evolutions || []).filter(evo => isPokemonInRegion(getPokemonConfig(evo.to, state), state));
    if (validEvolutions.length > 1) {
        const canAnyEvolve = validEvolutions.some(evo => getEvolveRequirements(p, evo, state).canEvolve);
        evolveHtml = `
            <div>
                <button ${canAnyEvolve ? '' : 'disabled'} onclick="window.showMultipleEvolveModal('${location}', ${idx})" style="${btnBaseStyle} background: ${canAnyEvolve ? activeBg : disabledBg}; color: white; cursor: ${canAnyEvolve ? 'pointer' : 'not-allowed'}; ${canAnyEvolve ? '' : 'opacity: 0.65;'}">Multiple Evolutions</button>
            </div>
        `;
    } else if (validEvolutions.length === 1) {
        const evo = validEvolutions[0];
        const req = getEvolveRequirements(p, evo, state);

        let btnText = "Evolve";
        if (!req.canEvolve) {
            if (!req.hasLevel && !req.hasStones) {
                btnText = `<span style="line-height:1.2;">Need Lv. ${req.requiredLevel}</span><span style="line-height:1.2; display:flex; align-items:center;">Need ${req.missingStonesHtml} to evolve</span>`;
            } else if (!req.hasLevel) {
                btnText = `Need Lv. ${req.requiredLevel} to evolve`;
            } else if (!req.hasStones) {
                btnText = `<span style="display:flex; align-items:center;">Need ${req.missingStonesHtml} to evolve</span>`;
            }
        }

        evolveHtml = `
            <div>
                <button ${req.canEvolve ? '' : 'disabled'} onclick="window.showEvolveConfirmModal('${location}', ${idx}, ${evo.to})" style="${btnBaseStyle} background: ${req.canEvolve ? activeBg : disabledBg}; color: white; cursor: ${req.canEvolve ? 'pointer' : 'not-allowed'}; ${req.canEvolve ? '' : 'opacity: 0.65;'}">${btnText}</button>
            </div>
        `;
    }

    return `<div style="margin-top: 14px; border-top: 1px solid rgba(255,255,255,0.15); padding: 14px 0 4px 0; display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 12px;">
        ${evolveHtml}
        <div>
            <button onclick="window.showVitaminsModal('${location}', ${idx})" style="${btnBaseStyle} background: ${activeBg}; color: white; cursor: pointer;">Consume Vitamins</button>
        </div>
    </div>`;
}

function getVitHtml(count, imgName) {
    if (!count || count <= 0) return '';
    return ` <span style="font-size: 12px; margin-left: 2px;">${count}x<img src="Assets/Items/Vitamins/${imgName}.png" style="width: 12px; height: 12px; vertical-align: middle;"></span>`;
}

function getActualStatsHtml(p) {
    const v = p.vitamins || {};
    const statItem = (label, val, vitHtml) => `
        <div style="background: rgba(255,255,255,0.06); padding: 7px 8px; border-radius: 6px; text-align: center;">
            <div style="font-size: 11px; color: #bbb; margin-bottom: 2px;">${label}</div>
            <div style="font-size: 15px; font-weight: bold;">${val}${vitHtml}</div>
        </div>
    `;
    return `
        <div style="background: rgba(0,0,0,0.45); padding: 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); text-align: left; min-width: 150px; flex: 1; display: flex; flex-direction: column;">
            <h3 style="margin: 0 0 12px 0; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 6px;">Actual Stats</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; flex: 1; align-content: center;">
                ${statItem('HP', p.maxHp, getVitHtml(v.hp, 'HP Up'))}
                ${statItem('Speed', p.currentStats ? p.currentStats.spe : '?', getVitHtml(v.spe, 'Carbo Speed'))}
                ${statItem('Atk', p.currentStats ? p.currentStats.atk : '?', getVitHtml(v.atk, 'Protein Atk'))}
                ${statItem('SpAtk', p.currentStats ? p.currentStats.spa : '?', getVitHtml(v.spa, 'Calcium SpAtk'))}
                ${statItem('Def', p.currentStats ? p.currentStats.def : '?', getVitHtml(v.def, 'Iron Def'))}
                ${statItem('SpDef', p.currentStats ? p.currentStats.spd : '?', getVitHtml(v.spd, 'Zinc SpDef'))}
            </div>
        </div>
    `;
}

function getBasicInfoHtml(p, sumIV) {
    return `
        <div style="background: rgba(0,0,0,0.45); padding: 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); text-align: center; flex: 1; font-size: 14px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <img src="${window.getSpriteUrl(p.id, p.qualityName === 'Shiny')}" style="width: 100px; height: 100px;"><br>
            <p style="margin: 5px 0;"><b>Type:</b> ${p.types.map(t => formatType(t)).join(' ')}</p>
            <b>Quality:</b> ${p.qualityName} (Q=${p.quality.toFixed(2)})<br>
            <b>Sum IVs:</b> ${sumIV}<br>
        </div>
    `;
}

function getIvDistributionHtml(p) {
    const ivBar = (label, val) => `
        <div style="background: rgba(255,255,255,0.06); padding: 6px 8px; border-radius: 6px; text-align: center;">
            <div style="font-size: 11px; color: #bbb; margin-bottom: 4px;">${label}</div>
            <div style="background: rgba(0,0,0,0.45); width: 100%; height: 16px; border-radius: 8px; overflow: hidden; position: relative;">
                <div style="background: #3498db; width: ${val}%; height: 100%;"></div>
                <div style="position: absolute; top: 0; left: 0; width: 100%; text-align: center; font-size: 11px; line-height: 16px; font-weight: bold; color: white; text-shadow: 1px 1px 1px black;">${val}</div>
            </div>
        </div>
    `;
    return `
        <div style="background: rgba(0,0,0,0.45); padding: 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); text-align: left; min-width: 200px; flex: 1; display: flex; flex-direction: column;">
            <h3 style="margin: 0 0 12px 0; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 6px;">IV Distribution</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; flex: 1; align-content: center;">
                ${ivBar('HP', p.ivs.hp)}
                ${ivBar('Speed', p.ivs.spe)}
                ${ivBar('Atk', p.ivs.atk)}
                ${ivBar('SpAtk', p.ivs.spa)}
                ${ivBar('Def', p.ivs.def)}
                ${ivBar('SpDef', p.ivs.spd)}
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
        <div style="margin-top: 16px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 14px;">
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
        <div style="position: relative; width: 100%; height: 100%;">
            <div class="content-panel" style="padding: 15px; box-sizing: border-box;">
                ${individualHtml}
                ${collectiveHtml}
            </div>
            <div id="pokemon-vitamins-inner-overlay" onclick="if(event.target === this) window.closeVitaminsInnerWindow()" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.75); z-index: 10; align-items: center; justify-content: center;">
                <div id="pokemon-vitamins-inner-window" onclick="event.stopPropagation()" class="floating-window" style="position: relative; width: 500px; max-width: 95%; height: auto; max-height: 90%; flex-direction: column; display: none; overflow: hidden;">
                    <div class="window-header" style="position: relative; cursor: default;">
                        <span id="pokemon-vitamins-inner-title">Vitamins</span>
                        <span onclick="window.closeVitaminsInnerWindow()" style="position: absolute; top: 5px; right: 5px; font-size: 12px; font-weight: bold; line-height: 1; padding: 0; cursor: pointer; color: white;">X</span>
                    </div>
                    <div class="window-content-container" style="flex: 1; overflow-y: auto;">
                        <div id="pokemon-vitamins-inner-content" style="padding: 15px; box-sizing: border-box; width: 100%;"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    showModal(`${escapeHTML(p.name)} (Lv. ${p.level})`, html, "window-pokemon-stats");
    const statsWin = document.getElementById('window-pokemon-stats');
    if (statsWin) {
        const innerContent = statsWin.querySelector('.window-content-container');
        if (innerContent) {
            innerContent.style.setProperty('padding', '0px', 'important');
        }
    }
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
        for (const type of req.stoneTypes) {
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

window.closeVitaminsInnerWindow = function() {
    const overlay = document.getElementById('pokemon-vitamins-inner-overlay');
    if (overlay) overlay.style.display = 'none';
    const innerWin = document.getElementById('pokemon-vitamins-inner-window');
    if (innerWin) innerWin.style.display = 'none';
};

window.showMultipleEvolveModal = function(location, idx) {
    const list = state[location];
    if (!list || !list[idx]) return;
    const p = list[idx];
    const pData = getPokemonConfig(p.id, state);
    if (!pData) return;
    const validEvolutions = (pData.evolutions || []).filter(evo => isPokemonInRegion(getPokemonConfig(evo.to, state), state));
    if (validEvolutions.length === 0) return;

    const isShiny = !!(p.isShiny || p.quality === 'Shiny');
    const fromImgPath = window.getSpriteUrl(p.id, isShiny);

    const cardsHtml = validEvolutions.map(evo => {
        const req = getEvolveRequirements(p, evo, state);
        const toData = getPokemonConfig(evo.to, state);
        const isRevealed = toData && ((state.stats?.seenSpecies?.[toData.name]) || (state.stats?.caughtSpecies?.[toData.name]));
        const toName = isRevealed ? escapeHTML(toData.name) : "???";
        const toImgPath = window.getSpriteUrl(evo.to, isShiny);
        const btnBg = req.canEvolve ? 'linear-gradient(180deg, #2ecc71, #27ae60)' : '#7f8c8d';
        const btnShadow = req.canEvolve ? 'box-shadow: 0 3px 8px rgba(46, 204, 113, 0.3);' : 'opacity: 0.6;';
        return `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 10px; background: linear-gradient(145deg, rgba(20, 30, 48, 0.9), rgba(36, 59, 85, 0.7)); border: 1px solid #3498db; box-shadow: 0 4px 15px rgba(52, 152, 219, 0.25); padding: 12px 16px; border-radius: 10px; width: fit-content;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 14px;">
                    <div style="display: flex; flex-direction: column; align-items: center;">
                        <div style="background: rgba(255, 255, 255, 0.06); border-radius: 50%; padding: 5px; display: flex; align-items: center; justify-content: center;">
                            <img src="${fromImgPath}" style="width: 48px; height: 48px; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">
                        </div>
                        <span style="font-size: 11px; font-weight: 600; color: #ecf0f1; margin-top: 4px;">${escapeHTML(p.name)}</span>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
                        <span style="background: rgba(52, 152, 219, 0.2); border: 1px solid rgba(52, 152, 219, 0.5); border-radius: 12px; padding: 2px 8px; font-size: 11px; font-weight: bold; color: #74b9ff;">Lv.${evo.level}</span>
                        <span style="font-size: 15px; color: #3498db; line-height: 1;">➔</span>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: center;">
                        <div style="background: rgba(255, 255, 255, 0.06); border-radius: 50%; padding: 5px; display: flex; align-items: center; justify-content: center;">
                            <img src="${toImgPath}" style="width: 48px; height: 48px; object-fit: contain; filter: ${isRevealed ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' : 'brightness(0)'};">
                        </div>
                        <span style="font-size: 11px; font-weight: 600; color: ${isRevealed ? '#ecf0f1' : '#95a5a6'}; margin-top: 4px;">${toName}</span>
                    </div>
                </div>
                <button ${req.canEvolve ? '' : 'disabled'} onclick="window.closeVitaminsInnerWindow(); window.evolvePokemon('${location}', ${idx}, ${evo.to})" style="background: ${btnBg}; color: white; border: none; border-radius: 8px; padding: 7px 16px; font-weight: bold; font-size: 13px; cursor: ${req.canEvolve ? 'pointer' : 'not-allowed'}; ${btnShadow} width: 100%; display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 4px;">Consume ${req.missingStonesHtml}</button>
            </div>
        `;
    }).join('');

    const html = `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 6px 10px 10px 10px;">
            ${cardsHtml}
            <button onclick="window.closeVitaminsInnerWindow()" style="background: linear-gradient(180deg, #e74c3c, #c0392b); color: white; border: none; border-radius: 8px; padding: 9px 28px; font-weight: bold; font-size: 14px; cursor: pointer; box-shadow: 0 3px 8px rgba(231, 76, 60, 0.3);">No</button>
        </div>
    `;
    const overlay = document.getElementById('pokemon-vitamins-inner-overlay');
    const innerWin = document.getElementById('pokemon-vitamins-inner-window');
    const innerTitle = document.getElementById('pokemon-vitamins-inner-title');
    const innerContent = document.getElementById('pokemon-vitamins-inner-content');
    if (innerWin && innerTitle && innerContent) {
        innerTitle.textContent = `Evolve ${p.name}`;
        innerContent.innerHTML = html;
        if (overlay) overlay.style.display = 'flex';
        innerWin.style.display = 'flex';
    }
};

window.showEvolveConfirmModal = function(location, idx, toId) {
    const list = state[location];
    if (!list || !list[idx]) return;
    const p = list[idx];
    const pData = getPokemonConfig(p.id, state);
    if (!pData || !pData.evolutions) return;
    const evo = pData.evolutions.find(e => e.to === toId);
    if (!evo) return;
    const req = getEvolveRequirements(p, evo, state);
    const toData = getPokemonConfig(toId, state);
    const isRevealed = toData && ((state.stats?.seenSpecies?.[toData.name]) || (state.stats?.caughtSpecies?.[toData.name]));
    const toName = isRevealed ? escapeHTML(toData.name) : "???";
    const isShiny = !!(p.isShiny || p.quality === 'Shiny');
    const fromImgPath = window.getSpriteUrl(p.id, isShiny);
    const toImgPath = window.getSpriteUrl(toId, isShiny);
    const filterStyle = isRevealed ? '' : 'filter: brightness(0);';

    const btnBg = req.canEvolve ? 'linear-gradient(180deg, #2ecc71, #27ae60)' : '#7f8c8d';
    const btnShadow = req.canEvolve ? 'box-shadow: 0 3px 8px rgba(46, 204, 113, 0.3);' : 'opacity: 0.6;';

    const html = `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 6px 10px 10px 10px;">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 10px; background: linear-gradient(145deg, rgba(20, 30, 48, 0.9), rgba(36, 59, 85, 0.7)); border: 1px solid #3498db; box-shadow: 0 4px 15px rgba(52, 152, 219, 0.25); padding: 12px 16px; border-radius: 10px; width: fit-content;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 14px;">
                    <div style="display: flex; flex-direction: column; align-items: center;">
                        <div style="background: rgba(255, 255, 255, 0.06); border-radius: 50%; padding: 5px; display: flex; align-items: center; justify-content: center;">
                            <img src="${fromImgPath}" style="width: 48px; height: 48px; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">
                        </div>
                        <span style="font-size: 11px; font-weight: 600; color: #ecf0f1; margin-top: 4px;">${escapeHTML(p.name)}</span>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
                        <span style="background: rgba(52, 152, 219, 0.2); border: 1px solid rgba(52, 152, 219, 0.5); border-radius: 12px; padding: 2px 8px; font-size: 11px; font-weight: bold; color: #74b9ff;">Lv.${evo.level}</span>
                        <span style="font-size: 15px; color: #3498db; line-height: 1;">➔</span>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: center;">
                        <div style="background: rgba(255, 255, 255, 0.06); border-radius: 50%; padding: 5px; display: flex; align-items: center; justify-content: center;">
                            <img src="${toImgPath}" style="width: 48px; height: 48px; object-fit: contain; filter: ${isRevealed ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' : 'brightness(0)'};">
                        </div>
                        <span style="font-size: 11px; font-weight: 600; color: ${isRevealed ? '#ecf0f1' : '#95a5a6'}; margin-top: 4px;">${toName}</span>
                    </div>
                </div>
                <button ${req.canEvolve ? '' : 'disabled'} onclick="window.closeVitaminsInnerWindow(); window.evolvePokemon('${location}', ${idx}, ${toId})" style="background: ${btnBg}; color: white; border: none; border-radius: 8px; padding: 7px 16px; font-weight: bold; font-size: 13px; cursor: ${req.canEvolve ? 'pointer' : 'not-allowed'}; ${btnShadow} width: 100%; display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 4px;">Consume ${req.missingStonesHtml}</button>
            </div>
            <button onclick="window.closeVitaminsInnerWindow()" style="background: linear-gradient(180deg, #e74c3c, #c0392b); color: white; border: none; border-radius: 8px; padding: 9px 28px; font-weight: bold; font-size: 14px; cursor: pointer; box-shadow: 0 3px 8px rgba(231, 76, 60, 0.3);">No</button>
        </div>
    `;

    const overlay = document.getElementById('pokemon-vitamins-inner-overlay');
    const innerWin = document.getElementById('pokemon-vitamins-inner-window');
    const innerTitle = document.getElementById('pokemon-vitamins-inner-title');
    const innerContent = document.getElementById('pokemon-vitamins-inner-content');
    if (innerWin && innerTitle && innerContent) {
        innerTitle.textContent = `Evolve ${p.name}`;
        innerContent.innerHTML = html;
        if (overlay) overlay.style.display = 'flex';
        innerWin.style.display = 'flex';
    }
};

window.showVitaminsModal = function(location, idx) {
    const list = state[location];
    if (!list || !list[idx]) return;
    const p = list[idx];

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
            btnHtml = `<button ${canUse ? '' : 'disabled'} onclick="window.useVitamin('${location}', ${idx}, '${v.name}', '${v.stat}')" style="${canUse ? 'background: #3498db; cursor: pointer;' : 'background: #7f8c8d; cursor: not-allowed;'} padding: 5px 10px; border: none; border-radius: 4px; color: white; width: 100%;">Use Vitamin (Owned: ${owned})</button>`;
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

    const overlay = document.getElementById('pokemon-vitamins-inner-overlay');
    const innerWin = document.getElementById('pokemon-vitamins-inner-window');
    const innerTitle = document.getElementById('pokemon-vitamins-inner-title');
    const innerContent = document.getElementById('pokemon-vitamins-inner-content');
    if (innerWin && innerTitle && innerContent) {
        innerTitle.textContent = `Vitamins for ${p.name}`;
        innerContent.innerHTML = html;
        if (overlay) overlay.style.display = 'flex';
        innerWin.style.display = 'flex';
    } else {
        showModal(`Vitamins for ${escapeHTML(p.name)}`, html, "window-vitamins", "500px");
    }
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
