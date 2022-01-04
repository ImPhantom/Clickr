const { contextBridge, ipcRenderer } = require('electron');

const validChannels = {
	invoke: ['get-stored-value'],
	send: ['close-window', 'minimize-window', 'update-shortcut', 'arm-toggle'],
	handle: ['arm-result']
};

contextBridge.exposeInMainWorld('api', {
	invoke: (channel, data) => {
		if (validChannels.invoke.includes(channel)) {
			return ipcRenderer.invoke(channel, data);
		}
	},
	send: (channel, data) => {
		if (validChannels.send.includes(channel)) {
			ipcRenderer.send(channel, data);
		}
	},
	on: (channel, callable) => {
		if (validChannels.handle.includes(channel)) {
			ipcRenderer.on(channel, (_, ...args) => callable(...args));
		}
	}
});