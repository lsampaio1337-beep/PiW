const { contextBridge, ipcRenderer } = require('electron');

// Whitelist channels to prevent arbitrary IPC messages
const VALID_CHANNELS = ['minimize-game', 'set-ignore-mouse-events'];

contextBridge.exposeInMainWorld('electronAPI', {
    send: (channel, ...args) => {
        if (VALID_CHANNELS.includes(channel)) {
            ipcRenderer.send(channel, ...args);
        }
    },
    saveStorage: {
        listProfiles: () => ipcRenderer.sendSync('save-storage:list-profiles'),
        readProfile: (profileId) => ipcRenderer.sendSync('save-storage:read-profile', profileId),
        writeProfile: (profileId, jsonString) => ipcRenderer.sendSync('save-storage:write-profile', profileId, jsonString),
        writeMasterIndex: (profiles) => ipcRenderer.sendSync('save-storage:write-master-index', profiles),
        deleteProfile: (profileId) => ipcRenderer.sendSync('save-storage:delete-profile', profileId),
        getSaveDir: () => ipcRenderer.sendSync('save-storage:get-save-dir'),
        getSaveDirs: () => ipcRenderer.sendSync('save-storage:get-save-dirs')
    }
});
