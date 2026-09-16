const fs = require('fs');

let code = fs.readFileSync('src/windowManager.js', 'utf8');

// Wait, break threshold using dx doesn't work well because dx is the total drag from mousedown.
// If you drag 50px towards a window and snap, dx is already 50.
// We should use the distance between the raw mouse position and the snapped position to determine breaking.

const improvedSnap = `
    _setupDrag(winElement, headerElement) {
        let isDragging = false;
        let startX, startY;
        let initialLeft, initialTop;

        let snapLockX = null;
        let snapLockY = null;

        headerElement.style.cursor = 'grab';

        headerElement.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;

            // Focus
            this.focusWindow(winElement);

            const rect = winElement.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;

            winElement.style.left = initialLeft + 'px';
            winElement.style.top = initialTop + 'px';
            winElement.style.transform = 'none';

            headerElement.style.cursor = 'grabbing';
            snapLockX = null;
            snapLockY = null;
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            let rawLeft = initialLeft + dx;
            let rawTop = initialTop + dy;

            let finalLeft = rawLeft;
            let finalTop = rawTop;

            const rect = winElement.getBoundingClientRect();

            const snapDistance = 20;
            const breakDistance = 30; // Distance raw mouse can move away from snap before breaking

            // Check X Snap
            if (snapLockX !== null) {
                if (Math.abs(rawLeft - snapLockX.rawAtSnap) > breakDistance) {
                    snapLockX = null; // Break snap
                } else {
                    finalLeft = snapLockX.snappedValue;
                }
            }

            if (snapLockX === null) {
                this.windows.forEach(otherWin => {
                    if (otherWin === winElement || otherWin.style.display === 'none') return;
                    const otherRect = otherWin.getBoundingClientRect();

                    if (Math.abs(rawLeft - otherRect.right) < snapDistance) {
                        snapLockX = { snappedValue: otherRect.right, rawAtSnap: rawLeft };
                    } else if (Math.abs((rawLeft + rect.width) - otherRect.left) < snapDistance) {
                        snapLockX = { snappedValue: otherRect.left - rect.width, rawAtSnap: rawLeft };
                    } else if (Math.abs(rawLeft - otherRect.left) < snapDistance) {
                        snapLockX = { snappedValue: otherRect.left, rawAtSnap: rawLeft };
                    }
                });
            }

            // Check Y Snap
            if (snapLockY !== null) {
                if (Math.abs(rawTop - snapLockY.rawAtSnap) > breakDistance) {
                    snapLockY = null; // Break snap
                } else {
                    finalTop = snapLockY.snappedValue;
                }
            }

            if (snapLockY === null) {
                this.windows.forEach(otherWin => {
                    if (otherWin === winElement || otherWin.style.display === 'none') return;
                    const otherRect = otherWin.getBoundingClientRect();

                    if (Math.abs(rawTop - otherRect.bottom) < snapDistance) {
                        snapLockY = { snappedValue: otherRect.bottom, rawAtSnap: rawTop };
                    } else if (Math.abs((rawTop + rect.height) - otherRect.top) < snapDistance) {
                        snapLockY = { snappedValue: otherRect.top - rect.height, rawAtSnap: rawTop };
                    } else if (Math.abs(rawTop - otherRect.top) < snapDistance) {
                        snapLockY = { snappedValue: otherRect.top, rawAtSnap: rawTop };
                    }
                });
            }

            if (snapLockX !== null) finalLeft = snapLockX.snappedValue;
            if (snapLockY !== null) finalTop = snapLockY.snappedValue;

            // Container Boundary constraints
            if (finalLeft < 0) finalLeft = 0;
            if (finalTop < 0) finalTop = 0;
            if (finalLeft + rect.width > this.containerWidth) finalLeft = this.containerWidth - rect.width;
            if (finalTop + rect.height > this.containerHeight) finalTop = this.containerHeight - rect.height;

            winElement.style.left = finalLeft + 'px';
            winElement.style.top = finalTop + 'px';
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                headerElement.style.cursor = 'grab';
            }
        });
    }
`;

code = code.replace(/_setupDrag\(winElement, headerElement\) \{[\s\S]*?\}\s*(?=\n\s*_setupResize)/, improvedSnap);

fs.writeFileSync('src/windowManager.js', code);
