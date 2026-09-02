const fs = require('fs');

let battleJs = fs.readFileSync('src/ui/battle.js', 'utf8');
battleJs = battleJs.replace(
    /particle\.style\.transition = 'all 0\.3s ease-out';/,
    `particle.style.transition = 'all 1s ease-out';`
);
battleJs = battleJs.replace(
    /        setTimeout\(\(\) => \{\n            if \(particle\.parentElement\) particle\.parentElement\.removeChild\(particle\);\n        \}, 300\);/g,
    `        setTimeout(() => {\n            if (particle.parentElement) particle.parentElement.removeChild(particle);\n        }, 1000);`
);

fs.writeFileSync('src/ui/battle.js', battleJs);
console.log('Splash duration increased to 1s!');
