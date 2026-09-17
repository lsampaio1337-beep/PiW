import { state } from "./state.js";
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
                this.saveWindowData(winElement.id);
            }
        });
    }

        _setupResize(winElement, handleElement, scalerElement, headerElement) {
        let isResizing = false;
        let startX, startY;
        let startWidth, startHeight;


        winElement.adjustHeightForNewContent = () => {
            if (!originalWidth) {
                initDims();
                return;
            }

            const headerH = headerElement ? headerElement.offsetHeight : 0;

            // To find the unscaled content height without removing scaling which causes flicker/warp,
            // we can temporarily reset width to original, height to auto, and transform to none.
            const currentWidth = winElement.offsetWidth;
            const currentScale = currentWidth / originalWidth;

            // Strip scaling temporarily
            winElement.style.width = originalWidth + 'px';
            winElement.style.height = 'auto';
            scalerElement.style.transform = 'none';
            scalerElement.style.width = 'auto';
            scalerElement.style.height = 'auto';
            scalerElement.style.position = 'relative';

            // Need to let browser reflow

            // Force synchronous reflow to measure without visual flicker
            void winElement.offsetHeight;

            const newOriginalHeight = winElement.offsetHeight - headerH;
            if (newOriginalHeight > 0) {
                originalHeight = newOriginalHeight;
                scalerElement.style.setProperty('--original-height', originalHeight + 'px');
                originalRatio = originalWidth / originalHeight;

                // Re-apply scale
                const newScaledContentHeight = originalHeight * currentScale;
                const newHeight = headerH + newScaledContentHeight;

                // Lock dimensions
                scalerElement.style.position = 'absolute';
                scalerElement.style.width = originalWidth + 'px';
                scalerElement.style.height = originalHeight + 'px';
                scalerElement.style.transform = `scale(${currentScale})`;

                winElement.style.width = currentWidth + 'px';
                winElement.style.height = newHeight + 'px';

                if (this.windows.includes(winElement)) {
                    this.saveWindowData(winElement.id);
                }
            }

        };

        winElement.resetResizeDims = () => {
            originalWidth = 0;
            originalHeight = 0;
            initDims();
        };

        const initDims = () => {
            if (!winElement._originalWidth) {
                const headerH = headerElement ? headerElement.offsetHeight : 0;

                if (winElement.style.display !== 'none' && winElement.offsetWidth > 0) {
                    winElement._originalWidth = winElement.offsetWidth;
                    winElement._originalHeight = winElement.offsetHeight - headerH;
                    if (winElement._originalWidth > 0 && winElement._originalHeight > 0) {
                        scalerElement.style.setProperty('--original-width', winElement._originalWidth + 'px');
                        scalerElement.style.setProperty('--original-height', winElement._originalHeight + 'px');
                        winElement._originalRatio = winElement._originalWidth / winElement._originalHeight;

                        // Lock the window to its exact measured height so it doesn't collapse
                        // when the scaler changes to absolute positioning.
                        winElement.style.height = (headerH + winElement._originalHeight) + 'px';

                        scalerElement.style.width = winElement._originalWidth + 'px';
                        scalerElement.style.position = 'absolute';
                        scalerElement.style.height = winElement._originalHeight + 'px';
                        scalerElement.style.top = headerH + 'px';
                    }
                }
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

            if (winElement._originalWidth && winElement._originalRatio) {
                const headerH = headerElement ? headerElement.offsetHeight : 0;
                const scale = newWidth / winElement._originalWidth;
                const newContentHeight = winElement._originalHeight * scale;
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
                this.saveWindowData(winElement.id);
            }
        });

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'style' && winElement.style.display !== 'none' && !winElement._originalWidth) {
                    setTimeout(initDims, 50);
                }
            });
        });
        observer.observe(winElement, { attributes: true });

        setTimeout(initDims, 100);
    }

    setWindowProportions(windowId, widthToHeightRatio) {
        const winElement = document.getElementById(windowId);
        if (!winElement) return;

        const headerElement = winElement.querySelector('.window-header');
        const scalerElement = winElement.querySelector('.window-content-scaler');
        if (!scalerElement) return;

        // Force a layout flush to ensure header height is accurate
        const headerH = headerElement ? headerElement.offsetHeight || 30 : 0;

        if (!winElement._originalWidth) {
             winElement._originalWidth = 800;
        }

        // We MUST preserve originalWidth and scale, and only update originalHeight
        const originalWidth = winElement._originalWidth;
        // height = width / (width/height ratio)
        const originalHeight = originalWidth / widthToHeightRatio;

        winElement._originalHeight = originalHeight;
        winElement._originalRatio = widthToHeightRatio;

        scalerElement.style.setProperty('--original-width', originalWidth + 'px');
        scalerElement.style.setProperty('--original-height', originalHeight + 'px');

        // Find current width to keep scale the same
        let currentWidth = winElement.offsetWidth;
        if (currentWidth === 0) currentWidth = parseInt(winElement.style.width) || 800;

        const scale = currentWidth / originalWidth;
        const newContentHeight = originalHeight * scale;
        const newHeight = headerH + newContentHeight;

        // Apply exactly
        winElement.style.height = newHeight + 'px';
        scalerElement.style.height = originalHeight + 'px';
        // Enforce top margin to prevent overlapping the header
        scalerElement.style.top = headerH + 'px';

        // DO NOT change transform or scalerElement.style.width, we preserve the existing scale!
        this.saveWindowData(windowId);
    }


    saveWindowData(windowId) {
        if (!state.settings.windowSettings) {
            state.settings.windowSettings = {};
        }
        const winElement = document.getElementById(windowId);
        if (winElement) {
            state.settings.windowSettings[windowId] = {
                left: winElement.style.left,
                top: winElement.style.top,
                width: winElement.style.width,
                height: winElement.style.height
            };
            if (window.storageRef) {
                window.storageRef.save(state);
            }
        }
    }




    autoAdjustWidth(windowId) {
        const winElement = document.getElementById(windowId);
        if (!winElement) return;

        const scalerElement = winElement.querySelector('.window-content-scaler');
        if (!scalerElement) return;

        // Briefly measure natural width of content without constraints
        const oldScale = scalerElement.style.transform;
        const oldWidth = winElement.style.width;
        const oldPosition = scalerElement.style.position;

        // Temporarily clear constraints to let it flow to natural width
        scalerElement.style.position = 'relative';
        scalerElement.style.transform = 'none';
        scalerElement.style.width = 'max-content';

        const newOriginalWidth = scalerElement.scrollWidth;

        // Check if we need to grow original width
        const currentOriginalWidthStr = scalerElement.style.getPropertyValue('--original-width');
        let currentOriginalWidth = parseInt(currentOriginalWidthStr);
        if (isNaN(currentOriginalWidth) || currentOriginalWidth <= 0) {
            currentOriginalWidth = newOriginalWidth;
        }

        if (newOriginalWidth > currentOriginalWidth) {
            // Content needs more width, we must grow
            const growthRatio = newOriginalWidth / currentOriginalWidth;
            scalerElement.style.setProperty('--original-width', newOriginalWidth + 'px');

            // Scale up the window width by the same ratio
            if (oldWidth && oldWidth.endsWith('px')) {
                const currentWidth = parseInt(oldWidth);
                winElement.style.width = (currentWidth * growthRatio) + 'px';
            } else {
                winElement.style.width = newOriginalWidth + 'px';
            }

            this.saveWindowData(windowId);
        } else if (newOriginalWidth > 0 && (!currentOriginalWidthStr || isNaN(parseInt(currentOriginalWidthStr)))) {
            // Initializing original width if it wasn't set yet
            scalerElement.style.setProperty('--original-width', newOriginalWidth + 'px');
            if (!oldWidth || oldWidth === 'auto') {
                winElement.style.width = Math.max(1100, newOriginalWidth) + 'px';
            }
        }

        // Restore positioning
        scalerElement.style.position = oldPosition;
        scalerElement.style.transform = oldScale;
        scalerElement.style.width = scalerElement.style.getPropertyValue('--original-width');
    }

    recalculateWindowSize(windowId) {
        const winElement = document.getElementById(windowId);
        if (!winElement) return;

        // Reset to auto to let content reflow
        if (windowId === 'top-bar-window') {
            winElement.style.width = '1100px';
        } else {
            winElement.style.width = '800px';
        }
        winElement.style.height = 'auto';

        const scalerElement = winElement.querySelector('.window-content-scaler');
        if (scalerElement) {
            scalerElement.style.transform = 'none';
            scalerElement.style.width = 'auto';
            scalerElement.style.height = 'auto';
            scalerElement.style.position = 'relative';

            scalerElement.style.removeProperty('--original-width');
            scalerElement.style.removeProperty('--original-height');

            if (typeof winElement.resetResizeDims === 'function') {
                setTimeout(() => {
                    winElement.resetResizeDims();
                }, 50);
            }

            if (state.settings && state.settings.windowSettings && state.settings.windowSettings[windowId]) {
                delete state.settings.windowSettings[windowId];
                if (window.storageRef) {
                    window.storageRef.save(state);
                }
            }
        }
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

    createDynamicWindow(windowId, title, htmlContent, width = '800px', height = 'auto') {
        let winElement = document.getElementById(windowId);

        if (!winElement) {
            const template = document.getElementById('generic-window-template');
            if (!template) {
                console.error("Template #generic-window-template not found.");
                return null;
            }

            const clone = template.content.cloneNode(true);
            winElement = clone.querySelector('.floating-window');
            winElement.id = windowId;
            winElement.style.width = width;
            winElement.style.height = height;

            const header = winElement.querySelector('.window-header');
            header.id = windowId + '-header';

            const contentPanel = winElement.querySelector('.content-panel');
            contentPanel.id = windowId + '-content';

            document.body.appendChild(winElement);

            // Register it with windowManager
            this.registerWindow(windowId, header.id);
        }

        const header = document.getElementById(windowId + '-header');
        if (header && title) {
            header.style.position = 'relative';
            header.innerHTML = `${title}<span onclick="if(window.windowManager) window.windowManager.closeDynamicWindow('${windowId}')" style="position: absolute; right: 10px; cursor: pointer; color: white; font-weight: bold;">X</span>`;
        }

        const contentPanel = document.getElementById(windowId + '-content');
        if (contentPanel && htmlContent !== undefined) {
            contentPanel.innerHTML = htmlContent;
        }

        // Spawn logic: under main control if possible
        this.spawnWindow(windowId);

        return winElement;
    }

    closeDynamicWindow(windowId) {
        const winElement = document.getElementById(windowId);
        if (winElement) {
            winElement.style.display = 'none';
        }
    }

    spawnWindow(windowId) {
        const winElement = document.getElementById(windowId);
        if (!winElement) return;

        winElement.style.display = 'flex';

        // Check if there is saved position/size for this window
        let savedSettings = null;
        if (state.settings && state.settings.windowSettings && state.settings.windowSettings[windowId]) {
            savedSettings = state.settings.windowSettings[windowId];
        }

        if (savedSettings) {
            if (savedSettings.width) winElement.style.width = savedSettings.width;
            if (savedSettings.height) winElement.style.height = savedSettings.height;
            if (savedSettings.left) winElement.style.left = savedSettings.left;
            if (savedSettings.top) winElement.style.top = savedSettings.top;
        } else {
            let left = 50;
            let top = 50;

            const mainView = document.getElementById('top-bar-window');
            if (mainView && mainView.style.display !== 'none') {
                const rect = mainView.getBoundingClientRect();
                left = rect.left;
                top = rect.bottom; // directly below (vertical)
            }

            const winRect = winElement.getBoundingClientRect();
            if (left < 0) left = 0;
            if (top < 0) top = 0;
            if (left + winRect.width > this.containerWidth) left = this.containerWidth - winRect.width;
            if (top + winRect.height > this.containerHeight) top = this.containerHeight - winRect.height;

            winElement.style.left = left + 'px';
            winElement.style.top = top + 'px';
        }

        // above all other windows
        winElement.style.zIndex = this.zIndexCounter++;

        setTimeout(() => {
             // trigger resize initialization if needed
             winElement.style.display = 'flex';
        }, 50);
    }



}
