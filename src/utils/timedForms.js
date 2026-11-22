import * as mathEngine from '../mathEngine.js';

export const TIMED_FORM_DURATION_MS = 5 * 60 * 1000;
export const GIGANTAMAX_HP_MULTIPLIER = 2;

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

export function isTimedFormActive(p, originalIdKey, expiresAtKey, now = Date.now()) {
    return Boolean(
        p &&
        p[originalIdKey] !== undefined &&
        p[originalIdKey] !== null &&
        typeof p[expiresAtKey] === 'number' &&
        p[expiresAtKey] > now
    );
}

export function getTimedFormRemainingMs(p, originalIdKey, expiresAtKey, now = Date.now()) {
    if (!isTimedFormActive(p, originalIdKey, expiresAtKey, now)) return 0;
    return Math.max(0, p[expiresAtKey] - now);
}

export function formatFormCountdown(ms) {
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

export function getTimedFormTargetIds(p, pData, state, { isAllowedRegion, originalIdKey, targetField }) {
    if (!state || !isAllowedRegion(state.currentRegionName)) return [];
    const sourceData = (p && p[originalIdKey] !== undefined && p[originalIdKey] !== null)
        ? getPokemonConfigById(p[originalIdKey], state)
        : pData;
    if (!sourceData || !Array.isArray(sourceData[targetField])) return [];
    return sourceData[targetField];
}

export function getFormStoneRequirements(p, targetData, state) {
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
        hasStones,
        stonesReq,
        stoneTypes,
        missingStonesHtml: missingStonesHtml.trim(),
    };
}

export function getGigantamaxHpMultiplier(mon, now = Date.now()) {
    return isTimedFormActive(mon, 'gmaxOriginalId', 'gmaxExpiresAt', now) ? GIGANTAMAX_HP_MULTIPLIER : 1;
}

export function applyPokemonBaseData(mon, baseData, { healToMax = false, hpMultiplier } = {}) {
    mon.id = getCanonicalPokemonId(baseData);
    mon.name = baseData.name;
    mon.types = [...(baseData.types || [])];
    mon.bst = baseData.hp + baseData.atk + baseData.def + baseData.spa + baseData.spd + baseData.spe;

    const effectiveHpMultiplier = typeof hpMultiplier === 'number' ? hpMultiplier : getGigantamaxHpMultiplier(mon);
    const v = mon.vitamins || {};
    const ivs = mon.ivs || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
    const newMaxHp = mathEngine.calculateHP(baseData.hp, ivs.hp, mon.level, mon.quality, v.hp || 0) * effectiveHpMultiplier;
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

export function applyTimedForm(mon, targetData, { originalIdKey, expiresAtKey, durationMs = TIMED_FORM_DURATION_MS, hpMultiplier = 1, now = Date.now() }) {
    if (!mon || !targetData) return;
    const hadPreviousForm = mon[originalIdKey] !== undefined && mon[originalIdKey] !== null;
    if (!hadPreviousForm) {
        mon[originalIdKey] = mon.id;
    }
    const baseTime = (typeof mon[expiresAtKey] === 'number' && mon[expiresAtKey] > now)
        ? mon[expiresAtKey]
        : now;
    mon[expiresAtKey] = baseTime + durationMs;

    const targetId = getCanonicalPokemonId(targetData);
    if (String(mon.id) !== String(targetId) || !hadPreviousForm) {
        applyPokemonBaseData(mon, targetData, { healToMax: false, hpMultiplier });
    }
    if (!hadPreviousForm && hpMultiplier > 1 && typeof mon.currentHp === 'number') {
        mon.currentHp = Math.min(mon.maxHp, Math.round(mon.currentHp * hpMultiplier));
    }
}

export function revertTimedForm(mon, state, { originalIdKey, expiresAtKey, hpDivide = 1 }) {
    if (!mon || mon[originalIdKey] === undefined || mon[originalIdKey] === null) return false;
    const originalBase = getPokemonConfigById(mon[originalIdKey], state);
    if (!originalBase) return false;

    const prevCurrentHp = mon.currentHp;
    delete mon[originalIdKey];
    delete mon[expiresAtKey];
    applyPokemonBaseData(mon, originalBase, { healToMax: false, hpMultiplier: 1 });
    if (hpDivide > 1 && typeof prevCurrentHp === 'number') {
        mon.currentHp = prevCurrentHp <= 0
            ? 0
            : Math.min(mon.maxHp, Math.max(1, Math.floor(prevCurrentHp / hpDivide)));
    }
    return true;
}

export function checkTimedFormTimers(state, { originalIdKey, expiresAtKey, revertFn, now = Date.now() }) {
    const reverted = [];
    if (!state) return reverted;

    const seenRefs = new Set();
    const checkAndRevert = (p, location, idx) => {
        if (!p || seenRefs.has(p)) return;
        seenRefs.add(p);
        if (p[originalIdKey] !== undefined && p[originalIdKey] !== null && typeof p[expiresAtKey] === 'number' && now >= p[expiresAtKey]) {
            if (revertFn(p, state)) {
                reverted.push({ pokemon: p, location, idx });
            }
        }
    };

    const scanList = (list, location) => {
        if (!Array.isArray(list)) return;
        for (let idx = 0; idx < list.length; idx++) {
            checkAndRevert(list[idx], location, idx);
        }
    };

    const locations = ['party', 'storage', 'safe', 'breeding', 'training'];
    for (const loc of locations) {
        scanList(state[loc], loc);
    }

    if (state.dayCareRef) {
        for (const [slotKey, loc] of [['slot1', 'breeding'], ['slot2', 'training']]) {
            checkAndRevert(state.dayCareRef[slotKey]?.pokemon, loc, 0);
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
