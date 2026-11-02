const fs = require('fs');
const xlsx = require('xlsx');

// Load generic data
const pokemonData = JSON.parse(fs.readFileSync('data/pokemon.json', 'utf8'));
const getPokemonById = (id) => pokemonData.find(p => p.id === id) || { name: `Unknown (${id})`, types: [], hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };

// Parse pokedex
const dexStr = fs.readFileSync('config/pokedexIndexes.js', 'utf8');
const dexObjStr = dexStr.substring(dexStr.indexOf('{')).replace(/;\s*$/, '');
const dexObj = eval('(' + dexObjStr + ')');

const getBST = (pkmn) => pkmn.hp + pkmn.atk + pkmn.def + pkmn.spa + pkmn.spd + pkmn.spe;

const regions = [
    { num: 1, name: 'Kanto', filePrefix: 'routes', id: 'kanto' },
    { num: 2, name: 'Johto', filePrefix: 'johtoRoutes', id: 'johto' },
    { num: 3, name: 'Hoenn', filePrefix: 'hoennRoutes', id: 'hoenn' },
    { num: 4, name: 'Sinnoh', filePrefix: 'sinnohRoutes', id: 'sinnoh' },
    { num: 5, name: 'Unova', filePrefix: 'unovaRoutes', id: 'unova' },
    { num: 6, name: 'Kalos', filePrefix: 'kalosRoutes', id: 'kalos' },
    { num: 7, name: 'Alola', filePrefix: 'alolaRoutes', id: 'alola' },
    { num: 8, name: 'Galar', filePrefix: 'galarRoutes', id: 'galar' },
    { num: 9, name: 'Hisui', filePrefix: 'hisuiRoutes', id: 'hisui' },
    { num: 10, name: 'Paldea', filePrefix: 'paldeaRoutes', id: 'paldea' }
];

const loadRegionConfig = (region) => {
    let routesStr = fs.readFileSync(`config/${region.filePrefix}.js`, 'utf8');

    // Simple naive parsing that always works for this codebase pattern:
    // routes usually start with "export const xyzRoutes = [" or "const routes = ["
    // unlocks usually start with "export const xyzUnlocks = ["

    let mapFile = region.id === 'kanto' ? 'mapCoordinates' : `${region.id}MapCoordinates`;
    let mapStr = fs.readFileSync(`config/${mapFile}.js`, 'utf8');
    let mapCoords = {};
    try {
        const mapDataStr = mapStr.substring(mapStr.indexOf('{'), mapStr.lastIndexOf('}') + 1);
        mapCoords = eval('(' + mapDataStr.trim() + ')');
    } catch (e) {}

    routesStr = routesStr.replace(/export { .*? };/g, '');
    routesStr = routesStr.replace(/export const/g, 'const');
    routesStr = routesStr.replace(/export default/g, 'const defaultExport =');
    routesStr = routesStr.replace(/import .*?;/g, '');

    let routes, unlocks;
    try {
        const result = new Function(routesStr + `
            return {
                r: typeof routes !== 'undefined' ? routes : (
                   typeof ${region.id}Routes !== 'undefined' ? ${region.id}Routes : (
                   typeof ${region.filePrefix} !== 'undefined' ? ${region.filePrefix} : null
                   )
                ),
                u: typeof unlocks !== 'undefined' ? unlocks : (
                   typeof ${region.id}Unlocks !== 'undefined' ? ${region.id}Unlocks : null
                )
            };
        `)();
        routes = result.r;
        unlocks = result.u;
    } catch(e) {
        throw new Error("Failed to eval " + region.filePrefix + ": " + e.message);
    }

    if (!Array.isArray(routes)) {
        routes = Object.keys(routes).map(key => ({
            name: key,
            spawns: routes[key].pokes ? routes[key].pokes.map(p => ({
                pokemonId: p.id,
                minLevel: p.minLevel,
                maxLevel: p.maxLevel,
                chance: p.probability
            })) : []
        }));
    }

    return { routes, unlocks, mapCoords };
};

console.log("Script structure created");

