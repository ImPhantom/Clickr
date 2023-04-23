import '../global.scss';

/* Add respective functionality to the toolbar buttons */
document.getElementById('close-button').onclick = () => window.api.send('close-window');
document.getElementById('minimize-button').onclick = () => window.api.send('minimize-window');
document.getElementById('open-settings').onclick = () => window.api.send('open-settings-window');

/* 
The following line is a strange fix to a bug thats caused when the application is packaged
For some reason the type attribute is stripped only from the shortcut input, If I took enough time I could probably hunt it down, but its not worth it at the moment.
*/
document.getElementById('start-shortcut').setAttribute('type', 'text');

// Theses are referenced throughout
const startAlertAudio = document.getElementById('start-alert-audio');

/* Inputs */
const shortcutInput = document.getElementById('start-shortcut');
const cpsInput = document.getElementById('click-speed');

const hasErrorBorder = (input) => input.classList.contains('border-red-400');
const setErrorBorder = (input, state) => {
	const s = ['border-gray-300', 'dark:border-gray-500'];
	const e = ['border-red-400', 'dark:border-red-500'];

	input.classList.add(...(state ? e : s));
	input.classList.remove(...(state ? s : e));
};

(async () => {
	/* Apply scheme initially, and on update */
	const { setupScheme } = require('../scheme.js');
	await setupScheme();

	/* Set version in toolbar */
	const version = await window.api.invoke('get-clickr-version');
	document.getElementById('clickr-version').textContent = `${version[0]}.${version[1]}`;

	/* Click Speed Input (1-infinity) */
	const clickSpeed = document.getElementById('click-speed');
	clickSpeed.value = await window.api.invoke('get-stored-value', 'click.speed') ?? 10;
	clickSpeed.onblur = () => {
		window.api.send('update-click-speed', clickSpeed.value);

		// validation
		if (clickSpeed.value > 0) {
			if (!hasErrorBorder(cpsInput)) return;
			setErrorBorder(cpsInput, false);
		} else {
			setErrorBorder(cpsInput, true);
		}
	};

	/* Click Speed Input (second/minute) */
	const clickUnit = document.getElementById('click-unit');
	clickUnit.value = await window.api.invoke('get-stored-value', 'click.unit') ?? 1000;
	clickUnit.onchange = () => window.api.send('update-click-unit', clickUnit.value);

	/* Click Speed Input (left/middle/right) */
	const clickButton = document.getElementById('click-button');
	clickButton.value = await window.api.invoke('get-stored-value', 'click.button') ?? 'left';
	clickButton.onchange = () => window.api.send('update-click-button', clickButton.value);

	/* Shortcut Input */
	const ShortcutInput = require('../shortcut_input.js');
	const savedShortcut = await window.api.invoke('get-stored-value', 'shortcut');
	new ShortcutInput('start-shortcut', savedShortcut, newShortcut => {
		window.api.send('update-shortcut', newShortcut);

		if (newShortcut != '') {
			if (!hasErrorBorder(shortcutInput)) return;
			setErrorBorder(shortcutInput, false);
		} else {
			setErrorBorder(shortcutInput, true);
		}
	});

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

/* Arm button/cover */
const armButton = document.getElementById('arm-toggle');
const armedCover = document.getElementById('cover');

/* Elements displayed on arm cover */
const stateInfoElement = document.getElementById('clickr-current-state');
const stateText = document.getElementById('clickr-state');
const currentClicksText = document.getElementById('clickr-clicks');

const lastRunInfoElement = document.getElementById('clickr-last-run');
const lastRunAtText = document.getElementById('lr-time-ago');
const lastRunClicksText = document.getElementById('lr-clicks');

document.getElementById('arm-toggle').onclick = () => window.api.send('arm-toggle');
window.api.on('arm-result', result => {
	// The 'error borders' (input validation) are mostly handled in the inputs 'onblur' event, but I have
	// this additional handling incase those events don't fire before the user is able to arm
	if (typeof result == 'string') {
		// 'arm-result' returned an error.
		if (result == 'no-shortcut') {
			setErrorBorder(shortcutInput, true);
		} else if (result == 'invalid-cps') {
			setErrorBorder(cpsInput, true);
		}

		return;
	}

	if (typeof result !== 'boolean') return;

	// Error borders should be cleared by the input's onblur, but this is here just incase it doesn't...
	if (hasErrorBorder(shortcutInput)) setErrorBorder(shortcutInput, false);
	if (hasErrorBorder(cpsInput)) setErrorBorder(cpsInput, false);

	// Ensure last run stats aren't still displayed
	lastRunInfoElement.classList.replace('flex', 'hidden');

	if (result) {
		stateText.textContent = 'Idle';
		armedCover.classList.replace('hidden', 'flex'); // Armed
		stateInfoElement.classList.replace('hidden', 'flex');

		armButton.textContent = 'Disarm';
	} else {
		armedCover.classList.replace('flex', 'hidden'); // Disarmed
		stateInfoElement.classList.replace('flex', 'hidden');

		armButton.textContent = 'Arm';
	}
});

// TODO: Find a better solution to this
let clickrStopped = false;

window.api.on('clickr-started', (speed, unit, shouldAlert) => {
	console.log(`[clickr] Started clicking: ${speed} clicks per ${{1000:'second',60000:'minute'}[unit]} (${Date.now()})`);
	clickrStopped = false;

	stateText.textContent = 'Clicking';
	currentClicksText.textContent = '0';

	lastRunInfoElement.classList.replace('flex', 'hidden');

	// Play start alert if enabled
	if (shouldAlert) {
		startAlertAudio.load();
		startAlertAudio.play();
	}
});

window.api.on('clickr-clicked', clicks => {
	if (clickrStopped) return;
	currentClicksText.textContent = `${clicks} clicks`;
});

window.api.on('clickr-stopped', (clickTotal, shouldAlert) => {
	clickrStopped = true;
	stateText.textContent = 'Idle';
	currentClicksText.textContent = '';
	
	// Play start alert if enabled
	if (shouldAlert) {
		startAlertAudio.load();
		startAlertAudio.play();
	}

	lastRunInfoElement.classList.replace('hidden', 'flex');
	lastRunAtText.textContent = `(${new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })})`;
	lastRunClicksText.textContent = `${clickTotal} clicks`;

	console.log(`[clickr] Stopped clicking. (${Date.now()})`);
});