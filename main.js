const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs');

// Robust fix for blank/black windows on Windows
// This disables hardware acceleration which is the #1 cause of black screens in Electron
app.disableHardwareAcceleration();

function createWindow() {
    // Get primary display dimensions
    const { x, y, width, height } = screen.getPrimaryDisplay().workArea;

    const win = new BrowserWindow({
        width: width,
        height: height,
        x: x,
        y: y,
        transparent: false,
        backgroundColor: '#000000',
        frame: false,
        hasShadow: false,
        alwaysOnTop: false, // Don't keep it above other windows
        skipTaskbar: false,
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.setBounds({ x, y, width, height });

    win.loadFile('index.html');

    win.once('ready-to-show', () => {
        win.show();
        // Fallback for forcing a repaint
        setTimeout(() => {
             win.show();
             win.focus();
        }, 200);
    });

    win.webContents.on('did-finish-load', () => {
        // Create a signal file to let the launcher know the game is ready
        // Only write this AFTER the app has successfully loaded to avoid false positives
        if (process.platform === 'win32') {
            try {
                const readyFilePath = path.join(app.getAppPath(), 'game_ready.txt');
                fs.writeFileSync(readyFilePath, 'ready', { flag: 'wx' });
            } catch (err) {
                // Ignore EEXIST if the file is already there, but log other errors
                if (err.code !== 'EEXIST') {
                    console.error('Failed to write game_ready.txt:', err);
                }
            }
        }
    });

    // Handle click-through messages from the renderer process
    ipcMain.on('minimize-game', (event) => {
        const webContents = event.sender;
        const currentWindow = BrowserWindow.fromWebContents(webContents);
        if (currentWindow) {
            currentWindow.minimize();
        }
    });

    ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
        const webContents = event.sender;
        const currentWindow = BrowserWindow.fromWebContents(webContents);
        if (currentWindow) {
            currentWindow.setIgnoreMouseEvents(ignore, options);
        }
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
