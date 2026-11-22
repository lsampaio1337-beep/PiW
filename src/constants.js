export const WHITE_CANDY_DEFEAT_REQUIREMENT = 100;

export const REGION_ORDER = [
    'Kanto',
    'Johto',
    'Hoenn',
    'Sinnoh',
    'Unova',
    'Kalos',
    'Alola',
    'Galar',
    'Hisui',
    'Paldea',
];

export const STARTING_ROUTES = new Set([
    'Route 1',
    'Route 1 (Kanto)',
    'Route 29',
    'Route 101',
    'Route 201',
    'Aspiration Hill',
    'Route 19',
    'Route 2',
    'Route 1 (Alola)',
    'Postwick',
    'Poco Path - Main',
]);

/**
 * Returns the 1-based region index (Kanto = 1, Johto = 2, ..., Paldea = 10).
 */
export function getRegionNumber(regionName) {
    const idx = REGION_ORDER.indexOf(regionName);
    return idx >= 0 ? idx + 1 : 1;
}

/**
 * Returns the level cap for a region (100 * regionNumber).
 */
export function getRegionLevelCap(regionName) {
    return getRegionNumber(regionName) * 100;
}

/**
 * Returns the region XP multiplier (+100% per region: R1 = 1x, R2 = 2x, ...).
 */
export function getRegionBonusXP(regionName) {
    return getRegionNumber(regionName);
}

/**
 * Linearly scales a base 1-100 level to the target region's level scale.
 */
export function scaleLevelForRegion(level, regionName) {
    return Math.max(1, Math.round(level * getRegionNumber(regionName)));
}

export const VITAMINS = [
    "HP Up",
    "Carbo Speed",
    "Protein Atk",
    "Calcium SpAtk",
    "Iron Def",
    "Zinc SpDef"
];

export const TYPE_COLORS = {
    "Bug": "#aead56",
    "Dark": "#636066",
    "Dragon": "#648abd",
    "Electric": "#ebc74a",
    "Fairy": "#e09bd4",
    "Fighting": "#d98251",
    "Fire": "#da6149",
    "Flying": "#92add3",
    "Ghost": "#8c769f",
    "Grass": "#6da862",
    "Ground": "#b0845f",
    "Ice": "#76c4c5",
    "Normal": "#a69b93",
    "Poison": "#af56a7",
    "Psychic": "#e48194",
    "Rock": "#a7a7a7",
    "Steel": "#869ba7",
    "Water": "#6391c7",
};
