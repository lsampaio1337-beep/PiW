const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs');

// Force D3D11 backend to ensure stable hardware acceleration (required for transparent: true on Windows)
app.commandLine.appendSwitch('use-angle', 'd3d11');
// Disable CalculateNativeWinOcclusion to prevent frameless transparent window freezing issues
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion');
// Force standard color profile to ensure alpha channels map correctly
app.commandLine.appendSwitch('force-color-profile', 'srgb');

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
        backgroundColor: '#00000000', // Explicit transparent hex for software alpha channel base
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
    // 500ms delay to ensure the main process and IPC pipelines are completely settled
    setTimeout(() => {
        createWindow();
    }, 500);

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
