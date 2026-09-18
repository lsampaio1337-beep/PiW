const fs = require('fs');
let code = fs.readFileSync('src/windowManager.js', 'utf8');

// 1. Enforce constraints during drag
code = code.replace(
    /if \(finalLeft < 0\) finalLeft = 0;\s*if \(finalTop < 0\) finalTop = 0;\s*if \(finalLeft \+ rect\.width > this\.containerWidth\) finalLeft = this\.containerWidth - rect\.width;\s*if \(finalTop \+ rect\.height > this\.containerHeight\) finalTop = this\.containerHeight - rect\.height;/,
    `// Container Boundary constraints
            if (finalLeft + rect.width > this.containerWidth) finalLeft = Math.max(0, this.containerWidth - rect.width);
            if (finalTop + rect.height > this.containerHeight) finalTop = Math.max(0, this.containerHeight - rect.height);
            if (finalLeft < 0) finalLeft = 0;
            if (finalTop < 0) finalTop = 0;`
);

// 2. Enforce constraints during resize
let resizeCode = `                let contentContainer = winElement.querySelector('.window-content-container');
                let horizontalPadding = 0;
                let verticalPadding = 0;
                if (contentContainer) {
                    const style = window.getComputedStyle(contentContainer);
                    horizontalPadding = parseFloat(style.paddingLeft || 0) + parseFloat(style.paddingRight || 0);
                    verticalPadding = parseFloat(style.paddingTop || 0) + parseFloat(style.paddingBottom || 0);
                }

                // Constrain max width based on container width and maximum allowed height based on container height
                let maxWFromHeight = horizontalPadding + (this.containerHeight - headerH - verticalPadding) * (winElement._originalWidth / winElement._originalHeight);
                let maxW = Math.min(this.containerWidth, maxWFromHeight);
                if (newWidth > maxW) newWidth = maxW;
`;

code = code.replace(
    /let contentContainer = winElement\.querySelector\('\.window-content-container'\);\s*let horizontalPadding = 0;\s*let verticalPadding = 0;\s*if \(contentContainer\) \{\s*const style = window\.getComputedStyle\(contentContainer\);\s*horizontalPadding = parseFloat\(style\.paddingLeft \|\| 0\) \+ parseFloat\(style\.paddingRight \|\| 0\);\s*verticalPadding = parseFloat\(style\.paddingTop \|\| 0\) \+ parseFloat\(style\.paddingBottom \|\| 0\);\s*\}/g,
    (match, offset) => {
        // Only replace the one in resize, not in adjustHeightForNewContent or initDims
        if (offset > 5000 && offset < 9000) {
             return resizeCode;
        }
        return match;
    }
);


// 3. Update _constrainAllWindows and add _shrinkWindow
let constrainCode = `
    _shrinkWindow(winElement) {
        if (winElement._originalWidth && winElement._originalHeight) {
            const headerElement = winElement.querySelector('.window-header');
            const scalerElement = winElement.querySelector('.window-content-scaler');
            if (!scalerElement) return;

            const headerH = headerElement ? headerElement.offsetHeight : 0;
            let contentContainer = winElement.querySelector('.window-content-container');
            let horizontalPadding = 0;
            let verticalPadding = 0;
            if (contentContainer) {
                const style = window.getComputedStyle(contentContainer);
                horizontalPadding = parseFloat(style.paddingLeft || 0) + parseFloat(style.paddingRight || 0);
                verticalPadding = parseFloat(style.paddingTop || 0) + parseFloat(style.paddingBottom || 0);
            }

            let targetHeight = 720;
            if (targetHeight > this.containerHeight) {
                targetHeight = this.containerHeight;
            }

            let newContentHeight = targetHeight - headerH - verticalPadding;
            if (newContentHeight <= 0) newContentHeight = 100;
            let scale = newContentHeight / winElement._originalHeight;

            let currentContentWidth = scale * winElement._originalWidth;
            let newWidth = currentContentWidth + horizontalPadding;

            if (newWidth > this.containerWidth) {
                newWidth = this.containerWidth;
                currentContentWidth = newWidth - horizontalPadding;
                scale = currentContentWidth / winElement._originalWidth;
                newContentHeight = winElement._originalHeight * scale;
                targetHeight = headerH + newContentHeight + verticalPadding;
            }

            winElement.style.width = newWidth + 'px';
            winElement.style.height = targetHeight + 'px';
            scalerElement.style.transform = \`scale(\${scale})\`;

            // Wait for reflow to let width take effect
            void winElement.offsetWidth;
        } else {
            const rect = winElement.getBoundingClientRect();
            if (rect.width > this.containerWidth) winElement.style.width = this.containerWidth + 'px';
            if (rect.height > this.containerHeight) winElement.style.height = this.containerHeight + 'px';
        }
    }

    _constrainAllWindows() {
        this.windows.forEach(winElement => {
            if (winElement.style.display !== 'none') {
                const rect = winElement.getBoundingClientRect();
                let left = parseInt(winElement.style.left) || 0;
                let top = parseInt(winElement.style.top) || 0;

                let changed = false;

                if (rect.width > this.containerWidth || rect.height > this.containerHeight) {
                    this._shrinkWindow(winElement);
                    changed = true;
                }

                const currentRect = winElement.getBoundingClientRect();

                if (left + currentRect.width > this.containerWidth) {
                    left = Math.max(0, this.containerWidth - currentRect.width);
                    changed = true;
                }
                if (top + currentRect.height > this.containerHeight) {
                    top = Math.max(0, this.containerHeight - currentRect.height);
                    changed = true;
                }
                if (left < 0) {
                    left = 0;
                    changed = true;
                }
                if (top < 0) {
                    top = 0;
                    changed = true;
                }

                if (changed) {
                    winElement.style.left = left + 'px';
                    winElement.style.top = top + 'px';
                }
            }
        });
    }`;

code = code.replace(/_constrainAllWindows\(\) {[\s\S]*?}\n\n    createDynamicWindow/, constrainCode + "\n\n    createDynamicWindow");

fs.writeFileSync('src/windowManager.js', code);
