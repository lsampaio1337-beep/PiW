const fs = require('fs');
const xlsx = require('xlsx');

// Load Data
const alolaRoutesFile = 'config/alolaRoutes.js';
let alolaRoutesRaw = fs.readFileSync(alolaRoutesFile, 'utf8');

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

    // Sort family chronologically from base to highest stage
    // Simple way: base has no backward evo in family.
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

const missingPks = [
    "Munchlax", "Snorlax", "Rufflet", "Braviary", "Vullaby", "Mandibuzz",
    "Sableye", "Luvdisc", "Feebas", "Milotic", "Alomomola", "Zygarde",
    "Gible", "Gabite", "Garchomp", "Riolu", "Lucario", "Zorua", "Zoroark",
    "Mime Jr.", "Mr. Mime", "Clamperl", "Huntail", "Gorebyss", "Basculin",
    "Electrike", "Manectric", "Frillish", "Jellicent", "Pawniard", "Bisharp",
    "Skrelp", "Dragalge", "Clauncher", "Clawitzer", "Corphish", "Crawdaunt",
    "Litleo", "Pyroar", "Lickitung", "Lickilicky"
];

let toInsert = [];

// "If the evolution tree has only that pokemon insert “No1”, if the evolution tree has 2 pokemons insert “No2”, if evolution tree has 3 pokemons insert “No1” and “No3”, if evolution tree has more then 3 pokemons do nothing."

const processedFamilies = new Set();
missingPks.forEach(m => {
    const p = pkMap[m];
    if (!p) return;
    const fam = getFamily(p.id);
    const famStr = fam.join(',');
    if (processedFamilies.has(famStr)) return;
    processedFamilies.add(famStr);

    if (fam.length === 1) {
        toInsert.push(fam[0]); // No1
    } else if (fam.length === 2) {
        toInsert.push(fam[1]); // No2
    } else if (fam.length === 3) {
        toInsert.push(fam[0]); // No1
        toInsert.push(fam[2]); // No3
    }
});

console.log("To Insert: ", toInsert.map(id => pkMap[id].name).join(", "));
