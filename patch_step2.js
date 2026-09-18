const fs = require('fs');
let code = fs.readFileSync('src/windowManager.js', 'utf8');

const oldResizeCode = `                let contentContainer = winElement.querySelector('.window-content-container');
                let horizontalPadding = 0;
                let verticalPadding = 0;
                if (contentContainer) {
                    const style = window.getComputedStyle(contentContainer);
                    horizontalPadding = parseFloat(style.paddingLeft || 0) + parseFloat(style.paddingRight || 0);
                    verticalPadding = parseFloat(style.paddingTop || 0) + parseFloat(style.paddingBottom || 0);
                }

                const currentContentWidth = newWidth - horizontalPadding;`;

const newResizeCode = `                let contentContainer = winElement.querySelector('.window-content-container');
                let horizontalPadding = 0;
                let verticalPadding = 0;
                if (contentContainer) {
                    const style = window.getComputedStyle(contentContainer);
                    horizontalPadding = parseFloat(style.paddingLeft || 0) + parseFloat(style.paddingRight || 0);
                    verticalPadding = parseFloat(style.paddingTop || 0) + parseFloat(style.paddingBottom || 0);
                }

                // Enforce max width during resize to prevent it from going out of screen boundaries
                let maxWFromHeight = horizontalPadding + ((this.containerHeight - headerH - verticalPadding) * (winElement._originalWidth / winElement._originalHeight));
                let maxW = Math.min(this.containerWidth, maxWFromHeight);
                if (newWidth > maxW) newWidth = maxW;

                const currentContentWidth = newWidth - horizontalPadding;`;

code = code.replace(oldResizeCode, newResizeCode);
fs.writeFileSync('src/windowManager.js', code);
