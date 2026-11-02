const fs = require('fs');
const xlsx = require('xlsx');

const REGIONS = [
  { id: 1, name: 'Kanto', file: 'routes.js', exportUnlocks: 'unlocks', dexKey: 'kanto' },
  { id: 2, name: 'Johto', file: 'johtoRoutes.js', exportUnlocks: 'johtoUnlocks', exportRoutes: 'johtoRoutes', dexKey: 'johto' },
  { id: 3, name: 'Hoenn', file: 'hoennRoutes.js', exportUnlocks: 'hoennUnlocks', exportRoutes: 'hoennRoutes', dexKey: 'hoenn' },
  { id: 4, name: 'Sinnoh', file: 'sinnohRoutes.js', exportUnlocks: 'sinnohUnlocks', exportRoutes: 'sinnohRoutes', dexKey: 'sinnoh' },
  { id: 5, name: 'Unova', file: 'unovaRoutes.js', exportUnlocks: 'unovaUnlocks', exportRoutes: 'unovaRoutes', dexKey: 'unova' },
  { id: 6, name: 'Kalos', file: 'kalosRoutes.js', exportUnlocks: 'kalosUnlocks', exportRoutes: 'kalosRoutes', dexKey: 'kalos' },
  { id: 7, name: 'Alola', file: 'alolaRoutes.js', exportUnlocks: 'alolaUnlocks', exportRoutes: 'alolaRoutes', dexKey: 'alola' },
  { id: 8, name: 'Galar', file: 'galarRoutes.js', exportUnlocks: 'galarUnlocks', exportRoutes: 'galarRoutes', dexKey: 'galar' },
  { id: 9, name: 'Hisui', file: 'hisuiRoutes.js', exportUnlocks: 'hisuiUnlocks', exportRoutes: 'hisuiRoutes', dexKey: 'hisui' },
  { id: 10, name: 'Paldea', file: 'paldeaRoutes.js', exportUnlocks: 'paldeaUnlocks', exportRoutes: 'paldeaRoutes', dexKey: 'paldea' },
];

