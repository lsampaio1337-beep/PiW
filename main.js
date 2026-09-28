const { app, BrowserWindow, screen } = require('electron');
const path = require('path');
const fs = require('fs');

// Disable hardware acceleration to fix invisible/frozen window issues
app.disableHardwareAcceleration();

function createWindow() {
    // Get primary display dimensions, with a robust fallback
    const workArea = screen.getPrimaryDisplay().workArea || {};
    const winWidth = workArea.width || 1200;
    const winHeight = workArea.height || 800;
    const winX = workArea.x || 0;
    const winY = workArea.y || 0;

    const win = new BrowserWindow({
        width: winWidth,
        height: winHeight,
        x: winX,
        y: winY,
        frame: false,
        hasShadow: false,
        alwaysOnTop: false, // Don't keep it above other windows
        skipTaskbar: false,
        show: true, // Show immediately
        backgroundColor: '#000000', // Solid black base to prevent transparency bugs
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            backgroundThrottling: false
        }
    });

    win.setBounds({ x: winX, y: winY, width: winWidth, height: winHeight });

    win.loadFile(path.join(__dirname, 'index.html'));

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
