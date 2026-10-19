import fs from 'fs';
import xlsx from 'xlsx';

const getPokemonData = () => JSON.parse(fs.readFileSync('./data/pokemon.json', 'utf8'));

const getCatchableIds = (code) => {
  const ids = new Set();
  const regex = /"pokemonId":\s*(\d+)/g;
  let match;
  while ((match = regex.exec(code)) !== null) {
    ids.add(parseInt(match[1], 10));
  }
  return ids;
};

const pokemonData = getPokemonData();

const sinnohPokedex = pokemonData.filter(p => typeof p.sinnoh_id === 'number');
const unovaPokedex = pokemonData.filter(p => typeof p.unova_id === 'number');

const sinnohMap = new Map(sinnohPokedex.map(p => [p.id, p]));
const unovaMap = new Map(unovaPokedex.map(p => [p.id, p]));
// We also need the global map to resolve evolutions that might drop out of regional pokedex
const globalMap = new Map(pokemonData.map(p => [p.id, p]));

const getEvolutions = (catchableIds) => {
    let evolvableIds = new Set();
    for (let p of globalMap.values()) {
        if (catchableIds.has(p.id)) {
            // Traverse evolutions
            let stack = [p];
            while (stack.length > 0) {
                let curr = stack.pop();
                if (curr.evolutions) {
                    for (let ev of curr.evolutions) {
                        evolvableIds.add(ev.to);
                        const nextP = globalMap.get(ev.to);
                        if (nextP) stack.push(nextP);
                    }
                }
            }
        }
    }
    return evolvableIds;
};

const sinnohCode = fs.readFileSync('./config/sinnohRoutes.js', 'utf8');
const unovaCode = fs.readFileSync('./config/unovaRoutes.js', 'utf8');
const sinnohCatchableIds = getCatchableIds(sinnohCode);
const unovaCatchableIds = getCatchableIds(unovaCode);

const sinnohEvolvableIds = getEvolutions(sinnohCatchableIds);
const unovaEvolvableIds = getEvolutions(unovaCatchableIds);

const generateSheetData = (pokedex, regionKey, catchableIds, evolvableIds) => {
    // Sort by regional id
    pokedex.sort((a, b) => a[regionKey] - b[regionKey]);
    const data = [];
    data.push(['Number', 'Name', 'Status']);

    for (const p of pokedex) {
        let status = 'No';
        if (catchableIds.has(p.id)) {
            status = 'Catch';
        } else if (evolvableIds.has(p.id)) {
            status = 'Evolved';
        }
        data.push([p[regionKey], p.name, status]);
    }
    return data;
};

const sinnohSheetData = generateSheetData(sinnohPokedex, 'sinnoh_id', sinnohCatchableIds, sinnohEvolvableIds);
const unovaSheetData = generateSheetData(unovaPokedex, 'unova_id', unovaCatchableIds, unovaEvolvableIds);

const legendariesData = [];
legendariesData.push(['Region', 'Name', 'Type']);

const sinnohLegendaries = [
  "Uxie", "Mesprit", "Azelf", "Dialga", "Palkia", "Heatran", "Regigigas", "Giratina", "Cresselia", "Phione", "Manaphy", "Darkrai", "Shaymin", "Arceus"
];

const unovaLegendaries = [
  "Cobalion", "Terrakion", "Virizion", "Tornadus", "Thundurus", "Reshiram", "Zekrom", "Landorus", "Kyurem", "Victini", "Keldeo", "Meloetta", "Genesect"
];

for (const name of sinnohLegendaries) {
    legendariesData.push(['Sinnoh', name, 'Legendary/Mythical']);
}
for (const name of unovaLegendaries) {
    legendariesData.push(['Unova', name, 'Legendary/Mythical']);
}

const wb = xlsx.utils.book_new();

const wsSinnoh = xlsx.utils.aoa_to_sheet(sinnohSheetData);
const wsUnova = xlsx.utils.aoa_to_sheet(unovaSheetData);
const wsLegendaries = xlsx.utils.aoa_to_sheet(legendariesData);

xlsx.utils.book_append_sheet(wb, wsSinnoh, 'Region 4 (Sinnoh)');
xlsx.utils.book_append_sheet(wb, wsUnova, 'Region 5 (Unova)');
xlsx.utils.book_append_sheet(wb, wsLegendaries, 'Legendaries & Mythicals');

xlsx.writeFile(wb, 'pokemon_regions_4_5.xlsx');
