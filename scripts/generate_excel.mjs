import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Import data loaders and scrapers
import { loadJsFile, pokemonData, regionData, gyms } from './loadGameData.mjs';
import { fetchPokemonLocations, isPokemonLegacyToRoute } from './scrapeLocations.mjs';

const getPokemonById = (id) => pokemonData.find(p => p.id === id || p.id === parseInt(id));

const checkBST = (pokemon, isEarlyRoute, isLateRoute) => {
    if (!pokemon) return "NONONO";
    const bst = pokemon.hp + pokemon.atk + pokemon.def + pokemon.spa + pokemon.spd + pokemon.spe;
    if (isEarlyRoute && bst >= 500) return "NONONO"; // Strong on early route
    if (isLateRoute && bst < 400) return "NONONO"; // Weak on late route
    return "Ok";
};

const getEvolutionSteps = (pokemonId, targetId, steps = 0) => {
    if (pokemonId == targetId) return steps;
    const pk = getPokemonById(pokemonId);
    if (!pk || !pk.evolutions) return -1;
    for (const ev of pk.evolutions) {
        const nextId = ev.to || ev.id;
        const res = getEvolutionSteps(nextId, targetId, steps + 1);
        if (res !== -1) return res;
    }
    return -1;
};

const checkCanObtain = (targetPkId, availablePkIds) => {
    if (availablePkIds.has(targetPkId)) return "Yes"; // already in route

    // Check if it can be evolved from an available pokemon
    let minSteps = -1;
    for (const availId of availablePkIds) {
        const steps = getEvolutionSteps(availId, targetPkId, 0);
        if (steps !== -1) {
            if (minSteps === -1 || steps < minSteps) {
                minSteps = steps;
            }
        }
    }

    if (minSteps === 1) return "Evolve";
    if (minSteps > 1) return `${minSteps}xEvolution`;
    return "No";
};

