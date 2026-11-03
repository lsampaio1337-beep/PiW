const fs = require('fs');
const vm = require('vm');
const xlsx = require('xlsx');

function loadDataFile(filename) {
    let code = fs.readFileSync(filename, 'utf8');
    code = code.replace(/^import\s+.*?;?\s*$/gm, '');
    code = code.replace(/export\s+const\s+/g, 'var ')
               .replace(/export\s+default\s+/g, 'var defaultExport = ')
               .replace(/export\s+\{.*\}\s*;/g, '');
    const context = {};
    vm.createContext(context);
    vm.runInContext(code, context);
    return context;
}

const REGIONS = [
    { num: 1, name: 'Kanto', prefix: '', routesVar: 'routes', unlocksVar: 'unlocks' },
    { num: 2, name: 'Johto', prefix: 'johto', routesVar: 'johtoRoutes', unlocksVar: 'johtoUnlocks' },
    { num: 3, name: 'Hoenn', prefix: 'hoenn', routesVar: 'hoennRoutes', unlocksVar: 'hoennUnlocks' },
    { num: 4, name: 'Sinnoh', prefix: 'sinnoh', routesVar: 'sinnohRoutes', unlocksVar: 'sinnohUnlocks' },
    { num: 5, name: 'Unova', prefix: 'unova', routesVar: 'unovaRoutes', unlocksVar: 'unovaUnlocks' },
    { num: 6, name: 'Kalos', prefix: 'kalos', routesVar: 'kalosRoutes', unlocksVar: 'kalosUnlocks' },
    { num: 7, name: 'Alola', prefix: 'alola', routesVar: 'alolaRoutes', unlocksVar: 'alolaUnlocks' },
    { num: 8, name: 'Galar', prefix: 'galar', routesVar: 'galarRoutes', unlocksVar: 'galarUnlocks' },
    { num: 9, name: 'Hisui', prefix: 'hisui', routesVar: 'hisuiRoutes', unlocksVar: 'hisuiUnlocks' },
    { num: 10, name: 'Paldea', prefix: 'paldea', routesVar: 'paldeaRoutes', unlocksVar: 'paldeaUnlocks' }
];

const regionData = {};
let maxRows = 0;