const formatRequirements = (reqs) => {
    if (!reqs) return "";
    let parts = [];
    if (reqs.catchSpecies) reqs.catchSpecies.forEach(c => parts.push(`Catch ${c.count} ${c.species}`));
    if (reqs.catchSpeciesByQuality) reqs.catchSpeciesByQuality.forEach(c => parts.push(`Catch ${c.count} ${c.quality} ${c.species}`));
    if (reqs.catchSpeciesAnyOfByQuality) reqs.catchSpeciesAnyOfByQuality.forEach(c => parts.push(`Catch ${c.count} ${c.quality} of [${c.species.join(', ')}]`));
    if (reqs.catchByType) parts.push(`Catch ${reqs.catchByType.count} ${reqs.catchByType.type} type`);
    if (reqs.catchByQualityAndType) parts.push(`Catch ${reqs.catchByQualityAndType.count} ${reqs.catchByQualityAndType.quality} ${reqs.catchByQualityAndType.type} type`);
    if (reqs.earnBadge) parts.push(`Earn ${reqs.earnBadge.name}`);
    if (reqs.defeatCountRoute) parts.push(`Defeat ${reqs.defeatCountRoute.count} on ${reqs.defeatCountRoute.route}`);
    if (reqs.defeatSpecific) parts.push(`Defeat ${reqs.defeatSpecific.count} ${reqs.defeatSpecific.name}`);
    if (reqs.completeChallenges) parts.push(`Complete challenges: ${reqs.completeChallenges.join(', ')}`);
    if (reqs.defeatEliteFourAndChampion || reqs.defeatKantoChampion || reqs.defeatJohtoChampion || reqs.defeatHoennChampion || reqs.defeatSinnohChampion || reqs.defeatUnovaChampion || reqs.defeatKalosChampion || reqs.defeatAlolaChampion || reqs.defeatGalarChampion || reqs.defeatHisuiChampion || reqs.defeatPaldeaChampion) {
        parts.push(`Win Pokemon League`);
    }
    if (reqs.catchEachFromSlotMachine) {
        parts.push(`Catch from slot machine`);
    }
    if (reqs.catchSpeciesUniqueCount) {
        parts.push(`Catch ${reqs.catchSpeciesUniqueCount} unique species`);
    }
    return parts.length > 0 ? parts.join(", ") : JSON.stringify(reqs);
};

const formatRewards = (challenge) => {
    let parts = [];
    if (challenge.gift) {
        parts.push(`${challenge.gift.count} ${challenge.gift.item}`);
    }
    if (challenge.gifts) {
        challenge.gifts.forEach(g => parts.push(`${g.count} ${g.item}`));
    }
    return parts.length > 0 ? parts.join(", ") : "";
};

const getChallengeUnlockingRoute = (routeName, unlocksArray) => {
    const unlockChallenge = unlocksArray.find(c => c.unlocks && c.unlocks.includes(routeName));
    return unlockChallenge ? unlockChallenge.challengeName : "";
};

