const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs');

// Fix transparency issues by applying robust rendering fixes
app.commandLine.appendSwitch('enable-transparent-visuals');
app.disableHardwareAcceleration();

function createWindow() {
    // Get primary display dimensions
    const { x, y, width, height } = screen.getPrimaryDisplay().workArea;

    // Prevent native window occlusion tracking on Windows by subtracting 1 pixel
    const safeWidth = width - 1;
    const safeHeight = height - 1;

    const win = new BrowserWindow({
        width: safeWidth,
        height: safeHeight,
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
            webSecurity: true,
            sandbox: true,
            allowRunningInsecureContent: false,
            webviewTag: false,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.setBounds({ x, y, width: safeWidth, height: safeHeight });

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
    // Delay creation to ensure transparent visuals initialize properly
    setTimeout(() => {
        createWindow();
    }, 400);

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