const processRegion = async (regionName) => {
    console.log(`Processing ${regionName}...`);
    const data = regionData[regionName];
    const { routesInfo, map, pokedex, id: regionNum } = data;

    const rutesData = [];
    const rutesHeader = [
        "Unlocked", "Route", "Route (Secondary)", "Pokemon Name", "Level",
        "% Appearance", "% Appearance Ok?", "Pokemon/Type Ok?", "Pokemon/BST Ok?",
        "Map Ok?", "Will Unlock", "Requisite", "Reward"
    ];
    rutesData.push(rutesHeader);

    const challengesData = [];
    const challengesHeader = [
        "Challenge Name", "Requisite", "Reward Map", "Reward Challenge", "Reward Gift"
    ];
    challengesData.push(challengesHeader);

    // Keep track of what unlock each route
    const areaToChallenge = {};
    // challenges to unlocked routes/challenges
    const challengeToNext = {};

    if (routesInfo.unlocks) {
        routesInfo.unlocks.forEach(u => {
            areaToChallenge[u.areaId] = u;
            if (u.unlocks) {
                u.unlocks.forEach(unl => {
                    challengeToNext[unl] = u.challengeName;
                });
            }
        });
    }

    const availablePkIds = new Set();

    // Gather all routes/spots
    let allSpots = [...(routesInfo.routes || [])];

    // Helper to calculate if route is early/mid/late
    const mainChallenges = (routesInfo.unlocks || []).filter(u => u.challengeName && u.challengeName.includes('Challenge') && !u.challengeName.includes('Extra'));
    const totalMainChallenges = mainChallenges.length;

    for (let i = 0; i < allSpots.length; i++) {
        const spot = allSpots[i];
        if (!spot.name || spot.name === 'Spot') continue;

        let challengeIndex = mainChallenges.findIndex(c => c.areaId === spot.name);
        const isEarlyRoute = challengeIndex !== -1 && challengeIndex <= totalMainChallenges / 2;
        const isLateRoute = challengeIndex !== -1 && challengeIndex >= totalMainChallenges * 0.75;

        let unlockedBy = challengeToNext[spot.name] || "";
        if (spot.name === 'Professor Lab' || spot.name.includes('PokeCenter')) unlockedBy = "";

        const mapOk = (map && (Object.values(map).some(m => m.name === spot.name))) ? "Yes" : "No";

        const unlockObj = areaToChallenge[spot.name];
        let willUnlock = "", requisite = "", reward = "";
        if (unlockObj) {
            willUnlock = (unlockObj.unlocks || []).join(", ");
            requisite = JSON.stringify(unlockObj.requirements || {});
            reward = JSON.stringify(unlockObj.gift || unlockObj.gifts || {});
        }

        if (!spot.spawns || spot.spawns.length === 0) {
            // Gym, Daycare, etc
            rutesData.push([
                unlockedBy, spot.name, "", "", "", "", "", "", "", mapOk, willUnlock, requisite, reward
            ]);
            continue;
        }

        // Check if there's secondary route name in config (we don't have it natively, leave blank)
        for (const spawn of spot.spawns) {
            const pk = getPokemonById(spawn.pokemonId);
            const pkName = pk ? pk.name : `Unknown (${spawn.pokemonId})`;
            if (pk) availablePkIds.add(pk.id);

            const levelStr = `${spawn.minLevel}-${spawn.maxLevel}`;
            const appearance = `${(spawn.chance * 100).toFixed(1)}%`;

            let typeOk = "Yes";
            let appOk = "";
            if (pk) {
                const locations = await fetchPokemonLocations(pk.name);
                if (isPokemonLegacyToRoute(locations, spot.name, regionNum)) {
                    typeOk = "Legacy";
                } else {
                    // Type checking heuristic could be expanded, default "Yes" unless it breaks obvious rules
                    typeOk = "Yes";
                }

                // % Appearance Ok - Leave blank for manual review, script can't reliably know what's "adequate"
                appOk = "";
            }

            const bstOk = checkBST(pk, isEarlyRoute, isLateRoute);

            rutesData.push([
                unlockedBy, spot.name, "", pkName, levelStr, appearance, appOk, typeOk, bstOk, mapOk, willUnlock, requisite, reward
            ]);
        }
    }

    // Remove Route (Secondary) if completely empty
    const secondaryColIndex = rutesHeader.indexOf("Route (Secondary)");
    const isSecondaryEmpty = rutesData.slice(1).every(row => !row[secondaryColIndex]);
    if (isSecondaryEmpty) {
        rutesData.forEach(row => row.splice(secondaryColIndex, 1));
    }

    // Challenges Data
    if (routesInfo.unlocks) {
        routesInfo.unlocks.forEach(u => {
            const req = JSON.stringify(u.requirements || {});
            const rewardMap = (u.unlocks || []).join(", ");
            // We consider the next challenge in sequence as Reward Challenge roughly, or leave blank if we don't have explicit rewardChallenge in config
            let rewardChallenge = "";
            const gift = JSON.stringify(u.gift || u.gifts || {});
            challengesData.push([
                u.challengeName, req, rewardMap, rewardChallenge, gift
            ]);
        });
    }

    // Missing PK
    const missingPkData = [];
    missingPkData.push(["Pokemon Name", "Can Obtain?"]);

    if (pokedex) {
        for (const pkId of pokedex) {
            const pk = getPokemonById(pkId);
            if (pk && !availablePkIds.has(pk.id)) {
                const canObtain = checkCanObtain(pk.id, availablePkIds);
                missingPkData.push([pk.name, canObtain]);
            }
        }
    }

    const wb = xlsx.utils.book_new();
    const wsRutes = xlsx.utils.aoa_to_sheet(rutesData);
    const wsChallenges = xlsx.utils.aoa_to_sheet(challengesData);
    const wsMissing = xlsx.utils.aoa_to_sheet(missingPkData);

    xlsx.utils.book_append_sheet(wb, wsRutes, "Rutes");
    xlsx.utils.book_append_sheet(wb, wsChallenges, "Challenges");
    xlsx.utils.book_append_sheet(wb, wsMissing, "Missing PK");

    const fileName = `${regionNum}_${regionName}_Data.xlsx`;
    xlsx.writeFile(wb, path.join(rootDir, fileName));
    console.log(`Generated ${fileName}`);
};

const run = async () => {
    await processRegion('Kanto');
    await processRegion('Johto');
    await processRegion('Hoenn');
    await processRegion('Sinnoh');
    await processRegion('Unova');
    console.log('All regions processed.');
};

run().catch(console.error);
