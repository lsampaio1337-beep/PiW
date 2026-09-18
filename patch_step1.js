const fs = require('fs');
let code = fs.readFileSync('src/windowManager.js', 'utf8');

const oldDragCode = `            // Container Boundary constraints
            if (finalLeft < 0) finalLeft = 0;
            if (finalTop < 0) finalTop = 0;
            if (finalLeft + rect.width > this.containerWidth) finalLeft = this.containerWidth - rect.width;
            if (finalTop + rect.height > this.containerHeight) finalTop = this.containerHeight - rect.height;`;

const newDragCode = `            // Container Boundary constraints
            if (finalLeft + rect.width > this.containerWidth) finalLeft = Math.max(0, this.containerWidth - rect.width);
            if (finalTop + rect.height > this.containerHeight) finalTop = Math.max(0, this.containerHeight - rect.height);
            if (finalLeft < 0) finalLeft = 0;
            if (finalTop < 0) finalTop = 0;`;

code = code.replace(oldDragCode, newDragCode);
fs.writeFileSync('src/windowManager.js', code);
