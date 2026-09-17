const fs = require('fs');

// The issue is in src/windowManager.js, when it calculates the inner _originalWidth and _originalHeight,
// it was including the padding. I need to make sure the padding is accurately stripped.

let code = fs.readFileSync('src/windowManager.js', 'utf8');

// Ensure we don't have duplicated logic in initDims
code = code.replace(/let contentContainer = winElement\.querySelector\('\.window-content-container'\);\n\s*let horizontalPadding = 0;\n\s*let verticalPadding = 0;\n\s*if \(contentContainer\) {\n\s*const style = window\.getComputedStyle\(contentContainer\);\n\s*horizontalPadding = parseFloat\(style\.paddingLeft\) \+ parseFloat\(style\.paddingRight\);\n\s*verticalPadding = parseFloat\(style\.paddingTop\) \+ parseFloat\(style\.paddingBottom\);\n\s*}/g, '');

code = code.replace(
    /const headerH = headerElement \? headerElement\.offsetHeight : 0;\n\n\s*if \(winElement\.style\.display !== 'none' && winElement\.offsetWidth > 0\) {/g,
    `const headerH = headerElement ? headerElement.offsetHeight : 0;

                if (winElement.style.display !== 'none' && winElement.offsetWidth > 0) {
                    let contentContainer = winElement.querySelector('.window-content-container');
                    let horizontalPadding = 0;
                    let verticalPadding = 0;
                    if (contentContainer) {
                        const style = window.getComputedStyle(contentContainer);
                        horizontalPadding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
                        verticalPadding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
                    }`
);

// We need to fix the duplicate replacement issue and make sure vertical padding is accurately read
// Reset file entirely from origin then manually patch
