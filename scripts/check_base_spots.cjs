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
const keys = Object.keys(hisuiRoutes);
console.log("Keys count:", keys.length);

// Group by base name without parenthesized region/category
const baseMap = {};
for (const k of keys) {
  const base = k.replace(/\s*\([^)]*\)$/, '').trim();
  if (!baseMap[base]) baseMap[base] = [];
  baseMap[base].push(k);
}

for (const [base, list] of Object.entries(baseMap)) {
  if (list.length > 1) {
    console.log(`Base spot "${base}" has multiple route entries:`, list);
  }
}
