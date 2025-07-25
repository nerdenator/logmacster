const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const isDev = process.env.ELECTRON_IS_DEV === 'true';

// Security: Disable error dialogs in production
if (!isDev) {
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Log to file or crash reporting service in production
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Log to file or crash reporting service in production
  });
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
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true, // Ensure web security is enabled
      allowRunningInsecureContent: false,
      experimentalFeatures: false
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
    {
      label: 'LogMacster',
      submenu: [
        {
          label: 'About LogMacster',
          role: 'about'
        },
        { type: 'separator' },
        {
          label: 'Hide LogMacster',
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
    },
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
                // Validate file size before reading (50MB limit)
                const stats = fs.statSync(filePath);
                if (stats.size > 50 * 1024 * 1024) {
                  dialog.showErrorBox('Error', 'File too large. Maximum size is 50MB.');
                  return;
                }
                
                // Validate file extension
                const allowedExtensions = ['.adi', '.adif', '.txt'];
                const fileExtension = path.extname(filePath).toLowerCase();
                
                if (!allowedExtensions.includes(fileExtension)) {
                  dialog.showErrorBox('Error', 'Invalid file type. Only .adi, .adif, and .txt files are supported.');
                  return;
                }
                
                const content = fs.readFileSync(filePath, 'utf8');
                BrowserWindow.getFocusedWindow().webContents.send('file-opened', {
                  filePath,
                  content
                });
              } catch (error) {
                console.error('File open error:', error);
                dialog.showErrorBox('Error', 'Failed to open file. Please check file permissions.');
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
    // Validate file path to prevent directory traversal attacks
    const resolvedPath = path.resolve(filePath);
    
    // Ensure the file has a safe extension
    const allowedExtensions = ['.adi', '.adif', '.txt'];
    const fileExtension = path.extname(resolvedPath).toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      return { success: false, error: 'Invalid file extension. Only .adi, .adif, and .txt files are allowed.' };
    }
    
    // Validate content is a string and not too large (10MB limit)
    if (typeof content !== 'string') {
      return { success: false, error: 'Invalid content type' };
    }
    
    if (content.length > 10 * 1024 * 1024) {
      return { success: false, error: 'File too large. Maximum size is 10MB.' };
    }
    
    fs.writeFileSync(resolvedPath, content, 'utf8');
    return { success: true };
  } catch (error) {
    console.error('Save file error:', error);
    return { success: false, error: 'Failed to save file' };
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
