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
	lightModeSwitch.onchange = () => window.api.send('set-light-mode', lightModeSwitch.checked);

	/* Position Lock Switch */
	const positionLock = document.getElementById('position-lock');
	positionLock.checked = await window.api.invoke('get-stored-value', 'positionLock') ?? false;
	positionLock.onchange = () => window.api.send('toggle-position-lock', positionLock.checked);
})();