const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  onFileOpened: (callback) => ipcRenderer.on('file-opened', callback),
  onSaveFile: (callback) => ipcRenderer.on('save-file', callback),
  onSaveFileAs: (callback) => ipcRenderer.on('save-file-as', callback),
  onNewEntry: (callback) => ipcRenderer.on('new-entry', callback),
  
  // Save file to disk
  saveFile: (filePath, content) => ipcRenderer.invoke('save-file', { filePath, content }),
  
  // Open file dialog
  openFile: () => ipcRenderer.invoke('open-file'),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});
