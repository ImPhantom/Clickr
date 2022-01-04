const { mouse, straightTo } = require('@nut-tree/nut-js');
const { globalShortcut } = require('electron');

class Clicker {
	constructor(store) {
		this.store = store;
		this.armed = false;
		this.clicking = false;

		this.clicks = 0;
		this.interval = null;

		mouse.config.autoDelayMs = 10;
	}

	async arm(startCallback = null, clickCallback = null, endCallback = null) {
		if (this.armed || this.clicking) return;
		this.armed = true;

		const shortcut = this.store.get('shortcut');
		if (!shortcut) return;

		globalShortcut.register(shortcut, async () => {
			if (this.clicking) {
				await this.stop(endCallback);
			} else {
				await this.start(startCallback, clickCallback);
			}
		});

		console.log(`[clicker] Successfully armed: ${shortcut}`);
	}

	async disarm() {
		if (!this.armed && !this.clicking) return;
		this.armed = false;

		if (this.clicking) {
			await this.stop();
		}

		// Unregister shortcuts
		globalShortcut.unregisterAll();
		console.log('[clicker] Disarmed, unregistering shortcuts...');
	}

	async start(startCallback = null, clickCallback = null) {
		if (!this.armed || this.clicking) return;

		this.clicks = 0; // reset click count

		const positionLock = this.store.get('positionLock') ?? false;
		let lockedPosition = null;
		if (positionLock) {
			lockedPosition = await mouse.getPosition();
			console.log(`Locked position @ '${lockedPosition.x}, ${lockedPosition.y}'`);
		}

		const clickSpeed = this.store.get('click.speed') ?? 10;
		const clickUnit = this.store.get('click.unit') ?? 1000;

		if (startCallback) startCallback(clickSpeed, clickUnit);

		this.interval = setInterval(async () => {
			if (positionLock && lockedPosition != null) {
				await mouse.move(straightTo(lockedPosition));
			}

			switch (this.store.get('click.button')) {
				default:
				case 'left':
					await mouse.leftClick();
					break;
				case 'middle':
					await mouse.pressButton(1);
					await mouse.releaseButton(2);
					break;
				case 'right':
					await mouse.rightClick();
					break;
			}

			this.clicks++;

			if (clickCallback) clickCallback(this.clicks);

		}, Math.floor(clickUnit / clickSpeed));

		this.clicking = true;
		console.log(`Started clicker (${clickSpeed} clicks per ${{1000:'second',60000:'minute'}[clickUnit]})`);
	}

	stop(callback = null) {
		const wasClicking = this.clicking;
		clearInterval(this.interval);
		this.clicking = false;

		if (wasClicking) {
			if (callback) callback(this.clicks);
		}
	}
}

module.exports = Clicker;