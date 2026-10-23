const crypto = { randomUUID: () => Math.random().toString(36).substring(2) };

const state = {
  config: {
    pokemonData: Array.from({ length: 1000 }).map((_, i) => ({
      id: i + 1,
      name: `Pokemon${i+1}`,
      hp: 50, atk: 50, def: 50, spa: 50, spd: 50, spe: 50
    }))
  },
  storage: Array.from({ length: 5000 }).map((_, i) => ({
    id: (i % 1000) + 1,
    level: 10,
    quality: 1,
    qualityName: 'Regular',
    ivs: { hp: 10, atk: 10, def: 10, spa: 10, spd: 10, spe: 10 },
    uuid: crypto.randomUUID()
  }))
};
const calculatePP = () => 10;
const getSpriteUrl = () => '';
const formatMarketNumber = (n) => n.toString();

const filterName = '';
const filterLevelMin = NaN;
const filterLevelMax = NaN;
const filterQMin = NaN;
const filterQMax = NaN;
const filterSumIVMin = NaN;
const filterSumIVMax = NaN;

const start = performance.now();
for (let i = 0; i < 10; i++) {
    let pdMap = null;
    if (state.config && state.config.pokemonData) {
        pdMap = new Map();
        state.config.pokemonData.forEach(pd => pdMap.set(pd.id, pd));
    }

    state.storage.forEach(p => {
        if (!p.uuid) p.uuid = crypto.randomUUID();
        let sumIV = p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe;

        if (p.bst === undefined) {
            if (typeof p.id === 'number' && pdMap) {
                const pd = pdMap.get(p.id);
                if (pd) p.bst = pd.hp + pd.atk + pd.def + pd.spa + pd.spd + pd.spe;
            }
        }
        let pEv = calculatePP(p.bst || 300, p.level, p.quality, sumIV);

        let pName = p.name || p.id;
        if (typeof p.id === 'number' && pdMap) {
            const pd = pdMap.get(p.id);
            if (pd) pName = p.name || pd.name;
        }
    });
}
const end = performance.now();
console.log(`Optimized render loop: ${end - start} ms`);
