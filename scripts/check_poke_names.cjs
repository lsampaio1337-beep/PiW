const fs = require('fs');
const vm = require('vm');

function loadDataFile(filepath) {
    let code = fs.readFileSync(filepath, 'utf8');
    code = code.replace(/^import\s+.*?;?\s*$/gm, '');
    code = code.replace(/export\s+const\s+/g, 'var ')
               .replace(/export\s+default\s+/g, 'var defaultExport = ')
               .replace(/export\s+\{.*\}\s*;/g, '');
    code = code.replace(/^const\s+([a-zA-Z0-9_]+)\s*=/gm, 'var $1 =');

    const context = {};
    vm.createContext(context);
    vm.runInContext(code, context);
    return context;
}

const { hisuiRoutes } = loadDataFile('config/hisuiRoutes.js');
const pokemonData = require('../data/pokemon.json');
const pokeNameMap = {};
pokemonData.forEach(p => { pokeNameMap[p.id] = p.name; });

for (const [routeName, route] of Object.entries(hisuiRoutes)) {
  if (!route.pokes) continue;
  const names = {};
  for (const p of route.pokes) {
    const name = pokeNameMap[p.id] || `Unknown(${p.id})`;
    names[name] = (names[name] || 0) + 1;
  }
  const dupes = Object.entries(names).filter(([name, c]) => c > 1);
  if (dupes.length > 0) {
    console.log(`Route "${routeName}" has duplicate pokemon names:`, dupes);
  }
}
