const fs = require('fs');
let content = fs.readFileSync('src/ui/battle.js', 'utf8');

// I also need to update the "applyMovementAnimation" function so that it checks if dataset is stopping
// `if (isAnimating && !pokemon) return;` is okay, but `!elContainer` check should be first.
content = content.replace(
    /if \(!elContainer\) return;\n\s*if \(isAnimating && !pokemon\) return;/g,
    `if (!elContainer) return;
    // We want to be able to stop animations even if pokemon is null
    if (isAnimating && !pokemon) return;`
);

// If the user says "Battle is not starting, my pokemon keeps animated and nothing happens",
// this implies that `updateUI()` is NOT called when the battle starts, OR the animation iteration event never fires because the container is display: none or hidden?
// No, the battle is literally not starting. The user said "nothing happens".
// Let's look at `animationiteration` event listener in `applyMovementAnimation`.

content = content.replace(
    `const handleIteration = () => {`,
    `const handleIteration = () => {
                if (!elContainer.dataset.stopping || elContainer.dataset.stopping === "false") return;`
);

// We need to ensure that the execution of battleSystem doesn't get blocked by the animation.
// Wait, the battle system is completely asynchronous to UI. It uses setTimeout (`this.combatLoop = setTimeout(() => { ... this.scheduleTurn(); })`).
// It shouldn't block the battle itself. If the battle is "not starting" and "nothing happens", could there be a JS error preventing `scheduleTurn()` from firing?
fs.writeFileSync('src/ui/battle.js', content, 'utf8');
