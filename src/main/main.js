const { app, BrowserWindow, ipcMain } = require('electron');
const Store = require('electron-store');

const Clicker = require('./clicker.js');

const store = new Store({ name: 'app_config', schema: require('../schema.json') });

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
	app.quit();
}

const createWindow = () => {
	// Create the browser window.
	const mainWindow = new BrowserWindow({
		width: 300,
		height: 380,
		frame: false,
		resizable: false,
		fullscreenable: false,
		webPreferences: {
			// eslint-disable-next-line no-undef
			preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
		}
	});

	// and load the index.html of the app.
	// eslint-disable-next-line no-undef
	mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

	// Open the DevTools.
	mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

const getFocusedWindow = () => BrowserWindow.getFocusedWindow();

ipcMain.on('close-window', () => getFocusedWindow().close());
ipcMain.on('minimize-window', () => getFocusedWindow().minimize());

const clicker = new Clicker(store);

/* Store handling channels */
ipcMain.handle('get-stored-value', (_, key) => {
	return store.get(key);
});

ipcMain.on('update-shortcut', (_, value) => {
	store.set('shortcut', value);
	console.log(`[ipc] Shortcut set to '${value}'`);
});

ipcMain.on('update-click-speed', (_, value) => {
	store.set('click.speed', value);
	console.log(`[ipc] Click speed set to '${value}'`);
});

ipcMain.on('update-click-unit', (_, value) => {
	store.set('click.speed', value);
	console.log(`[ipc] Click speed set to '${value}'`);
});

/* Clicker functions */
ipcMain.on('arm-toggle', async event => {
	let armed = false;
	if (!clicker.armed && !clicker.clicking) {
		await clicker.arm(
			(speed, unit) => event.reply('clickr-started', speed, unit),
			clicks => event.reply('clickr-clicked', clicks),
			totalClicks => event.reply('clickr-stopped', totalClicks)
		);
		armed = true;
	} else {
		await clicker.disarm();
	}

	event.reply('arm-result', armed);
});