const fs = require('fs');

let content = fs.readFileSync('src/ui/map.js', 'utf8');

content = content.replace(
    /container\.style\.overflow = "";\s*container\.style\.flex = "1";/g,
    'container.style.overflow = "hidden";\n                container.style.flex = "1";'
);

content = content.replace(
    '<div class="window-content-container" style="display: flex; flex: 1; min-height: 0; justify-content: center;">\n                        <div id="map-inner-modal-content" class="content-panel" style="position: relative; display: flex; flex-direction: column; flex: 1; align-items: center; overflow-y: auto;">',
    '<div class="window-content-container" style="display: flex; flex: 1; min-height: 0; justify-content: center; overflow: hidden;">\n                        <div id="map-inner-modal-content" class="content-panel" style="position: relative; display: flex; flex-direction: column; flex: 1; align-items: center; overflow-y: auto;">'
);

// We need to restore container overflow to hidden when opening gym, because we had it as "visible" in safari/casino:
// I'll ensure window-content-container in html has overflow hidden
// Let's modify the html:
content = content.replace(
    '<div class="window-content-container" style="display: flex; flex: 1; min-height: 0; justify-content: center;">',
    '<div class="window-content-container" style="display: flex; flex: 1; min-height: 0; justify-content: center; overflow: hidden;">'
);


fs.writeFileSync('src/ui/map.js', content);