const processSheet1 = (regionData, regionName) => {
    const { routes, unlocks, mapCoords } = regionData;
    const mapNames = Object.values(mapCoords).map(c => c.name);

    // Identify Main and Extra Challenges based on unlock chain
    let mainChallenges = [];
    let extraChallenges = [];

    // First, find the starting point. It's usually a route not unlocked by anything, or unlocked by "Travel to a new Region" etc.
    // For simplicity, we can rely on challengeName conventions.
    // "Challenge 1", "Challenge 2", etc.
    routes.forEach(route => {
        let unlockInfo = unlocks.find(u => u.areaId === route.name);
        let challengeName = unlockInfo ? unlockInfo.challengeName : "";

        if (!challengeName) {
            // Check if it's unlocked by something
            const unlockedBy = getChallengeUnlockingRoute(route.name, unlocks);
            if (unlockedBy && unlockedBy.startsWith("Challenge")) challengeName = "Challenge";
        }

        if (challengeName && (challengeName.startsWith("Challenge") || challengeName.includes("Final Challenge") || challengeName === "Kanto Pokemon League" || challengeName.includes("League") || route.name.includes("League") || route.name.includes("Gym"))) {
            if (!route.isGym) mainChallenges.push(route);
        } else if (challengeName && challengeName.startsWith("Extra")) {
            extraChallenges.push(route);
        } else if (route.name.includes("Route") || route.name.includes("City") || route.name.includes("Forest") || route.name.includes("Cave") || route.name.includes("Mountain") || route.name.includes("Island")) {
            // Fallback for Kanto route 1 which might lack explicit Challenge name in unlocks
            mainChallenges.push(route);
        } else {
             // Fallback for other locations
             extraChallenges.push(route);
        }
    });

    // Re-evaluate main vs extra purely based on `unlocks` data matching areaId to challengeName
    // Because the above heuristic is flawed. Let's do a better trace.
    let chainMain = [];
    let chainExtras = {}; // { 'A': [], 'B': [] }

    routes.forEach(r => {
        let unlockObj = unlocks.find(u => u.areaId === r.name);
        if (unlockObj) {
            if (unlockObj.challengeName.includes('Extra Challenge')) {
                let match = unlockObj.challengeName.match(/Extra Challenge ([A-Z])/);
                let letter = match ? match[1] : 'Other';
                if (!chainExtras[letter]) chainExtras[letter] = [];
                chainExtras[letter].push(r);
            } else if (unlockObj.challengeName.includes('Challenge')) {
                 chainMain.push(r);
            }
        }
    });

    // If we missed routes that don't have explicit unlocks objects (like starting routes)
    routes.forEach(r => {
        if (!chainMain.includes(r) && !Object.values(chainExtras).flat().includes(r)) {
            // Check if it unlocks a main challenge
            let unlocksMain = unlocks.find(u => u.requirements && u.requirements.defeatCountRoute && u.requirements.defeatCountRoute.route === r.name);
            if (unlocksMain && unlocksMain.challengeName.includes('Extra')) {
                let match = unlocksMain.challengeName.match(/Extra Challenge ([A-Z])/);
                let letter = match ? match[1] : 'Other';
                if (!chainExtras[letter]) chainExtras[letter] = [];
                chainExtras[letter].push(r);
            } else {
                chainMain.push(r); // default to main
            }
        }
    });

    // We will do a generic pass over all routes instead of strict chains for the 'First?' check,
    // but follow the rule: Main Challenges first, then Extra A, Extra B, etc.
    let orderedForFirstCheck = [...chainMain];
    Object.keys(chainExtras).sort().forEach(k => {
        orderedForFirstCheck = orderedForFirstCheck.concat(chainExtras[k]);
    });

    let seenPokemon = new Set();
    let seenInChain = {}; // pkmnId -> firstRouteName

    const sheet1Data = [];
    const numMainChallenges = chainMain.filter(r => r.spawns && r.spawns.length > 0).length;

    // Helper for Pokemon/Type Ok?
    const isWater = (name) => name.toLowerCase().includes('sea') || name.toLowerCase().includes('water') || name.toLowerCase().includes('ocean') || name.toLowerCase().includes('surf') || name.toLowerCase().includes('lake') || name.toLowerCase().includes('river');
    const isCave = (name) => name.toLowerCase().includes('cave') || name.toLowerCase().includes('tunnel') || name.toLowerCase().includes('mine');

    let currentMainIdx = 0;

    orderedForFirstCheck.forEach((route, routeIdx) => {
        let isMain = chainMain.includes(route);
        if (isMain && route.spawns && route.spawns.length > 0) {
            currentMainIdx++;
        }

        const unlockedBy = getChallengeUnlockingRoute(route.name, unlocks);
        const inMap = mapNames.includes(route.name) ? "Yes" : "NONONO";

        let unlockObj = unlocks.find(u => u.areaId === route.name);
        let challengeName = unlockObj ? unlockObj.challengeName : "";

        let willUnlock = "";
        let reqs = "";
        let reward = "";
        if (unlockObj) {
            willUnlock = unlockObj.unlocks ? unlockObj.unlocks.join(", ") : "";
            reqs = formatRequirements(unlockObj.requirements);
            reward = formatRewards(unlockObj);
            if (!reward && unlockObj.unlocks && unlockObj.unlocks.length > 0) reward = "Unlocks Map";
        }

        if (route.spawns && route.spawns.length > 0) {
            // Calculate route BST mean
            let totalBst = 0;
            let validSpawns = 0;
            route.spawns.forEach(spawn => {
                const pkmn = getPokemonById(spawn.pokemonId);
                if (pkmn.hp > 0) {
                    totalBst += getBST(pkmn);
                    validSpawns++;
                }
            });
            const meanBst = validSpawns > 0 ? totalBst / validSpawns : 0;

            route.spawns.forEach(spawn => {
                const pkmn = getPokemonById(spawn.pokemonId);
                const pkmnName = pkmn.name;
                const bst = pkmn.hp > 0 ? getBST(pkmn) : 0;

                // First? Logic
                let isFirst = "NONONO";
                if (!seenPokemon.has(spawn.pokemonId)) {
                    isFirst = "";
                    seenPokemon.add(spawn.pokemonId);
                }

                // Level Logic
                let levelStr = spawn.minLevel && spawn.maxLevel ? `${spawn.minLevel}-${spawn.maxLevel}` : "";
                let sugMin = spawn.minLevel || 1;

                // Peer to Peer Logic
                let p2pMod = 0;
                let bstDiff = bst - meanBst;
                if (bstDiff > 150) p2pMod = 4;
                else if (bstDiff >= 100) p2pMod = 2;
                else if (bstDiff >= 50) p2pMod = 1;
                else if (bstDiff >= -50) p2pMod = 0;
                else if (bstDiff > -100) p2pMod = -1;
                else if (bstDiff > -150) p2pMod = -2;
                else p2pMod = -4;

                sugMin = Math.max(1, sugMin + p2pMod);

                let sugRange = 2;
                if (sugMin >= 12) sugRange = 3;
                if (sugMin >= 30) sugRange = Math.min(8, Math.floor(sugMin * 0.1));
                if (sugMin >= 100) sugRange = 5;

                let maxSugLevel = sugMin + sugRange;
                if (sugMin <= 100) {
                     if (!isMain && maxSugLevel > 100) maxSugLevel = 100;
                     if (isMain && maxSugLevel > 80) maxSugLevel = 80;
                }

                let sugLevelStr = `${sugMin}-${maxSugLevel}`;

                // % Appearance Ok?
                let chanceStr = spawn.chance ? spawn.chance : "";

                // Pokemon/Type Ok?
                let typeOk = "Yes";
                if (isWater(route.name) && !pkmn.types.includes('Water')) typeOk = "NONONO";

                // Pokemon/BST Ok?
                let bstOk = "";
                if (isMain && numMainChallenges > 0) {
                    let progress = currentMainIdx / numMainChallenges;
                    if (progress <= 0.25 && bst > 400) bstOk = "NONONO";
                    else if (progress <= 0.50 && bst > 500) bstOk = "NONONO";
                    else if (progress > 0.50 && progress <= 0.75 && bst < 250) bstOk = "NONONO";
                    else if (progress > 0.75 && bst < 350) bstOk = "NONONO";
                }

                sheet1Data.push({
                    "Unlocked at": unlockedBy,
                    "Challenge": challengeName,
                    "Route": route.name,
                    "Pokemon Name": pkmnName,
                    "First?": isFirst,
                    "Level": levelStr,
                    "Sugested Level": sugLevelStr,
                    "% Appearance": chanceStr,
                    "% Appearance Ok?": "",
                    "Pokemon/Type Ok?": typeOk,
                    "BST": bst,
                    "Pokemon/BST Ok?": bstOk,
                    "Map Ok?": inMap,
                    "Will Unlock": willUnlock,
                    "Requisite": reqs,
                    "Reward": reward
                });
            });
        } else {
            // Gyms, Daycares, etc
            sheet1Data.push({
                "Unlocked at": unlockedBy,
                "Challenge": challengeName,
                "Route": route.name,
                "Pokemon Name": "",
                "First?": "",
                "Level": "",
                "Sugested Level": "",
                "% Appearance": "",
                "% Appearance Ok?": "",
                "Pokemon/Type Ok?": "",
                "BST": "",
                "Pokemon/BST Ok?": "",
                "Map Ok?": inMap,
                "Will Unlock": willUnlock,
                "Requisite": reqs,
                "Reward": reward
            });
        }
    });

    return sheet1Data;
};



