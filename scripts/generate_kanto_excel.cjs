const fs = require('fs');
const xlsx = require('xlsx');

// Read routes.js manually because of the `export` keyword
let routesContent = fs.readFileSync('config/routes.js', 'utf8');
routesContent = routesContent.replace(/export const unlocks = /g, 'const unlocks = ');
routesContent = routesContent.replace(/export \{ routes \};/g, '');
routesContent += '\nmodule.exports = { routes, unlocks };';

fs.writeFileSync('scripts/temp_routes.cjs', routesContent);

const { routes, unlocks } = require('./temp_routes.cjs');

// Read mapCoordinates.js manually because of `export default`
let mapContent = fs.readFileSync('config/mapCoordinates.js', 'utf8');
mapContent = mapContent.replace(/export default mapCoordinates;/g, 'module.exports = mapCoordinates;');
fs.writeFileSync('scripts/temp_map.cjs', mapContent);

const mapCoordinates = require('./temp_map.cjs');

// Read pokemon data
const pokemonDataRaw = fs.readFileSync('data/pokemon.json', 'utf8');
const pokemonData = JSON.parse(pokemonDataRaw);

const pokemonIdMap = {};
for (const p of pokemonData) {
    pokemonIdMap[p.id] = p;
}

// Prepare Sheet 1: Unlocked ; Route/Place ; Secondary ; Pokemon Name ; Level ; % Appearance
const sheet1Data = [];
// Also keep track of spots for sheet 4
const allSpots = new Set();
const unlockMap = {}; // mapping areaId to unlock challenge name

for (const unlock of unlocks) {
    // Collect mapping of what challenge unlocks what route.
    for (const unlockedArea of unlock.unlocks) {
        if (unlockedArea.includes(',')) {
            const parts = unlockedArea.split(',');
            // Example: Route 14,15 -> Route 14 and Route 15
            for (const p of parts) {
                const trimmed = p.trim();
                let areaName = trimmed;
                if (!areaName.startsWith("Route ") && trimmed.match(/^\d+$/)) {
                     areaName = `Route ${trimmed}`;
                }
                unlockMap[areaName] = unlock.challengeName;
            }
        } else {
            unlockMap[unlockedArea.trim()] = unlock.challengeName;
        }
    }
}
// Add starting spots or those that don't have an unlock challenge listed as unlocked
unlockMap["Route 1"] = "Start";
unlockMap["Spot"] = "Start";

// Get all the routes from config/routes.js
for (const route of routes) {
    if (route.name === "Spot") continue; // usually placeholder

    allSpots.add(route.name);

    let unlockedBy = unlockMap[route.name] || "None";

    if (route.spawns && route.spawns.length > 0) {
        for (const spawn of route.spawns) {
            const poke = pokemonIdMap[spawn.pokemonId];
            const pokeName = poke ? poke.name : `Unknown (${spawn.pokemonId})`;
            const levelStr = `${spawn.minLevel}-${spawn.maxLevel}`;
            const appearance = `${Math.round(spawn.chance * 100)}%`;

            sheet1Data.push({
                "Unlocked": unlockedBy,
                "Route/Place": route.name,
                "Secondary": "",
                "Pokemon Name": pokeName,
                "Level": levelStr,
                "% Appearance": appearance
            });
        }
    } else {
        // Spots with no spawns (like Gyms)
        sheet1Data.push({
            "Unlocked": unlockedBy,
            "Route/Place": route.name,
            "Secondary": "",
            "Pokemon Name": "",
            "Level": "",
            "% Appearance": ""
        });
    }
}

// Special spots missing from `routes` but exist in `unlocks` (e.g. Gyms, Daycare, etc)
for (const unlock of unlocks) {
    for (const unlockedArea of unlock.unlocks) {
        let areaNames = [unlockedArea];
        if (unlockedArea.includes(',')) {
            areaNames = [];
            const parts = unlockedArea.split(',');
            let prefix = "";
            if (parts[0].startsWith("Route ")) prefix = "Route ";
            for (let i=0; i<parts.length; i++) {
                let trimmed = parts[i].trim();
                if (i > 0 && prefix && trimmed.match(/^\d+$/)) {
                     areaNames.push(prefix + trimmed);
                } else {
                     areaNames.push(trimmed);
                }
            }
        }

        for (const a of areaNames) {
            if (!allSpots.has(a) && a !== "New Region to Travel" && a !== "Key for Indigo Summit" && a !== "Extra Challenge B") {
                allSpots.add(a);
                sheet1Data.push({
                    "Unlocked": unlock.challengeName,
                    "Route/Place": a,
                    "Secondary": "",
                    "Pokemon Name": "",
                    "Level": "",
                    "% Appearance": ""
                });
            }
        }
    }
}

