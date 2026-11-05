const fs = require('fs');
const xlsx = require('xlsx');
const vm = require('vm');

const pkData = require('./data/pokemon.json');
const pkMap = {};
pkData.forEach(p => pkMap[p.name] = p);
pkData.forEach(p => pkMap[p.id] = p);

const evosForward = {};
const evosBackward = {};
pkData.forEach(pk => {
    if (pk.evolutions) {
        pk.evolutions.forEach(evo => {
            if (!evosForward[pk.id]) evosForward[pk.id] = [];
            evosForward[pk.id].push(evo.to);
            evosBackward[evo.to] = pk.id;
        });
    }
});

function getFamily(id) {
    const family = new Set();
    let current = [id];
    while (current.length > 0) {
        const c = current.shift();
        family.add(c);
        if (evosBackward[c] && !family.has(evosBackward[c])) current.push(evosBackward[c]);
        if (evosForward[c]) {
            evosForward[c].forEach(f => {
                if (!family.has(f)) current.push(f);
            });
        }
    }
    let base = null;
    for (let f of family) {
        if (!evosBackward[f] || !family.has(evosBackward[f])) {
            base = f;
            break;
        }
    }
    const sorted = [];
    if (base) {
        let curr = [base];
        while (curr.length > 0) {
            let next = curr.shift();
            sorted.push(next);
            if (evosForward[next]) {
                evosForward[next].forEach(f => {
                    if (family.has(f)) curr.push(f);
                });
            }
        }
        return sorted;
    }
    return Array.from(family);
}

function processRegion(regionNum, regionName, routeFile) {
    const wb = xlsx.readFile(`xdata/${regionNum}_${regionName}_Data.xlsx`);
    const wsMissing = wb.Sheets['Missing PK'];
    let missing = xlsx.utils.sheet_to_json(wsMissing);

    let missingNo = missing.filter(r => r['Can Obtain?'] && r['Can Obtain?'].startsWith('No')).map(r => r['Pokemon Name']);

    console.log(`${regionName} starting missing No count: ${missingNo.length}`);

    let toInsert = [];
    let processedFamilies = new Set();

    missingNo.forEach(m => {
        const p = pkMap[m];
        if (!p) return;
        const fam = getFamily(p.id);
        const famStr = fam.join(',');
        if (processedFamilies.has(famStr)) return;
        processedFamilies.add(famStr);

        if (fam.length === 1) toInsert.push(fam[0]);
        else if (fam.length === 2) toInsert.push(fam[1]);
        else if (fam.length === 3) { toInsert.push(fam[0]); toInsert.push(fam[2]); }
    });

    // Target is max 60 total in sheet 3 that are not catchable.
    // Right now, 'No' are uncatchable. Other things like 'Evolve' can be obtained.
    // Count current uncatchable (the 'No' ones). If > 60, we must insert (missingNo.length - 60).
    const mustInsertCount = Math.max(0, missingNo.length - 60);
    console.log(`${regionName} to insert: ${mustInsertCount} out of ${toInsert.length} eligible`);

    if (mustInsertCount === 0) return;

    const actuallyInsert = toInsert.slice(0, mustInsertCount);

    // Inject into routes
    let raw = fs.readFileSync(`config/${routeFile}.js`, 'utf8');
    let code = raw.replace(/export const /g, 'var ');
    const sandbox = {};
    vm.createContext(sandbox);
    vm.runInContext(code, sandbox);

    const prefix = routeFile.replace('Routes', '');
    const routes = sandbox[`${prefix}Routes`];
    const unlocks = sandbox[`${prefix}Unlocks`];

    let insertIdx = 0;
    for (let r of routes) {
        if (insertIdx >= actuallyInsert.length) break;
        if (!r.name || r.name.includes("Lab") || r.name.includes("Gym")) continue;

        let toAdd = 1;
        if (r.spawns && r.spawns.length >= 5) toAdd = 2;

        if (!r.spawns) r.spawns = [];

        for (let i = 0; i < toAdd && insertIdx < actuallyInsert.length; i++) {
            const pk = pkData.find(p => p.id === actuallyInsert[insertIdx]);
            insertIdx++;

            let minL = 20, maxL = 25;
            if (r.spawns.length > 0) {
                minL = r.spawns[0].minLevel;
                maxL = r.spawns[0].maxLevel;
            }

            r.spawns.push({
                pokemonId: pk.id,
                minLevel: minL,
                maxLevel: maxL,
                chance: 0.05
            });
        }
    }

    let finalStr = "export const " + prefix + "Routes = " + JSON.stringify(routes, null, 2) + ";\n\n";
    finalStr += "export const " + prefix + "Unlocks = " + JSON.stringify(unlocks, null, 2) + ";\n";
    fs.writeFileSync(`config/${routeFile}.js`, finalStr);
    console.log(`${regionName} injected ${insertIdx} pokemon.`);
}

processRegion(8, 'Galar', 'galarRoutes');
processRegion(10, 'Paldea', 'paldeaRoutes');
