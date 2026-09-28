const { app, BrowserWindow, screen } = require('electron');
const path = require('path');
const fs = require('fs');

// Disable hardware acceleration to fix invisible/frozen window issues
app.disableHardwareAcceleration();

function createWindow() {
    // Get primary display dimensions
    const { x, y, width, height } = screen.getPrimaryDisplay().workArea;

    const win = new BrowserWindow({
        width: width,
        height: height,
        x: x,
        y: y,
        frame: false,
        hasShadow: false,
        alwaysOnTop: false, // Don't keep it above other windows
        skipTaskbar: false,
        show: true, // Show immediately
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.setBounds({ x, y, width, height });

    win.loadFile('index.html');

    win.once('ready-to-show', () => {
        // Create a signal file to let the launcher know the game is ready
        if (process.platform === 'win32') {
            fs.writeFileSync('game_ready.txt', 'ready');
        }
        win.show();
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
