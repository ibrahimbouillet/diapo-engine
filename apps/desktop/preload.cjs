const { contextBridge, ipcRenderer } = require('electron');

// Expose only public presentation metadata and the window-visibility signal.
// The page cannot send arbitrary IPC messages or access Node/Windows APIs.
contextBridge.exposeInMainWorld('presentationHost', {
  whenShown: () => ipcRenderer.invoke('presentation:when-shown'),
});