// Prepare Sheet 2: Challenge Name ; Requisite ; Reward
function formatRequirement(req) {
    const parts = [];
    if (req.defeatCountRoute) {
        parts.push(`Defeat ${req.defeatCountRoute.count} Pokemon on ${req.defeatCountRoute.route}`);
    }
    if (req.catchSpecies) {
        const catchStrs = req.catchSpecies.map(s => `Catch ${s.count} ${s.species}`);
        parts.push(catchStrs.join(', '));
    }
    if (req.catchSpeciesByQuality) {
        const catchStrs = req.catchSpeciesByQuality.map(s => `Catch ${s.count} ${s.species} (${s.quality} quality)`);
        parts.push(catchStrs.join(', '));
    }
    if (req.catchSpeciesAnyOfByQuality) {
        const catchStrs = req.catchSpeciesAnyOfByQuality.map(s => `Catch ${s.count} of ${s.species.join(' or ')} (${s.quality} quality)`);
        parts.push(catchStrs.join(', '));
    }
    if (req.catchByQualityAndType) {
        parts.push(`Catch ${req.catchByQualityAndType.count} ${req.catchByQualityAndType.type}-type Pokemon (${req.catchByQualityAndType.quality} quality)`);
    }
    if (req.catchByType) {
        parts.push(`Catch ${req.catchByType.count} ${req.catchByType.type}-type Pokemon`);
    }
    if (req.earnBadge) {
        parts.push(`Earn ${req.earnBadge.name} from ${req.earnBadge.leader}`);
    }
    if (req.defeatSpecific) {
        parts.push(`Defeat ${req.defeatSpecific.count} ${req.defeatSpecific.name}`);
    }
    if (req.defeatEliteFourAndChampion) {
        parts.push(`Defeat the Elite Four and Champion`);
    }
    if (req.catchEachFromSlotMachine) {
        const slots = req.catchEachFromSlotMachine.machines.map(m => `[${m.join(', ')}]`).join(', ');
        parts.push(`Catch each from slot machine: ${slots}`);
    }
    if (req.catchSpeciesUniqueCount) {
        parts.push(`Catch ${req.catchSpeciesUniqueCount} unique species`);
    }
    if (req.completeChallenges) {
        parts.push(`Complete challenges: ${req.completeChallenges.join(', ')}`);
    }

    return parts.join(' AND ');
}

function formatReward(unlock) {
    const rewards = [];
    if (unlock.unlocks && unlock.unlocks.length > 0) {
        rewards.push(`Unlocks ${unlock.unlocks.join(', ')}`);
    }
    if (unlock.gift) {
        rewards.push(`Gift: ${unlock.gift.count} ${unlock.gift.item}`);
    }
    return rewards.join(', ');
}

const sheet2Data = [];

for (const unlock of unlocks) {
    const requisite = formatRequirement(unlock.requirements || {});
    const reward = formatReward(unlock);

    sheet2Data.push({
        "Challenge Name": unlock.challengeName,
        "Requisite": requisite,
        "Reward": reward
    });
}

// Prepare Sheet 3: Pokemon Name ; Can Obtain?

// Build pokedexIndexes dynamically to avoid module issue
let pokedexIndexesContent = fs.readFileSync('config/pokedexIndexes.js', 'utf8');
pokedexIndexesContent = pokedexIndexesContent.replace(/export const pokedexIndexes = /g, 'const pokedexIndexes = ');
pokedexIndexesContent += '\nmodule.exports = { pokedexIndexes };';
fs.writeFileSync('scripts/temp_pokedex.cjs', pokedexIndexesContent);
const { pokedexIndexes } = require('./temp_pokedex.cjs');

