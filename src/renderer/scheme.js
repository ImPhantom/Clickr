const applyScheme = (state) => {
	(state) ? document.documentElement.classList.remove('dark') : document.documentElement.classList.add('dark');
};

const setupScheme = async () => {
	const scheme = await window.api.invoke('get-stored-value', 'lightMode') ?? false;
	applyScheme(scheme); // Apply initial scheme
	window.api.on('scheme-updated', state => applyScheme(state)); // Setup listener for changes
};

module.exports = { applyScheme, setupScheme };