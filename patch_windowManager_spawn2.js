const fs = require('fs');
let code = fs.readFileSync('src/windowManager.js', 'utf8');

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
            top = rect.top;
        }

        // We need to place this window underneath (z-index) the existing windows.
        // And make sure they are "covered by previous one".
        // The lowest active z-index:
        let lowestZ = this.zIndexCounter;
        this.windows.forEach(w => {
            if (w.style.display !== 'none' && w.id !== windowId) {
                const z = parseInt(w.style.zIndex || this.zIndexCounter);
                if (z < lowestZ) lowestZ = z;
            }
        });

        winElement.style.zIndex = lowestZ - 1;

        // Slightly offset so the user can grab the header if it's completely behind another window
        // The user said "covered by previous one", but to drag it they need a handle. We'll offset by 30px so the header peeps out.
        // Wait, if it spawns behind main view, how do they drag it? By dragging the main view away.
        // We will just put it exactly where the main view is, but z-indexed behind it.

        const winRect = winElement.getBoundingClientRect();
        if (left < 0) left = 0;
        if (top < 0) top = 0;
        if (left + winRect.width > this.containerWidth) left = this.containerWidth - winRect.width;
        if (top + winRect.height > this.containerHeight) top = this.containerHeight - winRect.height;

        winElement.style.left = left + 'px';
        winElement.style.top = top + 'px';

        setTimeout(() => {`);

fs.writeFileSync('src/windowManager.js', code);
