const fs = require('fs');

// We need to put the attack/defend animations on a wrapper OR isolate them from the idle animation.
// Currently idle is on #player-sprite directly, and attack is ALSO applied to #player-sprite directly, overwriting it.
// The new plan is: idle animation on the PARENT div (the one with position relative that holds the sprite and water).
// Attack animation on the IMG itself. That way they don't fight over `transform`.

let battleJs = fs.readFileSync('src/ui/battle.js', 'utf8');

battleJs = battleJs.replace(
    /spriteEl.classList.remove\('anim-idle-walk'/g,
    `const wrapper = spriteEl.parentElement;
    if (wrapper) wrapper.classList.remove('anim-idle-walk'`
);

battleJs = battleJs.replace(
    /spriteEl.classList.add\(animClass\);/,
    `if (wrapper) wrapper.classList.add(animClass);`
);

// We need to change pauseIdleAnimation and resumeIdleAnimation to target the parent elements too!
battleJs = battleJs.replace(
    /export function pauseIdleAnimation\(\) \{\n    \['player-sprite', 'enemy-sprite'\].forEach\(id => \{\n        const el = document.getElementById\(id\);\n        if \(el\) \{\n            el.style.animationPlayState = 'paused';/g,
    `export function pauseIdleAnimation() {
    ['player-sprite', 'enemy-sprite'].forEach(id => {
        const el = document.getElementById(id);
        if (el && el.parentElement) {
            el.parentElement.style.animationPlayState = 'paused';`
);

battleJs = battleJs.replace(
    /export function resumeIdleAnimation\(\) \{\n    \['player-sprite', 'enemy-sprite'\].forEach\(id => \{\n        const el = document.getElementById\(id\);\n        if \(el\) \{\n            el.style.animationPlayState = 'running';/g,
    `export function resumeIdleAnimation() {
    ['player-sprite', 'enemy-sprite'].forEach(id => {
        const el = document.getElementById(id);
        if (el && el.parentElement) {
            el.parentElement.style.animationPlayState = 'running';`
);

battleJs = battleJs.replace(
    /function clearSpriteAnimation\(spriteEl, side\) \{\n    if \(!spriteEl\) return;\n    spriteEl.classList.remove/g,
    `function clearSpriteAnimation(spriteEl, side) {
    if (!spriteEl) return;
    if (spriteEl.parentElement) spriteEl.parentElement.classList.remove`
);

// We no longer need to remove idleClasses from el when playing attack since they are on the parent!
battleJs = battleJs.replace(
    /    \/\/ Briefly remove idle anim during attack\n    const idleClasses = Array.from\(el.classList\).filter\(c => c.startsWith\('anim-idle-'\)\);\n    el.classList.remove\(\.\.\.idleClasses\);\n/g,
    ""
);

battleJs = battleJs.replace(
    /        if \(idleClasses.length\) el.classList.add\(\.\.\.idleClasses\);\n/g,
    ""
);

fs.writeFileSync('src/ui/battle.js', battleJs);
console.log('Patched attack vs idle isolation in JS!');
