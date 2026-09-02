const fs = require('fs');

let battleJs = fs.readFileSync('src/ui/battle.js', 'utf8');

battleJs = battleJs.replace(
    /dmgNode\.style\.transition = 'all 1s ease-out';/,
    `dmgNode.style.transition = 'top 3s linear, opacity 1s linear';`
);

const oldDamageAnim = `    // Animate up
    setTimeout(() => {
        dmgNode.style.top = (parseInt(dmgNode.style.top) - 40) + 'px';
    }, 50);

    // Keep 100% opacity for 2 seconds, then fade out over 1 second
    setTimeout(() => {
        dmgNode.style.opacity = '0';
    }, 2050);

    setTimeout(() => {
        if (dmgNode.parentElement) dmgNode.parentElement.removeChild(dmgNode);
    }, 3050);`;

const newDamageAnim = `    // Set initial opacity explicit for transition
    dmgNode.style.opacity = '1';

    // Slide up constantly over 3s
    setTimeout(() => {
        dmgNode.style.top = (parseInt(dmgNode.style.top) - 40) + 'px';
    }, 50);

    // After 2s, start fading out over the last 1s
    setTimeout(() => {
        dmgNode.style.opacity = '0';
    }, 2050);

    setTimeout(() => {
        if (dmgNode.parentElement) dmgNode.parentElement.removeChild(dmgNode);
    }, 3050);`;

battleJs = battleJs.replace(oldDamageAnim, newDamageAnim);

fs.writeFileSync('src/ui/battle.js', battleJs);
console.log('Damage float duration patched to 3s slide!');