// Pass sheet1Data so we can see First? and % Appearance easily
const processSheet2 = (regionData, sheet1Data) => {
    const { unlocks } = regionData;
    const sheet2Data = [];

    unlocks.forEach(challenge => {
        let reqs = formatRequirements(challenge.requirements);

        let rewardMap = challenge.unlocks ? challenge.unlocks.join(", ") : "";
        let rewardChallenge = "";
        if (challenge.unlocks && challenge.unlocks.length > 0) {
            // Attempt to find the challenge name for the first unlocked map
            let nextMap = challenge.unlocks[0];
            let nextUnlock = unlocks.find(u => u.areaId === nextMap);
            if (nextUnlock) rewardChallenge = nextUnlock.challengeName;
        }

        let rewardGift = "";
        if (challenge.gift) {
            rewardGift = `${challenge.gift.count} ${challenge.gift.item}`;
        }
        if (challenge.gifts) {
            let gs = challenge.gifts.map(g => `${g.count} ${g.item}`);
            rewardGift = rewardGift ? rewardGift + ", " + gs.join(", ") : gs.join(", ");
        }



        let suggestion = "";
        if (reqs.includes("Win Pokemon League") || reqs.includes("Defeat Elite Four and Champion")) {
            suggestion = "Win Pokemon League";
        } else if (reqs.includes("Earn")) {
            suggestion = reqs; // Defeat Gym Leader
        } else {
            // Find all spawns for this route from sheet1Data
            let routeRows = sheet1Data.filter(r => r.Route === challenge.areaId && r["Pokemon Name"] !== "");

            if (routeRows.length > 0) {
                let firstTimes = routeRows.filter(r => r["First?"] === "");
                let lowAppearance = routeRows.filter(r => parseFloat(r["% Appearance"]) <= 0.1);
                let regAppearance = routeRows.filter(r => parseFloat(r["% Appearance"]) >= 0.2);

                let isEarly = challenge.challengeName.match(/Challenge (\d+)/) && parseInt(challenge.challengeName.match(/Challenge (\d+)/)[1]) <= 15;
                let isMid = challenge.challengeName.match(/Challenge (\d+)/) && parseInt(challenge.challengeName.match(/Challenge (\d+)/)[1]) > 15 && parseInt(challenge.challengeName.match(/Challenge (\d+)/)[1]) <= 40;
                let isLate = challenge.challengeName.match(/Challenge (\d+)/) && parseInt(challenge.challengeName.match(/Challenge (\d+)/)[1]) > 40;
                let isExtra = challenge.challengeName.includes("Extra");

                if (firstTimes.length > 0) {
                     // Pick up to 3 that aren't too painful
                     let viable = firstTimes.filter(r => {
                          let pChance = parseFloat(r["% Appearance"]);
                          // math: 1 / pChance <= 200 => pChance >= 0.005
                          return pChance >= 0.05 && r.BST < 500;
                     });
                     if (viable.length > 0) {
                          let count = Math.min(3, viable.length);
                          let names = viable.slice(0, count).map(v => v["Pokemon Name"]);
                          suggestion = `Catch ${names.join(', ')}`;
                     } else if (regAppearance.length > 0 && firstTimes.some(f => regAppearance.includes(f))) {
                          let f = firstTimes.find(f => regAppearance.includes(f));
                          suggestion = `Catch 1 Rare ${f["Pokemon Name"]}`;
                     } else if (lowAppearance.length > 0) {
                          let f = lowAppearance[0];
                          let pChance = parseFloat(f["% Appearance"]);
                          // math: encounters = req_count / pChance -> req_count = encounters * pChance
                          let reqCount = Math.floor(125 * pChance);
                          if (reqCount < 1) reqCount = 1;
                          suggestion = `Defeat ${reqCount} ${f["Pokemon Name"]}`;
                     } else {
                          suggestion = "Defeat 100 Pokemon in route";
                     }
                } else if (lowAppearance.length > 0) {
                     let f = lowAppearance[0];
                     let pChance = parseFloat(f["% Appearance"]);
                     let reqCount = Math.floor(125 * pChance);
                     if (reqCount < 1) reqCount = 1;
                     suggestion = `Defeat ${reqCount} ${f["Pokemon Name"]}`;
                } else {
                     // Generalist
                     let num = 25;
                     if (isEarly) num = 50;
                     if (isMid) num = 100;
                     if (isLate) num = 200;
                     if (isExtra) num = 300;
                     suggestion = `Defeat ${num} Pokemon in route`;
                }
            } else {
                 // Generalist
                 let isExtra = challenge.challengeName.includes("Extra");
                 let num = isExtra ? 300 : 100;
                 suggestion = `Defeat ${num} Pokemon in route`;
            }
        }


        sheet2Data.push({
            "Challenge Name": challenge.challengeName,
            "Requisite": reqs,
            "Sugestion for Req": suggestion,
            "Reward Map": rewardMap,
            "Reward Challenge": rewardChallenge,
            "Reward Gift": rewardGift
        });
    });

    return sheet2Data;
};

