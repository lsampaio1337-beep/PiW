const xlsx = require('xlsx');

const wb = xlsx.readFile('xdata/9_Hisui_Data.xlsx');
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

for (const [route, pks] of Object.entries(routeMap)) {
  const dupes = Object.entries(pks).filter(([pk, list]) => list.length > 1);
  if (dupes.length > 0) {
    console.log(`Route "${route}" has ${dupes.length} repeated Pokemon:`);
    for (const [pk, list] of dupes) {
      console.log(`  ${pk} (${list.length} times): ` + list.map(x => `[${x['Challenge']}: LvlMin=${x['LvlMin']}, LvlMax=${x['LvlMax']}, %=${x['% Appearance']}]`).join(', '));
    }
  }
}
