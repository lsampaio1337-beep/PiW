const fs = require('fs');
const xlsx = require('xlsx');

// 1. Read files and extract data
const routesStr = fs.readFileSync('config/sinnohRoutes.js', 'utf8');

// Extract routes
const routesArrayStr = routesStr.substring(routesStr.indexOf('['), routesStr.indexOf('export const sinnohUnlocks = ['));
const sinnohRoutes = eval(`(${routesArrayStr.trim().replace(/;$/, '')})`);

// Extract unlocks/challenges
const unlocksStr = routesStr.substring(routesStr.indexOf('export const sinnohUnlocks = ['));
const unlocksArrayStr = unlocksStr.substring(unlocksStr.indexOf('[')).trim().replace(/;$/, '');
const sinnohUnlocks = eval(`(${unlocksArrayStr})`);

// Extract map coordinates
const mapStr = fs.readFileSync('config/sinnohMapCoordinates.js', 'utf8');
const mapDataStr = mapStr.substring(mapStr.indexOf('{'), mapStr.lastIndexOf('}') + 1);
const mapCoords = eval(`(${mapDataStr.trim()})`);
const mapNames = Object.values(mapCoords).map(c => c.name);

// Extract pokemon data
const pokemonStr = fs.readFileSync('data/pokemon.json', 'utf8');
const pokemonData = JSON.parse(pokemonStr);
const getPokemonById = (id) => pokemonData.find(p => p.id === id);
const getPokemonByName = (name) => pokemonData.find(p => p.name === name);

// Extract pokedex
const dexStr = fs.readFileSync('config/pokedexIndexes.js', 'utf8');
const dexObjStr = dexStr.substring(dexStr.indexOf('{')).replace(/;\s*$/, '');
const dexObj = eval(`(${dexObjStr})`);
const sinnohDexIds = dexObj.regional.sinnoh;

// Helpers
const isMapSpot = (name) => mapNames.includes(name) ? 1 : 0;

const getChallengeUnlockingRoute = (routeName) => {
    const unlockChallenge = sinnohUnlocks.find(c => c.unlocks && c.unlocks.includes(routeName));
    return unlockChallenge ? unlockChallenge.challengeName : "";
};

const formatRequirements = (reqs) => {
    if (!reqs) return "None";
    let parts = [];
    if (reqs.catchSpecies) {
        reqs.catchSpecies.forEach(c => parts.push(`Catch ${c.count} ${c.species}`));
    }
    if (reqs.catchSpeciesByQuality) {
        reqs.catchSpeciesByQuality.forEach(c => parts.push(`Catch ${c.count} ${c.quality} ${c.species}`));
    }
    if (reqs.catchSpeciesAnyOfByQuality) {
        reqs.catchSpeciesAnyOfByQuality.forEach(c => parts.push(`Catch ${c.count} ${c.quality} of [${c.species.join(', ')}]`));
    }
    if (reqs.catchByType) {
        parts.push(`Catch ${reqs.catchByType.count} ${reqs.catchByType.type} type`);
    }
    if (reqs.catchByQualityAndType) {
        parts.push(`Catch ${reqs.catchByQualityAndType.count} ${reqs.catchByQualityAndType.quality} ${reqs.catchByQualityAndType.type} type`);
    }
    if (reqs.earnBadge) {
        parts.push(`Earn ${reqs.earnBadge.name}`);
    }
    if (reqs.defeatCountRoute) {
        parts.push(`Defeat ${reqs.defeatCountRoute.count} on ${reqs.defeatCountRoute.route}`);
    }
    if (reqs.defeatSpecific) {
        parts.push(`Defeat ${reqs.defeatSpecific.count} ${reqs.defeatSpecific.name}`);
    }
    if (reqs.completeChallenges) {
        parts.push(`Complete challenges: ${reqs.completeChallenges.join(', ')}`);
    }
    if (reqs.defeatEliteFourAndChampion) {
        parts.push(`Defeat Elite Four and Champion`);
    }
    return parts.length > 0 ? parts.join(", ") : JSON.stringify(reqs);
};

const formatRewards = (challenge) => {
    let parts = [];
    if (challenge.unlocks && challenge.unlocks.length > 0) {
        parts.push(`Unlocks: ${challenge.unlocks.join(', ')}`);
    }
    if (challenge.gift) {
        parts.push(`Gift: ${challenge.gift.count} ${challenge.gift.item}`);
    }
    if (challenge.gifts) {
        challenge.gifts.forEach(g => parts.push(`Gift: ${g.count} ${g.item}`));
    }
    return parts.length > 0 ? parts.join(", ") : "None";
};

