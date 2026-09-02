const fs = require('fs');

let battleJs = fs.readFileSync('src/ui/battle.js', 'utf8');

battleJs = battleJs.replace(
    /        if \(el && el\.parentElement\) \{\n            el\.parentElement\.style\.animationPlayState = 'paused';/g,
    `        const wrapper = document.getElementById(id + '-wrapper');
        if (wrapper) {
            wrapper.style.animationPlayState = 'paused';`
);

battleJs = battleJs.replace(
    /        if \(el && el\.parentElement\) \{\n            el\.parentElement\.style\.animationPlayState = 'running';/g,
    `        const wrapper = document.getElementById(id + '-wrapper');
        if (wrapper) {
            wrapper.style.animationPlayState = 'running';`
);

fs.writeFileSync('src/ui/battle.js', battleJs);
console.log('Fixed pause/resume wrapper selectors!');
