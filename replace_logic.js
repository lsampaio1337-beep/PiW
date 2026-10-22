const fs = require('fs');

let content = fs.readFileSync('src/windowManager.js', 'utf-8');

// The original block looks like:
//         if (contentPanel && htmlContent !== undefined) {
//             // Parse HTML safely ...
//             ...
//             // Move nodes from the parsed body document into the active DOM
//             while (body.firstChild) {
//                 contentPanel.appendChild(body.firstChild);
//             }
//         }

// Find the start of the block
const blockStartToken = `if (contentPanel && htmlContent !== undefined) {`;
let blockStartIndex = content.indexOf(blockStartToken);

// Find the end of the while loop
const blockEndToken = `contentPanel.appendChild(body.firstChild);\n            }\n        }`;
let blockEndIndex = content.indexOf(blockEndToken, blockStartIndex);

if (blockStartIndex !== -1 && blockEndIndex !== -1) {
    const toReplace = content.substring(blockStartIndex, blockEndIndex + blockEndToken.length);
    content = content.replace(toReplace, `if (contentPanel && htmlContent !== undefined) {\n            this._parseAndSanitizeToElement(htmlContent, contentPanel);\n        }`);

    fs.writeFileSync('src/windowManager.js', content);
    console.log("Replaced successfully!");
} else {
    console.log("Could not find the block to replace.");
}