let kantoIndexes = [];
if (pokedexIndexes && pokedexIndexes.regional && pokedexIndexes.regional.kanto) {
    kantoIndexes = pokedexIndexes.regional.kanto;
} else {
    for (let i = 1; i <= 151; i++) kantoIndexes.push(i);
}

const spawnedPokemonIds = new Set();
for (const route of routes) {
    if (route.spawns) {
        for (const s of route.spawns) {
            spawnedPokemonIds.add(s.pokemonId);
        }
    }
}

const sheet3Data = [];

for (const id of kantoIndexes) {
    if (spawnedPokemonIds.has(id)) continue;

    let canObtain = "No";
    let isReachable1Step = false;
    for (const parent of pokemonData) {
        if (!kantoIndexes.includes(parent.id)) continue;
        if (!spawnedPokemonIds.has(parent.id)) continue;

        if (parent.evolutions) {
            for (const ev of parent.evolutions) {
                const targetId = ev.to || ev.id;
                if (targetId === id) {
                    isReachable1Step = true;
                    break;
                }
            }
        }
        if (isReachable1Step) break;
    }

    if (isReachable1Step) {
        canObtain = "Evolve";
    } else {
        let isReachable2Step = false;
        for (const gp of pokemonData) {
            if (!kantoIndexes.includes(gp.id)) continue;
            if (!spawnedPokemonIds.has(gp.id)) continue;

            if (gp.evolutions) {
                for (const ev1 of gp.evolutions) {
                    const midId = ev1.to || ev1.id;
                    const midPoke = pokemonIdMap[midId];
                    if (midPoke && midPoke.evolutions) {
                        for (const ev2 of midPoke.evolutions) {
                            const targetId = ev2.to || ev2.id;
                            if (targetId === id) {
                                isReachable2Step = true;
                                break;
                            }
                        }
                    }
                    if (isReachable2Step) break;
                }
            }
            if (isReachable2Step) break;
        }

        if (isReachable2Step) {
            canObtain = "2xEvolution";
        }
    }

    const pName = pokemonIdMap[id] ? pokemonIdMap[id].name : `Unknown (${id})`;
    sheet3Data.push({
        "Pokemon Name": pName,
        "Can Obtain?": canObtain
    });
}

// Prepare Sheet 4: Name of challenge / Route Name / Map?
const sheet4Data = [];
const mapNormalized = new Set();
for (const key in mapCoordinates) {
    if (mapCoordinates.hasOwnProperty(key)) {
        mapNormalized.add(mapCoordinates[key].name.toLowerCase());
    }
}

const sortedSpots = Array.from(allSpots).sort();

for (const routeName of sortedSpots) {
    let unlockedBy = unlockMap[routeName] || "Start";
    let isMap = mapNormalized.has(routeName.toLowerCase()) ? 1 : 0;

    if (routeName === "Kanto Pokemon League") {
        isMap = mapNormalized.has("kanto pokemon league") || mapNormalized.has("indigo plateau") ? 1 : 0;
    }

    sheet4Data.push({
        "Name of challenge": unlockedBy,
        "Route Name": routeName,
        "Map?": isMap
    });
}

const wb = xlsx.utils.book_new();

const ws1 = xlsx.utils.json_to_sheet(sheet1Data);
xlsx.utils.book_append_sheet(wb, ws1, "Sheet1");

const ws2 = xlsx.utils.json_to_sheet(sheet2Data);
xlsx.utils.book_append_sheet(wb, ws2, "Sheet2");

const ws3 = xlsx.utils.json_to_sheet(sheet3Data);
xlsx.utils.book_append_sheet(wb, ws3, "Sheet3");

const ws4 = xlsx.utils.json_to_sheet(sheet4Data);
xlsx.utils.book_append_sheet(wb, ws4, "Sheet4");

xlsx.writeFile(wb, "1_Kanto_Data.xlsx");

// cleanup
fs.unlinkSync('scripts/temp_routes.cjs');
fs.unlinkSync('scripts/temp_map.cjs');
fs.unlinkSync('scripts/temp_pokedex.cjs');
