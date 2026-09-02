const fs = require('fs');

// Replace the TYPE_COLORS_MAP block we added to just use the one in scope, since we verified it DOES exist and work.
let battleJs = fs.readFileSync('src/ui/battle.js', 'utf8');

battleJs = battleJs.replace(
    /const localTypeColors = \{[\s\S]*?\};\n    const color = localTypeColors\[moveType\] \|\| '#ffffff';/m,
    `const color = TYPE_COLORS[moveType] || '#ffffff';`
);

fs.writeFileSync('src/ui/battle.js', battleJs);
console.log('Fixed localTypeColors!');
