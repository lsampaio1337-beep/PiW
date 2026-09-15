const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

function createWindow() {
    // Get primary display dimensions
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    const win = new BrowserWindow({
        width: width,
        height: height,
        transparent: true,
        frame: false,
        hasShadow: false,
        alwaysOnTop: false, // Don't keep it above other windows
        skipTaskbar: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // Maximize the window to cover the screen
    win.maximize();

    win.loadFile('index.html');

    // Handle click-through messages from the renderer process
    ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
        const webContents = event.sender;
        const currentWindow = BrowserWindow.fromWebContents(webContents);
        if (currentWindow) {
            currentWindow.setIgnoreMouseEvents(ignore, options);
        }
    });
}

// Disable hardware acceleration to prevent transparency bugs on some OS
app.disableHardwareAcceleration();

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
