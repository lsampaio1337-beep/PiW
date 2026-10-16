function setupClickThrough() {
    // Click-through has been permanently disabled to prevent invisible/unclickable window bugs.
    // The transparent: false setting in main.js means we no longer need to dynamically ignore mouse events.
    if (window.electronAPI) {
        window.electronAPI.send('set-ignore-mouse-events', false, { forward: false });
    }
}

// Export it for use
export { setupClickThrough };
