const fs = require('fs');

let ui = fs.readFileSync('src/ui.js', 'utf-8');

ui = ui.replace(`export function showModal(title, htmlContent, windowId = 'dynamic-modal') {
    if (window.windowManager) {
        window.windowManager.createDynamicWindow(windowId, title, htmlContent);
    } else {
        const overlay = document.getElementById('modal-overlay');
        const modalBox = document.getElementById('modal-content-box');
        const header = document.getElementById('modal-header');
        const contentPanel = document.getElementById('content-panel');
        if (overlay && modalBox && header && contentPanel) {
            overlay.style.display = 'flex';
            header.innerHTML = title;
            contentPanel.innerHTML = htmlContent;
        }
    }
}`, `export function showModal(title, htmlContent, windowId = 'dynamic-modal') {
    if (window.windowManager) {
        window.windowManager.createDynamicWindow(windowId, title, htmlContent);
    } else {
        const overlay = document.getElementById('modal-overlay');
        const modalBox = document.getElementById('modal-content-box');
        const header = document.getElementById('modal-header');
        const contentPanel = document.getElementById('content-panel');
        if (overlay && modalBox && header && contentPanel) {
            overlay.style.display = 'flex';
            header.innerHTML = title + '<span onclick="if(window.closeModal) window.closeModal()" style="position: absolute; right: 10px; cursor: pointer; color: white; font-weight: bold;">X</span>';
            contentPanel.innerHTML = htmlContent;
        }
    }
}`);

fs.writeFileSync('src/ui.js', ui);
