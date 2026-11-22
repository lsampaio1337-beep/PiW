import {
    TIMED_FORM_DURATION_MS,
    GIGANTAMAX_HP_MULTIPLIER,
    getPokemonConfigById,
    getCanonicalPokemonId,
    isTimedFormActive,
    getTimedFormRemainingMs,
    formatFormCountdown,
    getTimedFormTargetIds,
    getFormStoneRequirements,
    getGigantamaxHpMultiplier,
    applyTimedForm,
    revertTimedForm,
    checkTimedFormTimers,
} from './timedForms.js';

export const GIGANTAMAX_REGIONS = new Set(['Galar']);
export const GIGANTAMAX_DURATION_MS = TIMED_FORM_DURATION_MS;
export { GIGANTAMAX_HP_MULTIPLIER, getGigantamaxHpMultiplier };

export const GIGANTAMAX_EFFECTS = Object.freeze({
    '0003.1': { dotRatio: 0.20, immuneType: 'Grass', description: '+20% extra damage after each hit (not Grass)' },
    '0006.1': { dotRatio: 0.20, immuneType: 'Fire', description: '+20% extra damage after each hit (not Fire)' },
    '0009.1': { dotRatio: 0.20, immuneType: 'Water', description: '+20% extra damage after each hit (not Water)' },
    '0012.1': { stunChance: 0.20, description: '20% chance to stun enemy on hit' },
    '0025.2': { enemyDelayMult: 1.25, description: 'Enemy attacks 25% slower' },
    '0052.3': { moneyMult: 2, damageMult: 1.25, description: '+100% Money drops and +25% damage' },
    '0068.1': { critChance: 0.40, description: '40% Critical Hit chance' },
    '0094.1': { catchBonusPct: 20, description: '+20% Catch Chance' },
    '0099.1': { enemyDelayMult: 1.25, description: 'Enemy attacks 25% slower' },
    '0131.1': { damageTakenMult: 0.75, description: 'Takes 25% less damage' },
    '0133.1': { stunChance: 0.20, description: '20% chance to stun enemy on hit' },
    '0143.1': { healPct: 0.02, damageTakenMult: 0.90, description: 'Heals 2% Max HP per hit, takes 10% less damage' },
    '0569.1': { dotRatio: 0.15, description: '+15% extra damage after each hit' },
    '0809.1': { damageTakenMult: 0.80, description: 'Enemy deals 20% less damage' },
    '0812.1': { damageMult: 1.20, description: '+20% damage' },
    '0815.1': { damageMult: 1.20, description: '+20% damage' },
    '0818.1': { damageMult: 1.20, description: '+20% damage' },
    '0823.1': { defIgnore: 0.25, description: 'Ignores 25% of enemy Defense' },
    '0826.1': { maxRoll: true, damageMult: 1.10, description: 'Always max roll + 10% bonus damage' },
    '0834.1': { openingHpPct: 0.20, description: 'Hits new enemies for 20% Max HP at start' },
    '0839.1': { dotRatio: 0.20, immuneType: 'Rock', description: '+20% extra damage after each hit (not Rock)' },
    '0841.1': { maxRoll: true, damageMult: 1.10, description: 'Always max roll + 10% bonus damage' },
    '0842.1': { healPct: 0.02, damageTakenMult: 0.90, description: 'Heals 2% Max HP per hit, takes 10% less damage' },
    '0844.1': { dotRatio: 0.15, description: '+15% extra damage after each hit' },
    '0849.2': { stunChance: 0.20, description: '20% chance to stun enemy on hit' },
    '0851.1': { dotRatio: 0.15, description: '+15% extra damage after each hit' },
    '0858.1': { stunChance: 0.20, description: '20% chance to stun enemy on hit' },
    '0861.1': { stunChance: 0.20, description: '20% chance to stun enemy on hit' },
    '0869.9': { healPct: 0.03, description: 'Heals 3% Max HP per hit' },
    '0879.1': { openingHpPct: 0.20, description: 'Hits new enemies for 20% Max HP at start' },
    '0884.1': { playerDelayMult: 0.85, damageTakenMult: 0.85, description: 'Attacks 15% faster, takes 15% less damage' },
    '0892.2': { defIgnore: 0.25, description: 'Ignores 25% of enemy Defense' },
    '0892.4': { defIgnore: 0.25, description: 'Ignores 25% of enemy Defense' },
});

export function getGigantamaxEffectForId(id) {
    if (id === undefined || id === null) return null;
    return GIGANTAMAX_EFFECTS[String(id)] || null;
}

export function getGigantamaxEffect(p, now = Date.now()) {
    if (!isPokemonGigantamaxed(p, now)) return null;
    return getGigantamaxEffectForId(p.id);
}

export function getGigantamaxEffectDescription(id) {
    return getGigantamaxEffectForId(id)?.description || '';
}

export function isGigantamaxRegion(regionName) {
    return GIGANTAMAX_REGIONS.has(regionName);
}

export function isPokemonGigantamaxed(p, now = Date.now()) {
    return isTimedFormActive(p, 'gmaxOriginalId', 'gmaxExpiresAt', now);
}

export function getGigantamaxRemainingMs(p, now = Date.now()) {
    return getTimedFormRemainingMs(p, 'gmaxOriginalId', 'gmaxExpiresAt', now);
}

export function formatGigantamaxCountdown(ms) {
    return formatFormCountdown(ms);
}

export function getGigantamaxTargetIdsForPokemon(p, pData, state) {
    return getTimedFormTargetIds(p, pData, state, {
        isAllowedRegion: isGigantamaxRegion,
        originalIdKey: 'gmaxOriginalId',
        targetField: 'gigantamaxForms',
    });
}

export function getGigantamaxStoneRequirements(p, targetData, state) {
    const req = getFormStoneRequirements(p, targetData, state);
    return {
        canGigantamax: req.hasStones,
        ...req,
    };
}

export function applyGigantamaxForm(mon, targetData, now = Date.now()) {
    applyTimedForm(mon, targetData, {
        originalIdKey: 'gmaxOriginalId',
        expiresAtKey: 'gmaxExpiresAt',
        durationMs: GIGANTAMAX_DURATION_MS,
        hpMultiplier: GIGANTAMAX_HP_MULTIPLIER,
        now,
    });
}

export function revertGigantamaxPokemon(mon, state) {
    return revertTimedForm(mon, state, {
        originalIdKey: 'gmaxOriginalId',
        expiresAtKey: 'gmaxExpiresAt',
        hpDivide: GIGANTAMAX_HP_MULTIPLIER,
    });
}

export function checkGigantamaxTimers(state, now = Date.now()) {
    return checkTimedFormTimers(state, {
        originalIdKey: 'gmaxOriginalId',
        expiresAtKey: 'gmaxExpiresAt',
        revertFn: revertGigantamaxPokemon,
        now,
    });
}

export { getPokemonConfigById, getCanonicalPokemonId };
