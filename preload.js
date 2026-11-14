const { contextBridge, ipcRenderer } = require('electron');

// Whitelist channels to prevent arbitrary IPC messages
const VALID_CHANNELS = ['minimize-game', 'set-ignore-mouse-events'];

contextBridge.exposeInMainWorld('electronAPI', {
    send: (channel, ...args) => {
        if (VALID_CHANNELS.includes(channel)) {
            ipcRenderer.send(channel, ...args);
        }
    }
});