const processSheet3 = (regionData, regionId) => {
    const { routes } = regionData;
    const regionDexIds = dexObj.regional[regionId];
    if (!regionDexIds) return [];

    const allRegionPokemon = regionDexIds.map(id => getPokemonById(id)).filter(p => p.hp > 0);
    const obtainableDirectly = new Set();

    routes.forEach(route => {
        if (route.spawns) {
            route.spawns.forEach(spawn => {
                obtainableDirectly.add(spawn.pokemonId);
            });
        }
    });

    const checkEvolve = (pkmnId, depth = 0) => {
        if (obtainableDirectly.has(pkmnId)) return depth;
        if (depth >= 3) return -1; // Avoid deep recursion

        const evolvesFrom = pokemonData.filter(p => p.evolutions && p.evolutions.some(e => e.to === pkmnId));
        if (evolvesFrom.length === 0) return -1;

        for (const pre of evolvesFrom) {
            let res = checkEvolve(pre.id, depth + 1);
            if (res !== -1) return res;
        }
        return -1;
    };

    const checkPreEvolve = (pkmnId, depth = 0) => {
        if (obtainableDirectly.has(pkmnId)) return depth;
        if (depth >= 3) return -1;

        const pkmn = getPokemonById(pkmnId);
        if (!pkmn.evolutions) return -1;

        for (const ev of pkmn.evolutions) {
            let res = checkPreEvolve(ev.to, depth + 1);
            if (res !== -1) return res;
        }
        return -1;
    };

    const getObtainStatus = (pkmnId) => {
        if (obtainableDirectly.has(pkmnId)) return "Direct";

        let evDepth = checkEvolve(pkmnId, 0);
        if (evDepth === 1) return "Evolve";
        if (evDepth > 1) return `${evDepth}xEvolution`;

        let preEvDepth = checkPreEvolve(pkmnId, 0);
        if (preEvDepth === 1) return "Pre Evolve";
        if (preEvDepth > 1) return `Pre ${preEvDepth}xEvolution`;

        return "No";
    };

    const sheet3Data = [];
    allRegionPokemon.forEach(pkmn => {
        const status = getObtainStatus(pkmn.id);
        if (status !== "Direct") {
            sheet3Data.push({
                "Pokemon Name": pkmn.name,
                "Can Obtain?": status
            });
        }
    });

    return sheet3Data;
};

