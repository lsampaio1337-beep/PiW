const fs = require('fs');
let code = fs.readFileSync('src/ui/map.js', 'utf8');

const search = `        const overlay = document.getElementById('map-inner-modal-overlay');
        const modal = document.getElementById('map-inner-modal');
        if (overlay && modal) {
            overlay.style.display = 'flex';
            overlay.style.padding = '0';
            modal.classList.remove('floating-window');
            modal.style.position = 'relative';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.maxWidth = '100%';
            modal.style.maxHeight = '100%';
        }`;

const replace = `        const overlay = document.getElementById('map-inner-modal-overlay');
        const modal = document.getElementById('map-inner-modal');
        if (overlay && modal) {
            overlay.style.display = 'flex';

            const mapWin = document.getElementById('interactive-map');
            if (mapWin) {
                const applyPaddingAndAspect = (aspectRatio) => {
                    const mapW = mapWin.offsetWidth;
                    const mapH = mapWin.offsetHeight;
                    const maxDim = Math.max(mapW, mapH);
                    const padding = maxDim * 0.02;
                    overlay.style.padding = \`\${padding}px\`;

                    modal.style.aspectRatio = aspectRatio ? aspectRatio.toString() : 'auto';
                    modal.style.maxHeight = '100%';
                    modal.style.maxWidth = '100%';
                };

                const img = new Image();
                img.onload = () => applyPaddingAndAspect(img.naturalWidth / img.naturalHeight);
                img.src = './Assets/BG/SafariZone.png';
            }
        }`;

if (code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync('src/ui/map.js', code);
    console.log("Replaced successfully!");
} else {
    console.log("Search string not found!");
}
