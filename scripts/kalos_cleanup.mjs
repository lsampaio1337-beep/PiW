import fs from 'fs';

const remove = new Set([
  "Route 3 (Water)","Santalune City","Route 22 (Détourner Way)","Lumiose City (South Boulevard)","Camphrier Town",
  "Route 7 (Rivière Walk — East)","Parfum Palace","Route 7 (Rivière Walk — West)","Ambrette Town",
  "Route 8 (Muraille Coast — Lower Beach)","Cyllage City","Cyllage City Gym","Geosenge Town","Shalour City",
  "Tower of Mastery (First Visit)","Tower of Mastery (Second Visit)","Azure Bay","Sea Spirit's Den","Coumarine City",
  "Kalos Power Plant","Lumiose City (North Boulevard & Centrico Plaza)","Laverre City","Poké Ball Factory",
  "Dendemille Town","Anistar City","Lysandre Café & Lysandre Labs (Lumiose City)","Terminus Cave","Couriway Town",
  "Route 19 (Grande Vallée Way)","Snowbelle City","Pokémon Village","Route 22 (Lower River & Chamber of Emptiness)",
  "Lumiose Station","Kiloude City","Unknown Dungeon","Terminus Cave Zygarde","Sea Spirit's Den Legendary",
  "Looker Bureau (Lumiose City)"
]);

// --- Map coordinates ---
const coordPath = 'config/kalosMapCoordinates.js';
const cSrc = fs.readFileSync(coordPath, 'utf8');
const cm = cSrc.match(/export const kalosMapCoordinates = (\{[\s\S]*\});?\s*$/);
const coords = JSON.parse(cm[1]);
let removedCoords = [];
for (const k of Object.keys(coords)) {
  if (remove.has(k) || remove.has(coords[k].name)) { delete coords[k]; removedCoords.push(k); }
}
fs.writeFileSync(coordPath, 'export const kalosMapCoordinates = ' + JSON.stringify(coords, null, 2) + ';\n', 'utf8');

// --- Routes / unlocks ---
const rPath = 'config/kalosRoutes.js';
const rSrc = fs.readFileSync(rPath, 'utf8');
const m = rSrc.match(/export const kalosRoutes = (\[[\s\S]*?\]);\s*export const kalosUnlocks = (\[[\s\S]*?\]);/);
let routes = JSON.parse(m[1]).filter(r => !remove.has(r.name));
let unlocks = JSON.parse(m[2]).filter(u => !remove.has(u.areaId));
unlocks.forEach(u => { u.unlocks = u.unlocks.filter(x => !remove.has(x)); });

// --- Renumber main challenges ---
const halves = [7.5, 14.5, 35.5];
const renum = (name) => {
  const mm = name && name.match(/^Challenge (\d+(?:\.\d+)?)$/);
  if (!mm) return name;
  const x = parseFloat(mm[1]);
  const n = Math.ceil(x) + halves.filter(h => h < x).length;
  return 'Challenge ' + n;
};
routes.forEach(r => { r.challengeName = renum(r.challengeName); });
unlocks.forEach(u => { if (u.challengeName) u.challengeName = renum(u.challengeName); });

fs.writeFileSync(rPath, 'export const kalosRoutes = ' + JSON.stringify(routes, null, 2) + ';\n\nexport const kalosUnlocks = ' + JSON.stringify(unlocks, null, 2) + ';\n', 'utf8');

console.log('Removed coords:', removedCoords.length, removedCoords);
routes.filter(r => /^Challenge/.test(r.challengeName)).forEach(r => console.log(r.challengeName, '|', r.name));
