const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs');

// Fix transparency issues conditionally rather than disabling hardware acceleration entirely
if (process.platform === 'linux') {
    app.commandLine.appendSwitch('enable-transparent-visuals');
    // Hardware acceleration must be disabled on Linux for transparency to work properly
    app.disableHardwareAcceleration();
}

function createWindow() {
    // Get primary display dimensions
    const { x, y, width, height } = screen.getPrimaryDisplay().workArea;

    const win = new BrowserWindow({
        width: width,
        height: height,
        x: x,
        y: y,
        transparent: true,
        backgroundColor: '#00000000',
        frame: false,
        hasShadow: true,
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
        // Create a signal file to let the launcher know the game is ready
        if (process.platform === 'win32') {
            fs.writeFileSync('game_ready.txt', 'ready');
        }
        win.show();
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
