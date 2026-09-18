const fs = require('fs');
let code = fs.readFileSync('src/windowManager.js', 'utf8');

const regex = /let contentContainer = winElement\.querySelector\('\.window-content-container'\);\s*let horizontalPadding = 0;\s*let verticalPadding = 0;\s*if \(contentContainer\) \{\s*const style = window\.getComputedStyle\(contentContainer\);\s*horizontalPadding = parseFloat\(style\.paddingLeft \|\| 0\) \+ parseFloat\(style\.paddingRight \|\| 0\);\s*verticalPadding = parseFloat\(style\.paddingTop \|\| 0\) \+ parseFloat\(style\.paddingBottom \|\| 0\);\s*\}\s*const currentContentWidth = newWidth - horizontalPadding;/g;

let count = 0;
code = code.replace(regex, (match, offset) => {
    count++;
    // The one in the document.addEventListener('mousemove') should be after offset 5000 (roughly)
    if (offset > 5000 && offset < 9000) {
        return `let contentContainer = winElement.querySelector('.window-content-container');
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
    }
    return match;
});

console.log('Replaced', count, 'matches');

fs.writeFileSync('src/windowManager.js', code);
