import '../global.scss';

/* Toolbar buttons (just close) */
document.getElementById('close-button').onclick = () => window.api.send('close-window');

(async () => {
	/* Apply scheme initially, and on update */
	const { setupScheme } = require('../scheme.js');
	await setupScheme();

	/* Setup any checkbox/toggle switches */
	const setupToggle = async (elementId, storeValue, storedDefault = false) => {
		const toggle = document.getElementById(elementId);
		toggle.checked = await window.api.invoke('get-stored-value', storeValue) ?? storedDefault;
		toggle.onchange = () => window.api.send('set-stored-bool', storeValue, toggle.checked);
	};

	// Associate toggle element with its store value
	const toggles = [
		['light-mode', 'lightMode'],
		['position-lock', 'positionLock'],
		['window-on-top', 'windowOnTop'],
		['notify-desktop-start', 'notification.desktop.start'],
		['notify-desktop-stop', 'notification.desktop.stop'],
		['notify-audible-start', 'notification.audible.start'],
		['notify-audible-stop', 'notification.audible.stop'],
	];

	// Loop and setup
	for (let i = 0; i <= toggles.length; i++) {
		await setupToggle(toggles[i][0], toggles[i][1]);
	}
})();