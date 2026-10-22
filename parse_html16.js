const fs = require('fs');
let content = fs.readFileSync('src/windowManager.js', 'utf-8');

// I am replacing the `if (contentPanel && htmlContent !== undefined)` logic in createDynamicWindow
// to use `this._parseAndSanitizeToElement(htmlContent, contentPanel)` and remove the duplication

const startIndexStr = 'if (contentPanel && htmlContent !== undefined) {';
const startIndex = content.indexOf(startIndexStr);

if (startIndex !== -1) {
    let bracketCount = 0;
    let endIndex = -1;
    for (let i = startIndex + startIndexStr.length - 1; i < content.length; i++) {
        if (content[i] === '{') bracketCount++;
        else if (content[i] === '}') bracketCount--;

        if (bracketCount === 0) {
            endIndex = i;
            break;
        }
    }

    if (endIndex !== -1) {
        const toReplace = content.substring(startIndex, endIndex + 1);
        content = content.replace(toReplace, `if (contentPanel && htmlContent !== undefined) {
            this._parseAndSanitizeToElement(htmlContent, contentPanel);
        }`);
        fs.writeFileSync('src/windowManager.js', content);
        console.log("Successfully replaced duplicate code!");
    } else {
        console.log("Could not find matching bracket.");
    }
} else {
    console.log("Could not find start index.");
}
