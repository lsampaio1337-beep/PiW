const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('xdata').filter(f => f.endsWith('.xlsx') && !f.includes('_'));
for (const file of fs.readdirSync('xdata').filter(f => f.match(/^\d+_[A-Za-z]+_Data\.xlsx$/))) {
  const wb = xlsx.readFile(path.join('xdata', file));
  const sheet = wb.Sheets['Routes'];
  if (!sheet) continue;
  const rows = xlsx.utils.sheet_to_json(sheet);
  const routeMap = {};
  for (const r of rows) {
    const route = r['Route'];
    const pk = r['Pokemon Name'];
    if (!route || !pk) continue;
    if (!routeMap[route]) routeMap[route] = {};
    routeMap[route][pk] = (routeMap[route][pk] || 0) + 1;
  }
  let dupes = 0;
  for (const [route, pks] of Object.entries(routeMap)) {
    for (const [pk, cnt] of Object.entries(pks)) {
      if (cnt > 1) dupes++;
    }
  }
  console.log(`${file}: ${dupes} repeated (Route + Pokemon) entries`);
}
