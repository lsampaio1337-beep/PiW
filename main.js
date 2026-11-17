const { app, BrowserWindow, ipcMain, screen, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

let isMainControlMinimized = false;

// Fix transparency issues conditionally rather than disabling hardware acceleration entirely
if (process.platform === 'linux') {
    app.commandLine.appendSwitch('enable-transparent-visuals');
    // We no longer disable hardware acceleration on Linux as it causes severe performance issues.
    // Instead, we will use a setTimeout workaround when creating the window.
}

function createWindow() {
    // Get primary display dimensions
    let { x, y, width, height } = screen.getPrimaryDisplay().workArea;

    // Subtract 1 pixel on Windows to bypass native window occlusion tracking
    // which freezes underlying Chromium browsers (e.g. YouTube in Chrome)
    if (process.platform === 'win32') {
        height -= 1;
    }

    const win = new BrowserWindow({
        title: 'PiW',
        icon: path.join(__dirname, 'Assets', 'Items', 'Balls', 'Pokeball.png'),
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
            webSecurity: true,
            sandbox: true,
            allowRunningInsecureContent: false,
            webviewTag: false,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.setBounds({ x, y, width, height });

    win.loadFile('index.html');

    win.once('ready-to-show', () => {
        // Create a signal file to let the launcher know the game is ready
        if (process.platform === 'win32') {
            try {
                fs.writeFileSync('game_ready.txt', 'ready');
            } catch (err) {
                console.error('Failed to write game_ready.txt:', err);
            }
        }
        win.show();
    });

    win.on('minimize', () => {
        if (isMainControlMinimized) {
            isMainControlMinimized = false;
            setImmediate(() => {
                if (!win.isDestroyed()) {
                    win.restore();
                    win.focus();
                    win.webContents.send('restore-main-control', { fromMinimize: true });
                }
            });
        }
    });

    win.on('focus', () => {
        if (isMainControlMinimized && !win.isDestroyed()) {
            win.webContents.send('restore-main-control', { fromMinimize: false });
        }
    });
}

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

ipcMain.on('set-main-control-minimized', (_event, minimized) => {
    isMainControlMinimized = Boolean(minimized);
});

app.setName('PiW');
if (process.platform === 'win32') {
    app.setAppUserModelId('PiW');
}

app.whenReady().then(() => {
    // Remove default application menu so Ctrl+W is handled by the renderer instead of closing the whole app
    Menu.setApplicationMenu(null);

    // Delay window creation on Linux to allow the compositor to initialize correctly
    // so transparent windows work without disabling hardware acceleration.
    if (process.platform === 'linux') {
        setTimeout(createWindow, 1000);
    } else {
        createWindow();
    }

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
