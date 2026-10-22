const fs = require('fs');

let content = fs.readFileSync('src/windowManager.js', 'utf-8');

// 1. Extract the logic lines for the new helper method
const startToken = `            // Parse HTML safely in an inactive document to prevent automatic resource fetching (e.g. CSRF via img tags).`;
const endToken = `            // Move nodes from the parsed body document into the active DOM`;

const startIndex = content.indexOf(startToken);
const endIndex = content.indexOf(endToken);

if (startIndex === -1 || endIndex === -1) {
    console.error("Tokens not found");
    process.exit(1);
}

// Logic lines to extract
let logicBody = content.substring(startIndex, endIndex);
logicBody = logicBody.replace(/htmlContent/g, 'htmlString');

const helperMethod = `    _parseAndSanitizeToElement(htmlString, targetElement) {
${logicBody}
            targetElement.innerHTML = '';
            // Move nodes from the parsed body document into the active DOM
            while (body.firstChild) {
                targetElement.appendChild(body.firstChild);
            }
    }
`;

// 2. Insert helper method right after the constructor
const classStartToken = `    constructor() {`;
const constructorStartIndex = content.indexOf(classStartToken);

// find end of constructor (count braces)
let braces = 0;
let constructorEndIndex = -1;
for (let i = constructorStartIndex + classStartToken.length; i < content.length; i++) {
    if (content[i] === '{') braces++;
    if (content[i] === '}') {
        if (braces === 0) {
            constructorEndIndex = i;
            break;
        }
        braces--;
    }
}

if (constructorEndIndex === -1) {
    console.error("Constructor end not found");
    process.exit(1);
}

content = content.substring(0, constructorEndIndex + 1) + "\n\n" + helperMethod + content.substring(constructorEndIndex + 1);

fs.writeFileSync('src/windowManager.js', content);
