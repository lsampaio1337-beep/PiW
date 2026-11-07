const fs = require('fs');
const path = require('path');
const vm = require('vm');
const xlsx = require('xlsx');

function loadDataFile(filename, varNames = null) {
    filename = path.resolve(__dirname, '..', filename);
    let code = fs.readFileSync(filename, 'utf8');
    code = code.replace(/^import\s+.*?;?\s*$/gm, '');
    code = code.replace(/export\s+const\s+/g, 'var ')
               .replace(/export\s+default\s+/g, 'var defaultExport = ')
               .replace(/export\s+\{.*\}\s*;/g, '');
    code = code.replace(/^const\s+([a-zA-Z0-9_]+)\s*=/gm, 'var $1 =');

    const context = {};
    vm.createContext(context);
    vm.runInContext(code, context);

    if (varNames) {
        const result = {};
        for (const name of varNames) {
            result[name] = context[name];
        }
        return result;
    }
    return context;
}


const _pokemonDataArr = require('../data/pokemon.json');
const pokemonData = {};
_pokemonDataArr.forEach(p => { pokemonData[p.id] = p; });

const { pokedexIndexes } = loadDataFile('config/pokedexIndexes.js', ['pokedexIndexes']);
const { types } = loadDataFile('config/types.js', ['types']);

const REGIONS = [
    { num: 1, name: 'Kanto', prefix: '', routesVar: 'routes', unlocksVar: 'unlocks', mapVar: 'mapCoordinates' },
    { num: 2, name: 'Johto', prefix: 'johto', routesVar: 'johtoRoutes', unlocksVar: 'johtoUnlocks', mapVar: 'johtoMapCoordinates' },
    { num: 3, name: 'Hoenn', prefix: 'hoenn', routesVar: 'hoennRoutes', unlocksVar: 'hoennUnlocks', mapVar: 'hoennMapCoordinates' },
    { num: 4, name: 'Sinnoh', prefix: 'sinnoh', routesVar: 'sinnohRoutes', unlocksVar: 'sinnohUnlocks', mapVar: 'sinnohMapCoordinates' },
    { num: 5, name: 'Unova', prefix: 'unova', routesVar: 'unovaRoutes', unlocksVar: 'unovaUnlocks', mapVar: 'unovaMapCoordinates' },
    { num: 6, name: 'Kalos', prefix: 'kalos', routesVar: 'kalosRoutes', unlocksVar: 'kalosUnlocks', mapVar: 'kalosMapCoordinates' },
    { num: 7, name: 'Alola', prefix: 'alola', routesVar: 'alolaRoutes', unlocksVar: 'alolaUnlocks', mapVar: 'alolaMapCoordinates' },
    { num: 8, name: 'Galar', prefix: 'galar', routesVar: 'galarRoutes', unlocksVar: 'galarUnlocks', mapVar: 'galarMapCoordinates' },
    { num: 9, name: 'Hisui', prefix: 'hisui', routesVar: 'hisuiRoutes', unlocksVar: 'hisuiUnlocks', mapVar: 'hisuiMapCoordinates' },
    { num: 10, name: 'Paldea', prefix: 'paldea', routesVar: 'paldeaRoutes', unlocksVar: 'paldeaUnlocks', mapVar: 'paldeaMapCoordinates' }
];


function formatChallengeName(name) {
    if (!name) return name;
    return name.replace(/(Challenge\s+([A-Z]\s+)?|Extra Challenge\s+([A-Z]\s+)?)(\d+)$/i, (match, p1, p2, p3, p4) => {
        let numStr = p4.length === 1 ? '0' + p4 : p4;
        let prefix = p1;
        return `${prefix}${numStr}`;
    });
}

function getBST(pk) {
    if (!pk) return 0;
    return pk.hp + pk.atk + pk.def + pk.spa + pk.spd + pk.spe;
}

const evosForward = {};
const evosBackward = {};

for (const id in pokemonData) {
    const pk = pokemonData[id];
    if (pk.evolutions) {
        pk.evolutions.forEach(evo => {
            if (!evosForward[id]) evosForward[id] = [];
            evosForward[id].push(evo.to);
            evosBackward[evo.to] = id;
        });
    }
}

function reqString(req) {
    if (!req) return '';
    return JSON.stringify(req);
}

