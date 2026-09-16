const fs = require('fs');

let backpack = fs.readFileSync('src/ui/backpack/index.js', 'utf8');

// The backpack function creates HTML manually rather than calling showModal.
// Let's refactor showBackpack to use showModal.
// Wait, backpack does:
// let rightCol = document.getElementById('modal-overlay'); ... contentPanel.innerHTML = html;
// We can just use window.showModal inside showBackpack instead.

backpack = backpack.replace(/let rightCol = document\.getElementById\('modal-overlay'\);[\s\S]*?let html = `/g, `let html = \``);
backpack = backpack.replace(/contentPanel\.innerHTML = html;\n\}/g, `
    if (window.showModal) {
        window.showModal('Backpack', html, 'window-backpack');
    }
}`);
fs.writeFileSync('src/ui/backpack/index.js', backpack);


let mapjs = fs.readFileSync('src/ui/map.js', 'utf8');
mapjs = mapjs.replace(/let rightCol = document\.getElementById\('modal-overlay'\);[\s\S]*?let html = `/g, `let html = \``);
mapjs = mapjs.replace(/contentPanel\.innerHTML = html;\n\}/g, `
    if (window.showModal) {
        window.showModal('Map', html, 'window-map');
    }
}`);
fs.writeFileSync('src/ui/map.js', mapjs);