function requireESMAsCJS(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');
  content = content.replace(/export\s+const\s+/g, 'exports.');
  content = content.replace(/export\s+default\s+/g, 'exports.default = ');
  content = content.replace(/export\s+\{([^}]+)\}/g, (match, p1) => {
    return p1.split(',').map(name => `exports.${name.trim()} = ${name.trim()};`).join('\n');
  });
  content = content.replace(/import\s+.*?from\s+['"].*?['"];?/g, '');

  const m = { exports: {} };
  const wrapper = Function('exports', 'module', content);
  wrapper(m.exports, m);
  return m.exports;
}

const pokemonDataRaw = JSON.parse(fs.readFileSync('./data/pokemon.json', 'utf8'));
const pokemonData = {};
pokemonDataRaw.forEach(p => {
    pokemonData[p.id] = p;
});

const pokedexIndexesRaw = requireESMAsCJS('./config/pokedexIndexes.js').pokedexIndexes;

const evolutionParents = {};
for (const p of pokemonDataRaw) {
    if (p.evolutions) {
        for (const evo of p.evolutions) {
            evolutionParents[evo.to] = p.id;
        }
    }
}

function calculateBST(pokemonId) {
    const p = pokemonData[pokemonId];
    if (!p) return 0;
    return (p.hp || 0) + (p.atk || 0) + (p.def || 0) + (p.spa || 0) + (p.spd || 0) + (p.spe || 0);
}

function formatChallengeReqs(reqs) {
    if (!reqs) return "";
    let str = "";
    if (reqs.defeatCountRoute) str += `Defeat ${reqs.defeatCountRoute.count} on ${reqs.defeatCountRoute.route}. `;
    if (reqs.catchSpecies) {
        str += "Catch: " + reqs.catchSpecies.map(s => `${s.count}x ${s.species}`).join(', ') + ". ";
    }
    if (reqs.catchSpeciesAnyOf) {
        str += "Catch Any: " + reqs.catchSpeciesAnyOf.map(sList => sList.map(s => `${s.count}x ${s.species}`).join(' or ')).join(', ') + ". ";
    }
    if (reqs.catchSpeciesByQuality) {
        str += "Catch (Quality): " + reqs.catchSpeciesByQuality.map(s => `${s.count}x ${s.species} (${s.quality})`).join(', ') + ". ";
    }
    if (reqs.catchByQualityAndType) {
        str += `Catch ${reqs.catchByQualityAndType.count}x ${reqs.catchByQualityAndType.type} (${reqs.catchByQualityAndType.quality}). `;
    }
    if (reqs.earnBadge) {
        str += `Earn ${reqs.earnBadge.name} (${reqs.earnBadge.leader}). `;
    }
    if (reqs.catchByType) {
         str += `Catch ${reqs.catchByType.count}x ${reqs.catchByType.type}. `;
    }
    if (reqs.defeatEliteFourAndChampion) {
        str += `Defeat E4 & Champion. `;
    }
    if (reqs.defeatSpecific) {
        str += `Defeat ${reqs.defeatSpecific.count}x ${reqs.defeatSpecific.name}. `;
    }
    if (reqs.catchSpeciesUniqueCount) {
        str += `Catch ${reqs.catchSpeciesUniqueCount} unique species. `;
    }
    if (reqs.completeChallenges) {
        str += `Complete: ${reqs.completeChallenges.join(', ')}. `;
    }
    return str.trim();
}

function classifyChallenge(name) {
    if (!name) return 'other';
    if (name.startsWith('Challenge')) return 'main';
    if (name.startsWith('Extra Challenge')) return 'extra';
    return 'other';
}

function getBaseLevelIntervalMin(minLevel, maxLevel) {
    let diff = 2;
    if (minLevel >= 30) {
        diff = Math.min(8, Math.floor(minLevel * 0.1));
    } else if (minLevel >= 12) {
        diff = 3;
    }
    return [minLevel, minLevel + diff];
}

function getAppOk(chance, bst) {
    if (bst >= 550 && chance > 0.05) return "2%"; // suggest 2%
    if (bst < 300 && chance < 0.15) return "20%"; // suggest 20%
    return "";
}

function getTypeOk(pd, routeName) {
    let typeOk = "Yes";
    const routeNameLower = routeName.toLowerCase();
    const types = pd.types || [];
    if (routeNameLower.includes("sea") || routeNameLower.includes("water") || routeNameLower.includes("ocean") || routeNameLower.includes("lake")) {
        if (!types.includes("Water") && !types.includes("Flying")) typeOk = "NONONO";
    }
    if (routeNameLower.includes("volcano") || routeNameLower.includes("magma") || routeNameLower.includes("fire")) {
        if (!types.includes("Fire") && !types.includes("Rock") && !types.includes("Ground")) typeOk = "NONONO";
    }
    if (routeNameLower.includes("forest") || routeNameLower.includes("woods")) {
        if (!types.includes("Bug") && !types.includes("Grass") && !types.includes("Poison") && !types.includes("Flying") && !types.includes("Fairy")) typeOk = "NONONO";
    }
    return typeOk;
}

function getSuggestion(u, route, bstQuarter, isFirsts, newTypes, lowChances, highChancesLowBst) {
    let baseReq = 50;
    if (bstQuarter === 1) baseReq = 25;
    if (bstQuarter === 2) baseReq = 100;
    if (bstQuarter === 3) baseReq = 150;
    if (bstQuarter === 4) baseReq = 200;
    if (bstQuarter >= 5) baseReq = 300;

    if (u.areaId.includes("Gym") || u.areaId.includes("Dojo") || u.areaId.includes("Team") || u.areaId.includes("Tower") || u.areaId.includes("Mansion")) {
        return `Defeat Gym Leader/Boss`;
    }
    if (u.areaId.includes("League") || u.areaId.includes("Victory Road") || u.areaId.includes("Champion")) {
        return `Win Pokemon League`;
    }

    if (!route || !route.spawns || route.spawns.length === 0) {
        return `Defeat Gym Leader/Boss`;
    }

    const reasonableFirsts = isFirsts.filter(s => s.chance >= 0.05 && s.bst < 500);
    if (reasonableFirsts.length > 0) {
        let countToCatch = Math.min(3, reasonableFirsts.length);
        const toCatch = reasonableFirsts.slice(0, countToCatch).map(s => s.name);
        return `Catch: ${toCatch.join(', ')}`;
    }

    if (highChancesLowBst.length > 0) {
        return `Catch ${highChancesLowBst[0].name} (Rare/Epic/Weak)`;
    }

    if (lowChances.length > 0) {
        const target = lowChances[0];
        const chance = Math.max(0.01, target.chance);
        const amount = Math.floor(100 * chance);
        return `Defeat ${Math.max(1, amount)}x ${target.name} (force 100 encounters)`;
    }

    if (newTypes.length > 0) {
        return `Defeat ${baseReq}x ${newTypes[0]} type`;
    }

    return `Defeat ${baseReq} pokemon on route`;
}

function generateRegionData() {
    for (const region of REGIONS) {
        console.log(`Generating data for ${region.name}...`);

        let mapCoords = {};
        const mapCoordsFile = `./config/${region.name.toLowerCase()}MapCoordinates.js`;
        if (region.name === 'Kanto') {
            const exported = requireESMAsCJS('./config/mapCoordinates.js');
            mapCoords = exported.mapCoordinates || exported.default || {};
        } else if (fs.existsSync(mapCoordsFile)) {
            const exported = requireESMAsCJS(mapCoordsFile);
            mapCoords = exported[`${region.name.toLowerCase()}MapCoordinates`] || exported.default || {};
        }

        const mapCoordsByName = {};
        for (const key in mapCoords) {
            if (mapCoords[key].name) {
                mapCoordsByName[mapCoords[key].name] = true;
            }
        }

        const routeData = requireESMAsCJS(`./config/${region.file}`);
        let routesArray = routeData[region.exportRoutes || 'routes'] || routeData.routes;
        const unlocksArray = routeData[region.exportUnlocks || 'unlocks'] || routeData.unlocks || [];

        if (region.name === 'Hisui' && !Array.isArray(routesArray)) {
            const arr = [];
            for (const [key, val] of Object.entries(routesArray)) {
                arr.push({
                    name: key,
                    spawns: val.pokes?.map(p => ({
                        pokemonId: p.id,
                        minLevel: p.minLevel,
                        maxLevel: p.maxLevel,
                        chance: p.probability
                    })) || []
                });
            }
            routesArray = arr;
        }

        const routeMap = {};
        routesArray.forEach(r => routeMap[r.name] = r);

        const unlockMap = {};
        unlocksArray.forEach(u => unlockMap[u.areaId] = u);

        const mainChallenges = [];
        const extraChallenges = {};
        const otherChallenges = [];

        let currentMainChallengeCount = 0;
        unlocksArray.forEach(u => {
            if (u.challengeName && u.challengeName.startsWith('Challenge ')) {
                currentMainChallengeCount++;
            }
        });

        unlocksArray.forEach(u => {
            const classification = classifyChallenge(u.challengeName);
            if (classification === 'main') {
                mainChallenges.push(u);
            } else if (classification === 'extra') {
                const chainMatch = u.challengeName.match(/Extra Challenge ([A-Z])/);
                if (chainMatch) {
                    const chain = chainMatch[1];
                    if (!extraChallenges[chain]) extraChallenges[chain] = [];
                    extraChallenges[chain].push(u);
                } else if (u.challengeName === 'Extra Challenge B' || u.challengeName.startsWith('Extra Challenge')) {
                     const fb = 'B';
                     if (!extraChallenges[fb]) extraChallenges[fb] = [];
                     extraChallenges[fb].push(u);
                } else {
                     otherChallenges.push(u);
                }
            } else {
                otherChallenges.push(u);
            }
        });

        mainChallenges.sort((a, b) => {
            const numA = parseInt(a.challengeName.replace('Challenge ', ''));
            const numB = parseInt(b.challengeName.replace('Challenge ', ''));
            return numA - numB;
        });

        for (const chain in extraChallenges) {
            extraChallenges[chain].sort((a, b) => {
                const matchA = a.challengeName.match(/Extra Challenge [A-Z] (\d+)/);
                const matchB = b.challengeName.match(/Extra Challenge [A-Z] (\d+)/);
                const numA = matchA ? parseInt(matchA[1]) : 0;
                const numB = matchB ? parseInt(matchB[1]) : 0;
                return numA - numB;
            });
        }

        const fullOrder = [...mainChallenges];
        for (const chain in extraChallenges) {
            fullOrder.push(...extraChallenges[chain]);
        }
        fullOrder.push(...otherChallenges);

        const chainSplitIndex = {};
        for (const chain in extraChallenges) {
            chainSplitIndex[chain] = currentMainChallengeCount;
            const firstExtra = extraChallenges[chain][0];
            for (let i = 0; i < mainChallenges.length; i++) {
                if (mainChallenges[i].unlocks && mainChallenges[i].unlocks.includes(firstExtra.areaId)) {
                    chainSplitIndex[chain] = i + 1;
                    break;
                }
            }
        }

        const rutesRows = [];
        const challengesRows = [];
        let mainIndex = 0;

        const mainEncounteredSteps = [new Set()];
        const allTypesEncountered = new Set();

        for (const u of mainChallenges) {
            const prevSet = mainEncounteredSteps[mainEncounteredSteps.length - 1];
            const currentSet = new Set(prevSet);
            const route = routeMap[u.areaId];
            if (route && route.spawns) {
                route.spawns.forEach(s => {
                    const pd = pokemonData[s.pokemonId];
                    if (pd) currentSet.add(pd.name);
                });
            }
            mainEncounteredSteps.push(currentSet);
        }

        const globalEncountered = new Set(mainEncounteredSteps[mainEncounteredSteps.length - 1]);
        const extraEncounteredState = {};
        for(const chain in extraChallenges) {
            const splitIdx = Math.min(chainSplitIndex[chain], mainEncounteredSteps.length - 1);
            extraEncounteredState[chain] = new Set(mainEncounteredSteps[splitIdx]);
        }

        for (let challengeIdx = 0; challengeIdx < fullOrder.length; challengeIdx++) {
            const u = fullOrder[challengeIdx];
            const routeName = u.areaId;
            const route = routeMap[routeName];

            let chain = 'other';
            let currentEncounterSet = globalEncountered;

            if (classifyChallenge(u.challengeName) === 'main') {
                chain = 'main';
                mainIndex++;
                currentEncounterSet = mainEncounteredSteps[mainIndex - 1];
            } else if (classifyChallenge(u.challengeName) === 'extra') {
                const m = u.challengeName.match(/Extra Challenge ([A-Z])/);
                if(m) {
                    chain = m[1];
                } else {
                    chain = 'B';
                }
                currentEncounterSet = extraEncounteredState[chain];
            }

            const bstQuarter = chain === 'main' ? Math.ceil((mainIndex / currentMainChallengeCount) * 4) : 5;
            const bstQuarterForType = chain === 'main' ? bstQuarter : 5;

            const isFirsts = [];
            const newTypes = [];
            const lowChances = [];
            const highChancesLowBst = [];

            if (!route || !route.spawns || route.spawns.length === 0) {
                rutesRows.push({
                    "Unlocked at": u.challengeName,
                    "Challenge": u.challengeName,
                    "Route": routeName,
                    "Route (Secondary)": "",
                    "Pokemon Name": "",
                    "First?": "",
                    "Level": "",
                    "Sugested Level": "",
                    "% Appearance": "",
                    "% Appearance Ok?": "",
                    "Pokemon/Type Ok?": "",
                    "BST": "",
                    "Pokemon/BST Ok?": "",
                    "Map Ok?": mapCoordsByName[routeName] ? "Yes" : "",
                    "Will Unlock": (u.unlocks && u.unlocks.length > 0) ? u.unlocks.join(', ') : "",
                    "Requisite": formatChallengeReqs(u.requirements),
                    "Reward": u.gift ? (u.gift.item ? `${u.gift.count}x ${u.gift.item}` : JSON.stringify(u.gift)) : ""
                });
            } else {
                let totalBst = 0;
                let spawnCount = 0;
                route.spawns.forEach(s => {
                    totalBst += calculateBST(s.pokemonId);
                    spawnCount++;
                });
                const meanBst = spawnCount > 0 ? totalBst / spawnCount : 0;

                route.spawns.forEach(s => {
                    const pd = pokemonData[s.pokemonId];
                    if (!pd) return;
                    const bst = calculateBST(s.pokemonId);

                    let isFirst = !currentEncounterSet.has(pd.name);

                    if (isFirst) {
                        isFirsts.push({ name: pd.name, bst: bst, chance: s.chance });
                        pd.types.forEach(t => {
                            if (!allTypesEncountered.has(t)) {
                                newTypes.push(t);
                                allTypesEncountered.add(t);
                            }
                        });
                    }
                    if (s.chance <= 0.10) {
                        lowChances.push({ name: pd.name, chance: s.chance });
                    }
                    if (s.chance >= 0.20 && bst <= 350) {
                        highChancesLowBst.push({ name: pd.name });
                    }

                    currentEncounterSet.add(pd.name);
                    if (chain === 'other') globalEncountered.add(pd.name);

                    const diff = bst - meanBst;
                    let levelMod = 0;
                    if (diff > 150) levelMod = 4;
                    else if (diff >= 100) levelMod = 2;
                    else if (diff >= 50) levelMod = 1;
                    else if (diff > -50) levelMod = 0;
                    else if (diff >= -100) levelMod = -1;
                    else if (diff >= -150) levelMod = -2;
                    else levelMod = -4;

                    let baseMin = 1;
                    let maxProgressionLevel = (chain === 'main') ? 80 : 100;

                    if (chain === 'main') {
                        baseMin = Math.max(1, Math.floor((mainIndex / currentMainChallengeCount) * maxProgressionLevel));
                    } else if (chain !== 'other') {
                        const extraChallengesList = extraChallenges[chain];
                        const idxInChain = extraChallengesList.indexOf(u);
                        const splitIdx = Math.min(chainSplitIndex[chain], currentMainChallengeCount);
                        const startLvl = Math.max(1, Math.floor((splitIdx / currentMainChallengeCount) * 80));
                        const extraCount = extraChallengesList.length;
                        if (extraCount > 0) {
                             baseMin = startLvl + Math.floor(((idxInChain + 1) / extraCount) * (100 - startLvl));
                        } else {
                             baseMin = 100;
                        }
                    } else {
                        baseMin = 100;
                    }

                    // Ignore scaling if already over 100
                    let [adjMin, adjMax] = s.minLevel > 100 ? [s.minLevel, s.maxLevel] : getBaseLevelIntervalMin(baseMin, baseMin + 5);

                    if (s.minLevel <= 100) {
                        adjMin += levelMod;
                        adjMax += levelMod;
                        adjMin = Math.max(1, adjMin);
                        adjMax = Math.max(1, adjMax);
                    }

                    let bstOk = "";
                    if (chain === 'main') {
                        if (bstQuarter === 1 && bst > 400) bstOk = "NONONO";
                        else if (bstQuarter === 2 && bst > 500) bstOk = "NONONO";
                        else if (bstQuarter === 3 && bst < 250) bstOk = "NONONO";
                        else if (bstQuarter === 4 && bst < 350) bstOk = "NONONO";
                    }

                    rutesRows.push({
                        "Unlocked at": u.challengeName,
                        "Challenge": u.challengeName,
                        "Route": routeName,
                        "Route (Secondary)": "",
                        "Pokemon Name": pd.name,
                        "First?": isFirst ? "" : "NONONO",
                        "Level": `${s.minLevel}-${s.maxLevel}`,
                        "Sugested Level": `${adjMin}-${adjMax}`,
                        "% Appearance": s.chance,
                        "% Appearance Ok?": getAppOk(s.chance, bst),
                        "Pokemon/Type Ok?": getTypeOk(pd, routeName),
                        "BST": bst,
                        "Pokemon/BST Ok?": bstOk,
                        "Map Ok?": mapCoordsByName[routeName] ? "Yes" : "",
                        "Will Unlock": (u.unlocks && u.unlocks.length > 0) ? u.unlocks.join(', ') : "",
                        "Requisite": formatChallengeReqs(u.requirements),
                        "Reward": u.gift ? (u.gift.item ? `${u.gift.count}x ${u.gift.item}` : JSON.stringify(u.gift)) : ""
                    });
                });
            }

            // Reward Challenge calculation
            let rewardChallenge = "";
            if (u.unlocks && u.unlocks.length > 0) {
                // Find what challenge unlocks this map
                // In fullOrder, look for the first challenge that has this unlocked areaId
                for (const area of u.unlocks) {
                    const nextChallenge = fullOrder.find(c => c.areaId === area);
                    if (nextChallenge) {
                        rewardChallenge += (rewardChallenge ? ", " : "") + nextChallenge.challengeName;
                    }
                }
            }

            challengesRows.push({
                "Challenge Name": u.challengeName,
                "Requisite": formatChallengeReqs(u.requirements),
                "Sugestion for Req": getSuggestion(u, route, bstQuarterForType, isFirsts, newTypes, lowChances, highChancesLowBst),
                "Reward Map": (u.unlocks && u.unlocks.length > 0) ? u.unlocks.join(', ') : "",
                "Reward Challenge": rewardChallenge,
                "Reward Gift": u.gift ? (u.gift.item ? `${u.gift.count}x ${u.gift.item}` : JSON.stringify(u.gift)) : ""
            });
        }

        const missingRows = [];
        const dexIndexes = pokedexIndexesRaw[region.dexKey];
        if (dexIndexes) {
             const allRoutePokemonIds = new Set();
             if (routesArray) {
                 routesArray.forEach(r => {
                     if (r.spawns) {
                         r.spawns.forEach(s => allRoutePokemonIds.add(s.pokemonId));
                     }
                 });
             }

             for (let i = 0; i < dexIndexes.length; i++) {
                 const pId = dexIndexes[i];
                 if (!allRoutePokemonIds.has(pId)) {
                     const pd = pokemonData[pId];
                     if (!pd) continue;

                     let obtainMethod = "No";
                     let evosCount = 0;
                     let currentId = pId;

                     while (evolutionParents[currentId]) {
                         currentId = evolutionParents[currentId];
                         evosCount++;
                         if (allRoutePokemonIds.has(currentId)) {
                             obtainMethod = evosCount === 1 ? "Evolve" : `${evosCount}xEvolution`;
                             break;
                         }
                     }

                     if (obtainMethod === "No" && pd.evolutions && pd.evolutions.length > 0) {
                          for(const evo of pd.evolutions) {
                              if (allRoutePokemonIds.has(evo.to)) {
                                  obtainMethod = "Breed";
                                  break;
                              }
                          }
                     }

                     if (obtainMethod === "No") {
                         if (i + 1 < dexIndexes.length) {
                             const nextId = dexIndexes[i+1];
                             if (evolutionParents[nextId] === pId || (pd.evolutions && pd.evolutions.find(e => e.to === nextId))) {
                                 obtainMethod = "No Next";
                             }
                         }
                     }

                     missingRows.push({
                         "Pokemon Name": pd.name,
                         "Can Obtain?": obtainMethod
                     });
                 }
             }
        }

        const wb = xlsx.utils.book_new();

        const wsRutes = xlsx.utils.json_to_sheet(rutesRows);
        const range = xlsx.utils.decode_range(wsRutes['!ref']);
        for(let R = range.s.r; R <= range.e.r; ++R) {
            const cellRef = xlsx.utils.encode_cell({c: 8, r: R});
            if(!wsRutes[cellRef]) continue;
            if(typeof wsRutes[cellRef].v === 'number') {
                wsRutes[cellRef].z = '0%';
            }
        }
        xlsx.utils.book_append_sheet(wb, wsRutes, "Rutes");

        const wsChallenges = xlsx.utils.json_to_sheet(challengesRows);
        xlsx.utils.book_append_sheet(wb, wsChallenges, "Challenges");

        const wsMissing = xlsx.utils.json_to_sheet(missingRows);
        xlsx.utils.book_append_sheet(wb, wsMissing, "Missing PK");

        xlsx.writeFile(wb, `${region.id}_${region.name}_Data.xlsx`);
        console.log(`Generated ${region.id}_${region.name}_Data.xlsx`);
    }
}

generateRegionData();
