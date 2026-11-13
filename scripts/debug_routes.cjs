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
console.log("Total routes in hisuiRoutes:", Object.keys(hisuiRoutes).length);
const entries = Object.entries(hisuiRoutes);
for (let i = 0; i < Math.min(5, entries.length); i++) {
  const [name, r] = entries[i];
  console.log(`Route: ${name}, pokes count: ${r.pokes ? r.pokes.length : 0}`);
  if (r.pokes) {
    console.log(r.pokes);
  }
}
