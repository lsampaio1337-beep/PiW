const xlsx = require('xlsx');

const wb = xlsx.readFile('xdata/9_Hisui_Data.xlsx');
const sheet = wb.Sheets['Routes'];
const rows = xlsx.utils.sheet_to_json(sheet);

console.log("Total rows in Routes sheet:", rows.length);

const routePokeMap = {};
for (const row of rows) {
  const route = row['Route'];
  const poke = row['Pokemon Name'];
  if (!route || !poke) continue;
  const key = `${route} | ${poke}`;
  if (!routePokeMap[key]) routePokeMap[key] = [];
  routePokeMap[key].push(row);
}

const repeatedInSheet = Object.entries(routePokeMap).filter(([k, v]) => v.length > 1);
console.log("Repeated (Route + Pokemon) in 9_Hisui_Data.xlsx:", repeatedInSheet.length);
for (const [k, v] of repeatedInSheet.slice(0, 15)) {
  console.log(`  ${k}: ${v.length} times`);
  v.forEach(r => console.log(`     Challenge: "${r['Challenge']}", LvlMin: ${r['LvlMin']}, LvlMax: ${r['LvlMax']}, %: ${r['% Appearance']}`));
}
