import { state } from '../state.js';

export function getSpriteUrl(id, isShiny = false) {
    if (!state || !state.config || (!state.config.pokemonMap && !state.config.pokemonData) || id === undefined || id === null) return '';
    const pData = state.config.pokemonMap
        ? (state.config.pokemonMap.get(Number(id)) || state.config.pokemonMap.get(id))
        : state.config.pokemonData.find(pd => pd.id == id);
    if (!pData) return '';
    const paddedId = id.toString().padStart(4, '0');
    return `Assets/Pokemon Sprites/Natural/Gen5/${paddedId}_${pData.name}${isShiny ? '_shiny' : ''}.png`;
};
