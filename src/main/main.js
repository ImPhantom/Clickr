const path = require('path');
const { readFile } = require('fs').promises;
const { app, BrowserWindow, ipcMain } = require('electron');
const Store = require('electron-store');
const Clicker = require('./clicker.js');

// file-loader imports
const startAlertAudio = require('../static/audio/alert.mp3').default;

const store = new Store({ name: 'app_config', schema: require('../schema.json') });

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
	app.quit();
}

const createWindow = () => {
	// Create the browser window.
	const mainWindow = new BrowserWindow({
		show: false,
		width: 300,
		height: 380,
		frame: false,
		resizable: false,
		fullscreenable: false,
		icon: path.join(__dirname, 'icons/icon.png'),
		webPreferences: {
			// eslint-disable-next-line no-undef
			preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
		}
	});

	// TODO: maybe add splash?

	// and load the index.html of the app.
	// eslint-disable-next-line no-undef
	mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

	// Don't show the main window until the webcontents is fully loaded, avoids uglyness
	mainWindow.once('ready-to-show', () => mainWindow.show());
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

ipcMain.handle('get-alert', async () => {
	const rawAlert = await readFile(path.join(__dirname, startAlertAudio));
	return (rawAlert) ? `data:audio/mpeg;base64,${rawAlert.toString('base64')}` : false;
});

ipcMain.on('set-light-mode', (_, value) => store.set('lightMode', value));
ipcMain.on('update-shortcut', (_, value) => store.set('shortcut', value));
ipcMain.on('update-click-speed', (_, value) => store.set('click.speed', value));
ipcMain.on('update-click-unit', (_, value) => store.set('click.unit', value));
ipcMain.on('update-click-button', (_, value) => store.set('click.button', value));
ipcMain.on('toggle-position-lock', (_, value) => store.set('positionLock', value));
ipcMain.on('toggle-start-alert', (_, value) => store.set('startAlert', value));

/* Clicker functions */
ipcMain.on('arm-toggle', async event => {
	let armed = false;
	if (!clicker.armed && !clicker.clicking) {
		await clicker.arm(
			(speed, unit, alert) => event.reply('clickr-started', speed, unit, alert),
			clicks => event.reply('clickr-clicked', clicks),
			totalClicks => event.reply('clickr-stopped', totalClicks)
		);
		armed = true;
	} else {
		clicker.disarm();
	}

	event.reply('arm-result', armed);
});