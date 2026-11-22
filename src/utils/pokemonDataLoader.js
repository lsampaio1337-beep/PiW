const REGION_TO_MOVESET_KEY = {
    Kanto: 'Reg2',
    Johto: 'Reg2',
    Hoenn: 'Reg3',
    Sinnoh: 'Reg4',
    Unova: 'Reg5',
    Kalos: 'Reg6',
    Alola: 'Reg7',
    Galar: 'Reg8',
    Hisui: 'Reg9',
    Paldea: 'Reg10',
};

const MOVESET_FALLBACK_ORDER = ['Reg2', 'Reg3', 'Reg4', 'Reg5', 'Reg6', 'Reg7', 'Reg8', 'Reg9', 'Reg10', '9'];

/**
 * Convert a raw moveset tuple array `[[level, moveName], ...]` into `{ level, move }` entries,
 * filtering out non-damaging moves absent from `movesMap`.
 */
function buildLearnsetArray(rawTuples, movesMap) {
    if (!Array.isArray(rawTuples)) return [];
    const seen = new Set();
    const out = [];
    for (let i = 0; i < rawTuples.length; i++) {
        const [rawLvl, moveName] = rawTuples[i];
        if (!movesMap[moveName]) continue;
        const level = typeof rawLvl === 'number' ? rawLvl : (parseInt(rawLvl, 10) || 1);
        const key = `${level}|${moveName}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ level, move: moveName });
    }
    out.sort((a, b) => a.level - b.level);
    return out;
}

/**
 * Pick the default learnset for a Pokémon entry from its regional movesets.
 */
function pickDefaultLearnset(movesetObj, movesMap) {
    if (!movesetObj) return [];
    for (const regKey of MOVESET_FALLBACK_ORDER) {
        if (movesetObj[regKey] && movesetObj[regKey].length > 0) {
            const arr = buildLearnsetArray(movesetObj[regKey], movesMap);
            if (arr.length > 0) return arr;
        }
    }
    for (const arrRaw of Object.values(movesetObj)) {
        const arr = buildLearnsetArray(arrRaw, movesMap);
        if (arr.length > 0) return arr;
    }
    return [];
}

/**
 * Resolve the learnset for a specific region name (falling back to `pokemonBase.learnset`).
 */
export function getLearnsetForRegion(pokemonBase, regionName, movesMap) {
    if (!pokemonBase) return [];
    const movesetObj = pokemonBase._moveset;
    if (!movesetObj) return pokemonBase.learnset || [];
    const regKey = REGION_TO_MOVESET_KEY[regionName];
    if (regKey && movesetObj[regKey] && movesetObj[regKey].length > 0) {
        const arr = buildLearnsetArray(movesetObj[regKey], movesMap);
        if (arr.length > 0) return arr;
    }
    return pokemonBase.learnset || [];
}

/**
 * Hydrate normalized `pokemon_info.json` (`{ folders, moves, pokemon }`) into the
 * runtime `pokemonData`, `pokemonMap`, and `moves` structures expected by the game.
 */
export function hydratePokemonInfo(pokemonInfo, existingMoves = {}, pokedexIndexes = null) {
    const mergedMoves = { ...existingMoves };
    if (pokemonInfo && pokemonInfo.moves) {
        for (const [moveName, m] of Object.entries(pokemonInfo.moves)) {
            if (!mergedMoves[moveName] && (m.cat === 'Physical' || m.cat === 'Special')) {
                mergedMoves[moveName] = {
                    power: m.power,
                    type: m.type,
                    category: m.cat,
                };
            }
        }
    }

    // Build regional dex lookup: integerId -> { kanto_id: 1, ... }
    const regionalFieldsById = new Map();
    if (pokedexIndexes && pokedexIndexes.regional) {
        for (const [regName, idList] of Object.entries(pokedexIndexes.regional)) {
            const fieldName = `${regName}_id`;
            for (let idx = 0; idx < idList.length; idx++) {
                const natId = idList[idx];
                let obj = regionalFieldsById.get(natId);
                if (!obj) {
                    obj = {};
                    regionalFieldsById.set(natId, obj);
                }
                obj[fieldName] = idx + 1;
            }
        }
    }

    const pokemonData = [];
    const pokemonMap = new Map();
    const rawPokemon = (pokemonInfo && pokemonInfo.pokemon) || {};

    for (const [canonId, raw] of Object.entries(rawPokemon)) {
        const isVariation = canonId.includes('.');
        const baseIdStr = isVariation ? canonId.split('.')[0] : canonId;
        const baseRaw = isVariation ? rawPokemon[baseIdStr] : null;

        const types = raw.types ?? baseRaw?.types ?? ['Normal'];
        const stats = raw.stats ?? baseRaw?.stats ?? [0, 0, 0, 0, 0, 0, 0];
        const movesetObj = raw.moveset ?? baseRaw?.moveset ?? {};
        const evolutions = raw.evolutions ?? [];
        const megaEvolutions = raw.megaEvolutions ?? [];

        const numId = isVariation ? Number(canonId) : parseInt(canonId, 10);
        const record = {
            id: numId,
            canonId,
            name: raw.name,
            types,
            hp: stats[0],
            atk: stats[1],
            def: stats[2],
            spa: stats[3],
            spd: stats[4],
            spe: stats[5],
            evolutions,
            megaEvolutions,
            learnset: pickDefaultLearnset(movesetObj, mergedMoves),
            _moveset: movesetObj,
            _sprite: raw.sprite ?? null,
            _folders: raw.folders ?? [],
        };

        if (!isVariation) {
            const regFields = regionalFieldsById.get(numId);
            if (regFields) {
                Object.assign(record, regFields);
            }
        }

        pokemonData.push(record);
        // Key by canonical string ID first (prevents .10 vs .1 float collision), and by numeric ID if unclaimed
        pokemonMap.set(canonId, record);
        if (!pokemonMap.has(numId)) {
            pokemonMap.set(numId, record);
        }
    }

    return { pokemonData, pokemonMap, moves: mergedMoves };
}
