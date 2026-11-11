const fs = require('fs');

let content = fs.readFileSync('src/ui/map.js', 'utf8');

// Also ensuring in the gym restore code block that we actually have:
// container.style.overflow = "hidden";
// Actually the review said: "changing .window-content-container and #map-inner-modal-content to remove flex: 1 and overflow-y: auto, replacing them with overflow: hidden. Because this modal template is shared globally... this breaks scrollability"
// We already fixed the html template.
// Wait, the review said the issue was we changed the base html template instead of applying it dynamically. So we MUST revert the base html entirely to its original form.

// Let's restore the original HTML.
content = content.replace(
    '<div class="window-content-container" style="display: flex; flex: 1; min-height: 0; justify-content: center; overflow: hidden;">\n                        <div id="map-inner-modal-content" class="content-panel" style="position: relative; display: flex; flex-direction: column; flex: 1; align-items: center; overflow-y: auto;">',
    '<div class="window-content-container" style="display: flex; min-height: 0; justify-content: center;">\n                        <div id="map-inner-modal-content" class="content-panel" style="position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden;">'
);


// Original was:
// <div class="window-content-container" style="display: flex; min-height: 0; justify-content: center;">
// <div id="map-inner-modal-content" class="content-panel" style="position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden;">

fs.writeFileSync('src/ui/map.js', content);
