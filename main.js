const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs');

// Robust hardware acceleration and GPU flags to prevent transparency freezing issues
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('enable-transparent-visuals');
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion');

function createWindow() {
    // Get primary display dimensions
    const { x, y, width, height } = screen.getPrimaryDisplay().workArea;

    const win = new BrowserWindow({
        width: width,
        height: height,
        x: x,
        y: y,
        transparent: true,
        frame: false,
        resizable: false, // Prevent unintentional resizing
        hasShadow: false,
        alwaysOnTop: false, // Don't keep it above other windows
        skipTaskbar: false,
        show: false,
        backgroundColor: '#00000000', // Explicit transparent hex to prevent glitched contexts
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            backgroundThrottling: false // Prevent video/animation freezes when unfocused
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
    ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
        const webContents = event.sender;
        const currentWindow = BrowserWindow.fromWebContents(webContents);
        if (currentWindow) {
            currentWindow.setIgnoreMouseEvents(ignore, options);
        }
    });
}

app.whenReady().then(() => {
    // Slight delay to ensure the GPU process is fully initialized before window creation
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
