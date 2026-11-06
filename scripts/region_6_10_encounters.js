const fs = require('fs');
const path = require('path');
const vm = require('vm');
const xlsx = require('xlsx');

// 1. Load Data Files
function loadDataFile(filename) {
    let code = fs.readFileSync(filename, 'utf8');
    code = code.replace(/^import\s+.*?;?\s*$/gm, '');
    code = code.replace(/export\s+const\s+/g, 'var ')
               .replace(/export\s+default\s+/g, 'var defaultExport = ')
               .replace(/export\s+\{.*\}\s*;/g, '');
    code = code.replace(/^const\s+([a-zA-Z0-9_]+)\s*=/gm, 'var $1 =');

    const context = {};
    vm.createContext(context);
    vm.runInContext(code, context);

    return context;
}

const pokemonDataArr = require('../data/pokemon.json');
const pokemonData = {};
pokemonDataArr.forEach(p => { pokemonData[p.id] = p; });

const REGIONS = [
    { num: 6, name: 'Kalos', prefix: 'kalos', routesVar: 'kalosRoutes' },
    { num: 7, name: 'Alola', prefix: 'alola', routesVar: 'alolaRoutes' },
    { num: 8, name: 'Galar', prefix: 'galar', routesVar: 'galarRoutes' },
    { num: 9, name: 'Hisui', prefix: 'hisui', routesVar: 'hisuiRoutes' },
    { num: 10, name: 'Paldea', prefix: 'paldea', routesVar: 'paldeaRoutes' }
];

// 2. Extract Route Names
function extractRouteNames(fullName) {
    let routeName = fullName;
    let compName = "";

    // E.g., "Terminus Cave (Surface)" -> "Terminus Cave", "Surface"
    const parenMatch = fullName.match(/^(.*?)\s*\((.*?)\)$/);
    if (parenMatch) {
        return { routeName: parenMatch[1].trim(), compName: parenMatch[2].trim() };
    }

    // E.g., "Route 19 Marshlands" -> "Route 19", "Marshlands"
    const routeMatch = fullName.match(/^(Route\s+\d+\w*)\s+(.+)$/i);
    if (routeMatch) {
        return { routeName: routeMatch[1].trim(), compName: routeMatch[2].trim() };
    }

    // E.g., "Lumiose South Boulevard" -> "Lumiose Boulevard", "South"
    const dirMatch = fullName.match(/^(.*?)\s+(North|South|East|West|Central)(\s+.*)?$/i);
    if (dirMatch) {
        return {
            routeName: `${dirMatch[1]} ${dirMatch[3] || ''}`.trim(),
            compName: dirMatch[2].trim()
        };
    }

    return { routeName, compName };
}

// 3. Fetch Encounter Methods
const methodMap = {
    'walk': 'Walking',
    'grass': 'Walking',
    'tall-grass': 'Walking',
    'dark-grass': 'Walking',
    'red-flowers': 'Walking',
    'yellow-flowers': 'Walking',
    'surf': 'Surfing',
    'surf-spots': 'Surfing',
    'overworld-water': 'Surfing',
    'old-rod': 'Fishing',
    'good-rod': 'Fishing',
    'super-rod': 'Fishing',
    'super-rod-spots': 'Fishing',
    'fishing': 'Fishing',
    'interact': 'Interact',
    'gift': 'Interact',
    'gift-egg': 'Interact',
    'only-one': 'Interact',
    'overworld-special': 'Interact',
    'wanderer': 'Interact',
    'npc-trade': 'Trade'
};

function getCategory(methods) {
    const categories = new Set();
    methods.forEach(m => {
        if (methodMap[m]) categories.add(methodMap[m]);
        else if (m.includes('surf') || m.includes('sea') || m.includes('water')) categories.add('Surfing');
        else if (m.includes('rod') || m.includes('fishing')) categories.add('Fishing');
        else if (m.includes('trade')) categories.add('Trade');
        else if (m.includes('overworld')) categories.add('Walking');
        else if (m === 'walk') categories.add('Walking');
        else categories.add('Other');
    });

    if (categories.size === 0) return 'Walking';

    const pref = ['Walking', 'Surfing', 'Fishing', 'Interact', 'Trade', 'Other'];
    return Array.from(categories).sort((a, b) => pref.indexOf(a) - pref.indexOf(b)).join(', ');
}

// Caching to avoid hammering API
const encounterCache = {};

async function getEncounterCategories(pkName, types) {
    const safeName = pkName.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (encounterCache[safeName]) {
        return encounterCache[safeName];
    }

    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${safeName}/encounters`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();

        let methods = new Set();
        data.forEach(encounter => {
            encounter.version_details.forEach(vd => {
                vd.encounter_details.forEach(ed => {
                    methods.add(ed.method.name);
                });
            });
        });

        let category = getCategory(Array.from(methods));
        encounterCache[safeName] = category;
        return category;
    } catch(e) {
        // Fallbacks if not found
        let category = 'Walking';
        if (types.includes('Water')) category = 'Walking, Surfing, Fishing';
        encounterCache[safeName] = category;
        return category;
    }
}

// 4. Processing Regions
async function run() {
    const wb = xlsx.utils.book_new();

    for (const region of REGIONS) {
        console.log(`Processing Region ${region.num}: ${region.name}...`);

        const file = path.join(__dirname, '..', `config/${region.prefix}Routes.js`);
        const ctx = loadDataFile(file);

        let routesObj = ctx[region.routesVar] || ctx.defaultExport;
        let routes = [];

        if (!Array.isArray(routesObj)) {
            routes = Object.keys(routesObj).map(key => {
                return { name: key, ...routesObj[key] };
            });
        } else {
            routes = routesObj;
        }

        const sheetData = [];

        for (const route of routes) {
            const mapName = route.name || route.areaId;
            if (!mapName) continue;

            const lowerMap = mapName.toLowerCase();
            if (lowerMap.includes('gym') || lowerMap.includes('league') || lowerMap.includes('battle')) {
                continue; // Ignore Gyms/League
            }

            const { routeName, compName } = extractRouteNames(mapName);

            // Normalize Hisui specific field names
            let spawns = route.spawns || route.pokes || [];

            for (const spawn of spawns) {
                const pkId = spawn.pokemonId || spawn.id;
                const pk = pokemonData[pkId];
                if (!pk) continue;

                let minLevel = spawn.minLevel || 1;
                let maxLevel = spawn.maxLevel || 100;

                const obtainMethod = await getEncounterCategories(pk.name, pk.types);

                sheetData.push({
                    "Route Name": routeName,
                    "Complementary Name": compName,
                    "Pokemon Name": pk.name,
                    "Level Min": minLevel,
                    "Level Max": maxLevel,
                    "How can be obtained": obtainMethod
                });
            }
        }

        const ws = xlsx.utils.json_to_sheet(sheetData);
        xlsx.utils.book_append_sheet(wb, ws, region.name);
    }

    const outPath = path.join(__dirname, '..', 'xdata', 'Region_6_10_Encounters.xlsx');
    if (!fs.existsSync(path.dirname(outPath))) {
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
    }

    xlsx.writeFile(wb, outPath);
    console.log(`Successfully written to ${outPath}`);
}

run().catch(console.error);
