const fs = require('fs');
let content = fs.readFileSync('src/battleSystem.js', 'utf8');

content = content.replace(
    `console.log('Setting timeout for sliding:', slideDelay);
        this.combatLoop = setTimeout(() => {
            console.log('Timeout finished sliding!');
            this.isSliding = false;
            this.updateUI();
            this.scheduleTurn();
        }, slideDelay);`,
    `this.combatLoop = setTimeout(() => {
            this.isSliding = false;
            this.updateUI();
            this.scheduleTurn();
        }, slideDelay);`
);
content = content.replace(
    `console.log('Setting timeout for sliding:', slideDelay);
        this.combatLoop = setTimeout(() => {
            console.log('Timeout finished sliding!');
            this.isSliding = false;
            this.updateUI();
            this.scheduleTurn();
        }, slideDelay);`,
    `this.combatLoop = setTimeout(() => {
            this.isSliding = false;
            this.updateUI();
            this.scheduleTurn();
        }, slideDelay);`
);

fs.writeFileSync('src/battleSystem.js', content, 'utf8');