// Main Runner
regions.forEach(region => {
    try {
        console.log(`Processing ${region.name}...`);
        const regionData = loadRegionConfig(region);

        const sheet1 = processSheet1(regionData, region.name);
        const sheet2 = processSheet2(regionData, sheet1);
        const sheet3 = processSheet3(regionData, region.id);

        const wb = xlsx.utils.book_new();

        // Sheet 1
        const ws1 = xlsx.utils.json_to_sheet(sheet1);

        // Fix percentage formatting
        const range = xlsx.utils.decode_range(ws1['!ref']);
        for (let R = range.s.r + 1; R <= range.e.r; ++R) {
            let cell = ws1[xlsx.utils.encode_cell({c: 7, r: R})]; // % Appearance column
            if (cell && cell.v) {
                cell.t = 'n';
                cell.z = '0%';
            }
        }
        xlsx.utils.book_append_sheet(wb, ws1, "Rutes");

        // Sheet 2
        const ws2 = xlsx.utils.json_to_sheet(sheet2);
        xlsx.utils.book_append_sheet(wb, ws2, "Challenges");

        // Sheet 3
        const ws3 = xlsx.utils.json_to_sheet(sheet3);
        xlsx.utils.book_append_sheet(wb, ws3, "Missing PK");

        const fileName = `${region.num}_${region.name}_Data01.xlsx`;
        xlsx.writeFile(wb, fileName);
        console.log(`Generated ${fileName}`);

    } catch (e) {
        console.error(`Error processing ${region.name}:`, e);
    }
});
