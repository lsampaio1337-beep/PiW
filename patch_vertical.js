const fs = require('fs');

let battleJs = fs.readFileSync('src/ui/battle.js', 'utf8');

const oldUpdateAnim = `function updateSpriteAnimation(spriteEl, pokemon, side) {
    if (!spriteEl) return;

    // Clear existing idle classes
    spriteEl.classList.remove('anim-idle-walk', 'anim-idle-walk-enemy', 'anim-idle-fly', 'anim-idle-fly-enemy', 'anim-idle-swim', 'anim-idle-swim-enemy');

    const types = pokemon.types || [];
    let animClass = side === 'player' ? 'anim-idle-walk' : 'anim-idle-walk-enemy';

    // Determine animation based on priority: Fly+Water -> Fly, Fly -> Fly, Water -> Swim, Else -> Walk
    if (types.includes('Flying')) {
        animClass = side === 'player' ? 'anim-idle-fly' : 'anim-idle-fly-enemy';
    } else if (types.includes('Water')) {
        animClass = side === 'player' ? 'anim-idle-swim' : 'anim-idle-swim-enemy';
    }

    // Don't override attack or entrance classes if they are active, just add it to classList
    spriteEl.classList.add(animClass);

    // Handle fake water display
    const fakeWaterEl = document.getElementById(side + '-fake-water');
    if (fakeWaterEl) {
        if (animClass.includes('swim')) {
            fakeWaterEl.style.display = 'block';
        } else {
            fakeWaterEl.style.display = 'none';
        }
    }
}`;

const newUpdateAnim = `function updateSpriteAnimation(spriteEl, pokemon, side) {
    if (!spriteEl) return;

    // Clear existing idle classes
    spriteEl.classList.remove('anim-idle-walk', 'anim-idle-walk-enemy', 'anim-idle-fly', 'anim-idle-fly-enemy', 'anim-idle-swim', 'anim-idle-swim-enemy');

    const types = pokemon.types || [];
    let animClass = side === 'player' ? 'anim-idle-walk' : 'anim-idle-walk-enemy';

    // Set base padding to 0 first
    const wrapper = spriteEl.parentElement;
    if (wrapper) wrapper.style.paddingTop = '0';

    // Determine animation based on priority: Fly+Water -> Fly, Fly -> Fly, Water -> Swim, Else -> Walk
    if (types.includes('Flying')) {
        animClass = side === 'player' ? 'anim-idle-fly' : 'anim-idle-fly-enemy';
        if (wrapper) wrapper.style.paddingBottom = '60px'; // Fly higher
        if (wrapper) wrapper.style.paddingTop = '0px';
    } else if (types.includes('Water')) {
        animClass = side === 'player' ? 'anim-idle-swim' : 'anim-idle-swim-enemy';
        if (wrapper) wrapper.style.paddingTop = '60px'; // Swim lower
        if (wrapper) wrapper.style.paddingBottom = '0px';
    } else {
        if (wrapper) wrapper.style.paddingTop = '30px'; // Normal walk height
        if (wrapper) wrapper.style.paddingBottom = '0px';
    }

    // Don't override attack or entrance classes if they are active, just add it to classList
    spriteEl.classList.add(animClass);

    // Handle fake water display
    const fakeWaterEl = document.getElementById(side + '-fake-water');
    if (fakeWaterEl) {
        if (animClass.includes('swim')) {
            fakeWaterEl.style.display = 'block';
        } else {
            fakeWaterEl.style.display = 'none';
        }
    }
}`;

battleJs = battleJs.replace(oldUpdateAnim, newUpdateAnim);
fs.writeFileSync('src/ui/battle.js', battleJs);
console.log("Patched vertical alignments!");
