const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

if (!content.includes('<div class="window-resize-handle"></div>') || !content.match(/<div id="top-bar-window".*?>[\s\S]*?<div class="window-resize-handle"><\/div>/)) {
    console.log("No resize handle in top-bar-window!");
} else {
    console.log("Resize handle found in top-bar-window.");
}

// Check where it actually is
const lines = content.split('\n');
let insideTopBar = false;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('id="top-bar-window"')) {
        insideTopBar = true;
    }
    if (insideTopBar && lines[i].includes('window-resize-handle')) {
        console.log("Found handle at line:", i + 1);
        break;
    }
    if (insideTopBar && lines[i].includes('<!-- Splash Screen')) {
        console.log("Top bar ended without finding handle!");
        break;
    }
}
