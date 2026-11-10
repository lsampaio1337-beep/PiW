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
    { num: 3, name: 'Hoenn', prefix: 'hoenn', routesVar: 'hoennRoutes', unlocksVar: 'hoennUnlocks' },
    { num: 4, name: 'Sinnoh', prefix: 'sinnoh', routesVar: 'sinnohRoutes', unlocksVar: 'sinnohUnlocks' },
    { num: 5, name: 'Unova', prefix: 'unova', routesVar: 'unovaRoutes', unlocksVar: 'unovaUnlocks' },
    { num: 60, name: 'Region 60', prefix: 'region60', routesVar: 'region60Routes', unlocksVar: 'region60Unlocks' },
    { num: 70, name: 'Region 70', prefix: 'region70', routesVar: 'region70Routes', unlocksVar: 'region70Unlocks' },
    { num: 80, name: 'Region 80', prefix: 'region80', routesVar: 'region80Routes', unlocksVar: 'region80Unlocks' },
    { num: 90, name: 'Region 90', prefix: 'region90', routesVar: 'region90Routes', unlocksVar: 'region90Unlocks' },
    { num: 100, name: 'Region 100', prefix: 'region100', routesVar: 'region100Routes', unlocksVar: 'region100Unlocks' }
];

const regionData = {};
let maxRows = 0;

REGIONS.forEach(r => {
    const file = `config/${r.prefix}Routes.js`;
    const ctx = loadDataFile(file);
    let unlocks = ctx[r.unlocksVar] || ctx[r.routesVar] || ctx.defaultExport;

    if (!Array.isArray(unlocks)) {
        unlocks = Object.values(unlocks);
    }

    const main = unlocks.filter(u => u.challengeName && !u.challengeName.startsWith('Extra') && !u.challengeName.startsWith('Key') && !u.challengeName.includes('League'));

    const currentRoutes = main.map(m => m.areaId || m.name);

    let officialList = [];
    if (r.num === 3) officialList = ["Route 101", "Route 102", "Route 103", "Route 104", "Petalburg Woods", "Route 116", "Rustboro Gym", "Route 105", "Route 106 Fishing Spot", "Granite Cave", "Dewford Gym", "Route 107", "Slateport Docks", "Route 109 Fishing Spot", "Route 110", "Mauville Gym", "Route 111", "Route 117", "Route 113", "Route 114", "Meteor Falls", "Route 115", "Jagged Pass", "Fiery Path", "Lavaridge Gym", "Petalburg Gym", "Route 118", "Route 119", "Fortree Gym", "Route 120", "Route 121", "Safari Zone East", "Route 123", "Mount Pyre", "Route 124", "Mossdeep Gym", "Shoal Cave", "Route 126 Underwater", "Sootopolis Gym", "Sky Pillar", "Victory Road", "Hoenn Pokemon League", "Nebula Fissure"];
    else if (r.num === 4) officialList = ["Route 201", "Route 202", "Route 203", "Oreburgh Gate", "Oreburgh Gym", "Route 204", "Ravaged Path", "Valley Windworks", "Route 205", "Eterna Forest", "Eterna Gym", "Route 211", "Mount Coronet", "Route 208", "Hearthome Gym", "Route 209", "Route 214", "Route 213", "Pastoria Gym", "Great Marsh", "Route 212", "Route 215", "Veilstone Gym", "Route 218", "Canalave Gym", "Route 216", "Route 217", "Snowpoint Gym", "Route 222", "Sunyshore Gym", "Route 223", "Victory Road", "Sinnoh Pokemon League"];
    else if (r.num === 5) officialList = ["Route 19", "Route 20", "Floccesy Ranch", "Floccesy Pond", "Aspertia Gym", "Virbank City", "Virbank Complex", "Virbank Bay", "Virbank Gym", "Castelia City", "Castelia Sewers", "Castelia Park", "Relic Passage", "Castelia Gym", "Route 4", "Desert Resort", "Relic Castle", "Route 16", "Lostlorn Forest", "Nimbasa City", "Nimbasa Gym", "Driftveil Drawbridge", "Driftveil City", "Route 6", "Chargestone Cave", "Driftveil Gym", "Mistralton City", "Route 7", "Celestial Tower", "Mistralton Gym", "Strange House", "Reversal Mountain", "Undella Town", "Undella Bay", "Route 14", "Abundant Shrine", "Route 13", "Village Bridge", "Route 12", "Route 11", "Opelucid City", "Route 9", "Opelucid Gym", "Humilau City", "Humilau Sea", "Route 22", "Humilau Gym", "Route 21", "Seaside Cave", "P2 Laboratory", "Wellspring Cave", "Giant Chasm", "Route 23", "Victory Road", "Unova Pokemon League", "Dragonspire Clouds"];
    else if (r.num === 6) officialList = ["Aquacorde Outskirts", "Route 2", "Santalune Forest", "Route 3", "Santalune Outskirts", "Santalune City Gym", "Route 4", "Lumiose South Boulevard", "Route 5", "Camphrier Berry Fields", "Route 6", "Route 7", "Connecting Cave", "Route 8", "Ambrette Cliffs", "Route 9", "Glittering Cave", "Cyllage Seaside Slope", "Cyllage City Gym", "Route 10", "Geosenge Megalith Ruins", "Route 11", "Reflection Cave", "Shalour Beachfront", "Shalour City Gym", "Route 12", "Azure Deep", "Azure Bay Isles", "Coumarine Seaside Hill", "Coumarine Docks", "Coumarine City Gym", "Route 13", "Lumiose North Boulevard", "Lumiose City Gym", "Route 14", "Laverre Mushroom Woods", "Laverre City Gym", "Route 15", "Dendemille Windmill Farm", "Frost Cavern", "Anistar Sundial Terrace", "Anistar City Gym", "Route 17", "Couriway Cascades", "Route 18", "Route 19", "Vallée Grande Marshlands", "Snowbelle Frostwoods", "Snowbelle City Gym", "Route 20", "Hidden Village Glade", "Route 21", "Victory Road", "Kalos Pokemon League", "Keys to Eternal Fight"];

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
