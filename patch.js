const fs = require('fs');
let code = fs.readFileSync('src/ui/market.js', 'utf8');
code = code.replace(/state\.storage\.forEach\(p => \{/g, "state.storage.forEach(p => {\n        if (!p.uuid) p.uuid = Math.random().toString(36).substring(2, 15);");
fs.writeFileSync('src/ui/market.js', code);
