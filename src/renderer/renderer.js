import './index.scss';

document.getElementById('close-button').onclick = () => window.api.send('close-window');
document.getElementById('minimize-button').onclick = () => window.api.send('minimize-window');

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

/* 
The following line is a strange fix to a bug thats caused when the application is packaged
For some reason the type attribute is stripped only from the shortcut input, If I took enough time I could probably hunt it down, but its not worth it at the moment.
*/
document.getElementById('start-shortcut').setAttribute('type', 'text');

// Theses are referenced throughout
const startAlertAudio = document.getElementById('start-alert-audio');

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

	/* Start Alert Switch */
	const startAlert = document.getElementById('start-alert');
	startAlert.checked = await window.api.invoke('get-stored-value', 'startAlert') ?? false;
	startAlert.onchange = () => window.api.send('toggle-start-alert', startAlert.checked);

	/* Append Alert Audio */
	const alertDataUri = await window.api.invoke('get-alert');
	if (alertDataUri) {
		const source = document.createElement('source');
		source.setAttribute('src', alertDataUri);
		startAlertAudio.appendChild(source);
		startAlertAudio.volume = 0.5;
	} else {
		console.error('Something went wrong while loading the alert audio!');
	}
})();

/* Arm button */
const armedCover = document.getElementById('cover');

// Info displayed on arm cover
const stateInfoElement = document.getElementById('clickr-current-state');
const stateText = document.getElementById('clickr-state');
const currentClicksText = document.getElementById('clickr-clicks');

const lastRunInfoElement = document.getElementById('clickr-last-run');
const lastRunAtText = document.getElementById('lr-time-ago');
const lastRunClicksText = document.getElementById('lr-clicks');

document.getElementById('arm-toggle').onclick = () => window.api.send('arm-toggle');
window.api.on('arm-result', result => {
	if (typeof result !== 'boolean') return;

	// Ensure last run stats aren't still displayed
	lastRunInfoElement.classList.replace('flex', 'hidden');

	if (result) {
		stateText.innerHTML = 'Idle';
		armedCover.classList.replace('hidden', 'flex'); // Armed
		stateInfoElement.classList.replace('hidden', 'flex');
	} else {
		armedCover.classList.replace('flex', 'hidden'); // Disarmed
		stateInfoElement.classList.replace('flex', 'hidden');
	}
});

// TODO: Find a better solution to this
let clickrStopped = false;

window.api.on('clickr-started', (speed, unit, alert) => {
	console.log(`[clickr] Started clicking: ${speed} clicks per ${{1000:'second',60000:'minute'}[unit]} (${Date.now()})`);
	clickrStopped = false;

	stateText.innerHTML = 'Clicking';
	currentClicksText.innerHTML = '0';

	lastRunInfoElement.classList.replace('flex', 'hidden');

	// Play start alert if enabled
	if (alert) {
		startAlertAudio.load();
		startAlertAudio.play();
	}
});

window.api.on('clickr-clicked', clicks => {
	if (clickrStopped) return;
	currentClicksText.innerHTML = `${clicks} clicks`;
});

window.api.on('clickr-stopped', clickTotal => {
	clickrStopped = true;
	stateText.innerHTML = 'Idle';
	currentClicksText.innerHTML = '';
	
	lastRunInfoElement.classList.replace('hidden', 'flex');
	lastRunAtText.innerHTML = `(${new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })})`;
	lastRunClicksText.innerHTML = `${clickTotal} clicks`;

	console.log(`[clickr] Stopped clicking. (${Date.now()})`);
});