async function processRegion(region, counter) {
    console.log(`Processing ${region.name}...`);

    let routesFile = 'config/routes.js';
    let mapFile = 'config/mapCoordinates.js';
    if (region.prefix !== '') {
        routesFile = `config/${region.prefix}Routes.js`;
        mapFile = `config/${region.prefix}MapCoordinates.js`;
    }

    let routes = [];
    let unlocks = [];

    if (fs.existsSync(routesFile)) {
        const varsToLoad = [];
        if (region.routesVar) varsToLoad.push(region.routesVar);
        if (region.unlocksVar) varsToLoad.push(region.unlocksVar);
        const loaded = loadDataFile(routesFile, varsToLoad);
        if (loaded[region.routesVar]) routes = loaded[region.routesVar];
        if (region.unlocksVar && loaded[region.unlocksVar]) unlocks = loaded[region.unlocksVar];
    } else {
        console.error(`Routes file not found: ${routesFile}`);
        return;
    }
if (!Array.isArray(routes)) {
        routes = Object.keys(routes).map(key => {
            const val = routes[key];
            return {
                name: key,
                ...val
            };
        });
    }

    // Normalize Hisui specific field names
    routes.forEach(r => {
        if (!r.spawns && r.pokes) {
            r.spawns = r.pokes.map(p => ({
                pokemonId: p.id,
                minLevel: p.minLevel,
                maxLevel: p.maxLevel,
                chance: p.probability || p.chance || 0
            }));
        }
    });
    if (!Array.isArray(unlocks)) {
        unlocks = Object.values(unlocks);
    }

    for (const u of unlocks) {
        if (u.challengeName) u.challengeName = formatChallengeName(u.challengeName);
        if (u.unlocks && Array.isArray(u.unlocks)) {
            u.unlocks = u.unlocks.map(formatChallengeName);
        }
        if (u.requirements && u.requirements.challenge) {
            u.requirements.challenge = formatChallengeName(u.requirements.challenge);
        }
    }
    let mapCoords = {};
    if (fs.existsSync(mapFile)) {
        const loadedMap = loadDataFile(mapFile);
        mapCoords = loadedMap[region.mapVar] || loadedMap.mapCoordinates || loadedMap.defaultExport || {};
    }

    const nativeIds = pokedexIndexes.regional[region.prefix === '' ? 'kanto' : region.prefix] || [];


    const allSpawnsToFetch = new Set();
    routes.forEach(r => {
        (r.spawns || []).forEach(s => {
            const pk = pokemonData[s.pokemonId];
            if (pk && pk.name) allSpawnsToFetch.add(pk.name.toLowerCase());
        });
    });

    const encounterCache = {};
    for (const pkName of allSpawnsToFetch) {
        try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pkName}/encounters`);
            if (res.ok) {
                const data = await res.json();
                encounterCache[pkName] = data.map(d => d.location_area.name);
            } else {
                encounterCache[pkName] = [];
            }
        } catch (e) {
            encounterCache[pkName] = [];
        }
    }

    const mainChallenges = [];
    const extraChallenges = {};

    for (const u of unlocks) {
        if (!u.challengeName) continue;
        if (u.challengeName.startsWith('Challenge ') || (!u.challengeName.startsWith('Extra') && !u.challengeName.startsWith('Key') && !u.challengeName.includes('League'))) {
             mainChallenges.push(u);
        } else if (u.challengeName.startsWith('Extra Challenge ')) {
            const parts = u.challengeName.split(' ');
            if (parts.length >= 4) {
                const letter = parts[2];
                if (!extraChallenges[letter]) extraChallenges[letter] = [];
                extraChallenges[letter].push(u);
            } else {
                extraChallenges['X'] = extraChallenges['X'] || [];
                extraChallenges['X'].push(u);
            }
        }
    }

    for (const key in extraChallenges) {
        extraChallenges[key].sort((a,b) => {
            const numA = parseInt(a.challengeName.split(' ').pop()) || 0;
            const numB = parseInt(b.challengeName.split(' ').pop()) || 0;
            return numA - numB;
        });
    }

    const routesData = [];
    const challengesData = [];
    const routeSpawnedPokemon = new Set();
    const seenPokemon = new Set();



    const getEvolutionStage = (id) => {
        if (!id) return 1;
        let stage = 1;
        let currentId = id;
        while (evosBackward[currentId]) {
            stage++;
            currentId = evosBackward[currentId];
        }
        return stage;
    };
const mainSeenSets = [];
    const processUnlocks = (challengeList, isMain, startChallengeIndex, initialSeenSet) => {
        let currentSeen = new Set(initialSeenSet);
        for (let i = 0; i < challengeList.length; i++) {
            const c = challengeList[i];
            const areaNames = [c.areaId || c.name];
            if (c.secondaryAreas && Array.isArray(c.secondaryAreas)) {
                areaNames.push(...c.secondaryAreas);
            }
            const isLeagueOrKey = c.challengeName && (c.challengeName.includes('League') || c.challengeName.includes('Key'));

            let primaryAdded = false;

            areaNames.forEach(areaName => {
                const r = routes.find(ro => ro.name === areaName) || {};
                const spawns = r.spawns || [];

                const req = c.requirements || {};
                let unlockStr = (c.unlocks || []).join(', ');
                let giftStr = c.gift ? `${c.gift.item} x${c.gift.count}` : '';

                let avgBST = 0;
                if (spawns.length > 0) {
                    let sumBST = 0;
                    let uniqueIds = new Set();
                    spawns.forEach(s => {
                        uniqueIds.add(s.pokemonId);
                    });
                    uniqueIds.forEach(id => {
                        sumBST += getBST(pokemonData[id]);
                    });
                    avgBST = uniqueIds.size > 0 ? sumBST / uniqueIds.size : 0;
                }

                let baseMin = 1;
                if (isMain) {
                    if (mainChallenges.length > 1) {
                        baseMin = Math.round(1 + ((79) * (i / (mainChallenges.length - 1))));
                    }
                } else {
                     const totalExtra = challengeList.length;
                     let startLvl = 80;
                     if (totalExtra > 0) {
                         baseMin = Math.round(startLvl + ((20) * (i / totalExtra)));
                     }
                }

                let diff = 0;
                let baseMax = baseMin;
                if (baseMin < 12) diff = 2;
                else if (baseMin < 30) diff = 3;
                else {
                    let tempDiff = baseMin * 0.1;
                    let avg = (baseMin + baseMin + tempDiff) / 2;
                    diff = Math.floor(avg * 0.1);
                    if (diff > 8) diff = 8;
                }
                baseMax = baseMin + diff;

                let quarter = 1;
                if (isMain && mainChallenges.length > 0) {
                    quarter = Math.ceil(((i + 1) / mainChallenges.length) * 4);
                    if (quarter > 4) quarter = 4;
                } else {
                    quarter = 4;
                }

                if (spawns.length === 0) {
                    routesData.push({
                        "Unlocked at": (i === 0 && isMain && !primaryAdded) ? "" : ((i > 0 && !primaryAdded) ? challengeList[i-1].challengeName : ""),
                        "Challenge": c.challengeName,
                        "Route": areaName,
                        "Route (Secondary)": primaryAdded ? "Yes" : "",
                        "Pokemon Name": "",
                        "First?": "",
                        "Level": "",
                        "Sugested Level": "",
                        "Peer to Peer": "",
                        "% Appearance": "",
                        "% Appearance Ok?": "",
                        "Pokemon/Type Ok?": "",
                        "BST": "",
                        "Pokemon/BST Ok?": "",
                        "Map Ok?": mapCoords[areaName] ? "Yes" : "No",
                        "Will Unlock": unlockStr,
                        "Requisite": reqString(req),
                        "Reward": giftStr
                    });
                } else {
                    let totalChance = 0;
                    const weights = [];
                    let totalWeight = 0;

                    spawns.forEach(s => {
                        totalChance += (s.chance || 0);
                        const pk = pokemonData[s.pokemonId];
                        const bst = getBST(pk);
                        const evoStage = getEvolutionStage(s.pokemonId);
                        const weight = 10000 / (bst * evoStage);
                        weights.push(weight);
                        totalWeight += weight;
                    });

                    let allOk = Math.abs(totalChance - 1) < 0.01;
                    spawns.forEach((s, idx) => {
                        let cPct = s.chance || 0;
                        let suggestedChance = weights[idx] / totalWeight;
                        if (Math.abs(cPct - suggestedChance) > 0.05) {
                            allOk = false;
                        }
                    });

                    spawns.forEach((s, idx) => {
                        const pk = pokemonData[s.pokemonId];
                        if (!pk) return;

                        const pkName = pk.name;
                        routeSpawnedPokemon.add(s.pokemonId);

                        let first = "";
                        if (currentSeen.has(s.pokemonId)) {
                            first = "NONONO";
                        } else {
                            currentSeen.add(s.pokemonId);
                            seenPokemon.add(s.pokemonId);
                        }

                        let bst = getBST(pk);
                        let diffBST = bst - avgBST;

                        let p2p = 0;
                        if (diffBST > 150) p2p = 4;
                        else if (diffBST >= 100) p2p = 2;
                        else if (diffBST >= 50) p2p = 1;
                        else if (diffBST > -50) p2p = 0;
                        else if (diffBST >= -100) p2p = -1;
                        else if (diffBST > -150) p2p = -2;
                        else p2p = -4;

                        let sugMin = baseMin + p2p;
                        let sugMax = baseMax + p2p;
                        if (sugMin < 1) sugMin = 1;
                        if (sugMax < 1) sugMax = 1;

                        let bstOk = "";
                        if (isMain) {
                            if (quarter === 1 && bst > 400) bstOk = "NONONO";
                            if (quarter === 2 && bst > 500) bstOk = "NONONO";
                            if (quarter === 3 && bst < 250) bstOk = "NONONO";
                            if (quarter === 4 && bst < 350) bstOk = "NONONO";
                        }

                        let chancePct = (s.chance || 0);
                        let appOk = !allOk ? (weights[idx] / totalWeight) : "";

                        let typeOk = "";
                        const routeNameLower = areaName.toLowerCase();
                        if ((routeNameLower.includes("sea") || routeNameLower.includes("water") || routeNameLower.includes("lake") || routeNameLower.includes("ocean")) && pk.types.includes("Fire")) {
                            typeOk = "NONONO";
                        }
                        if (routeNameLower.includes("volcano") && pk.types.includes("Water")) {
                            typeOk = "NONONO";
                        }

                        if (encounterCache[pkName.toLowerCase()]) {
                            const locations = encounterCache[pkName.toLowerCase()];

                        let matchableRouteName = routeNameLower;
                        if (region === 6) {
                            if (routeNameLower.includes("aquacorde outskirts")) matchableRouteName = "kalos-route-2";
                            else if (routeNameLower === "route 2") matchableRouteName = "kalos-route-2";
                            else if (routeNameLower === "route 3") matchableRouteName = "kalos-route-3";
                            else if (routeNameLower.includes("santalune outskirts")) matchableRouteName = "kalos-route-3";
                            else if (routeNameLower === "route 4") matchableRouteName = "kalos-route-4";
                            else if (routeNameLower === "route 5") matchableRouteName = "kalos-route-5";
                            else if (routeNameLower === "route 6") matchableRouteName = "kalos-route-6";
                            else if (routeNameLower === "route 7") matchableRouteName = "kalos-route-7";
                            else if (routeNameLower === "route 8") matchableRouteName = "kalos-route-8";
                            else if (routeNameLower === "route 9") matchableRouteName = "kalos-route-9";
                            else if (routeNameLower === "route 10") matchableRouteName = "kalos-route-10";
                            else if (routeNameLower === "route 11") matchableRouteName = "kalos-route-11";
                            else if (routeNameLower === "route 12") matchableRouteName = "kalos-route-12";
                            else if (routeNameLower === "route 13") matchableRouteName = "kalos-route-13";
                            else if (routeNameLower === "route 14") matchableRouteName = "kalos-route-14";
                            else if (routeNameLower === "route 15") matchableRouteName = "kalos-route-15";
                            else if (routeNameLower === "route 16") matchableRouteName = "kalos-route-16";
                            else if (routeNameLower === "route 17") matchableRouteName = "kalos-route-17";
                            else if (routeNameLower === "route 18") matchableRouteName = "kalos-route-18";
                            else if (routeNameLower === "route 19") matchableRouteName = "kalos-route-19";
                            else if (routeNameLower === "route 20") matchableRouteName = "kalos-route-20";
                            else if (routeNameLower === "route 21") matchableRouteName = "kalos-route-21";
                            else if (routeNameLower === "route 22") matchableRouteName = "kalos-route-22";
                            else if (routeNameLower.includes("santalune forest")) matchableRouteName = "santalune-forest";
                            else if (routeNameLower.includes("lumiose south")) matchableRouteName = "kalos-route-4";
                            else if (routeNameLower.includes("lumiose north")) matchableRouteName = "kalos-route-13";
                            else if (routeNameLower.includes("camphrier berry")) matchableRouteName = "kalos-route-5";
                            else if (routeNameLower.includes("connecting cave")) matchableRouteName = "connecting-cave";
                            else if (routeNameLower.includes("ambrette cliffs")) matchableRouteName = "kalos-route-8";
                            else if (routeNameLower.includes("glittering cave")) matchableRouteName = "glittering-cave";
                            else if (routeNameLower.includes("cyllage seaside")) matchableRouteName = "kalos-route-8";
                            else if (routeNameLower.includes("geosenge megalith")) matchableRouteName = "kalos-route-10";
                            else if (routeNameLower.includes("reflection cave")) matchableRouteName = "reflection-cave";
                            else if (routeNameLower.includes("shalour beachfront")) matchableRouteName = "kalos-route-11";
                            else if (routeNameLower.includes("azure deep")) matchableRouteName = "azure-bay";
                            else if (routeNameLower.includes("azure bay isles")) matchableRouteName = "azure-bay";
                            else if (routeNameLower.includes("coumarine seaside")) matchableRouteName = "kalos-route-12";
                            else if (routeNameLower.includes("coumarine docks")) matchableRouteName = "kalos-route-12";
                            else if (routeNameLower.includes("laverre mushroom")) matchableRouteName = "kalos-route-14";
                            else if (routeNameLower.includes("dendemille windmill")) matchableRouteName = "kalos-route-15";
                            else if (routeNameLower.includes("frost cavern")) matchableRouteName = "frost-cavern";
                            else if (routeNameLower.includes("anistar sundial")) matchableRouteName = "kalos-route-17";
                            else if (routeNameLower.includes("couriway cascades")) matchableRouteName = "kalos-route-18";
                            else if (routeNameLower.includes("vallee grande") || routeNameLower.includes("vallée grande")) matchableRouteName = "kalos-route-19";
                            else if (routeNameLower.includes("snowbelle frostwoods")) matchableRouteName = "kalos-route-19";
                            else if (routeNameLower.includes("hidden village")) matchableRouteName = "pokemon-village";
                            else if (routeNameLower.includes("victory road")) matchableRouteName = "kalos-victory-road";
                            else if (routeNameLower.includes("parfum palace")) matchableRouteName = "parfum-palace";
                            else if (routeNameLower.includes("ambrette reef")) matchableRouteName = "kalos-route-8";
                            else if (routeNameLower.includes("cyllage tidepools")) matchableRouteName = "kalos-route-8";
                            else if (routeNameLower.includes("tower of mastery")) matchableRouteName = "tower-of-mastery";
                            else if (routeNameLower.includes("lost hotel")) matchableRouteName = "lost-hotel";
                            else if (routeNameLower.includes("team flare")) matchableRouteName = "team-flare-secret-hq";
                            else if (routeNameLower.includes("terminus cave")) matchableRouteName = "terminus-cave";
                            else if (routeNameLower.includes("pokemon village") || routeNameLower.includes("pokémon village")) matchableRouteName = "pokemon-village";
                            else if (routeNameLower.includes("friend safari")) matchableRouteName = "friend-safari";
                            else if (routeNameLower.includes("sea spirit")) matchableRouteName = "sea-spirit-den";
                        }
                        const normalizedRoute = matchableRouteName.replace(/[^a-z0-9]/g, '');

                            for (const loc of locations) {
                                const normalizedLoc = loc.replace(/[^a-z0-9]/g, '');
                                if (normalizedLoc.includes(normalizedRoute) || normalizedRoute.includes(normalizedLoc)) {
                                    typeOk = "Legacy";
                                    break;
                                }
                            }
                        }

                        routesData.push({
                            "Unlocked at": (i === 0 && isMain && !primaryAdded) ? "" : ((i > 0 && !primaryAdded) ? challengeList[i-1].challengeName : ""),
                            "Challenge": c.challengeName,
                            "Route": areaName,
                            "Route (Secondary)": primaryAdded ? "Yes" : "",
                            "Pokemon Name": pkName,
                            "First?": first,
                            "Level": `${s.minLevel || 1}-${s.maxLevel || 80}`,
                            "Sugested Level": `${sugMin}-${sugMax}`,
                            "Peer to Peer": p2p,
                            "% Appearance": chancePct,
                            "% Appearance Ok?": appOk,
                            "Pokemon/Type Ok?": typeOk,
                            "BST": bst,
                            "Pokemon/BST Ok?": bstOk,
                            "Map Ok?": mapCoords[areaName] ? "Yes" : "No",
                            "Will Unlock": unlockStr,
                            "Requisite": reqString(req),
                            "Reward": giftStr
                        });
                    });
                }

                let sugReq = "";
                let newPkCount = 0;
                let lowAppPk = null;
                let highAppLowBstPk = null;

                if (spawns.length > 0) {
                    spawns.forEach(s => {
                        let cPct = (s.chance || 0);
                        let b = getBST(pokemonData[s.pokemonId]);
                        if (routesData.find(rd => rd["Route"] === areaName && rd["Pokemon Name"] === pokemonData[s.pokemonId].name && rd["First?"] === "")) {
                            newPkCount++;
                            if (cPct > 0.20 && b < 350) highAppLowBstPk = pokemonData[s.pokemonId];
                        }
                        if (cPct < 0.10) lowAppPk = pokemonData[s.pokemonId];
                    });
                }

                if (!primaryAdded) {
                    if (areaName.toLowerCase().includes("gym") || isLeagueOrKey) {
                        sugReq = "Defeat Leader/Champion";
                    } else if (newPkCount > 0) {
                        sugReq = `Catch ${Math.min(newPkCount, 3)} new pokemon`;
                    } else if (highAppLowBstPk) {
                        sugReq = `Catch Rare+ ${highAppLowBstPk.name}`;
                    } else if (lowAppPk) {
                        let n = 150;
                        sugReq = `Defeat ${n} ${lowAppPk.name}`;
                    } else {
                        let n = isMain ? (quarter <= 2 ? 50 : (quarter === 3 ? 150 : 250)) : 300;
                        sugReq = `Defeat ${n} pokemon in route`;
                    }

                    challengesData.push({
                        "Challenge Name": c.challengeName,
                        "Requisite": reqString(req),
                        "Sugestion for Req": sugReq,
                        "Reward Map": unlockStr,
                        "Reward Challenge": "",
                        "Reward Gift": giftStr
                    });
                    primaryAdded = true;
                }
            });
            if (isMain) {
                mainSeenSets[i] = new Set(currentSeen);
            }
        }

        if (isMain) {
            return currentSeen;
        }
    };

    const mainSeenSet = processUnlocks(mainChallenges, true, 0, new Set());
    Object.keys(extraChallenges).sort().forEach(k => {
        let splitSeenSet = new Set(mainSeenSet);
        if (extraChallenges[k].length > 0) {
            const firstExtraReq = extraChallenges[k][0].requirements;
            if (firstExtraReq && firstExtraReq.challenge) {
                const reqName = firstExtraReq.challenge;
                const match = reqName.match(/Challenge\s+(\d+)/);
                if (match) {
                    const idx = parseInt(match[1]) - 1;
                    if (idx >= 0 && idx < mainSeenSets.length) {
                        splitSeenSet = new Set(mainSeenSets[idx]);
                    }
                }
            }
        }
        processUnlocks(extraChallenges[k], false, mainChallenges.length, splitSeenSet);
    });

    // Add remaining maps that haven't been added yet
    const generatedRoutes = new Set(routesData.map(r => r["Route"]));
    const allMapNames = Object.values(mapCoords).map(m => m.name);

    // Also include any route explicitly defined in the routes file, even if it lacks mapCoords
    const allDefinedRoutes = routes.map(r => r.name).filter(Boolean);
    const spotsToProcess = new Set([...allMapNames, ...allDefinedRoutes]);

    spotsToProcess.forEach(mapName => {
        if (!generatedRoutes.has(mapName)) {
            const r = routes.find(ro => ro.name === mapName) || {};
            const spawns = r.spawns || [];

            // Re-check Map Ok because some fallback routes might not have mapCoords
            const mapOkStr = allMapNames.includes(mapName) ? "Yes" : "No";

            let avgBST = 0;
            if (spawns.length > 0) {
                let sumBST = 0;
                let uniqueIds = new Set();
                spawns.forEach(s => {
                    uniqueIds.add(s.pokemonId);
                });
                uniqueIds.forEach(id => {
                    sumBST += getBST(pokemonData[id]);
                });
                avgBST = uniqueIds.size > 0 ? sumBST / uniqueIds.size : 0;
            }

            if (spawns.length === 0) {
                routesData.push({
                    "Unlocked at": "",
                    "Challenge": "",
                    "Route": mapName,
                    "Route (Secondary)": "",
                    "Pokemon Name": "",
                    "First?": "",
                    "Level": "",
                    "Sugested Level": "",
                    "Peer to Peer": "",
                    "% Appearance": "",
                    "% Appearance Ok?": "",
                    "Pokemon/Type Ok?": "",
                    "BST": "",
                    "Pokemon/BST Ok?": "",
                    "Map Ok?": mapOkStr,
                    "Will Unlock": "",
                    "Requisite": "",
                    "Reward": ""
                });
            } else {
                let totalChance = 0;
                const weights = [];
                let totalWeight = 0;

                spawns.forEach(s => {
                    totalChance += (s.chance || 0);
                    const pk = pokemonData[s.pokemonId];
                    const bst = getBST(pk);
                    const evoStage = getEvolutionStage(s.pokemonId);
                    const weight = 10000 / (bst * evoStage);
                    weights.push(weight);
                    totalWeight += weight;
                });

                let allOk = Math.abs(totalChance - 1) < 0.01;
                spawns.forEach((s, idx) => {
                    let cPct = s.chance || 0;
                    let suggestedChance = weights[idx] / totalWeight;
                    if (Math.abs(cPct - suggestedChance) > 0.05) {
                        allOk = false;
                    }
                });

                spawns.forEach((s, idx) => {
                    const pk = pokemonData[s.pokemonId];
                    if (!pk) return;

                    const pkName = pk.name;
                    routeSpawnedPokemon.add(s.pokemonId);

                    let first = "";
                    if (seenPokemon.has(s.pokemonId)) {
                        first = "NONONO";
                    } else {
                        seenPokemon.add(s.pokemonId);
                    }

                    let bst = getBST(pk);
                    let diffBST = bst - avgBST;

                    let p2p = 0;
                    if (diffBST > 150) p2p = 4;
                    else if (diffBST >= 100) p2p = 2;
                    else if (diffBST >= 50) p2p = 1;
                    else if (diffBST > -50) p2p = 0;
                    else if (diffBST >= -100) p2p = -1;
                    else if (diffBST > -150) p2p = -2;
                    else p2p = -4;

                    let baseMin = s.minLevel || 1;
                    let baseMax = s.maxLevel || 100;
                    let sugMin = baseMin + p2p;
                    let sugMax = baseMax + p2p;
                    if (sugMin < 1) sugMin = 1;
                    if (sugMax < 1) sugMax = 1;

                    let bstOk = ""; // No quarter checking for fallback maps

                    let chancePct = (s.chance || 0);
                    let appOk = !allOk ? (weights[idx] / totalWeight) : "";

                    let typeOk = "";
                    const routeNameLower = mapName.toLowerCase();
                    if ((routeNameLower.includes("sea") || routeNameLower.includes("water") || routeNameLower.includes("lake") || routeNameLower.includes("ocean")) && pk.types.includes("Fire")) {
                        typeOk = "NONONO";
                    }
                    if (routeNameLower.includes("volcano") && pk.types.includes("Water")) {
                        typeOk = "NONONO";
                    }

                    if (encounterCache[pkName.toLowerCase()]) {
                        const locations = encounterCache[pkName.toLowerCase()];
                        const normalizedRoute = routeNameLower.replace(/[^a-z0-9]/g, '');
                        for (const loc of locations) {
                            const normalizedLoc = loc.replace(/[^a-z0-9]/g, '');
                            if (normalizedLoc.includes(normalizedRoute) || normalizedRoute.includes(normalizedLoc)) {
                                typeOk = "Legacy";
                                break;
                            }
                        }
                    }

                    routesData.push({
                        "Unlocked at": "",
                        "Challenge": "",
                        "Route": mapName,
                        "Route (Secondary)": "",
                        "Pokemon Name": pkName,
                        "First?": first,
                        "Level": `${s.minLevel || 1}-${s.maxLevel || 80}`,
                        "Sugested Level": `${sugMin}-${sugMax}`,
                        "Peer to Peer": p2p,
                        "% Appearance": chancePct,
                        "% Appearance Ok?": appOk,
                        "Pokemon/Type Ok?": typeOk,
                        "BST": bst,
                        "Pokemon/BST Ok?": bstOk,
                        "Map Ok?": mapOkStr,
                        "Will Unlock": "",
                        "Requisite": "",
                        "Reward": ""
                    });
                });
            }
        }
    });

const missingData = [];

    const getFamilyMissingCount = (id) => {
        let count = 0;
        let queue = [id];
        let visited = new Set();
        let familyIds = new Set();

        let root = id;
        while (evosBackward[root]) {
            root = evosBackward[root];
        }

        queue = [root];
        while (queue.length > 0) {
            let current = queue.shift();
            if (visited.has(current)) continue;
            visited.add(current);
            familyIds.add(parseInt(current));

            if (evosForward[current]) {
                evosForward[current].forEach(next => queue.push(next));
            }
        }

        familyIds.forEach(fid => {
            if (nativeIds.includes(fid) && !routeSpawnedPokemon.has(fid)) {
                count++;
            }
        });

        return count;
    };

    nativeIds.forEach(id => {
        if (!routeSpawnedPokemon.has(id)) {
            const pk = pokemonData[id];
            if (!pk) return;

            let obtainStr = "No";

            const prevId = evosBackward[id];
            if (prevId && routeSpawnedPokemon.has(parseInt(prevId))) {
                obtainStr = "Evolve";
            } else if (prevId) {
                const prevPrevId = evosBackward[prevId];
                if (prevPrevId && routeSpawnedPokemon.has(parseInt(prevPrevId))) {
                    obtainStr = "2xEvolution";
                }
            }

            if (obtainStr === "No") {
                const evos = evosForward[id];
                if (evos) {
                    for (const nextId of evos) {
                        if (routeSpawnedPokemon.has(parseInt(nextId))) {
                            obtainStr = "Breed";
                            break;
                        }
                        const nextNextEvos = evosForward[nextId];
                        if (nextNextEvos) {
                            for (const nn of nextNextEvos) {
                                if (routeSpawnedPokemon.has(parseInt(nn))) {
                                    obtainStr = "2xBreed";
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            if (obtainStr === "No") {
                const count = getFamilyMissingCount(id);
                obtainStr = `No${count}`;
            }

            missingData.push({
                "Pokemon Name": pk.name,
                "Can Obtain?": obtainStr
            });
        }
    });

    const routeSecondaryEmpty = routesData.every(r => !r["Route (Secondary)"]);
    if (routeSecondaryEmpty) {
        routesData.forEach(r => delete r["Route (Secondary)"]);
    }

    const wb = xlsx.utils.book_new();
    const wsRoutes = xlsx.utils.json_to_sheet(routesData);
    xlsx.utils.book_append_sheet(wb, wsRoutes, "Routes");
    const wsChallenges = xlsx.utils.json_to_sheet(challengesData);
    xlsx.utils.book_append_sheet(wb, wsChallenges, "Challenges");
    const wsMissing = xlsx.utils.json_to_sheet(missingData);
    xlsx.utils.book_append_sheet(wb, wsMissing, "Missing PK");

const outFile = path.join(__dirname, '..', 'xdata', `${region.num}_${region.name}_Data.xlsx`);

    // Formatting cols
    const colsRoutes = ["% Appearance", "% Appearance Ok?"];
    const rangeRoutes = xlsx.utils.decode_range(wsRoutes['!ref']);
    for (let c = rangeRoutes.s.c; c <= rangeRoutes.e.c; c++) {
        const header = wsRoutes[xlsx.utils.encode_cell({r: 0, c})];
        if (header && colsRoutes.includes(header.v)) {
            for (let r = 1; r <= rangeRoutes.e.r; r++) {
                const cell = wsRoutes[xlsx.utils.encode_cell({r, c})];
                if (cell && typeof cell.v === 'number') {
                    cell.z = '0%';
                }
            }
        }
    }

    xlsx.writeFile(wb, outFile);
    console.log(`Generated ${outFile}`);
}

(async () => {
    const args = process.argv.slice(2);

    let counterFile = '';
    let counter = 1;
    const xlsxMdPath = path.join(__dirname, '..', 'xlsx.md');
    if (fs.existsSync(xlsxMdPath)) {
        counterFile = fs.readFileSync(xlsxMdPath, 'utf8');
        const counterMatch = counterFile.match(/Last Generation Counter:\s*(\d+)/);
        if (counterMatch) counter = parseInt(counterMatch[1]);
    }

    if (args.length === 0) {
        console.log("Generating data for all regions...");
        for (const region of REGIONS) {
            await processRegion(region, counter);
        }
    } else {
        const regionArg = args[0].toLowerCase();
        const regionToProcess = REGIONS.find(r => r.num.toString() === regionArg || r.name.toLowerCase() === regionArg);

        if (!regionToProcess) {
            console.error(`Error: Region '${args[0]}' not found.`);
            process.exit(1);
        }

        await processRegion(regionToProcess, counter);
    }

    // Increment counter
    if (counterFile) {
        const newCounterFile = counterFile.replace(/Last Generation Counter:\s*\d+/, `Last Generation Counter: ${counter + 1}`);
        fs.writeFileSync(xlsxMdPath, newCounterFile);
    }
})();
