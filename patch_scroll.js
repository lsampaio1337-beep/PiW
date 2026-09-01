const fs = require('fs');
let file = fs.readFileSync('src/ui/backpack/pokemon.js', 'utf8');

// Capture scroll state before rendering and restore it after
file = file.replace(/area\.innerHTML = content;/g, `
    // Capture previous scroll positions
    let prevStorageScroll = 0;
    let prevSafeScroll = 0;
    const oldStorage = document.getElementById('storage-scroll-container');
    const oldSafe = document.getElementById('safe-scroll-container');
    if (oldStorage) prevStorageScroll = oldStorage.scrollTop;
    if (oldSafe) prevSafeScroll = oldSafe.scrollTop;

    area.innerHTML = content;

    // Restore scroll positions
    const newStorage = document.getElementById('storage-scroll-container');
    const newSafe = document.getElementById('safe-scroll-container');
    if (newStorage) newStorage.scrollTop = prevStorageScroll;
    if (newSafe) newSafe.scrollTop = prevSafeScroll;
`);

fs.writeFileSync('src/ui/backpack/pokemon.js', file);
