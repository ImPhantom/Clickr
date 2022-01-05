import './index.scss';

document.getElementById('close-button').onclick = () => window.api.send('close-window');
document.getElementById('minimize-button').onclick = () => window.api.send('minimize-window');

/* 
The following line is a strange fix to a bug thats caused when the application is packaged
For some reason the type attribute is stripped only from the shortcut input, If I took enough time I could probably hunt it down, but its not worth it at the moment.
*/
document.getElementById('start-shortcut').setAttribute('type', 'text');

const schemeToggle = document.getElementById('scheme-toggle');
schemeToggle.onclick = () => {
	const _element = document.documentElement;
	if (_element.classList.contains('dark')) {
		_element.classList.remove('dark');
		schemeToggle.innerHTML = '&#xE708;';
	} else {
		_element.classList.add('dark');
		schemeToggle.innerHTML = '&#xE706;';
	}
};

(async () => {
	/* Click Speed Input (1-infinity) */
	const clickSpeed = document.getElementById('click-speed');
	clickSpeed.value = await window.api.invoke('get-stored-value', 'click.speed') ?? 10;
	clickSpeed.onblur = () => window.api.send('update-click-speed', clickSpeed.value);

	/* Click Speed Input (second/minute) */
	const clickUnit = document.getElementById('click-unit');
	clickUnit.value = await window.api.invoke('get-stored-value', 'click.unit') ?? 1000;
	clickUnit.onchange = () => window.api.send('update-click-unit', clickUnit.value);

	/* Click Speed Input (left/middle/right) */
	const clickButton = document.getElementById('click-button');
	clickButton.value = await window.api.invoke('get-stored-value', 'click.button') ?? 'left';
	clickButton.onchange = () => window.api.send('update-click-button', clickButton.value);

	/* Shortcut Input */
	const ShortcutInput = require('./shortcut_input.js');
	const savedShortcut = await window.api.invoke('get-stored-value', 'shortcut');
	new ShortcutInput('start-shortcut', savedShortcut, newShortcut => {
		window.api.send('update-shortcut', newShortcut);
	});

	/* Position Lock Switch */
	const positionLock = document.getElementById('position-lock');
	positionLock.checked = await window.api.invoke('get-stored-value', 'positionLock') ?? false;
	positionLock.onchange = () => window.api.send('toggle-position-lock', positionLock.checked);
})();

/* Arm button */
const armedCover = document.getElementById('cover');

document.getElementById('arm-toggle').onclick = () => window.api.send('arm-toggle');
window.api.on('arm-result', result => {
	if (typeof result !== 'boolean') return;

	if (result) {
		// Armed 
		armedCover.classList.remove('hidden');
	} else {
		// Disarmed
		armedCover.classList.add('hidden');
	}
});

window.api.on('clickr-started', () => {
	console.log('Clickr started clicking!');
});

window.api.on('clickr-clicked', () => {
	console.log('Clickr clicked!');
});

window.api.on('clickr-stopped', () => {
	console.log('Clickr stopped clicking!');
});
