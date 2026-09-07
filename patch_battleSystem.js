const fs = require('fs');

let content = fs.readFileSync('src/battleSystem.js', 'utf8');

// I am adding a small debug to see when isSearching / isSliding actually updates.
content = content.replace(
    /this.isSliding = false;\n\s*this.updateUI\(\);/g,
    `this.isSliding = false;
            this.updateUI();`
);

fs.writeFileSync('src/battleSystem.js', content, 'utf8');
