const fs = require('fs');

let code = fs.readFileSync('src/windowManager.js', 'utf8');

// The spawn logic previously put the window at the same X/Y as main view but z-index underneath.
// Now the user wants it to spawn "directly below (vertical) main control" and "above (order) all other windows".
// This means left = mainView.left, top = mainView.bottom, and zIndex = this.zIndexCounter++

code = code.replace(/spawnWindow\(windowId\) \{[\s\S]*?setTimeout\(\(\) => \{/m,
`spawnWindow(windowId) {
        const winElement = document.getElementById(windowId);
        if (!winElement) return;

        winElement.style.display = 'flex';

        let left = 50;
        let top = 50;

        const mainView = document.getElementById('main-view-window');
        if (mainView && mainView.style.display !== 'none') {
            const rect = mainView.getBoundingClientRect();
            left = rect.left;
            top = rect.bottom; // directly below (vertical)
        }

        // above all other windows
        winElement.style.zIndex = this.zIndexCounter++;

        const winRect = winElement.getBoundingClientRect();
        if (left < 0) left = 0;
        if (top < 0) top = 0;
        if (left + winRect.width > this.containerWidth) left = this.containerWidth - winRect.width;
        if (top + winRect.height > this.containerHeight) top = this.containerHeight - winRect.height;

        winElement.style.left = left + 'px';
        winElement.style.top = top + 'px';

        setTimeout(() => {`);

fs.writeFileSync('src/windowManager.js', code);
