import '../global.scss';

/* Toolbar buttons (just close) */
document.getElementById('close-button').onclick = () => window.api.send('close-window');

/* Color Scheme Toggle */
/*const schemeToggleButton = document.getElementById('scheme-toggle');
const updateScheme = (light) => {
	if (light) {
		document.documentElement.classList.remove('dark');
		schemeToggleButton.innerHTML = '&#xE708';
	} else {
		document.documentElement.classList.add('dark');
		schemeToggleButton.innerHTML = '&#xE706;';
	}
};

// I know the following is quite redundant, but theoretically its the best way to handle it
window.api.invoke('get-stored-value', 'lightMode').then(lightMode => updateScheme(lightMode ?? false));
schemeToggleButton.onclick = () => {
	window.api.invoke('get-stored-value', 'lightMode').then(lightMode => {
		lightMode = lightMode ?? false;
		window.api.send('set-light-mode', !lightMode);
		updateScheme(!lightMode);
	});
};*/