import '../global.scss';

/* Toolbar buttons (just close) */
document.getElementById('close-button').onclick = () => window.api.send('close-window');

(async () => {
	/* Apply scheme initially, and on update */
	const { setupScheme } = require('../scheme.js');
	await setupScheme();

	/* Light Mode Toggle */
	const lightModeSwitch = document.getElementById('light-mode');
	lightModeSwitch.checked = await window.api.invoke('get-stored-value', 'lightMode') ?? false;
	lightModeSwitch.onchange = () => window.api.send('set-stored-bool', 'lightMode', lightModeSwitch.checked);

	/* Position Lock Switch */
	const positionLock = document.getElementById('position-lock');
	positionLock.checked = await window.api.invoke('get-stored-value', 'positionLock') ?? false;
	positionLock.onchange = () => window.api.send('set-stored-bool', 'positionLock', positionLock.checked);

	/* Notification Toggles */
	const desktopStart = document.getElementById('notify-desktop-start');
	desktopStart.checked = await window.api.invoke('get-stored-value', 'notification.desktop.start') ?? false;
	desktopStart.onchange = () => window.api.send('set-stored-bool', 'notification.desktop.start', desktopStart.checked);

	const desktopStop = document.getElementById('notify-desktop-stop');
	desktopStop.checked = await window.api.invoke('get-stored-value', 'notification.desktop.stop') ?? false;
	desktopStop.onchange = () => window.api.send('set-stored-bool', 'notification.desktop.stop', desktopStop.checked);

	const audibleStart = document.getElementById('notify-audible-start');
	audibleStart.checked = await window.api.invoke('get-stored-value', 'notification.audible.start') ?? false;
	audibleStart.onchange = () => window.api.send('set-stored-bool', 'notification.audible.start', audibleStart.checked);

	const audibleStop = document.getElementById('notify-audible-stop');
	audibleStop.checked = await window.api.invoke('get-stored-value', 'notification.audible.stop') ?? false;
	audibleStop.onchange = () => window.api.send('set-stored-bool', 'notification.audible.stop', audibleStop.checked);
})();