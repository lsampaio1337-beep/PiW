const fs = require('fs');

let content = fs.readFileSync('src/ui/map.js', 'utf8');

// The code review mentions: "changing .window-content-container and #map-inner-modal-content to remove flex: 1 and overflow-y: auto, replacing them with overflow: hidden. Because this modal template is shared globally... this breaks scrollability"
// Looking at the html:
// <div class="window-content-container" style="display: flex; min-height: 0; justify-content: center;">
//     <div id="map-inner-modal-content" class="content-panel" style="position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden;">

// I will fix the HTML template by making map-inner-modal-content overflow-y: auto instead of hidden.
content = content.replace(
    '<div id="map-inner-modal-content" class="content-panel" style="position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden;">',
    '<div id="map-inner-modal-content" class="content-panel" style="position: relative; display: flex; flex-direction: column; flex: 1; align-items: center; overflow-y: auto;">'
);
content = content.replace(
    '<div class="window-content-container" style="display: flex; min-height: 0; justify-content: center;">',
    '<div class="window-content-container" style="display: flex; flex: 1; min-height: 0; justify-content: center;">'
);

// I will fix the gym restoration block:
// container.style.overflow = "hidden"; -> container.style.overflow = "";
// container.style.flex = "1";
content = content.replace(
    'container.style.overflow = "hidden";',
    'container.style.overflow = "";\n                container.style.flex = "1";'
);
// vGym.style.display = "block"; -> vGym.style.display = "flex";
// vGym.style.flexDirection = "column";
// vGym.style.flex = "1";
// vGym.style.overflowY = "auto";
content = content.replace(
    'vGym.style.display = "block";',
    'vGym.style.display = "flex";\n            vGym.style.flexDirection = "column";\n            vGym.style.flex = "1";\n            vGym.style.overflowY = "auto";\n            vGym.style.alignItems = "center";'
);


fs.writeFileSync('src/ui/map.js', content);
