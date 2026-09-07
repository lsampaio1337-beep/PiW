const fs = require('fs');
let bs = fs.readFileSync('src/battleSystem.js', 'utf8');

bs = bs.replace(
    /this\.combatLoop = setTimeout\(\(\) => \{\n\s*this\.isSliding = false;\n\s*this\.updateUI\(\);\n\s*this\.scheduleTurn\(\);\n\s*\}, slideDelay\);/g,
    `console.log('Setting timeout for sliding:', slideDelay);
        this.combatLoop = setTimeout(() => {
            console.log('Timeout finished sliding!');
            this.isSliding = false;
            this.updateUI();
            this.scheduleTurn();
        }, slideDelay);`
);

fs.writeFileSync('src/battleSystem.js', bs, 'utf8');
