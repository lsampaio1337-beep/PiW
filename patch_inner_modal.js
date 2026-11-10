const fs = require('fs');

const mapJsPath = 'src/ui/map.js';
let mapJs = fs.readFileSync(mapJsPath, 'utf8');

mapJs = mapJs.replace(
    /const windowStyleHTML = `[\s\S]*?`;/,
    `const windowStyleHTML = \`
        <div class="modal-content floating-window" style="width: 800px; height: auto; display: flex; flex-direction: column; position: relative;">
            <div class="window-header" style="display: flex; justify-content: space-between; align-items: center; padding-right: 15px;">
                <span style="flex-grow: 1; text-align: center;">Encounter Hub</span>
                <button onclick="window.hideInnerMapModal()" style="background: transparent; border: none; color: white; font-size: 20px; font-weight: bold; cursor: pointer; padding: 0;">&times;</button>
            </div>
            <div class="window-content-container">
                <div class="window-content-scaler">
                    <div class="content-panel" style="flex: 1; overflow-y: auto; height: 100%; padding: 15px;">
                        \${htmlContent}
                    </div>
                </div>
            </div>
        </div>
    \`;`
);

fs.writeFileSync(mapJsPath, mapJs);
console.log('Patched map.js');
