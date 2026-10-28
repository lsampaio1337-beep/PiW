const assert = require('assert');

// Simulate the logic we'll add
function simulateSanitizeCode(rawCode) {
    let codeToExecute = rawCode.trim();
    let stopPropagationCalled = false;

    // Check for stopPropagation prefix
    const propagationPrefixMatch = /^event\.stopPropagation\(\)\s*;?\s*/.exec(codeToExecute);
    if (propagationPrefixMatch) {
        stopPropagationCalled = true;
        codeToExecute = codeToExecute.substring(propagationPrefixMatch[0].length).trim();
    }

    // Test if basicCallMatch catches it
    const basicCallMatch = /^(?:if\s*\([^)]*\)\s*)?window\.([a-zA-Z0-9_]+)\s*\(\s*\)\s*;?$/.exec(codeToExecute);
    if (basicCallMatch) {
        return { stopPropagationCalled, matched: 'basicCallMatch', func: basicCallMatch[1] };
    }

    // Test if argCallMatch catches it
    const argCallMatch = /^(?:if\s*\([^)]*\)\s*)?window\.([a-zA-Z0-9_]+)\s*\(\s*(['"]?[a-zA-Z0-9_/\-$!*#@&\s.{}\[\]:()]+['"]?(?:\s*,\s*['"]?[a-zA-Z0-9_/\-$!*#@&\s.{}\[\]:()]+['"]?)*)\s*\)\s*;?$/.exec(codeToExecute);
    if (argCallMatch) {
        return { stopPropagationCalled, matched: 'argCallMatch', func: argCallMatch[1], args: argCallMatch[2] };
    }

    // Test if propagation only
    if (codeToExecute === '' && stopPropagationCalled) {
        return { stopPropagationCalled, matched: 'propagationOnly' };
    }

    return { stopPropagationCalled, matched: 'none' };
}

console.log(simulateSanitizeCode("event.stopPropagation(); window.closeBackpackPocket()"));
console.log(simulateSanitizeCode("event.stopPropagation(); window.renderBackpackTab('pokeballs')"));
console.log(simulateSanitizeCode("event.stopPropagation()"));
console.log(simulateSanitizeCode("window.closeBackpackPocket()"));
