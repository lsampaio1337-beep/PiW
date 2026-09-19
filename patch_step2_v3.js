const fs = require('fs');
let code = fs.readFileSync('src/windowManager.js', 'utf8');

code = code.replace(
    /\/\/ Enforce max width during resize to prevent it from going out of screen boundaries\s*let maxWFromHeight = horizontalPadding \+ \(\(this\.containerHeight - headerH - verticalPadding\) \* \(winElement\._originalWidth \/ winElement\._originalHeight\)\);\s*let maxW = Math\.min\(this\.containerWidth, maxWFromHeight\);\s*if \(newWidth > maxW\) newWidth = maxW;/,
    ""
);

fs.writeFileSync('src/windowManager.js', code);
