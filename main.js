const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
    // Get primary display dimensions
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    const win = new BrowserWindow({
        width: width,
        height: height,
        show: false,
        transparent: false,
        backgroundColor: '#000000', // Solid black background to guarantee rendering
        frame: false,
        hasShadow: false,
        alwaysOnTop: false, // Don't keep it above other windows
        skipTaskbar: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // Instead of maximizing which breaks transparent windows, set bounds
    win.setBounds(screen.getPrimaryDisplay().workArea);

    win.loadFile('index.html');

    win.once('ready-to-show', () => {
        win.show();
        win.focus();
        // Fallback robust show delay
        setTimeout(() => {
            if (!win.isVisible()) win.show();
            win.focus();
        }, 500);

        // Create a signal file to let the launcher know the game is ready
        if (process.platform === 'win32') {
            fs.writeFileSync('game_ready.txt', 'ready');
        }
    });

    // Handle click-through messages from the renderer process
    ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
        const webContents = event.sender;
        const currentWindow = BrowserWindow.fromWebContents(webContents);
        if (currentWindow) {
            currentWindow.setIgnoreMouseEvents(ignore, options);
        }
    });
}

// Disable hardware acceleration to prevent GPU crashes on some environments
app.disableHardwareAcceleration();

app.whenReady().then(() => {
    // Delay creation slightly to ensure graphics context is fully ready
    setTimeout(createWindow, 250);

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
