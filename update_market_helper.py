import re

with open('src/ui/market.js', 'r') as f:
    content = f.read()

# Prepend the helper
helper_str = """
export function getPokemonMarketValue(p, state) {
    let bst = p.bst;
    if (!bst && typeof p.id === 'number' && state.config && state.config.pokemonData) {
        const pd = state.config.pokemonData.find(pd => pd.id === p.id);
        if (pd && pd.stats) bst = pd.stats.hp + pd.stats.atk + pd.stats.def + pd.stats.spa + pd.stats.spd + pd.stats.spe;
    }
    if (!bst) bst = 300;
    let sumIV = p.ivs ? (p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe) : 0;
    return calculatePP(bst, p.level || 1, p.quality || 1, sumIV);
}
window.getPokemonMarketValue = getPokemonMarketValue;

"""

if "export function getPokemonMarketValue" not in content:
    content = helper_str + content

# Replace renderPokeMarketSellTab calculation (line 586-596)
block1 = """            let bst = p.bst;
            if (typeof p.id === 'number' && state.config && state.config.pokemonData) {
                const pd = state.config.pokemonData.find(pd => pd.id === p.id);
                if (pd) {
                    pName = p.name || pd.name;
                    if (!bst && pd.stats) bst = pd.stats.hp + pd.stats.atk + pd.stats.def + pd.stats.spa + pd.stats.spd + pd.stats.spe;
                }
            }
            if (!bst) bst = 300; // Fallback if data is missing
            let sumIV = p.ivs ? (p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe) : 0;
            let pEv = calculatePP(bst, p.level || 1, p.quality || 1, sumIV);"""

repl1 = """            if (typeof p.id === 'number' && state.config && state.config.pokemonData) {
                const pd = state.config.pokemonData.find(pd => pd.id === p.id);
                if (pd) {
                    pName = p.name || pd.name;
                }
            }
            let pEv = getPokemonMarketValue(p, state);"""

content = content.replace(block1, repl1)

# Replace updateMarketPokemonSellCount calculation (line 899-906)
block2 = """                let bst = p.bst;
                if (!bst && typeof p.id === 'number' && state.config && state.config.pokemonData) {
                    const pd = state.config.pokemonData.find(pd => pd.id === p.id);
                    if (pd && pd.stats) bst = pd.stats.hp + pd.stats.atk + pd.stats.def + pd.stats.spa + pd.stats.spd + pd.stats.spe;
                }
                if (!bst) bst = 300;
                let sumIV = p.ivs ? (p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe) : 0;
                let pEv = calculatePP(bst, p.level || 1, p.quality || 1, sumIV);
                totalGain += pEv;"""

repl2 = """                totalGain += getPokemonMarketValue(p, state);"""
content = content.replace(block2, repl2)

# Replace window.marketSellSelectedPokemon calculation (line 924-931)
block3 = """            let bst = p.bst;
            if (!bst && typeof p.id === 'number' && state.config && state.config.pokemonData) {
                const pd = state.config.pokemonData.find(pd => pd.id === p.id);
                if (pd && pd.stats) bst = pd.stats.hp + pd.stats.atk + pd.stats.def + pd.stats.spa + pd.stats.spd + pd.stats.spe;
            }
            if (!bst) bst = 300;
            let sumIV = p.ivs ? (p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe) : 0;
            let pEv = calculatePP(bst, p.level || 1, p.quality || 1, sumIV);
            totalGain += pEv;"""

repl3 = """            totalGain += getPokemonMarketValue(p, state);"""
content = content.replace(block3, repl3)

with open('src/ui/market.js', 'w') as f:
    f.write(content)
