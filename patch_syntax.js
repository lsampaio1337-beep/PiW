const fs = require('fs');

let battleJs = fs.readFileSync('src/ui/battle.js', 'utf8');
battleJs = battleJs.replace(
    /    \/\/ Set base padding to 0 first\n    const wrapper = side === 'player' \? document.getElementById\('player-sprite-wrapper'\) : document.getElementById\('enemy-sprite-wrapper'\);\n    if \(wrapper\) wrapper\.style\.paddingTop = '0';/g,
    `    // Set base padding to 0 first
    if (wrapper) wrapper.style.paddingTop = '0';`
);

fs.writeFileSync('src/ui/battle.js', battleJs);
console.log('Fixed wrapper double declaration');
