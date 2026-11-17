const { contextBridge, ipcRenderer } = require('electron');

// Whitelist channels to prevent arbitrary IPC messages
const VALID_CHANNELS = ['minimize-game', 'set-ignore-mouse-events', 'set-main-control-minimized'];
const VALID_RECEIVE_CHANNELS = ['restore-main-control'];

contextBridge.exposeInMainWorld('electronAPI', {
    send: (channel, ...args) => {
        if (VALID_CHANNELS.includes(channel)) {
            ipcRenderer.send(channel, ...args);
        }
    },
    on: (channel, callback) => {
        if (VALID_RECEIVE_CHANNELS.includes(channel) && typeof callback === 'function') {
            ipcRenderer.on(channel, (_event, ...args) => callback(...args));
        }
    }
});
