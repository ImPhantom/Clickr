import './index.scss';

document.getElementById('close-button').onclick = () => window.api.send('close-window');
document.getElementById('minimize-button').onclick = () => window.api.send('minimize-window');

const ShortcutInput = require('./shortcut_input.js');

new ShortcutInput('start-shortcut', saveValue => {
	window.api.send('update-shortcut', { shortcut: 'start', value: saveValue });
});