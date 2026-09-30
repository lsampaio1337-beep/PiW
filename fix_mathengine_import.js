const fs = require('fs');
let code = fs.readFileSync('src/ui.js', 'utf8');

// The issue is that `getCapacity` should be imported directly from mathEngine, just like in other files.
// Let's check imports in src/ui.js
if (!code.includes('import { getCapacity }')) {
    // MathEngine might not be imported. But `calculatePP` or others might be.
    // Let's check the top of the file
    let newCode = code.replace(
        /window\.mathEngine\.getCapacity\(state,/g,
        "getCapacity(state,"
    );
    // Add import if not present
    if (!newCode.includes('import { getCapacity')) {
        // Let's see how mathEngine is imported, or we just add it to the top.
        const importStr = 'import { getCapacity } from "./mathEngine.js";\n';
        newCode = importStr + newCode;
    }
    fs.writeFileSync('src/ui.js', newCode);
} else {
    code = code.replace(
        /window\.mathEngine\.getCapacity\(state,/g,
        "getCapacity(state,"
    );
    fs.writeFileSync('src/ui.js', code);
}
console.log("Fixed getCapacity calls in src/ui.js");
