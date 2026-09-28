const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

// Disable hardware acceleration to guarantee it doesn't cause blank screens
app.disableHardwareAcceleration();

function createWindow() {
    // Create the browser window with absolute bare minimum settings.
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        show: false, // Wait for ready-to-show to prevent visual flash
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // Load the index.html of the app.
    win.loadFile('index.html');

    // Show the window when it's ready to be rendered
    win.once('ready-to-show', () => {
        if (process.platform === 'win32') {
            fs.writeFileSync('game_ready.txt', 'ready');
        }
        win.show();
    });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
