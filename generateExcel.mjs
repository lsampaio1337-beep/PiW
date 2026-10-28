import fs from 'fs';
import * as xlsx from 'xlsx';

// We'll read these configs dynamically per region
const regions = [
  { num: 1, name: 'Kanto', configPrefix: '' }, // routes.js, mapCoordinates.js
  { num: 2, name: 'Johto', configPrefix: 'johto' },
  { num: 3, name: 'Hoenn', configPrefix: 'hoenn' },
  { num: 4, name: 'Sinnoh', configPrefix: 'sinnoh' },
  { num: 5, name: 'Unova', configPrefix: 'unova' }
];

const pokemonData = JSON.parse(fs.readFileSync('./data/pokemon.json', 'utf8'));

// create lookup dicts for pokemon data
const pokemonByName = {};
const pokemonById = {};
pokemonData.forEach(p => {
    pokemonByName[p.name] = p;
    pokemonById[p.id] = p;
});

function getPokemonBST(p) {
    if (!p) return 0;
    return p.hp + p.atk + p.def + p.spa + p.spd + p.spe;
}

async function generate() {
    let pokedexIndexes = {};
    let pkdxContent = fs.readFileSync('./config/pokedexIndexes.js', 'utf8');
    pkdxContent = pkdxContent.replace(/export const \w+ = /g, 'global.currentPkdx = ');
    pkdxContent = pkdxContent.replace(/export {[^}]+};?/g, '');
    eval(pkdxContent);
    pokedexIndexes = global.currentPkdx;

    for (const region of regions) {
        let routes = [];
        let unlocks = [];
        let mapCoordinates = {};

        const prefix = region.configPrefix;
        const routesFile = prefix ? `./config/${prefix}Routes.js` : `./config/routes.js`;
        const mapFile = prefix ? `./config/${prefix}MapCoordinates.js` : `./config/mapCoordinates.js`;

        // Strip export syntax to import manually or import as mjs
        let routesContent = fs.readFileSync(routesFile, 'utf8');
        routesContent = routesContent.replace(/export const \w+Routes = /g, 'global.currentRoutes = ');
        routesContent = routesContent.replace(/export const \w+Unlocks = /g, 'global.currentUnlocks = ');

        // specifically for Kanto
        routesContent = routesContent.replace(/const routes = /g, 'global.currentRoutes = ');
        routesContent = routesContent.replace(/export const unlocks = /g, 'global.currentUnlocks = ');

        routesContent = routesContent.replace(/export {[^}]+};?/g, '');
        routesContent = routesContent.replace(/export default \w+;?/g, '');
        routesContent = routesContent.replace(/import .*/g, '');
        eval(routesContent);
        routes = global.currentRoutes || [];
        unlocks = global.currentUnlocks || [];

        let mapContent = fs.readFileSync(mapFile, 'utf8');
        mapContent = mapContent.replace(/export const \w+MapCoordinates = /g, 'global.currentMap = ');
        mapContent = mapContent.replace(/export const mapCoordinates = /g, 'global.currentMap = ');
        mapContent = mapContent.replace(/export {[^}]+};?/g, '');
        mapContent = mapContent.replace(/export default \w+;?/g, '');
        mapContent = mapContent.replace(/import .*/g, '');
        eval(mapContent);
        mapCoordinates = global.currentMap || {};

        const sheet1 = []; // Routes
        const sheet2 = []; // Challenges
        const sheet3 = []; // Missing PK

        // Precalculate total challenges for BST checking
        const mainChallenges = routes.filter(r => !r.isExtra);
        const totalMainChallenges = mainChallenges.length;

        const allSpawns = new Set();

        routes.forEach((route, rIndex) => {
            const isLateGame = rIndex >= Math.floor(totalMainChallenges * 0.75);
            const isEarlyGame = rIndex <= Math.floor(totalMainChallenges * 0.5);

            const areaIdOrName = route.areaId || route.name;

            const mapOk = Object.values(mapCoordinates).some(area => (area.name === areaIdOrName || area.name === route.name)) ? 'Ok' : 'NONONO';

            // Find unlocks for this challenge
            let willUnlock = '';
            let requisite = '';
            let rewardMap = '';
            let rewardChallenge = '';
            let rewardGift = '';

            const routeUnlocks = unlocks.filter(u =>
                (u.requireCompletedChallenges && u.requireCompletedChallenges.includes(areaIdOrName)) ||
                (u.requireAnyCompletedChallenges && u.requireAnyCompletedChallenges.includes(areaIdOrName))
            );

            if (routeUnlocks.length > 0) {
                willUnlock = routeUnlocks.map(u => u.name).join(', ');
                requisite = JSON.stringify(routeUnlocks[0].requirements || {});
            }

            // Fill Challenge sheet
            sheet2.push({
                'Challenge Name': route.name || route.areaId,
                'Requisite': requisite,
                'Reward Map': willUnlock,
                'Reward Challenge': willUnlock,
                'Reward Gift': ''
            });

            // Special spots
            if (!route.spawns || route.spawns.length === 0) {
                sheet1.push({
                    'Unlocked': '?',
                    'Route/Place': route.name || route.areaId,
                    'Secondary': '',
                    'Pokemon Name': '',
                    'Level': '',
                    '% Appearance': '',
                    '% Appearance Ok?': '',
                    'Pokemon/Type Ok?': '',
                    'Pokemon/BST Ok?': '',
                    'Map Ok?': mapOk,
                    'Will Unlock': willUnlock,
                    'Requisite': requisite,
                    'Reward': ''
                });
                return;
            }

            // Route with spawns
            route.spawns.forEach(spawn => {
                const p = pokemonById[spawn.pokemonId];
                if (p) allSpawns.add(p.id);

                let bstOk = 'Ok';
                if (p) {
                    const bst = getPokemonBST(p);
                    if (bst >= 500 && isEarlyGame) bstOk = 'NONONO'; // strong early
                    if (bst < 350 && isLateGame) bstOk = 'NONONO'; // weak late
                }

                // Type logic: very naive heuristic
                let typeOk = 'Yes';
                if (p) {
                    const nameLower = (route.name || route.areaId).toLowerCase();
                    const isWaterRoute = nameLower.includes('sea') || nameLower.includes('ocean') || nameLower.includes('lake') || nameLower.includes('water') || nameLower.includes('surf') || nameLower.includes('beach') || nameLower.includes('cave');
                    if (isWaterRoute && p.type && !p.type.includes('Water')) typeOk = 'NONONO';
                }

                sheet1.push({
                    'Unlocked': '?',
                    'Route/Place': route.name || route.areaId,
                    'Secondary': '',
                    'Pokemon Name': p ? p.name : `Unknown (${spawn.pokemonId})`,
                    'Level': `${spawn.minLevel}-${spawn.maxLevel}`,
                    '% Appearance': `${Math.round(spawn.chance * 100)}%`,
                    '% Appearance Ok?': '', // left blank for human review as requested
                    'Pokemon/Type Ok?': typeOk, // naive Yes/NONONO based on type match, no DB check
                    'Pokemon/BST Ok?': bstOk,
                    'Map Ok?': mapOk,
                    'Will Unlock': willUnlock,
                    'Requisite': requisite,
                    'Reward': ''
                });
            });
        });

        // Missing PK
        const regionPokedex = pokedexIndexes.regional[region.name.toLowerCase()];
        if (regionPokedex) {
            const allRegionPokes = regionPokedex.map(id => pokemonById[id]);
            allRegionPokes.forEach(p => {
                if (p && !allSpawns.has(p.id)) {
                    // Check evolutions
                    let obtainStatus = 'No';

                    // Recursive function to see if we can obtain it by evolving something that IS on a route
                    function canObtainViaEvolution(targetId) {
                        for (const possibleBase of allRegionPokes) {
                            if (!possibleBase || !allSpawns.has(possibleBase.id)) continue;

                            // Does possibleBase evolve into target?
                            let evCount = 0;
                            let currentEvos = possibleBase.evolutions;
                            let found = false;
                            let queue = [{id: possibleBase.id, depth: 0}];
                            let visited = new Set();

                            while (queue.length > 0) {
                                const curr = queue.shift();
                                if (curr.id === targetId) {
                                    return {canObtain: true, steps: curr.depth};
                                }
                                visited.add(curr.id);
                                const currP = pokemonById[curr.id];
                                if (currP && currP.evolutions) {
                                    currP.evolutions.forEach(ev => {
                                        const nextId = ev.to || ev.id;
                                        if (!visited.has(nextId)) {
                                            queue.push({id: nextId, depth: curr.depth + 1});
                                        }
                                    });
                                }
                            }
                        }
                        return {canObtain: false, steps: 0};
                    }

                    const evoCheck = canObtainViaEvolution(p.id);
                    if (evoCheck.canObtain) {
                        if (evoCheck.steps === 1) obtainStatus = 'Evolve';
                        else obtainStatus = `${evoCheck.steps}xEvolution`;
                    }

                    sheet3.push({
                        'Pokemon Name': p.name,
                        'Can Obtain?': obtainStatus
                    });
                }
            });
        }

        const wb = xlsx.utils.book_new();
        const ws1 = xlsx.utils.json_to_sheet(sheet1);
        const ws2 = xlsx.utils.json_to_sheet(sheet2);
        const ws3 = xlsx.utils.json_to_sheet(sheet3);

        xlsx.utils.book_append_sheet(wb, ws1, 'Rutes');
        xlsx.utils.book_append_sheet(wb, ws2, 'Challenges');
        xlsx.utils.book_append_sheet(wb, ws3, 'Missing PK');

        xlsx.writeFile(wb, `${region.num}_${region.name}_Data.xlsx`);
        console.log(`Generated ${region.num}_${region.name}_Data.xlsx`);
    }
}

generate().catch(console.error);
