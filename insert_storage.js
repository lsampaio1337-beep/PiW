const fs = require('fs');

const htmlPath = 'index.html';
let html = fs.readFileSync(htmlPath, 'utf8');

const target = `<!-- Potion Card -->`;
const insert = `<!-- Storage Card -->
              <div id="smartwatch-storage-card" style="width: 30px; height: 30px; background: rgba(0, 0, 0, 0.6); border: 2px solid #9b59b6; border-radius: 8px; position: relative; display: flex; align-items: center; justify-content: center;">
                  <img id="smartwatch-storage-img" src="Assets/Items/Upgrades/Storage1.png" style="width: 80%; height: 80%; object-fit: contain;">
                  <span id="smartwatch-storage-count" style="position: absolute; bottom: 0px; right: 2px; color: white; font-size: 8px; font-weight: bold; text-shadow: 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000;">0/0</span>
                  <img id="smartwatch-storage-full-overlay" src="Assets/Extra/No.png" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; z-index: 2; display: none;">
              </div>
              `;

if (html.includes(target)) {
    html = html.replace(target, insert + target);
    fs.writeFileSync(htmlPath, html);
    console.log("Storage card inserted successfully.");
} else {
    console.error("Target string not found in index.html");
}
