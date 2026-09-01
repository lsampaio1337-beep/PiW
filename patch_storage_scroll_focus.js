const fs = require('fs');
let file = fs.readFileSync('src/ui/backpack/pokemon.js', 'utf8');

// The file currently has a bad structure because previous substitutions replaced `area.innerHTML = content;` twice.
// Let's rewrite the end of renderPokemonTab properly.

const regex = /\/\/ Capture previous scroll positions[\s\S]*?(?=\n\}\n\nwindow\.updatePokemonFilter)/;

const newCode = `
    // Capture focus state
    let activeElementId = document.activeElement ? document.activeElement.id : null;
    let selectionStart = 0;
    let selectionEnd = 0;
    if (activeElementId && document.activeElement.tagName === 'INPUT') {
        try {
            selectionStart = document.activeElement.selectionStart;
            selectionEnd = document.activeElement.selectionEnd;
        } catch(e) {}
    }

    // Capture previous scroll positions
    let prevStorageScroll = 0;
    let prevSafeScroll = 0;
    const oldStorage = document.getElementById('storage-scroll-container');
    const oldSafe = document.getElementById('safe-scroll-container');
    if (oldStorage) prevStorageScroll = oldStorage.scrollTop;
    if (oldSafe) prevSafeScroll = oldSafe.scrollTop;

    area.innerHTML = content;

    // Restore focus state
    if (activeElementId) {
        let el = document.getElementById(activeElementId);
        if (el) {
            el.focus();
            if (el.tagName === 'INPUT') {
                try {
                    el.setSelectionRange(selectionStart, selectionEnd);
                } catch(e) {}
            }
        }
    }

    // Restore scroll positions
    const newStorage = document.getElementById('storage-scroll-container');
    const newSafe = document.getElementById('safe-scroll-container');
    if (newStorage) newStorage.scrollTop = prevStorageScroll;
    if (newSafe) newSafe.scrollTop = prevSafeScroll;
`;

file = file.replace(regex, newCode.trim());
fs.writeFileSync('src/ui/backpack/pokemon.js', file);
