const path = require("path");
const { format } = require("url");
const { app, BrowserWindow, ipcMain, globalShortcut } = require("electron");

const isDevelopment = process.env.NODE_ENV !== 'production';

let mainWindow;

function createMainWindow() {
    const window = new BrowserWindow({
        width: 260,
        height: 380,
        show: false,
        frame: false,
        resizable: false,
        fullscreenable: false,
        icon: path.join(__dirname, '../../static/icon.png'),
        webPreferences: {
            nodeIntegration: true
        }
    });

    if (isDevelopment) {
        window.webContents.openDevTools();
    }

    if (isDevelopment) {
        window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);
    } else {
        window.loadURL(format({
            pathname: path.join(__dirname, 'index.html'),
            protocol: 'file',
            slashes: true
        }));
    }

    window.once('ready-to-show', () => {
        window.show();
    })

    window.on('closed', () => {
        mainWindow = null;
    })

    window.webContents.on('devtools-opened', () => {
        window.focus();
        setImmediate(() => {
            window.focus();
        });
    });

    return window;
}


// quit application when all windows are closed
app.on('window-all-closed', () => {
    // on macOS it is common for applications to stay open until the user explicitly quits
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // on macOS it is common to re-create a window even after all windows have been closed
    if (mainWindow === null) {
        mainWindow = createMainWindow();
    }
});

// create main BrowserWindow when electron is ready
app.on('ready', () => {
    mainWindow = createMainWindow();
});

// unregister hotkeys before exiting
app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});

// IPC Handlers
let preferencesWindow;
function openPreferencesModal() {
    preferencesWindow = new BrowserWindow({
        parent: mainWindow,
        width: 360,
        height: 135,
        show: false,
        frame: false,
        modal: true,
        resizable: false,
        fullscreenable: false,
        webPreferences: {
            nodeIntegration: true
        }
    });

    if (isDevelopment) {
        preferencesWindow.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);
    } else {
        preferencesWindow.loadURL(format({
            pathname: path.join(__dirname, 'index.html'),
            protocol: 'file',
            slashes: true
        }));
    }

    preferencesWindow.webContents.once('dom-ready', () => {
        preferencesWindow.webContents.send("async-renderer-channel", "render_preferences");
    });

    preferencesWindow.once("ready-to-show", () => {
        preferencesWindow.show();
    });
}

// Handle IPC Messages
ipcMain.on("async-channel", (event, args) => {
    if (args == "open_preferences_modal") {
        openPreferencesModal();
    } else if (args == "close_preferences_modal") {
        if (preferencesWindow) {
            preferencesWindow.close();
        }
    }

    event.reply("async-channel", "success");
});