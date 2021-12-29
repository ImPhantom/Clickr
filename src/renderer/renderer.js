import './index.scss';

document.getElementById('close-button').onclick = () => window.api.send('close-window');
document.getElementById('minimize-button').onclick = () => window.api.send('minimize-window');
