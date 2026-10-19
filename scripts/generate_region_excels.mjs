import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import vm from 'vm';

function loadModule(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/export const/g, 'const').replace(/export {/g, '// export {').replace(/export default/g, 'const defaultExport =');
    const sandbox = {};
    const script = new vm.Script(content + '\n; this.routes = typeof routes !== "undefined" ? routes : undefined; this.johtoRoutes = typeof johtoRoutes !== "undefined" ? johtoRoutes : undefined; this.hoennRoutes = typeof hoennRoutes !== "undefined" ? hoennRoutes : undefined; this.unlocks = typeof unlocks !== "undefined" ? unlocks : undefined; this.johtoUnlocks = typeof johtoUnlocks !== "undefined" ? johtoUnlocks : undefined; this.hoennUnlocks = typeof hoennUnlocks !== "undefined" ? hoennUnlocks : undefined;');
    const context = vm.createContext(sandbox);
    script.runInContext(context);
    return sandbox;
}

const pokemonData = JSON.parse(fs.readFileSync('./data/pokemon.json', 'utf8'));
const pokemonMap = {};
pokemonData.forEach(p => {
    pokemonMap[p.id] = p.name;
});

function getPokemonName(id) {
    return pokemonMap[id] || `Unknown (${id})`;
}

function formatRequirements(req) {
    if (!req) return "";
    let parts = [];

    if (req.defeatCountRoute) {
        parts.push(`Defeat ${req.defeatCountRoute.count} Pokémon on ${req.defeatCountRoute.route}`);
    }
    if (req.catchSpecies) {
        req.catchSpecies.forEach(spec => {
            parts.push(`Catch ${spec.count} ${spec.species}`);
        });
    }
    if (req.catchSpeciesByRarity) {
        req.catchSpeciesByRarity.forEach(spec => {
            parts.push(`Catch ${spec.count} ${spec.rarity} ${spec.species}`);
        });
    }
    if (req.catchSpeciesAnyOf) {
        req.catchSpeciesAnyOf.forEach(specGroup => {
            parts.push(`Catch ${specGroup.count} ${specGroup.species.join(' or ')}`);
        });
    }
    if (req.catchSpeciesAnyOfByRarity) {
        req.catchSpeciesAnyOfByRarity.forEach(specGroup => {
            parts.push(`Catch ${specGroup.count} ${specGroup.rarity} ${specGroup.species.join(' or ')}`);
        });
    }
    if (req.catchEachFromSlotMachine && req.catchEachFromSlotMachine.machines) {
        req.catchEachFromSlotMachine.machines.forEach(machine => {
            parts.push(`Catch 1 ${machine.join(' or ')}`);
        });
    }
    if (req.catchByRarity) {
        parts.push(`Catch ${req.catchByRarity.count} ${req.catchByRarity.rarity} Pokémon`);
    }
    if (req.catchByRarityAndType) {
        parts.push(`Catch ${req.catchByRarityAndType.count} ${req.catchByRarityAndType.rarity} ${req.catchByRarityAndType.type}-type`);
    }
    if (req.catchByType) {
        parts.push(`Catch ${req.catchByType.count} ${req.catchByType.type} Type Pokemons`);
    }
    if (req.earnBadge) {
        parts.push(`Earn ${req.earnBadge.name}`);
    }
    if (req.defeatSpecific) {
        parts.push(`Defeat ${req.defeatSpecific.count} ${req.defeatSpecific.name}`);
    }
    if (req.defeatMultipleSpecific) {
        req.defeatMultipleSpecific.forEach(target => {
            parts.push(`Defeat ${target.count} ${target.name}`);
        });
    }
    if (req.defeatEliteFourAndChampion) {
        parts.push(`Defeat all Elite 4 and Defeat Champion`);
    }
    if (req.defeatRed) {
        parts.push(`Defeat Red`);
    }
    return parts.join(', ');
}

function processRegion(routesArray, unlocksArray, filename) {
    const spawnData = [];
    const challengeData = [];

    // Table 1: Spawns (from routesArray)
    if (routesArray) {
        routesArray.forEach(route => {
            if (route.spawns && route.spawns.length > 0) {
                route.spawns.forEach(spawn => {
                    let levelText = spawn.minLevel === spawn.maxLevel ? `${spawn.minLevel}` : `${spawn.minLevel}-${spawn.maxLevel}`;
                    spawnData.push({
                        "Area / Route": route.name,
                        "Pokémon": getPokemonName(spawn.pokemonId),
                        "Level": levelText,
                        "Rate (%)": spawn.chance * 100
                    });
                });
            }
        });
    }

    // Combine routesArray and unlocksArray to search for challenges
    const allItems = [...(routesArray || []), ...(unlocksArray || [])];

    // De-duplicate by challengeName
    const challengeNamesSeen = new Set();

    allItems.forEach(route => {
        if (route.challengeName && !challengeNamesSeen.has(route.challengeName)) {
            challengeNamesSeen.add(route.challengeName);
            let reqs = formatRequirements(route.requirements);
            let unlocks = route.unlocks ? route.unlocks.join(', ') : "";
            let gifts = route.gift ? `${route.gift.count} ${route.gift.item}` : "";
            let unlocksAndRewards = [];
            if (unlocks) unlocksAndRewards.push(`Unlocks: ${unlocks}`);
            if (gifts) unlocksAndRewards.push(`Rewards: ${gifts}`);

            challengeData.push({
                "Challenge Name": route.challengeName,
                "Current Area": route.areaId || route.name,
                "Progress Challenge": reqs,
                "Unlocks & Rewards": unlocksAndRewards.join(' | ')
            });
        }
    });

    const wb = xlsx.utils.book_new();

    const ws1 = xlsx.utils.json_to_sheet(spawnData);
    xlsx.utils.book_append_sheet(wb, ws1, "Spawns");

    const ws2 = xlsx.utils.json_to_sheet(challengeData);
    xlsx.utils.book_append_sheet(wb, ws2, "Challenges");

    xlsx.writeFile(wb, filename);
    console.log(`Generated ${filename}`);
}

const kantoModule = loadModule('./config/routes.js');
processRegion(kantoModule.routes, kantoModule.unlocks, 'kanto_data.xlsx');

const johtoModule = loadModule('./config/johtoRoutes.js');
processRegion(johtoModule.johtoRoutes, johtoModule.johtoUnlocks, 'johto_data.xlsx');

const hoennModule = loadModule('./config/hoennRoutes.js');
processRegion(hoennModule.hoennRoutes, hoennModule.hoennUnlocks, 'hoenn_data.xlsx');
