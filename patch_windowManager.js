const fs = require('fs');

let code = fs.readFileSync('src/windowManager.js', 'utf8');

const newMethods = `
    createDynamicWindow(windowId, title, htmlContent, width = '800px', height = '600px') {
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
            header.innerHTML = \`\${title}<span onclick="if(window.windowManager) window.windowManager.closeDynamicWindow('\${windowId}')" style="position: absolute; right: 10px; cursor: pointer; color: white; font-weight: bold;">X</span>\`;
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

        // Make visible to measure and position
        winElement.style.display = 'flex';
        this.focusWindow(winElement);

        const mainView = document.getElementById('main-view-window');
        let left = 50;
        let top = 50;

        if (mainView && mainView.style.display !== 'none') {
            const rect = mainView.getBoundingClientRect();
            // Position it right below or slightly offset from the top left of the main view
            left = rect.left + 50;
            top = rect.top + 50;
        }

        // Add random slight offset to avoid perfect overlap if multiple open
        left += Math.floor(Math.random() * 40) - 20;
        top += Math.floor(Math.random() * 40) - 20;

        // Ensure boundaries
        const winRect = winElement.getBoundingClientRect();
        if (left < 0) left = 0;
        if (top < 0) top = 0;
        if (left + winRect.width > this.containerWidth) left = this.containerWidth - winRect.width;
        if (top + winRect.height > this.containerHeight) top = this.containerHeight - winRect.height;

        winElement.style.left = left + 'px';
        winElement.style.top = top + 'px';

        // Ensure dimensions are initialized for the scaler
        setTimeout(() => {
             // trigger resize initialization if needed
             winElement.style.display = 'flex';
        }, 50);
    }
`;

// Insert the new methods before the last closing brace
code = code.replace(/}\s*$/, newMethods + '\n}\n');

fs.writeFileSync('src/windowManager.js', code);
