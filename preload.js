const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    send: (channel, ...args) => {
        // Whitelist channels to prevent arbitrary IPC messages
        const validChannels = ['minimize-game', 'set-ignore-mouse-events'];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, ...args);
        }
    }
});
