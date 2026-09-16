const fs = require('fs');

let uiJs = fs.readFileSync('src/ui.js', 'utf8');

// Replace showModal implementation
uiJs = uiJs.replace(
/export function showModal\(title, htmlContent\) \{[\s\S]*?(?=const oakTasks = \{)/,
`export function showModal(title, htmlContent, windowId = 'dynamic-modal') {
    if (window.windowManager) {
        window.windowManager.createDynamicWindow(windowId, title, htmlContent);
    }
}

`
);

// We also need to patch window.closeModal to gracefully handle the generic ones or old ones if any exist.
uiJs = uiJs.replace(
/window\.closeModal = function\(\) \{[\s\S]*?\};/,
`window.closeModal = function(windowId) {
    if (windowId && typeof windowId === 'string' && window.windowManager) {
        window.windowManager.closeDynamicWindow(windowId);
    } else {
        const overlay = document.getElementById('modal-overlay');
        if (overlay) overlay.style.display = 'none';
        const modalBox = document.getElementById('modal-content-box');
        if (modalBox && modalBox.dataset.originalStyles !== undefined) {
            modalBox.setAttribute('style', modalBox.dataset.originalStyles);
            delete modalBox.dataset.originalStyles;
        }
    }
};`
);

fs.writeFileSync('src/ui.js', uiJs);
