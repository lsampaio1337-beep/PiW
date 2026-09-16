const fs = require('fs');

let index = fs.readFileSync('index.html', 'utf8');

// We are going to replace modal-overlay with a generic window container if we want, but actually multiple windows are appended to #main-container usually.
// Wait, the window manager constraints are window.innerWidth and window.innerHeight, so we can just append dynamically created windows to body, or create a specific container.
// Let's create a template for generic window so we can dynamically spawn them.

const template = `
  <!-- Generic Window Template -->
  <template id="generic-window-template">
      <div class="modal-content floating-window" style="width: 800px; height: 600px; display: flex; flex-direction: column; display: none;">
          <div class="window-header">Window</div>
          <div class="window-content-container">
              <div class="window-content-scaler">
                  <div class="content-panel" style="flex: 1; overflow-y: auto;"></div>
              </div>
          </div>
          <div class="window-resize-handle"></div>
      </div>
  </template>
`;

index = index.replace('<div id="modal-overlay"', template + '\n  <div id="modal-overlay"');

fs.writeFileSync('index.html', index);
