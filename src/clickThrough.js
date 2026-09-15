const { ipcRenderer } = require('electron');

function setupClickThrough() {
    let ignoreMouse = false;

    // Listen to mouse movements globally
    window.addEventListener('mousemove', (event) => {
        const x = event.clientX;
        const y = event.clientY;

        // Find the element directly under the mouse
        const elementUnderMouse = document.elementFromPoint(x, y);

        // Let's determine if we should ignore clicks.
        // We will ignore clicks if the element is the body, the html element,
        // or specifically designated transparent full-screen wrappers.
        let shouldIgnore = false;

        if (!elementUnderMouse) {
            shouldIgnore = true;
        } else if (elementUnderMouse === document.body || elementUnderMouse === document.documentElement) {
            shouldIgnore = true;
        } else if (elementUnderMouse.classList.contains('transparent-overlay')) {
            shouldIgnore = true;
        } else if (elementUnderMouse.id === 'splash-screen' && elementUnderMouse.style.display === 'none') {
             // Edge case if somehow the splash screen wrapper catches it
             shouldIgnore = true;
        }

        if (shouldIgnore !== ignoreMouse) {
            ignoreMouse = shouldIgnore;
            ipcRenderer.send('set-ignore-mouse-events', ignoreMouse, { forward: ignoreMouse });
        }
    });
}

// Export it for use
export { setupClickThrough };
