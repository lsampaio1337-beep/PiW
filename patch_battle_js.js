const fs = require('fs');

let content = fs.readFileSync('src/ui/battle.js', 'utf8');

// Ensure that applyMovementAnimation ALWAYS receives updates to isAnimating = false when we are in battle.
// Specifically, let's fix the logic so that it checks if battleSystem.isSliding || battleSystem.isSearching in one central place.
content = content.replace(
    /if \(elEnemyContainer && enemy\) applyMovementAnimation\(elEnemyContainer, enemy, battleSystem\.isSliding \|\| battleSystem\.isSearching\);\n\n\s*if \(!battleSystem\.isSliding && !battleSystem\.isSearching\) \{\n\s*if \(elEnemyContainer\) applyMovementAnimation\(elEnemyContainer, null, false\);\n\s*\}/g,
    `if (elEnemyContainer && enemy) {
                    if (battleSystem.isSliding || battleSystem.isSearching) {
                        applyMovementAnimation(elEnemyContainer, enemy, true);
                    } else {
                        applyMovementAnimation(elEnemyContainer, enemy, false);
                    }
                }`
);

content = content.replace(
    /applyMovementAnimation\(elPlayerContainer, leader, battleSystem\.isSearching \|\| battleSystem\.isSliding\);\n\s*if \(!battleSystem\.isSearching && !battleSystem\.isSliding\) \{\n\s*applyMovementAnimation\(elPlayerContainer, null, false\);\n\s*\}/g,
    `if (battleSystem.isSearching || battleSystem.isSliding) {
                        applyMovementAnimation(elPlayerContainer, leader, true);
                    } else {
                        applyMovementAnimation(elPlayerContainer, leader, false);
                    }`
);

fs.writeFileSync('src/ui/battle.js', content, 'utf8');
