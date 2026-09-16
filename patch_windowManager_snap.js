const fs = require('fs');

let code = fs.readFileSync('src/windowManager.js', 'utf8');

// We need to modify _setupDrag to include snapping logic.
const newSetupDrag = `
    _setupDrag(winElement, headerElement) {
        let isDragging = false;
        let startX, startY;
        let initialLeft, initialTop;

        let hasBrokenSnapX = false;
        let hasBrokenSnapY = false;

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
            hasBrokenSnapX = false;
            hasBrokenSnapY = false;
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            let newLeft = initialLeft + dx;
            let newTop = initialTop + dy;

            const rect = winElement.getBoundingClientRect();
            let snappedLeft = newLeft;
            let snappedTop = newTop;

            const snapThreshold = 20; // Distance to trigger snap
            const breakThreshold = 40; // Mouse distance required to break free of a snap

            let isSnappedX = false;
            let isSnappedY = false;

            // Check snapping against other windows
            this.windows.forEach(otherWin => {
                if (otherWin === winElement || otherWin.style.display === 'none') return;

                const otherRect = otherWin.getBoundingClientRect();

                // Snap Left to Right Edge
                if (Math.abs(newLeft - otherRect.right) < snapThreshold) {
                    snappedLeft = otherRect.right;
                    isSnappedX = true;
                }
                // Snap Right to Left Edge
                else if (Math.abs((newLeft + rect.width) - otherRect.left) < snapThreshold) {
                    snappedLeft = otherRect.left - rect.width;
                    isSnappedX = true;
                }

                // Snap Top to Bottom Edge
                if (Math.abs(newTop - otherRect.bottom) < snapThreshold) {
                    snappedTop = otherRect.bottom;
                    isSnappedY = true;
                }
                // Snap Bottom to Top Edge
                else if (Math.abs((newTop + rect.height) - otherRect.top) < snapThreshold) {
                    snappedTop = otherRect.top - rect.height;
                    isSnappedY = true;
                }

                // Snap Left to Left Edge
                if (Math.abs(newLeft - otherRect.left) < snapThreshold) {
                    snappedLeft = otherRect.left;
                    isSnappedX = true;
                }

                // Snap Top to Top Edge
                if (Math.abs(newTop - otherRect.top) < snapThreshold) {
                    snappedTop = otherRect.top;
                    isSnappedY = true;
                }
            });

            // If the user drags hard enough past the raw newLeft vs snappedLeft, they break the snap
            if (isSnappedX && !hasBrokenSnapX) {
                 if (Math.abs(dx) > breakThreshold) {
                     hasBrokenSnapX = true; // Broken free
                 } else {
                     newLeft = snappedLeft;
                 }
            }
            if (isSnappedY && !hasBrokenSnapY) {
                 if (Math.abs(dy) > breakThreshold) {
                     hasBrokenSnapY = true;
                 } else {
                     newTop = snappedTop;
                 }
            }

            // Container Boundary constraints
            if (newLeft < 0) newLeft = 0;
            if (newTop < 0) newTop = 0;
            if (newLeft + rect.width > this.containerWidth) newLeft = this.containerWidth - rect.width;
            if (newTop + rect.height > this.containerHeight) newTop = this.containerHeight - rect.height;

            winElement.style.left = newLeft + 'px';
            winElement.style.top = newTop + 'px';
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                headerElement.style.cursor = 'grab';
            }
        });
    }
`;

code = code.replace(/_setupDrag\(winElement, headerElement\) \{[\s\S]*?\}\s*(?=\n\s*_setupResize)/, newSetupDrag);

fs.writeFileSync('src/windowManager.js', code);
