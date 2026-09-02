const fs = require('fs');

let battleJs = fs.readFileSync('src/ui/battle.js', 'utf8');

battleJs = battleJs.replace(
    /const wrapper = spriteEl\.parentElement;/g,
    `const wrapper = side === 'player' ? document.getElementById('player-sprite-wrapper') : document.getElementById('enemy-sprite-wrapper');`
);

battleJs = battleJs.replace(
    /if \(spriteEl.parentElement\) spriteEl.parentElement.classList.remove/g,
    `const wrapper = side === 'player' ? document.getElementById('player-sprite-wrapper') : document.getElementById('enemy-sprite-wrapper');\n    if (wrapper) wrapper.classList.remove`
);

fs.writeFileSync('src/ui/battle.js', battleJs);
console.log('Fixed wrappers for JS!');
