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

const ShortcutInput = require('./shortcut_input.js');

new ShortcutInput('start-shortcut', saveValue => {
	window.api.send('update-shortcut', { shortcut: 'start', value: saveValue });
});