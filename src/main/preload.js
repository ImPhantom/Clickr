const { contextBridge, ipcRenderer } = require('electron');

const validChannels = {
	invoke: ['get-stored-value', 'get-alert'],
	send: ['set-stored-bool', 'close-window', 'minimize-window', 'open-settings-window', 'set-light-mode', 'arm-toggle', 'update-shortcut', 'update-click-speed', 'update-click-unit', 'update-click-button', 'toggle-position-lock', 'toggle-start-alert'],
	on: ['scheme-updated', 'arm-result', 'clickr-started', 'clickr-clicked', 'clickr-stopped']
};

contextBridge.exposeInMainWorld('api', {
	invoke: (channel, data) => {
		if (validChannels.invoke.includes(channel)) {
			return ipcRenderer.invoke(channel, data);
		}
	},
	send: (channel, ...data) => {
		if (validChannels.send.includes(channel)) {
			ipcRenderer.send(channel, ...data);
		}
	},
	on: (channel, callable) => {
		if (validChannels.on.includes(channel)) {
			ipcRenderer.on(channel, (_, ...args) => callable(...args));
		}
	}
});