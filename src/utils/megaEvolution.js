import * as mathEngine from '../mathEngine.js';

export const MEGA_EVOLUTION_REGIONS = new Set(['Kalos', 'Alola']);
export const MEGA_EVOLUTION_DURATION_MS = 5 * 60 * 1000;

export function isMegaRegion(regionName) {
    return MEGA_EVOLUTION_REGIONS.has(regionName);
}

export function getPokemonConfigById(id, state) {
    if (!state?.config || id === undefined || id === null) return undefined;
    if (state.config.pokemonMap) {
        return state.config.pokemonMap.get(id) || state.config.pokemonMap.get(String(id)) || state.config.pokemonMap.get(Number(id));
    }
    return state.config.pokemonData?.find(d => d.canonId === id || d.id === id || Number(d.id) === Number(id));
}

export function getCanonicalPokemonId(baseData) {
    if (!baseData) return undefined;
    return (baseData.canonId && baseData.canonId.includes('.')) ? baseData.canonId : baseData.id;
}

export function isPokemonMegaEvolved(p, now = Date.now()) {
    return Boolean(
        p &&
        p.megaOriginalId !== undefined &&
        p.megaOriginalId !== null &&
        typeof p.megaExpiresAt === 'number' &&
        p.megaExpiresAt > now
    );
}

export function getMegaRemainingMs(p, now = Date.now()) {
    if (!isPokemonMegaEvolved(p, now)) return 0;
    return Math.max(0, p.megaExpiresAt - now);
}

export function formatMegaCountdown(ms) {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');
    if (hours > 0) {
        return `${hours}:${mm}:${ss}`;
    }
    return `${mm}:${ss}`;
}

export function getMegaTargetIdsForPokemon(p, pData, state) {
    if (!state || !isMegaRegion(state.currentRegionName)) return [];
    const sourceData = (p && p.megaOriginalId !== undefined && p.megaOriginalId !== null)
        ? getPokemonConfigById(p.megaOriginalId, state)
        : pData;
    if (!sourceData || !Array.isArray(sourceData.megaEvolutions)) return [];
    return sourceData.megaEvolutions;
}

export function getMegaStoneRequirements(p, targetData, state) {
    const stoneTypes = (targetData && Array.isArray(targetData.types) && targetData.types.length > 0)
        ? targetData.types
        : (p?.types || []);
    const stonesReq = stoneTypes.length === 1 ? 2 : 1;

    let hasStones = stoneTypes.length > 0;
    let missingStonesHtml = '';

    for (const type of stoneTypes) {
        const stoneName = type + ' Stone';
        const hasCount = state?.backpack?.stones?.[stoneName] || 0;
        if (hasCount < stonesReq) {
            hasStones = false;
        }
        missingStonesHtml += `${missingStonesHtml ? ' and ' : ''}${stonesReq}<img src="Assets/Items/Stones/${stoneName}.png" style="width: 16px; height: 16px; vertical-align: middle; margin-left: 2px; margin-right: 5px;" title="${stoneName}">`;
    }

    return {
        canMega: hasStones,
        hasStones,
        stonesReq,
        stoneTypes,
        missingStonesHtml: missingStonesHtml.trim(),
    };
}

