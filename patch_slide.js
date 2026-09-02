const fs = require('fs');

let css = fs.readFileSync('styles.css', 'utf8');
css = css.replace(
    /@keyframes slide-in-right \{\n    from \{ right: -30%; opacity: 1; \}\n    to \{ right: 15%; opacity: 1; \}\n\}/,
    `@keyframes slide-in-right {
    from { right: -50%; opacity: 1; }
    to { right: 40%; opacity: 1; }
}`
);
css = css.replace(
    /right: 15%;\n    top: 20px;/,
    `right: 40%;\n    top: 20px;`
);

fs.writeFileSync('styles.css', css);
console.log("Patched slide-in positioning!");
