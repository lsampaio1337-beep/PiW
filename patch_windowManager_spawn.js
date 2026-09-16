const fs = require('fs');

let code = fs.readFileSync('src/windowManager.js', 'utf8');

const newSpawnLogic = `
    spawnWindow(windowId) {
        const winElement = document.getElementById(windowId);
        if (!winElement) return;

        // Make visible to measure and position
        winElement.style.display = 'flex';

        // Spawn covered by the previous window, or main window if first.
        // We can do this by setting z-index below the main window, but wait, the prompt asks:
        // "create all window below maincontrol beeing covered by previous one and let user drag them at will"
        // This means it should spawn at exactly the same location as main control but with a LOWER z-index so it's hidden under it,
        // or a lower z-index than the last spawned window.
        // Let's spawn them directly underneath 'main-view-window'.

        let targetZIndex = 900; // default below normal windows (which start at 1000)
        let left = 50;
        let top = 50;

        const mainView = document.getElementById('main-view-window');
        if (mainView) {
            const rect = mainView.getBoundingClientRect();
            left = rect.left;
            top = rect.top;

            // To ensure it's *under* the main view, we can manipulate z-index.
            // windowManager sets zIndexCounter to 1000 and increments.
            // mainView is probably around 1000+.
            targetZIndex = parseInt(mainView.style.zIndex || 1000) - 1;
        }

        // If this window is spawned, we can push it underneath the lowest z-indexed window.
        let lowestZ = 10000;
        this.windows.forEach(w => {
            if (w.style.display !== 'none' && w.id !== windowId) {
                const z = parseInt(w.style.zIndex || 1000);
                if (z < lowestZ) lowestZ = z;
            }
        });

        targetZIndex = lowestZ - 1;

        // But the user still needs to be able to drag it if it's completely covered... Wait, if it's completely covered, how do they click the header to drag it?
        // Ah. "create all window below maincontrol beeing covered by previous one and let user drag them at will"
        // If it's *below* the main control, maybe they mean vertically stacked?
        // "below maincontrol" usually means underneath visually (z-index) OR physically on the Y-axis.
        // "beeing covered by previous one" suggests they are layered underneath (z-index) BUT offset so the header is grabbable?
        // Or if they mean physically below (y-axis)?

        // Let's offset slightly so the header is visible if they mean z-index covered.
        // Let's offset by 30px down and 30px right from main window.
        // Actually, let's just make it spawn exactly where main control is, but force focusWindow on it so it comes to the TOP.
        // Wait, the user explicitly said "create all window below maincontrol beeing covered by previous one".
        // This implies they spawn IN THE BACKGROUND. But how do you drag it if it's covered?
        // Maybe the Main Control can be dragged away, revealing the ones underneath.

        // Let's put it exactly at main control's X and Y.
        // And zIndex = lowestZ - 1;
`;

// Wait, let's read the user prompt carefully:
// User: "3 since cover will be allowded on force break the snap, create all window below maincontrol beeing covered by previous one and let user drag them at will"
// "below maincontrol" could mean Y axis (top + height).
// If it's spawned physically below it, they don't overlap initially.
// Let's just spawn them at the exact same location as the Main Control but place them underneath (z-index) the currently focused window, OR just stack them below (Y-axis) the main control.
// Let's put them on the Y axis *below* Main Control. If they mean "below" as in Z-index, they said "covered by previous one".