export function applyPokemonBaseData(mon, baseData, { healToMax = false } = {}) {
    mon.id = getCanonicalPokemonId(baseData);
    mon.name = baseData.name;
    mon.types = [...(baseData.types || [])];
    mon.bst = baseData.hp + baseData.atk + baseData.def + baseData.spa + baseData.spd + baseData.spe;

    const v = mon.vitamins || {};
    const ivs = mon.ivs || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
    const newMaxHp = mathEngine.calculateHP(baseData.hp, ivs.hp, mon.level, mon.quality, v.hp || 0);
    mon.maxHp = newMaxHp;
    if (!mon.currentStats) mon.currentStats = {};
    mon.currentStats.hp = newMaxHp;
    mon.currentStats.atk = mathEngine.calculateStat(baseData.atk, ivs.atk, mon.level, mon.quality, v.atk || 0);
    mon.currentStats.def = mathEngine.calculateStat(baseData.def, ivs.def, mon.level, mon.quality, v.def || 0);
    mon.currentStats.spa = mathEngine.calculateStat(baseData.spa, ivs.spa, mon.level, mon.quality, v.spa || 0);
    mon.currentStats.spd = mathEngine.calculateStat(baseData.spd, ivs.spd, mon.level, mon.quality, v.spd || 0);
    mon.currentStats.spe = mathEngine.calculateStat(baseData.spe, ivs.spe, mon.level, mon.quality, v.spe || 0);

    if (healToMax) {
        mon.currentHp = newMaxHp;
    } else if (typeof mon.currentHp === 'number') {
        mon.currentHp = Math.min(mon.currentHp, newMaxHp);
    }

    const totalIV = ivs.hp + ivs.atk + ivs.def + ivs.spa + ivs.spd + ivs.spe;
    mon.evxp = mathEngine.calculateEVXP(mon.bst, mon.level, mon.quality, totalIV);
    mon.evm = mathEngine.calculateEVM(mon.bst, mon.level, mon.quality, totalIV);
    mon.pp = mathEngine.calculatePP(mon.bst, mon.level, mon.quality, totalIV);
}

export function applyMegaForm(mon, targetData, now = Date.now()) {
    if (!mon || !targetData) return;
    if (mon.megaOriginalId === undefined || mon.megaOriginalId === null) {
        const currentCanonical = mon.id;
        mon.megaOriginalId = currentCanonical;
    }
    const baseTime = (typeof mon.megaExpiresAt === 'number' && mon.megaExpiresAt > now)
        ? mon.megaExpiresAt
        : now;
    mon.megaExpiresAt = baseTime + MEGA_EVOLUTION_DURATION_MS;

    const targetId = getCanonicalPokemonId(targetData);
    if (String(mon.id) !== String(targetId)) {
        applyPokemonBaseData(mon, targetData, { healToMax: false });
    }
}

export function revertMegaPokemon(mon, state) {
    if (!mon || mon.megaOriginalId === undefined || mon.megaOriginalId === null) return false;
    const originalBase = getPokemonConfigById(mon.megaOriginalId, state);
    if (!originalBase) return false;

    applyPokemonBaseData(mon, originalBase, { healToMax: false });
    delete mon.megaOriginalId;
    delete mon.megaExpiresAt;
    return true;
}

export function checkMegaEvolutionTimers(state, now = Date.now()) {
    const reverted = [];
    if (!state) return reverted;

    const seenRefs = new Set();
    const scanList = (list, location) => {
        if (!Array.isArray(list)) return;
        for (let idx = 0; idx < list.length; idx++) {
            const p = list[idx];
            if (!p || seenRefs.has(p)) continue;
            seenRefs.add(p);
            if (p.megaOriginalId !== undefined && p.megaOriginalId !== null && typeof p.megaExpiresAt === 'number' && now >= p.megaExpiresAt) {
                if (revertMegaPokemon(p, state)) {
                    reverted.push({ pokemon: p, location, idx });
                }
            }
        }
    };

    const locations = ['party', 'storage', 'safe', 'breeding', 'training'];
    for (const loc of locations) {
        scanList(state[loc], loc);
    }

    if (state.dayCareRef) {
        for (const [slotKey, loc] of [['slot1', 'breeding'], ['slot2', 'training']]) {
            const p = state.dayCareRef[slotKey]?.pokemon;
            if (p && !seenRefs.has(p)) {
                seenRefs.add(p);
                if (p.megaOriginalId !== undefined && p.megaOriginalId !== null && typeof p.megaExpiresAt === 'number' && now >= p.megaExpiresAt) {
                    if (revertMegaPokemon(p, state)) {
                        reverted.push({ pokemon: p, location: loc, idx: 0 });
                    }
                }
            }
        }
    }

    if (state.regions && typeof state.regions === 'object') {
        for (const [regName, regData] of Object.entries(state.regions)) {
            if (!regData || regName === state.currentRegionName) continue;
            for (const loc of locations) {
                scanList(regData[loc], `${regName}:${loc}`);
            }
        }
    }

    return reverted;
}
