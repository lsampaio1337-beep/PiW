const xlsx = require('xlsx');
const path = require('path');

for (const file of ['1_Kanto_Data.xlsx', '2_Johto_Data.xlsx', '7_Alola_Data.xlsx', '10_Paldea_Data.xlsx']) {
  const wb = xlsx.readFile(path.join('xdata', file));
  const sheet = wb.Sheets['Routes'];
  const rows = xlsx.utils.sheet_to_json(sheet);
  const routeMap = {};
  for (const r of rows) {
    const route = r['Route'];
    const pk = r['Pokemon Name'];
    if (!route || !pk) continue;
    if (!routeMap[route]) routeMap[route] = {};
    if (!routeMap[route][pk]) routeMap[route][pk] = [];
    routeMap[route][pk].push(r);
  }
  console.log(`=== ${file} ===`);
  for (const [route, pks] of Object.entries(routeMap)) {
    for (const [pk, list] of Object.entries(pks)) {
      if (list.length > 1) {
        console.log(`  Route "${route}" | ${pk}: ${list.length} times -> ` + list.map(x => `[${x['Challenge']}: LvlMin=${x['LvlMin']}, LvlMax=${x['LvlMax']}, %=${x['% Appearance']}]`).join(', '));
      }
    }
  }
}
