const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  onFileOpened: (callback) => {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }
    return ipcRenderer.on('file-opened', callback);
  },
  onSaveFile: (callback) => {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }
    return ipcRenderer.on('save-file', callback);
  },
  onSaveFileAs: (callback) => {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }
    return ipcRenderer.on('save-file-as', callback);
  },
  onNewEntry: (callback) => {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }
    return ipcRenderer.on('new-entry', callback);
  },
  
  // Save file to disk with validation
  saveFile: (filePath, content) => {
    if (typeof filePath !== 'string' || filePath.length === 0) {
      throw new Error('File path must be a non-empty string');
    }
    if (typeof content !== 'string') {
      throw new Error('Content must be a string');
    }
    if (content.length > 10 * 1024 * 1024) {
      throw new Error('Content too large');
    }
    return ipcRenderer.invoke('save-file', { filePath, content });
  },
  
  // Remove listeners with validation
  removeAllListeners: (channel) => {
    const allowedChannels = ['file-opened', 'save-file', 'save-file-as', 'new-entry'];
    if (typeof channel !== 'string' || !allowedChannels.includes(channel)) {
      throw new Error('Invalid channel name');
    }
    return ipcRenderer.removeAllListeners(channel);
  }
});
