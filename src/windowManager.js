export class WindowManager {
    constructor() {
        this.windows = [];
        this.zIndexCounter = 1000;

        // Ensure there's a container for floating windows to bind boundaries
        this.containerWidth = window.innerWidth;
        this.containerHeight = window.innerHeight;

        window.addEventListener('resize', () => {
            this.containerWidth = window.innerWidth;
            this.containerHeight = window.innerHeight;
            this._constrainAllWindows();
        });
    }

    registerWindow(windowId, headerId, initialLeft = '10%', initialTop = '10%') {
        const winElement = document.getElementById(windowId);
        const headerElement = document.getElementById(headerId);

        if (!winElement || !headerElement) {
            console.error(`WindowManager: Could not find ${windowId} or ${headerId}`);
            return;
        }

        winElement.style.position = 'absolute';
        winElement.style.left = initialLeft;
        winElement.style.top = initialTop;
        winElement.style.zIndex = this.zIndexCounter++;

        this.windows.push(winElement);

        // Focus on mousedown
        winElement.addEventListener('mousedown', () => {
            this.focusWindow(winElement);
        });



        // Setup drag
        this._setupDrag(winElement, headerElement);

        // Setup resize if handles exist
        const resizeHandle = winElement.querySelector('.window-resize-handle');
        const contentScaler = winElement.querySelector('.window-content-scaler');

        if (resizeHandle && contentScaler) {
            this._setupResize(winElement, resizeHandle, contentScaler, headerElement);
        }


    }

    focusWindow(winElement) {
        if (winElement.style.zIndex != this.zIndexCounter - 1) {
            winElement.style.zIndex = this.zIndexCounter++;
        }
    }

    toggleWindow(windowId, forceShow = false) {
        const winElement = document.getElementById(windowId);
        if (winElement) {
            if (forceShow || winElement.style.display === 'none') {
                winElement.style.display = 'flex';
                this.focusWindow(winElement);
            } else {
                winElement.style.display = 'none';
            }
        }
    }

    _setupDrag(winElement, headerElement) {
        let isDragging = false;
        let startX, startY;
        let initialLeft, initialTop;

        headerElement.style.cursor = 'grab';

        headerElement.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;

            // Focus
            this.focusWindow(winElement);

            // Parse left/top (can be px or % initially)
            const rect = winElement.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;

            // Set to px for dragging
            winElement.style.left = initialLeft + 'px';
            winElement.style.top = initialTop + 'px';
            winElement.style.transform = 'none'; // Clear any transform

            headerElement.style.cursor = 'grabbing';
            e.preventDefault(); // Prevent text selection
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            let newLeft = initialLeft + dx;
            let newTop = initialTop + dy;

            // Boundary constraints
            const rect = winElement.getBoundingClientRect();

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


    _setupResize(winElement, handleElement, scalerElement, headerElement) {
        let isResizing = false;
        let startX, startY;
        let startWidth, startHeight;
        let originalWidth, originalHeight;
        let originalRatio;

        const initDims = () => {
            if (!originalWidth) {
                const headerH = headerElement ? headerElement.offsetHeight : 0;

                if (winElement.style.display !== 'none' && winElement.offsetWidth > 0) {
                    originalWidth = winElement.offsetWidth;
                    originalHeight = winElement.offsetHeight - headerH;
                    if (originalWidth > 0 && originalHeight > 0) {
                        scalerElement.style.setProperty('--original-width', originalWidth + 'px');
                        scalerElement.style.setProperty('--original-height', originalHeight + 'px');
                        originalRatio = originalWidth / originalHeight;

                        scalerElement.style.width = originalWidth + 'px';
                        scalerElement.style.height = originalHeight + 'px';
                    }
                }
            }
        };

        winElement.recalculateDims = () => {
            const headerH = headerElement ? headerElement.offsetHeight : 0;

            // Get current scale to reapply later
            let currentScale = 1;
            if (originalWidth) {
                currentScale = winElement.offsetWidth / originalWidth;
            }

            // Temporarily reset styles to measure natural unscaled dimensions
            winElement.style.width = '';
            winElement.style.height = '';
            scalerElement.style.transform = 'none';
            scalerElement.style.width = '';
            scalerElement.style.height = '';

            const newOriginalWidth = winElement.offsetWidth;
            const newOriginalHeight = winElement.offsetHeight - headerH;

            if (newOriginalWidth > 0 && newOriginalHeight > 0) {
                originalWidth = newOriginalWidth;
                originalHeight = newOriginalHeight;
                originalRatio = originalWidth / originalHeight;

                scalerElement.style.setProperty('--original-width', originalWidth + 'px');
                scalerElement.style.setProperty('--original-height', originalHeight + 'px');
                scalerElement.style.width = originalWidth + 'px';
                scalerElement.style.height = originalHeight + 'px';

                // Reapply scale
                let newWidth = originalWidth * currentScale;
                let newHeight = headerH + (originalHeight * currentScale);

                winElement.style.width = newWidth + 'px';
                winElement.style.height = newHeight + 'px';
                scalerElement.style.transform = `scale(${currentScale})`;
            }
        };

        handleElement.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;

            initDims(); // Ensure dimensions are known

            startWidth = winElement.offsetWidth;
            startHeight = winElement.offsetHeight;

            this.focusWindow(winElement);
            e.stopPropagation();
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;

            const dx = e.clientX - startX;
            let newWidth = Math.max(200, startWidth + dx); // minimum width 200px

            if (originalWidth && originalRatio) {
                const headerH = headerElement ? headerElement.offsetHeight : 0;
                const scale = newWidth / originalWidth;
                const newContentHeight = originalHeight * scale;
                let newHeight = headerH + newContentHeight;

                winElement.style.width = newWidth + 'px';
                winElement.style.height = newHeight + 'px';
                scalerElement.style.transform = `scale(${scale})`;
            }
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                this._constrainAllWindows();
            }
        });

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'style' && winElement.style.display !== 'none' && !originalWidth) {
                    setTimeout(initDims, 50);
                }
            });
        });
        observer.observe(winElement, { attributes: true });

        setTimeout(initDims, 100);
    }

    _constrainAllWindows() {
        this.windows.forEach(winElement => {
            if (winElement.style.display !== 'none') {
                const rect = winElement.getBoundingClientRect();
                let left = parseInt(winElement.style.left);
                let top = parseInt(winElement.style.top);

                let changed = false;

                if (left + rect.width > this.containerWidth) {
                    left = Math.max(0, this.containerWidth - rect.width);
                    changed = true;
                }
                if (top + rect.height > this.containerHeight) {
                    top = Math.max(0, this.containerHeight - rect.height);
                    changed = true;
                }

                if (changed) {
                    winElement.style.left = left + 'px';
                    winElement.style.top = top + 'px';
                }
            }
        });
    }
}
