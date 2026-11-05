const fs = require('fs');
const xlsx = require('xlsx');
const axios = require('axios');

const pokemonData = JSON.parse(fs.readFileSync('data/pokemon.json', 'utf8'));
const pokemonBase = JSON.parse(fs.readFileSync('data/pokemon_base.json', 'utf8'));

const evosBackward = {};
const evosForward = {};

pokemonData.forEach(pk => {
    if (pk.evolutions) {
        pk.evolutions.forEach(evo => {
            evosBackward[evo.to] = pk.id;
            if(!evosForward[pk.id]) evosForward[pk.id] = [];
            evosForward[pk.id].push(evo.to);
        });
    }
});

function getFirstInTree(id) {
    let curr = id;
    while (evosBackward[curr]) {
        curr = evosBackward[curr];
    }
    return curr;
}

function getLastInTree(id) {
    let leaves = [];
    function traverse(curr) {
        if (!evosForward[curr] || evosForward[curr].length === 0) {
            leaves.push(curr);
            return;
        }
        for (let next of evosForward[curr]) {
            traverse(next);
        }
    }
    traverse(id);
    return leaves;
}

function getBST(id) {
    const p = pokemonData.find(p => p.id === id);
    if (!p) return 0;
    const pb = pokemonBase.find(pb => pb.name === p.name);
    if (pb && pb.stats && pb.stats.Total) {
        return parseInt(pb.stats.Total);
    }
    return 0;
}

const routeFiles = [
    { region: 1, file: 'config/routes.js', objName: 'routes' },
    { region: 2, file: 'config/johtoRoutes.js', objName: 'johtoRoutes' },
    { region: 3, file: 'config/hoennRoutes.js', objName: 'hoennRoutes' },
    { region: 4, file: 'config/sinnohRoutes.js', objName: 'sinnohRoutes' },
    { region: 5, file: 'config/unovaRoutes.js', objName: 'unovaRoutes' },
    { region: 6, file: 'config/kalosRoutes.js', objName: 'kalosRoutes' },
    { region: 7, file: 'config/alolaRoutes.js', objName: 'alolaRoutes' },
    { region: 8, file: 'config/galarRoutes.js', objName: 'galarRoutes' },
    { region: 9, file: 'config/hisuiRoutes.js', objName: 'hisuiRoutes', isObj: true },
    { region: 10, file: 'config/paldeaRoutes.js', objName: 'paldeaRoutes' },
];

function parseRoutes(file, isObj) {
    const code = fs.readFileSync(file, 'utf8');
    let cjsCode = code.replace(/export\s+const\s+(\w+)\s*=/g, 'exports.$1 =');
    if(!code.includes('export')) {
        cjsCode = cjsCode.replace(/const\s+(\w+)\s*=/g, 'exports.$1 =');
    }
    cjsCode = cjsCode.replace(/import\s+.*?;/g, '');
    cjsCode = cjsCode.replace(/export\s+\{.*?\};/g, '');

    const m = new module.constructor();
    m.paths = module.paths;
    m._compile(cjsCode, file);

    const keys = Object.keys(m.exports);
    return m.exports[keys[0]];
}

async function getEncounterData(pokemonName) {
    try {
        let fetchName = pokemonName.toLowerCase().replace(/[^a-z0-9-]/g, '');
        if (fetchName === 'mimikyu') fetchName = 'mimikyu-disguised';
        if (fetchName === 'pumpkaboo') fetchName = 'pumpkaboo-average';
        if (fetchName === 'gourgeist') fetchName = 'gourgeist-average';
        if (fetchName === 'aegislash') fetchName = 'aegislash-shield';
        if (fetchName === 'meowstic') fetchName = 'meowstic-male';
        if (fetchName === 'toxtricity') fetchName = 'toxtricity-amped';
        if (fetchName === 'morpeko') fetchName = 'morpeko-full-belly';
        if (fetchName === 'urshifu') fetchName = 'urshifu-single-strike';
        if (fetchName === 'lycanroc') fetchName = 'lycanroc-midday';
        if (fetchName === 'basculegion') fetchName = 'basculegion-male';
        if (fetchName === 'wishiwashi') fetchName = 'wishiwashi-solo';
        if (fetchName === 'eiscue') fetchName = 'eiscue-ice';
        if (fetchName === 'indeedee') fetchName = 'indeedee-male';
        if (fetchName === 'minior') fetchName = 'minior-red-meteor';
        if (fetchName === 'keldeo') fetchName = 'keldeo-ordinary';
        if (fetchName === 'meloetta') fetchName = 'meloetta-aria';
        if (fetchName === 'hoopa') fetchName = 'hoopa-confined';
        if (fetchName === 'deoxys') fetchName = 'deoxys-normal';
        if (fetchName === 'wormadam') fetchName = 'wormadam-plant';
        if (fetchName === 'giratina') fetchName = 'giratina-altered';
        if (fetchName === 'shaymin') fetchName = 'shaymin-land';
        if (fetchName === 'tornadus') fetchName = 'tornadus-incarnate';
        if (fetchName === 'thundurus') fetchName = 'thundurus-incarnate';
        if (fetchName === 'landorus') fetchName = 'landorus-incarnate';

        const url = `https://pokeapi.co/api/v2/pokemon/${fetchName}/encounters`;
        const res = await axios.get(url);
        return res.data.map(e => e.location_area.name);
    } catch (e) {
        return [];
    }
}

