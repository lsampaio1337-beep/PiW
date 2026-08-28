const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Replace <aside id="right-col"> with a modal structure
html = html.replace(/<aside id="right-col"[\s\S]*?<\/aside>/, `
    <!-- Center Modal Overlay (replaces right-col) -->
    <div id="modal-overlay" class="modal">
        <div id="modal-content-box" class="modal-content" style="width: 80%; max-width: 800px; max-height: 90vh; overflow-y: auto;">
            <div id="content-panel">
                <!-- Dynamic content injected here -->
            </div>
        </div>
    </div>
`);

fs.writeFileSync('index.html', html);
