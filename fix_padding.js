const fs = require('fs');
let code = fs.readFileSync('src/windowManager.js', 'utf8');

code = code.replace(
    /const currentWidth = winElement\.offsetWidth;\n\s*const currentScale = currentWidth \/ winElement\._originalWidth;/g,
    `const currentWidth = winElement.offsetWidth;

            let contentContainer = winElement.querySelector('.window-content-container');
            let horizontalPadding = 0;
            let verticalPadding = 0;
            if (contentContainer) {
                const style = window.getComputedStyle(contentContainer);
                horizontalPadding = parseFloat(style.paddingLeft || 0) + parseFloat(style.paddingRight || 0);
                verticalPadding = parseFloat(style.paddingTop || 0) + parseFloat(style.paddingBottom || 0);
            }

            const currentScale = (currentWidth - horizontalPadding) / winElement._originalWidth;`
);

code = code.replace(
    /const newScaledContentHeight = winElement\._originalHeight \* currentScale;\n\s*const newHeight = headerH \+ newScaledContentHeight;/g,
    `const newScaledContentHeight = winElement._originalHeight * currentScale;
                const newHeight = headerH + newScaledContentHeight + verticalPadding;`
);

code = code.replace(
    /const headerH = headerElement \? headerElement\.offsetHeight : 0;\n\n\s*if \(winElement\.style\.display !== 'none' && winElement\.offsetWidth > 0\) {/g,
    `const headerH = headerElement ? headerElement.offsetHeight : 0;

                if (winElement.style.display !== 'none' && winElement.offsetWidth > 0) {
                    let contentContainer = winElement.querySelector('.window-content-container');
                    let horizontalPadding = 0;
                    let verticalPadding = 0;
                    if (contentContainer) {
                        const style = window.getComputedStyle(contentContainer);
                        horizontalPadding = parseFloat(style.paddingLeft || 0) + parseFloat(style.paddingRight || 0);
                        verticalPadding = parseFloat(style.paddingTop || 0) + parseFloat(style.paddingBottom || 0);
                    }`
);

code = code.replace(
    /winElement\._originalWidth = winElement\.offsetWidth;\n\s*winElement\._originalHeight = winElement\.offsetHeight - headerH;/g,
    `winElement._originalWidth = winElement.offsetWidth - horizontalPadding;
                    winElement._originalHeight = winElement.offsetHeight - headerH - verticalPadding;`
);

code = code.replace(
    /let newWidth = Math\.max\(200, startWidth \+ dx\); \/\/ minimum width 200px\n\n\s*if \(winElement\._originalWidth && winElement\._originalRatio\) {\n\s*const headerH = headerElement \? headerElement\.offsetHeight : 0;\n\s*const scale = newWidth \/ winElement\._originalWidth;\n\s*const newContentHeight = winElement\._originalHeight \* scale;\n\s*let newHeight = headerH \+ newContentHeight;/g,
    `let newWidth = Math.max(200, startWidth + dx); // minimum width 200px

            if (winElement._originalWidth && winElement._originalRatio) {
                const headerH = headerElement ? headerElement.offsetHeight : 0;

                let contentContainer = winElement.querySelector('.window-content-container');
                let horizontalPadding = 0;
                let verticalPadding = 0;
                if (contentContainer) {
                    const style = window.getComputedStyle(contentContainer);
                    horizontalPadding = parseFloat(style.paddingLeft || 0) + parseFloat(style.paddingRight || 0);
                    verticalPadding = parseFloat(style.paddingTop || 0) + parseFloat(style.paddingBottom || 0);
                }

                const currentContentWidth = newWidth - horizontalPadding;
                const scale = currentContentWidth / winElement._originalWidth;
                const newContentHeight = winElement._originalHeight * scale;
                let newHeight = headerH + newContentHeight + verticalPadding;`
);


code = code.replace(
    /scalerElement\.style\.width = 'auto';\n\s*scalerElement\.style\.height = 'auto';\n\s*scalerElement\.style\.position = 'relative';\n\s*scalerElement\.style\.removeProperty\('--original-width'\);\n\s*scalerElement\.style\.removeProperty\('--original-height'\);\n\n\s*let newOriginalWidth = scalerElement\.scrollWidth;/g,
    `scalerElement.style.width = 'auto';
        scalerElement.style.height = 'auto';
        scalerElement.style.position = 'relative';

        scalerElement.style.removeProperty('--original-width');
        scalerElement.style.removeProperty('--original-height');

        let newOriginalWidth = scalerElement.scrollWidth;`
);

fs.writeFileSync('src/windowManager.js', code);

// Styles
let styles = fs.readFileSync('styles.css', 'utf8');

styles = styles.replace(
    /#window-map \.window-content-container {\s*padding: 0 !important;\s*}/g,
    `#window-map .window-content-container,
#main-view-window .window-content-container,
#party-window .window-content-container {
    padding: 0 !important;
}

#window-settings .window-content-container {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
}`
);
fs.writeFileSync('styles.css', styles);
