const fs = require('fs');
let code = fs.readFileSync('src/ui.js', 'utf8');

// Replace the 'storage' capacity string with 'box' capacity string
code = code.replace(
    /window\.mathEngine\.getCapacity\(state, 'storage'\)/g,
    "window.mathEngine.getCapacity(state, 'box')"
);

fs.writeFileSync('src/ui.js', code);
console.log("Replaced 'storage' with 'box' in getCapacity calls in src/ui.js");