REGIONS.forEach(r => {
    const file = r.prefix ? `config/${r.prefix}Routes.js` : 'config/routes.js';
    const ctx = loadDataFile(file);
    let unlocks = ctx[r.unlocksVar] || ctx[r.routesVar] || ctx.defaultExport || ctx.routes;

    if (!Array.isArray(unlocks)) {
        unlocks = Object.values(unlocks);
    }

    if (r.num === 1) {
        unlocks = ctx.unlocks || ctx.routes || ctx.defaultExport;
    }

    const main = unlocks.filter(u => u.challengeName && !u.challengeName.startsWith('Extra') && !u.challengeName.startsWith('Key') && !u.challengeName.includes('League'));

    const currentRoutes = main.map(m => m.areaId || m.name);

    let officialList = [];
    if (r.num === 1) officialList = ["Route 1", "Route 2", "Viridian Forest", "Pewter Gym", "Route 3", "Mount Moon", "Route 4", "Cerulean Gym", "Route 24", "Route 25", "Route 5", "Route 6", "Vermilion Gym", "Route 11", "Digglett Cave", "Route 9", "Route 10", "Rock Tunnel", "Route 8", "Celadon Gym", "Saffron Gym", "Route 7", "Pokemon Tower", "Route 12", "Route 13", "Route 14,15", "Fuchsia Gym", "Cycling Road (16-18)", "Safari Zone", "Sea Routes", "Pokemon Mansion", "Cinnabar Gym", "Viridian Gym", "Route 22", "Route 23", "Kanto Pokemon League"];
    else if (r.num === 2) officialList = ["Route 29", "Route 30", "Route 31", "Dark Cave", "Violet Gym", "Route 32", "Ruins of Alph", "Union Cave", "Route 33", "Slowpoke Well", "Azalea Gym", "Ilex Forest", "Route 34", "Daycare", "Goldenrod Gym", "Goldenrod Game Corner", "Route 35", "National Park", "Route 36", "Route 37", "Ecruteak Gym", "Burned Tower", "Bell Tower", "Route 38", "Route 39", "Olivine Gym", "Route 40", "Route 41", "Cianwood Gym", "Route 42", "Mt. Mortar", "Mahogany Gym", "Route 43", "Lake of Rage", "Team Rocket HQ", "Route 44", "Ice Path", "Blackthorn Gym", "Dragon's Den", "Route 45", "Route 46", "Route 27", "Tohjo Falls", "Route 28", "Victory Road", "Pokemon League", "Mount Silver", "Legendaries Nest"];
    else if (r.num === 3) officialList = ["Route 101", "Route 102", "Route 103", "Route 104", "Petalburg Woods", "Route 116", "Rustboro Gym", "Route 105", "Route 106 Fishing Spot", "Granite Cave", "Dewford Gym", "Route 107", "Slateport Docks", "Route 109 Fishing Spot", "Route 110", "Mauville Gym", "Route 111", "Route 117", "Route 113", "Route 114", "Meteor Falls", "Route 115", "Jagged Pass", "Fiery Path", "Lavaridge Gym", "Petalburg Gym", "Route 118", "Route 119", "Fortree Gym", "Route 120", "Route 121", "Safari Zone East", "Route 123", "Mount Pyre", "Route 124", "Mossdeep Gym", "Shoal Cave", "Route 126 Underwater", "Sootopolis Gym", "Sky Pillar", "Victory Road", "Hoenn Pokemon League", "Nebula Fissure"];
    else if (r.num === 4) officialList = ["Route 201", "Route 202", "Route 203", "Oreburgh Gate", "Oreburgh Gym", "Route 204", "Ravaged Path", "Valley Windworks", "Route 205", "Eterna Forest", "Eterna Gym", "Route 211", "Mount Coronet", "Route 208", "Hearthome Gym", "Route 209", "Route 214", "Route 213", "Pastoria Gym", "Great Marsh", "Route 212", "Route 215", "Veilstone Gym", "Route 218", "Canalave Gym", "Route 216", "Route 217", "Snowpoint Gym", "Route 222", "Sunyshore Gym", "Route 223", "Victory Road", "Sinnoh Pokemon League"];
    else if (r.num === 5) officialList = ["Route 19", "Route 20", "Floccesy Ranch", "Floccesy Pond", "Aspertia Gym", "Virbank City", "Virbank Complex", "Virbank Bay", "Virbank Gym", "Castelia City", "Castelia Sewers", "Castelia Park", "Relic Passage", "Castelia Gym", "Route 4", "Desert Resort", "Relic Castle", "Route 16", "Lostlorn Forest", "Nimbasa City", "Nimbasa Gym", "Driftveil Drawbridge", "Driftveil City", "Route 6", "Chargestone Cave", "Driftveil Gym", "Mistralton City", "Route 7", "Celestial Tower", "Mistralton Gym", "Strange House", "Reversal Mountain", "Undella Town", "Undella Bay", "Route 14", "Abundant Shrine", "Route 13", "Village Bridge", "Route 12", "Route 11", "Opelucid City", "Route 9", "Opelucid Gym", "Humilau City", "Humilau Sea", "Route 22", "Humilau Gym", "Route 21", "Seaside Cave", "P2 Laboratory", "Wellspring Cave", "Giant Chasm", "Route 23", "Victory Road", "Unova Pokemon League", "Dragonspire Clouds"];
    else if (r.num === 6) officialList = ["Aquacorde Outskirts", "Route 2", "Santalune Forest", "Route 3", "Santalune Outskirts", "Santalune City Gym", "Route 4", "Lumiose South Boulevard", "Route 5", "Camphrier Berry Fields", "Route 6", "Route 7", "Connecting Cave", "Route 8", "Ambrette Cliffs", "Route 9", "Glittering Cave", "Cyllage Seaside Slope", "Cyllage City Gym", "Route 10", "Geosenge Megalith Ruins", "Route 11", "Reflection Cave", "Shalour Beachfront", "Shalour City Gym", "Route 12", "Azure Deep", "Azure Bay Isles", "Coumarine Seaside Hill", "Coumarine Docks", "Coumarine City Gym", "Route 13", "Lumiose North Boulevard", "Lumiose City Gym", "Route 14", "Laverre Mushroom Woods", "Laverre City Gym", "Route 15", "Dendemille Windmill Farm", "Frost Cavern", "Anistar Sundial Terrace", "Anistar City Gym", "Route 17", "Couriway Cascades", "Route 18", "Route 19 Marshlands", "Vallée Grande Marshlands", "Snowbelle Frostwoods", "Route 20", "Hidden Village Glade", "Snowbelle City Gym", "Route 21", "Victory Road", "Kalos Pokemon League", "The Eternal Fight"];
    else if (r.num === 7) officialList = ["Route 1 East", "Route 1 Hau'oli Outskirts", "Hau'oli Cemetery", "Route 2 North", "Captain Ilima Boss Battle", "Seaward Cave", "Kahuna Hala Boss Battle", "Ten Carat Hill Farthest Hollow", "Paniola Ranch", "Daycare NPC", "Route 5", "Captain Lana Boss Battle", "Wela Volcano Park", "Captain Kiawe Boss Battle", "Route 7", "Route 8 Fossil Restoration Center Part 1", "Lush Jungle North", "Lush Jungle East Cave", "Captain Mallow Boss Battle", "Diglett's Tunnel", "Akala Outskirts", "Kahuna Olivia Boss Battle", "Malie City", "Mount Hokulani East", "Captain Sophocles Boss Battle", "Tapu Village", "Thrifty Megamart", "Captain Acerola Boss Battle", "Haina Desert", "Kahuna Nanu Boss Battle", "Seafolk Village", "Poni Wilds", "Poni Breaker Coast", "Exeggutor Island", "Kahuna Hapu Boss Battle", "Vast Poni Canyon Outside", "Captain Mina Boss Battle", "Captain Kommo-o Boss Battle", "Mount Lanakila", "Alola Pokemon League Boss Battle", "Champion Hau Boss Battle"];
    else if (r.num === 8) officialList = ["Route 1", "Slumbering Weald", "Route 2", "Rolling Fields", "Dappled Grove", "West Lake Axewell", "Watchtower Ruins", "East Lake Axewell", "South Lake Miloch", "North Lake Miloch", "Route 3", "Galar Mine", "Route 4", "Turffield Gym", "Route 5", "Hulbury", "Hulbury Gym", "Galar Mine No. 2", "Motostoke Outskirts", "Motostoke Gym", "Motostoke Riverbank", "Bridge Field", "Stony Wilderness", "Dusty Bowl", "Giant's Cap", "Hammerlocke Hills", "Route 6", "Stow-on-Side Gym", "Glimwood Tangle", "Ballonlea Gym", "Route 7", "Route 8", "Circhester Gym", "Route 9", "Axew's Eye", "Lake of Outrage", "Route 9 Tunnel", "Outer Spikemuth", "Spikemuth Gym", "Hammerlocke Gym", "Route 10", "Pokemon League"];
    else if (r.num === 9) officialList = ["Aspiration Hill", "Horseshoe Plains", "Deertrack Path", "Oreburrow Tunnel", "The Heartwood North", "The Heartwood South", "Deertrack Heights", "Nature’s Pantry", "Gym - Kleavor", "Obsidian Falls", "Golden Lowlands North", "Golden Lowlands South", "Gapejaw Bog North", "Gapejaw Bog South", "Holm of Trials", "Ursa's Ring", "Sludge Mound", "Scarlet Bog", "Bolderoll Slope", "Gym - Lilligant", "Crossing Slope", "Bathers' Lagoon", "Deadwood Haunt", "Castaway Shore", "Veilstone Cape", "Tranquility Cove", "Islespy Shore", "Spring Path", "Firespit Island", "Gym - Arcanine", "Gym - Warden Ingo", "Celestica Trail", "Clamberclaw Cliffs", "Coronet Highlands", "Celestica Ruins", "Sacred Plaza", "Fabled Spring", "Stonetooth Rows", "Primeval Grotto", "Gym - Electrode", "Whiteout Valley", "Bonechill Wastes North", "Bonechill Wastes South", "Glacier Terrace", "Heart's Crag", "Snowpoint Temple", "Arena's Approach", "Gym - Avalugg", "Etertime Citadel"];
    else if (r.num === 10) officialList = ["Poco Path - Main", "Los Platos - Main", "South Province (Area One) - Beach", "South Province (Area One) - Cave", "South Province (Area One) - Flower Patch", "South Province (Area One) - Forest", "South Province (Area One) - Grass", "South Province (Area One) - Lake", "South Province (Area One) - Near Town", "South Province (Area One) - Ocean", "South Province (Area One) - River", "South Province (Area One) - Ruins", "Mesagoza - Main", "South Province (Area Two) - Flower Patch", "South Province (Area Two) - Forest", "South Province (Area Two) - Grass", "South Province (Area Two) - Mountain", "South Province (Area Two) - Near Town", "South Province (Area Two) - Olive Grove", "South Province (Area Two) - Rocky", "Cortondo Gym", "South Province (Area Three) - Grass", "South Province (Area Three) - Rocky", "Artazon Gym", "East Province (Area One) - Beach", "East Province (Area One) - Forest", "East Province (Area One) - Grass", "East Province (Area One) - Mountain", "East Province (Area One) - Near Town", "East Province (Area One) - Ocean", "East Province (Area One) - Rocky", "East Province (Area Two) - Forest", "East Province (Area Two) - Grass", "East Province (Area Two) - Near Town", "East Province (Area Two) - River", "East Province (Area Two) - Rocky", "Levincia Gym", "South Province (Area Five) - Beach", "South Province (Area Five) - Grass", "South Province (Area Five) - Lake", "South Province (Area Five) - Mountain", "South Province (Area Five) - River", "West Province (Area Two) - Beach", "West Province (Area Two) - Grass", "West Province (Area Two) - Near Town", "West Province (Area Two) - River", "Cascarrafa Gym", "West Province (Area Three) - Forest", "West Province (Area Three) - Grass", "West Province (Area Three) - Lake", "Medali Gym", "Montenevera Gym", "Alfornada Gym", "Glaseado Gym", "Casseroya Lake - Forest", "Casseroya Lake - Lake", "Casseroya Lake - Snow", "Paldea Pokemon League", "The Great Crater of Paldea - Upper", "The Great Crater of Paldea - Lower", "Zero Gate - Main"];

    let fixedOrder = currentRoutes.slice().sort((a,b) => {
       let idxA = officialList.indexOf(a);
       let idxB = officialList.indexOf(b);
       if (idxA === -1) idxA = 999;
       if (idxB === -1) idxB = 999;
       if (idxA === idxB) return 0;
       return idxA - idxB;
    });

    regionData[r.num] = {
        current: currentRoutes,
        fixed: fixedOrder
    };

    const maxLen = Math.max(currentRoutes.length, fixedOrder.length);
    if (maxLen > maxRows) maxRows = maxLen;
});

let outputData = [];
for (let i = 0; i < maxRows; i++) {
    let row = {};
    REGIONS.forEach(r => {
        const current = regionData[r.num].current;
        const fixed = regionData[r.num].fixed;

        row[`Region ${r.num} - #`] = (i < current.length || i < fixed.length) ? (i + 1) : "";
        row[`Region ${r.num} - Routes`] = current[i] || "";
        row[`Region ${r.num} - Fixed Routes`] = fixed[i] || "";
        row[`Region ${r.num} - Empty`] = "";
    });
    outputData.push(row);
}

const wb = xlsx.utils.book_new();
const ws = xlsx.utils.json_to_sheet(outputData);
xlsx.utils.book_append_sheet(wb, ws, "Route Order Check");
xlsx.writeFile(wb, "route_order.xlsx");
console.log("Generated route_order.xlsx");
