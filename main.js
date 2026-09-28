const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs');

// Explicitly disable hardware acceleration for maximum stability
app.disableHardwareAcceleration();

// Append command-line switches to improve compatibility
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion');
app.commandLine.appendSwitch('force-color-profile', 'srgb');

function createWindow() {
    // Get primary display dimensions
    const { x, y, width, height } = screen.getPrimaryDisplay().workArea;

    const win = new BrowserWindow({
        width: width,
        height: height,
        x: x,
        y: y,
        transparent: false, // Disable transparency to prevent rendering bugs
        frame: false,
        hasShadow: false,
        alwaysOnTop: false, // Don't keep it above other windows
        skipTaskbar: false,
        show: false,
        resizable: false,
        backgroundThrottling: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.setBounds(screen.getPrimaryDisplay().workArea);

    win.loadFile('index.html');

    win.once('ready-to-show', () => {
        // Create a signal file to let the launcher know the game is ready
        if (process.platform === 'win32') {
            fs.writeFileSync('game_ready.txt', 'ready');
        }
        win.show();
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
