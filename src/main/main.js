/* eslint-disable no-undef */
const path = require('path');
const { readFile } = require('fs').promises;
const { app, BrowserWindow, ipcMain } = require('electron');
const Store = require('electron-store');
const Clicker = require('./clicker.js');

// file-loader imports
const startAlertAudio = require('../static/audio/alert.mp3').default;

const store = new Store({
	name: 'app_config',
	schema: require('../schema.json'),
	migrations: {
		'1.1.0': store => {
			store.delete('startAlert');
		}
	}
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
	app.quit();
}

const createWindow = () => {
	const mainWindow = new BrowserWindow({
		show: false,
		width: 350,
		height: 166,
		frame: false,
		resizable: false,
		fullscreenable: false,
		icon: path.join(__dirname, 'icons/icon.png'),
		alwaysOnTop: store.get('windowOnTop', false),
		webPreferences: {
			contextIsolation: true,
			preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
		}
	});

	// TODO: maybe add splash screen?
	mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
	mainWindow.once('ready-to-show', () => mainWindow.show());
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

/*
	IPC Listeners/Clickr Stuff
*/

/* Window listeners */
const getFocusedWindow = () => BrowserWindow.getFocusedWindow();
ipcMain.on('close-window', () => getFocusedWindow().close());
ipcMain.on('minimize-window', () => getFocusedWindow().minimize());

ipcMain.on('open-settings-window', () => {
	const settingsWindow = new BrowserWindow({
		parent: getFocusedWindow(),
		modal: true,
		show: false,
		width: 305,
		height: 275,
		frame: false,
		resizable: false,
		fullscreenable: false,
		icon: path.join(__dirname, 'icons/icon.png'),
		alwaysOnTop: store.get('windowOnTop', false),
		webPreferences: {
			contextIsolation: true,
			preload: SETTINGS_WINDOW_PRELOAD_WEBPACK_ENTRY,
		}
	});

	settingsWindow.loadURL(SETTINGS_WINDOW_WEBPACK_ENTRY);
	settingsWindow.once('ready-to-show', () => settingsWindow.show());
});

/* Listeners for getting values from persistent config */
ipcMain.handle('get-stored-value', (_, key) => {
	return store.get(key);
});

ipcMain.handle('get-alert', async () => {
	const rawAlert = await readFile(path.join(__dirname, startAlertAudio));
	return (rawAlert) ? `data:audio/mpeg;base64,${rawAlert.toString('base64')}` : false;
});

ipcMain.handle('get-clickr-version', () => {
	return require('../../package.json').version.split('.');
});

/* Listeners for setting/updating persistent values */
ipcMain.on('set-stored-bool', (_, key, value) => {
	if (typeof value !== 'boolean') return;
	store.set(key, value);

	// If the scheme was changed, make sure each window updates
	if (key === 'lightMode') {
		BrowserWindow.getAllWindows().forEach(window => window.webContents.send('scheme-updated', value));
	}

	if (key === 'windowOnTop') {
		BrowserWindow.getAllWindows().forEach(window => window.setAlwaysOnTop(value));
	}
});

ipcMain.on('update-shortcut', (_, value) => store.set('shortcut', value));
ipcMain.on('update-click-speed', (_, value) => store.set('click.speed', value));
ipcMain.on('update-click-unit', (_, value) => store.set('click.unit', value));
ipcMain.on('update-click-button', (_, value) => store.set('click.button', value));

/* Clickr Listeners */
const clicker = new Clicker(store);
ipcMain.on('arm-toggle', async event => {
	if (store.get('shortcut', '') == '') {
		event.reply('arm-result', 'no-shortcut');
		return;
	}

	if (store.get('click.speed', 10) == 0) {
		event.reply('arm-result', 'invalid-cps');
		return;
	}

	let armed = false;
	if (!clicker.armed && !clicker.clicking) {
		await clicker.arm(
			(speed, unit, shouldAlert) => event.reply('clickr-started', speed, unit, shouldAlert),
			clicks => event.reply('clickr-clicked', clicks),
			(totalClicks, shouldAlert) => event.reply('clickr-stopped', totalClicks, shouldAlert)
		);
		armed = true;
	} else {
		clicker.disarm();
	}

	event.reply('arm-result', armed);
});