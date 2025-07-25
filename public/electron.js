const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Set the application name early for macOS menu bar
app.setName('LogMacster');

const isDev = process.env.ELECTRON_IS_DEV === 'true';

// Helper function to update window title with filename
function updateWindowTitle(window, filePath = null) {
  const baseTitle = 'LogMacster - ADIF Log Editor';
  if (filePath) {
    const fileName = path.basename(filePath);
    window.setTitle(`${fileName} - ${baseTitle}`);
  } else {
    window.setTitle(baseTitle);
  }
}

function createWindow() {
  // Create the browser window
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'default', // Traditional macOS window chrome
    title: 'LogMacster - ADIF Log Editor',
    show: false
  });

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:8080' 
    : `file://${path.join(__dirname, '../build/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  return mainWindow;
}

function createMenu() {
  const template = [
    ...(process.platform === 'darwin' ? [{
      label: app.getName(),
      submenu: [
        {
          label: 'About ' + app.getName(),
          role: 'about'
        },
        { type: 'separator' },
        {
          label: 'Hide ' + app.getName(),
          accelerator: 'Command+H',
          role: 'hide'
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Shift+H',
          role: 'hideothers'
        },
        {
          label: 'Show All',
          role: 'unhide'
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    }] : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'Open ADIF File...',
          accelerator: 'Command+O',
          click: async () => {
            const result = await dialog.showOpenDialog({
              properties: ['openFile'],
              filters: [
                { name: 'ADIF Files', extensions: ['adi', 'adif'] },
                { name: 'All Files', extensions: ['*'] }
              ]
            });

            if (!result.canceled && result.filePaths.length > 0) {
              const filePath = result.filePaths[0];
              try {
                const content = fs.readFileSync(filePath, 'utf8');
                const focusedWindow = BrowserWindow.getFocusedWindow();
                updateWindowTitle(focusedWindow, filePath);
                focusedWindow.webContents.send('file-opened', {
                  filePath,
                  content
                });
              } catch (error) {
                dialog.showErrorBox('Error', `Failed to open file: ${error.message}`);
              }
            }
          }
        },
        {
          label: 'Save',
          accelerator: 'Command+S',
          click: () => {
            BrowserWindow.getFocusedWindow().webContents.send('save-file');
          }
        },
        {
          label: 'Save As...',
          accelerator: 'Command+Shift+S',
          click: async () => {
            const result = await dialog.showSaveDialog({
              filters: [
                { name: 'ADIF Files', extensions: ['adi'] },
                { name: 'All Files', extensions: ['*'] }
              ]
            });

            if (!result.canceled) {
              BrowserWindow.getFocusedWindow().webContents.send('save-file-as', result.filePath);
            }
          }
        },
        { type: 'separator' },
        {
          label: 'New Log Entry',
          accelerator: 'Command+N',
          click: () => {
            BrowserWindow.getFocusedWindow().webContents.send('new-entry');
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'Command+Z',
          role: 'undo'
        },
        {
          label: 'Redo',
          accelerator: 'Command+Shift+Z',
          role: 'redo'
        },
        { type: 'separator' },
        {
          label: 'Cut',
          accelerator: 'Command+X',
          role: 'cut'
        },
        {
          label: 'Copy',
          accelerator: 'Command+C',
          role: 'copy'
        },
        {
          label: 'Paste',
          accelerator: 'Command+V',
          role: 'paste'
        },
        {
          label: 'Select All',
          accelerator: 'Command+A',
          role: 'selectall'
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'Command+R',
          click: () => {
            BrowserWindow.getFocusedWindow().reload();
          }
        },
        {
          label: 'Force Reload',
          accelerator: 'Command+Shift+R',
          click: () => {
            BrowserWindow.getFocusedWindow().webContents.reloadIgnoringCache();
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'F12',
          click: () => {
            BrowserWindow.getFocusedWindow().webContents.toggleDevTools();
          }
        },
        { type: 'separator' },
        {
          label: 'Actual Size',
          accelerator: 'Command+0',
          role: 'resetZoom'
        },
        {
          label: 'Zoom In',
          accelerator: 'Command+Plus',
          role: 'zoomIn'
        },
        {
          label: 'Zoom Out',
          accelerator: 'Command+-',
          role: 'zoomOut'
        },
        { type: 'separator' },
        {
          label: 'Toggle Fullscreen',
          accelerator: 'Control+Command+F',
          role: 'togglefullscreen'
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'Command+M',
          role: 'minimize'
        },
        {
          label: 'Close',
          accelerator: 'Command+W',
          role: 'close'
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Handle saving files
ipcMain.handle('save-file', async (event, { filePath, content }) => {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Handle opening files
ipcMain.handle('open-file', async (event) => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'ADIF Files', extensions: ['adi', 'adif'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0];
      const content = fs.readFileSync(filePath, 'utf8');
      // Update window title when file is opened via button
      const focusedWindow = BrowserWindow.getFocusedWindow();
      updateWindowTitle(focusedWindow, filePath);
      return { success: true, filePath, content };
    } else {
      return { success: false, canceled: true };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Handle updating window title
ipcMain.handle('update-title', async (event, filePath) => {
  try {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    updateWindowTitle(focusedWindow, filePath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();
  createMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
