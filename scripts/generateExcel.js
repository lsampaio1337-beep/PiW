const fs = require('fs');
const xlsx = require('xlsx');

function loadESModuleAsCJS(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    content = content.replace(/export const /g, 'exports.');
    content = content.replace(/export default /g, 'module.exports = ');

    const m = { exports: {} };
    const func = new Function('exports', 'module', content);
    func(m.exports, m);
    return m.exports;
}

const pokemonDataRaw = JSON.parse(fs.readFileSync('data/pokemon.json', 'utf-8'));
const pokedexIndexesRaw = loadESModuleAsCJS('config/pokedexIndexes.js');
const pokedexIndexes = pokedexIndexesRaw.pokedexIndexes;

const regions = [
    { num: 3, name: 'Hoenn', routeFile: 'config/hoennRoutes.js', coordFile: 'config/hoennMapCoordinates.js', indexName: 'hoenn', unlockNames: 'hoennUnlocks', routesName: 'hoennRoutes', coordName: 'hoennMapCoordinates' },
    { num: 4, name: 'Sinnoh', routeFile: 'config/sinnohRoutes.js', coordFile: 'config/sinnohMapCoordinates.js', indexName: 'sinnoh', unlockNames: 'sinnohUnlocks', routesName: 'sinnohRoutes', coordName: 'sinnohMapCoordinates' },
    { num: 5, name: 'Unova', routeFile: 'config/unovaRoutes.js', coordFile: 'config/unovaMapCoordinates.js', indexName: 'unova', unlockNames: 'unovaUnlocks', routesName: 'unovaRoutes', coordName: 'unovaMapCoordinates' }
];

function getPokemonStats(id) {
    return pokemonDataRaw.find(p => p.id === id);
}

function getBST(stats) {
    if (!stats) return 0;
    return (stats.hp || 0) + (stats.atk || 0) + (stats.def || 0) + (stats.spa || 0) + (stats.spd || 0) + (stats.spe || 0);
}

