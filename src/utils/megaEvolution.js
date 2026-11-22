import {
    TIMED_FORM_DURATION_MS,
    getPokemonConfigById,
    getCanonicalPokemonId,
    isTimedFormActive,
    getTimedFormRemainingMs,
    formatFormCountdown,
    getTimedFormTargetIds,
    getFormStoneRequirements,
    applyPokemonBaseData,
    applyTimedForm,
    revertTimedForm,
    checkTimedFormTimers,
} from './timedForms.js';

export const MEGA_EVOLUTION_REGIONS = new Set(['Kalos', 'Alola']);
export const MEGA_EVOLUTION_DURATION_MS = TIMED_FORM_DURATION_MS;

export { getPokemonConfigById, getCanonicalPokemonId, applyPokemonBaseData };

export function isMegaRegion(regionName) {
    return MEGA_EVOLUTION_REGIONS.has(regionName);
}

export function isPokemonMegaEvolved(p, now = Date.now()) {
    return isTimedFormActive(p, 'megaOriginalId', 'megaExpiresAt', now);
}

export function getMegaRemainingMs(p, now = Date.now()) {
    return getTimedFormRemainingMs(p, 'megaOriginalId', 'megaExpiresAt', now);
}

export function formatMegaCountdown(ms) {
    return formatFormCountdown(ms);
}

export function getMegaTargetIdsForPokemon(p, pData, state) {
    return getTimedFormTargetIds(p, pData, state, {
        isAllowedRegion: isMegaRegion,
        originalIdKey: 'megaOriginalId',
        targetField: 'megaEvolutions',
    });
}

export function getMegaStoneRequirements(p, targetData, state) {
    const req = getFormStoneRequirements(p, targetData, state);
    return {
        canMega: req.hasStones,
        ...req,
    };
}

export function applyMegaForm(mon, targetData, now = Date.now()) {
    applyTimedForm(mon, targetData, {
        originalIdKey: 'megaOriginalId',
        expiresAtKey: 'megaExpiresAt',
        durationMs: MEGA_EVOLUTION_DURATION_MS,
        hpMultiplier: 1,
        now,
    });
}

export function revertMegaPokemon(mon, state) {
    return revertTimedForm(mon, state, {
        originalIdKey: 'megaOriginalId',
        expiresAtKey: 'megaExpiresAt',
        hpDivide: 1,
    });
}

export function checkMegaEvolutionTimers(state, now = Date.now()) {
    return checkTimedFormTimers(state, {
        originalIdKey: 'megaOriginalId',
        expiresAtKey: 'megaExpiresAt',
        revertFn: revertMegaPokemon,
        now,
    });
}
