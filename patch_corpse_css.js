const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

const slideCorpseCSS = `
@keyframes slide-out-left {
    from { right: 40%; opacity: 1; }
    to { right: 100%; opacity: 0; }
}

.anim-slide-out-corpse { animation: slide-out-left 5s linear forwards; }
.anim-fade-corpse { animation: fade-out-enemy 2s ease-out forwards; }
`;

css += '\n' + slideCorpseCSS;
fs.writeFileSync('styles.css', css);
console.log('Added corpse CSS animations');