for (const region of regions) {
    const routeConfig = loadESModuleAsCJS(region.routeFile);
    const mapConfig = loadESModuleAsCJS(region.coordFile);

    const routes = routeConfig[region.routesName] || routeConfig.routes || [];
    let unlocksArray = routeConfig[region.unlockNames] || routeConfig.unlocks || [];

    if (!Array.isArray(unlocksArray)) {
        const temp = [];
        for (const [key, value] of Object.entries(unlocksArray)) {
            temp.push({ challengeName: key, ...value });
        }
        unlocksArray = temp;
    }

    const coordinates = mapConfig[region.coordName] || mapConfig.coordinates || mapConfig || {};
    const pokedex = pokedexIndexes[region.indexName] || [];

    const unlockedBy = {};
    const willUnlockMap = {};
    const challengeDetails = {};

    let mainChallengesCount = 0;
    for (const unlock of unlocksArray) {
        if (unlock.challengeName.startsWith("Challenge ")) mainChallengesCount++;

        challengeDetails[unlock.challengeName] = {
            req: unlock.requirements,
            rewardMap: unlock.unlockedArea,
            rewardGift: unlock.reward
        };

        if (unlock.unlockedArea) {
            unlockedBy[unlock.unlockedArea] = unlock.challengeName;
        }

        if (unlock.requirements && unlock.requirements.completeChallenges) {
            for (const prev of unlock.requirements.completeChallenges) {
                if (!willUnlockMap[prev]) willUnlockMap[prev] = [];
                willUnlockMap[prev].push(unlock.challengeName);
            }
        }
    }

    const challengeOrder = unlocksArray.map(u => u.challengeName).sort((a, b) => {
        const isMainA = a.startsWith('Challenge');
        const isMainB = b.startsWith('Challenge');
        if (isMainA && !isMainB) return -1;
        if (!isMainA && isMainB) return 1;
        return a.localeCompare(b, undefined, {numeric: true});
    });

    const encounteredPokemon = new Set();
    const routeToFirstMap = {};

    const challengeToRoutes = {};
    for (const unlock of unlocksArray) {
        if (unlock.unlockedArea) {
            if (!challengeToRoutes[unlock.challengeName]) challengeToRoutes[unlock.challengeName] = [];
            challengeToRoutes[unlock.challengeName].push(unlock.unlockedArea);
        }
    }

    for (const challengeName of challengeOrder) {
        const routesUnlocked = challengeToRoutes[challengeName] || [];
        for (const routeName of routesUnlocked) {
            const routeObj = routes.find(r => r.name === routeName);
            if (!routeObj || !routeObj.spawns) continue;

            if (!routeToFirstMap[routeName]) routeToFirstMap[routeName] = {};

            for (const spawn of routeObj.spawns) {
                if (!encounteredPokemon.has(spawn.pokemonId)) {
                    routeToFirstMap[routeName][spawn.pokemonId] = true;
                    encounteredPokemon.add(spawn.pokemonId);
                } else {
                    routeToFirstMap[routeName][spawn.pokemonId] = false;
                }
            }
        }
    }

    const mainChallenges = unlocksArray.filter(u => u.challengeName.startsWith('Challenge ')).sort((a, b) => a.challengeName.localeCompare(b.challengeName, undefined, {numeric: true}));
    const mainLevels = {};
    mainChallenges.forEach((ch, idx) => {
        const p = idx / (mainChallenges.length - 1 || 1);
        mainLevels[ch.challengeName] = Math.round(1 + p * 79);
    });

    const rutesRows = [];
    const challengesRows = [];

    for (const route of routes) {
        const unlockedAt = unlockedBy[route.name] || '';
        let baseMinLvl = 1, baseMaxLvl = 5;
        let quartile = 1;

        if (unlockedAt) {
            if (unlockedAt.startsWith('Challenge ')) {
                const idx = mainChallenges.findIndex(c => c.challengeName === unlockedAt);
                if (idx !== -1) {
                    baseMinLvl = mainLevels[unlockedAt];
                    if (idx < mainChallenges.length * 0.25) quartile = 1;
                    else if (idx < mainChallenges.length * 0.5) quartile = 2;
                    else if (idx < mainChallenges.length * 0.75) quartile = 3;
                    else quartile = 4;
                }
            } else if (unlockedAt.startsWith('Extra Challenge')) {
                const chainPrefix = unlockedAt.substring(0, unlockedAt.lastIndexOf(' '));
                const chain = unlocksArray.filter(u => u.challengeName.startsWith(chainPrefix)).sort((a,b)=>a.challengeName.localeCompare(b.challengeName, undefined, {numeric: true}));
                const idx = chain.findIndex(c => c.challengeName === unlockedAt);
                const p = idx / (chain.length - 1 || 1);
                baseMinLvl = Math.round(80 + p * 20);
                quartile = 4;
            }
        }

        let diff = 0;
        if (baseMinLvl < 12) diff = 2;
        else if (baseMinLvl < 30) diff = 3;
        else {
            diff = Math.floor((baseMinLvl + 5) * 0.10);
            if (diff > 8) diff = 8;
        }
        baseMaxLvl = baseMinLvl + diff;

        if (!route.spawns || route.spawns.length === 0) {
            let willUnl = (willUnlockMap[unlockedAt] || []).join(', ');
            let chDetails = challengeDetails[unlockedAt] || {};
            let mapOk = '';
            const coordKey = Object.keys(coordinates).find(k => coordinates[k].name === route.name);
            if (coordKey) mapOk = 'Yes';

            rutesRows.push({
                "Unlocked at": unlockedAt,
                "Challenge": unlockedAt,
                "Route": route.name,
                "Route (Secondary)": '',
                "Pokemon Name": '',
                "First?": '',
                "Level": '',
                "Sugested Level": '',
                "Peer to Peer": '',
                "% Appearance": '',
                "% Appearance Ok?": '',
                "Pokemon/Type Ok?": '',
                "BST": '',
                "Pokemon/BST Ok?": '',
                "Map Ok?": mapOk,
                "Will Unlock": willUnl,
                "Requisite": chDetails.req ? JSON.stringify(chDetails.req) : '',
                "Reward": chDetails.rewardGift ? JSON.stringify(chDetails.rewardGift) : ''
            });
            continue;
        }

        let sumBST = 0;
        let validSpawns = 0;
        const spawnsStats = [];

        for (const spawn of route.spawns) {
            const pStats = getPokemonStats(spawn.pokemonId);
            const bst = getBST(pStats);
            spawnsStats.push({ spawn, pStats, bst });
            sumBST += bst;
            validSpawns++;
        }

        const avgBST = validSpawns > 0 ? sumBST / validSpawns : 0;

        for (const sp of spawnsStats) {
            const pName = sp.pStats ? sp.pStats.name : `Unknown (${sp.spawn.pokemonId})`;
            const first = routeToFirstMap[route.name] && routeToFirstMap[route.name][sp.spawn.pokemonId] ? '' : 'NONONO';

            const val = sp.bst - avgBST;
            let offset = 0;
            if (val > 150) offset = 4;
            else if (val >= 100) offset = 2;
            else if (val >= 50) offset = 1;
            else if (val >= -50) offset = 0;
            else if (val > -100) offset = -1;
            else if (val > -150) offset = -2;
            else offset = -4;

            const peerMin = Math.max(1, baseMinLvl + offset);
            let pDiff = 0;
            if (peerMin < 12) pDiff = 2;
            else if (peerMin < 30) pDiff = 3;
            else {
                pDiff = Math.floor((peerMin + 5) * 0.10);
                if (pDiff > 8) pDiff = 8;
            }
            const peerMax = Math.min(100, peerMin + pDiff);

            let bstOk = '';
            if (unlockedAt.startsWith('Challenge ')) {
                if (quartile === 1 && sp.bst > 400) bstOk = 'NONONO';
                else if (quartile === 2 && sp.bst > 500) bstOk = 'NONONO';
                else if (quartile === 3 && sp.bst < 250) bstOk = 'NONONO';
                else if (quartile === 4 && sp.bst < 350) bstOk = 'NONONO';
            }

            let typeOk = 'Yes';
            const routeLower = route.name.toLowerCase();
            const types = sp.pStats ? sp.pStats.types : [];
            if (routeLower.includes('sea') || routeLower.includes('ocean') || routeLower.includes('water')) {
                if (types.includes('Fire') || types.includes('Ground') || types.includes('Rock')) typeOk = 'NONONO';
            } else if (routeLower.includes('volcano') || routeLower.includes('fiery') || routeLower.includes('magma') || routeLower.includes('pyre') || routeLower.includes('desert')) {
                if (types.includes('Water') || types.includes('Ice') || types.includes('Grass')) typeOk = 'NONONO';
            } else if (routeLower.includes('cave')) {
                if (types.includes('Flying') || types.includes('Grass')) typeOk = 'NONONO';
            }

            let willUnl = (willUnlockMap[unlockedAt] || []).join(', ');
            let chDetails = challengeDetails[unlockedAt] || {};

            let mapOk = '';
            const coordKey = Object.keys(coordinates).find(k => coordinates[k].name === route.name);
            if (coordKey) mapOk = 'Yes';

            rutesRows.push({
                "Unlocked at": unlockedAt,
                "Challenge": unlockedAt,
                "Route": route.name,
                "Route (Secondary)": '',
                "Pokemon Name": pName,
                "First?": first,
                "Level": `${sp.spawn.minLevel}-${sp.spawn.maxLevel}`,
                "Sugested Level": `${peerMin}-${peerMax}`,
                "Peer to Peer": offset > 0 ? `+${offset}` : offset.toString(),
                "% Appearance": sp.spawn.chance,
                "% Appearance Ok?": '',
                "Pokemon/Type Ok?": typeOk,
                "BST": sp.bst,
                "Pokemon/BST Ok?": bstOk,
                "Map Ok?": mapOk,
                "Will Unlock": willUnl,
                "Requisite": chDetails.req ? JSON.stringify(chDetails.req) : '',
                "Reward": chDetails.rewardGift ? JSON.stringify(chDetails.rewardGift) : ''
            });
        }
    }

    for (const unlock of unlocksArray) {
        let reqStr = JSON.stringify(unlock.requirements || {});
        let sug = 'Defeat 150 pokemon in route';

        if (unlock.challengeName.startsWith('Challenge ')) {
            const idx = mainChallenges.findIndex(c => c.challengeName === unlock.challengeName);
            if (idx < mainChallenges.length * 0.25) sug = 'Defeat 50 pokemon in route';
            else if (idx < mainChallenges.length * 0.5) sug = 'Defeat 100 pokemon in route';
            else if (idx < mainChallenges.length * 0.75) sug = 'Defeat 150 pokemon in route';
            else sug = 'Defeat 250 pokemon in route';
        } else {
            sug = 'Defeat 300 pokemon in route';
        }

        if (unlock.unlockedArea && unlock.unlockedArea.toLowerCase().includes('gym')) {
            sug = 'Defeat Gym Leader';
        } else if (unlock.unlockedArea && unlock.unlockedArea.toLowerCase().includes('league')) {
            sug = 'Win Pokemon League';
        } else if (reqStr.includes('earnBadge') || reqStr.includes('defeatCountRoute')) {
             if (reqStr.includes('earnBadge')) sug = 'Defeat Gym Leader';
        }

        challengesRows.push({
            "Challenge Name": unlock.challengeName,
            "Requisite": reqStr,
            "Sugestion for Req": sug,
            "Reward Map": unlock.unlockedArea || '',
            "Reward Challenge": (willUnlockMap[unlock.challengeName] || []).join(', '),
            "Reward Gift": unlock.reward ? JSON.stringify(unlock.reward) : ''
        });
    }

    const missingRows = [];
    for (const pId of pokedex) {
        const stats = getPokemonStats(pId);
        if (!stats) continue;

        if (!encounteredPokemon.has(pId)) {
            let canObtain = 'No';
            const evos = pokemonDataRaw.filter(p => p.evolutions && p.evolutions.some(e => e.to === pId));
            let nextCheck = pokemonDataRaw.find(p => p.id === pId);

            for (const evoBase of evos) {
                if (encounteredPokemon.has(evoBase.id)) {
                    canObtain = 'Evolve';
                    break;
                }
                const baseBase = pokemonDataRaw.filter(p => p.evolutions && p.evolutions.some(e => e.to === evoBase.id));
                for (const bb of baseBase) {
                    if (encounteredPokemon.has(bb.id)) {
                        canObtain = '2xEvolution';
                        break;
                    }
                }
            }

            if (canObtain === 'No' && nextCheck && nextCheck.evolutions && nextCheck.evolutions.length > 0) {
                canObtain = 'No Next';
            }

            missingRows.push({
                "Pokemon Name": stats.name,
                "Can Obtain?": canObtain
            });
        }
    }

    const wb = xlsx.utils.book_new();
    const ws1 = xlsx.utils.json_to_sheet(rutesRows);

    const range = xlsx.utils.decode_range(ws1['!ref']);
    let percentCol = -1;
    for(let C = range.s.c; C <= range.e.c; ++C) {
        const addr = xlsx.utils.encode_cell({r:0, c:C});
        if(ws1[addr] && ws1[addr].v === '% Appearance') {
            percentCol = C;
            break;
        }
    }

    if (percentCol !== -1) {
        for(let R = 1; R <= range.e.r; ++R) {
            const addr = xlsx.utils.encode_cell({r:R, c:percentCol});
            if(ws1[addr]) {
                ws1[addr].z = '0%';
            }
        }
    }

    xlsx.utils.book_append_sheet(wb, ws1, "Rutes");

    const ws2 = xlsx.utils.json_to_sheet(challengesRows);
    xlsx.utils.book_append_sheet(wb, ws2, "Challenges");

    const ws3 = xlsx.utils.json_to_sheet(missingRows);
    xlsx.utils.book_append_sheet(wb, ws3, "Missing PK");

    xlsx.writeFile(wb, `${region.num}_${region.name}_Data.xlsx`);
}