// 2. Generate Sheet 1: Spawns
// Columns: Unlocked ; Route/Place ; Secondary ; Pokemon Name ; Level ; % Appearance ; Map
const sheet1Data = [];
sinnohRoutes.forEach(route => {
    const unlockedBy = getChallengeUnlockingRoute(route.name);
    const inMap = isMapSpot(route.name);

    if (route.spawns && route.spawns.length > 0) {
        route.spawns.forEach(spawn => {
            const pkmn = getPokemonById(spawn.pokemonId);
            sheet1Data.push({
                "Unlocked": unlockedBy,
                "Route/Place": route.name,
                "Secondary": "",
                "Pokemon Name": pkmn ? pkmn.name : `Unknown (${spawn.pokemonId})`,
                "Level": `${spawn.minLevel}-${spawn.maxLevel}`,
                "% Appearance": spawn.chance ? `${(spawn.chance * 100).toFixed(1)}%` : "",
                "Map": inMap
            });
        });
    } else {
        sheet1Data.push({
            "Unlocked": unlockedBy,
            "Route/Place": route.name,
            "Secondary": "",
            "Pokemon Name": "",
            "Level": "",
            "% Appearance": "",
            "Map": inMap
        });
    }
});

// 3. Generate Sheet 2: Challenges
// Columns: Challenge Name ; Requisite ; Reward
const sheet2Data = [];
sinnohUnlocks.forEach(challenge => {
    sheet2Data.push({
        "Challenge Name": challenge.challengeName,
        "Requisite": formatRequirements(challenge.requirements),
        "Reward": formatRewards(challenge)
    });
});

// 4. Generate Sheet 3: Pokemon Availability
// Columns: Pokemon Name ; Can Obtain?
const allSinnohPokemon = sinnohDexIds.map(id => getPokemonById(id)).filter(p => p);

// Map of all directly obtainable pokemon
const obtainableDirectly = new Set();
sinnohRoutes.forEach(route => {
    if (route.spawns) {
        route.spawns.forEach(spawn => {
            obtainableDirectly.add(spawn.pokemonId);
        });
    }
});

const getObtainStatus = (pkmnId) => {
    if (obtainableDirectly.has(pkmnId)) return "Direct";

    // Find who evolves into this
    const evolvesFrom = pokemonData.filter(p => p.evolutions && p.evolutions.some(e => e.to === pkmnId));

    for (const pre of evolvesFrom) {
        if (obtainableDirectly.has(pre.id)) return "Evolve";
    }

    // Check 2x evolution
    for (const pre of evolvesFrom) {
        const preEvolvesFrom = pokemonData.filter(p => p.evolutions && p.evolutions.some(e => e.to === pre.id));
        for (const prePre of preEvolvesFrom) {
            if (obtainableDirectly.has(prePre.id)) return "2xEvolution";
        }
    }

    return "No";
};

const sheet3Data = [];
allSinnohPokemon.forEach(pkmn => {
    if (!obtainableDirectly.has(pkmn.id)) {
        sheet3Data.push({
            "Pokemon Name": pkmn.name,
            "Can Obtain?": getObtainStatus(pkmn.id)
        });
    }
});

// 5. Generate Sheet 4: Route Summary
// Columns: Name of challenge / Route Name / Map?
const sheet4Data = [];
sinnohRoutes.forEach(route => {
    const unlockedBy = getChallengeUnlockingRoute(route.name);
    sheet4Data.push({
        "Name of challenge": unlockedBy,
        "Route Name": route.name,
        "Map?": isMapSpot(route.name)
    });
});


// 6. Write to Excel file
const wb = xlsx.utils.book_new();

const ws1 = xlsx.utils.json_to_sheet(sheet1Data);
xlsx.utils.book_append_sheet(wb, ws1, "Route Place Spawns");

const ws2 = xlsx.utils.json_to_sheet(sheet2Data);
xlsx.utils.book_append_sheet(wb, ws2, "Challenges");

const ws3 = xlsx.utils.json_to_sheet(sheet3Data);
xlsx.utils.book_append_sheet(wb, ws3, "Obtainability");

const ws4 = xlsx.utils.json_to_sheet(sheet4Data);
xlsx.utils.book_append_sheet(wb, ws4, "Route List");

xlsx.writeFile(wb, "4_Sinnoh_Data.xlsx");
console.log("Generated 4_Sinnoh_Data.xlsx successfully.");