function addSpawnToFile(file, routeName, spawnData, isObj) {
    let content = fs.readFileSync(file, 'utf8');

    if (isObj) {
        const rp1 = new RegExp(`"${routeName}"\\s*:\\s*\\{[\\s\\S]*?pokes\\s*:\\s*\\[`);
        let match = rp1.exec(content);
        if(!match) {
            const rp2 = new RegExp(`${routeName}\\s*:\\s*\\{[\\s\\S]*?pokes\\s*:\\s*\\[`);
            match = rp2.exec(content);
        }
        if(match) {
            const insertPos = match.index + match[0].length;
            const spawnStr = `\n          ${JSON.stringify(spawnData, null, 2).replace(/\n/g, '\n          ')},`;
            content = content.slice(0, insertPos) + spawnStr + content.slice(insertPos);
            fs.writeFileSync(file, content);
            return true;
        }
    } else {
        const rp = new RegExp(`"name"\\s*:\\s*"${routeName}"[\\s\\S]*?"spawns"\\s*:\\s*\\[`);
        let match = rp.exec(content);
        if (match) {
            const insertPos = match.index + match[0].length;
            const spawnStr = `\n      ${JSON.stringify(spawnData, null, 2).replace(/\n/g, '\n      ')},`;
            content = content.slice(0, insertPos) + spawnStr + content.slice(insertPos);
            fs.writeFileSync(file, content);
            return true;
        }
    }
    return false;
}

(async () => {
    let report = "# Added Pokemon Report\n\n| Pokemon | Region | Route |\n| --- | --- | --- |\n";

    for (let i = 1; i <= 10; i++) {
        const files = fs.readdirSync('.');
        const file = files.find(f => f.startsWith(`${i}_`) && f.endsWith('xlsx'));
        if (!file) continue;

        const wb = xlsx.readFile("xdata/" + file);
        const ws = wb.Sheets['Missing PK'];
        if (!ws) continue;
        const data = xlsx.utils.sheet_to_json(ws);

        let nos = data.filter(r => r['Can Obtain?'] && r['Can Obtain?'].startsWith('No'));
        const insertIds = new Set();

        nos.forEach(no => {
            const pk = pokemonData.find(p => p.name === no['Pokemon Name']);
            if (!pk) return;

            const type = no['Can Obtain?'];
            if (type === 'No1') {
                insertIds.add(pk.id);
            } else if (type === 'No2') {
                insertIds.add(getFirstInTree(pk.id));
            } else if (type === 'No3') {
                insertIds.add(getFirstInTree(pk.id));
                const leaves = getLastInTree(getFirstInTree(pk.id));
                leaves.forEach(l => insertIds.add(l));
            } else {
                insertIds.add(pk.id);
            }
        });

        if (insertIds.size === 0) continue;

        const rConfig = routeFiles.find(rf => rf.region === i);
        if (!rConfig) continue;

        const routeObj = parseRoutes(rConfig.file, rConfig.isObj);

        for (const id of insertIds) {
            const pk = pokemonData.find(p => p.id === id);
            if (!pk) continue;

            const locations = await getEncounterData(pk.name);
            let matchedRoutes = [];

            if (rConfig.isObj) {
                const routeKeys = Object.keys(routeObj);
                for (let rIdx = 0; rIdx < routeKeys.length; rIdx++) {
                    const routeName = routeKeys[rIdx];
                    const normRoute = routeName.toLowerCase().replace(/[^a-z0-9]/g, '');
                    for (const loc of locations) {
                        const normLoc = loc.toLowerCase().replace(/[^a-z0-9]/g, '');
                        if (normLoc.includes(normRoute) || normRoute.includes(normLoc)) {
                            matchedRoutes.push({ idx: rIdx, name: routeName });
                            break;
                        }
                    }
                }
            } else {
                for (let rIdx = 0; rIdx < routeObj.length; rIdx++) {
                    const routeName = routeObj[rIdx].name;
                    const normRoute = routeName.toLowerCase().replace(/[^a-z0-9]/g, '');
                    if (normRoute === 'spot') continue;
                    for (const loc of locations) {
                        const normLoc = loc.toLowerCase().replace(/[^a-z0-9]/g, '');
                        if (normLoc.includes(normRoute) || normRoute.includes(normLoc)) {
                            matchedRoutes.push({ idx: rIdx, name: routeName });
                            break;
                        }
                    }
                }
            }

            if (matchedRoutes.length > 0) {
                const bst = getBST(pk.id);
                let chosenRoute;
                if (bst < 300) {
                    chosenRoute = matchedRoutes.reduce((prev, curr) => (prev.idx < curr.idx ? prev : curr));
                } else if (bst > 500) {
                    chosenRoute = matchedRoutes.reduce((prev, curr) => (prev.idx > curr.idx ? prev : curr));
                } else {
                    matchedRoutes.sort((a, b) => a.idx - b.idx);
                    chosenRoute = matchedRoutes[Math.floor(matchedRoutes.length / 2)];
                }

                let spawnData;
                if (rConfig.isObj) {
                    spawnData = { id: pk.id, minLevel: 1, maxLevel: 1, probability: 0 };
                } else {
                    spawnData = { pokemonId: pk.id, minLevel: 1, maxLevel: 1, chance: 0 };
                }

                const success = addSpawnToFile(rConfig.file, chosenRoute.name, spawnData, rConfig.isObj);
                if (success) {
                    report += `| ${pk.name} | ${i} | ${chosenRoute.name} |\n`;
                }
            }
        }
    }

    fs.writeFileSync('addedpokemon.md', report);
    console.log("Done");
})();
