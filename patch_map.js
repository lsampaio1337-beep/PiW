const fs = require('fs');

let content = fs.readFileSync('src/ui/map.js', 'utf8');

// Replace standard windowModal closes and opens with DOM manipulation
content = content.replace(/window\.showModal\(locationName, machinesHtml, 'window-casino-modal', '800px'\);/g,
`        let mapWin = document.getElementById('window-map-content');
        if (!mapWin) mapWin = document.querySelector('#window-map .content-panel');
        if (mapWin) {
            let overlay = document.getElementById('casino-inner-popup');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'casino-inner-popup';
                overlay.style.position = 'absolute';
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.width = '100%';
                overlay.style.height = '100%';
                overlay.style.backgroundColor = 'rgba(0,0,0,0.8)';
                overlay.style.zIndex = '1000';
                overlay.style.display = 'flex';
                overlay.style.justifyContent = 'center';
                overlay.style.alignItems = 'center';
                mapWin.parentElement.style.position = 'relative'; // Ensure relative parent
                mapWin.parentElement.appendChild(overlay);
            }
            if (window.windowManager) {
                window.windowManager._parseAndSanitizeToElement(machinesHtml, overlay);
            } else {
                overlay.innerHTML = machinesHtml;
            }
            overlay.style.display = 'flex';
        }`);

content = content.replace(/window\.showModal\(locationName, html, 'window-casino-modal', '800px'\);/g,
`        let mapWin = document.getElementById('window-map-content');
        if (!mapWin) mapWin = document.querySelector('#window-map .content-panel');
        if (mapWin) {
            let overlay = document.getElementById('casino-inner-popup');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'casino-inner-popup';
                overlay.style.position = 'absolute';
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.width = '100%';
                overlay.style.height = '100%';
                overlay.style.backgroundColor = 'rgba(0,0,0,0.8)';
                overlay.style.zIndex = '1000';
                overlay.style.display = 'flex';
                overlay.style.justifyContent = 'center';
                overlay.style.alignItems = 'center';
                mapWin.parentElement.style.position = 'relative';
                mapWin.parentElement.appendChild(overlay);
            }
            if (window.windowManager) {
                window.windowManager._parseAndSanitizeToElement(html, overlay);
            } else {
                overlay.innerHTML = html;
            }
            overlay.style.display = 'flex';
        }`);

// Replace the closes
content = content.replace(/if\(window\.windowManager\) window\.windowManager\.closeDynamicWindow\('window-casino-modal'\);/g, "const popup = document.getElementById('casino-inner-popup'); if (popup) popup.style.display = 'none';");


fs.writeFileSync('src/ui/map.js', content);
