const { mouse, straightTo } = require('@nut-tree/nut-js');
const { globalShortcut, Notification } = require('electron');

class Clicker {
	constructor(store) {
		this.store = store;
		this.armed = false;
		this.clicking = false;

		this.clicks = 0;
		this.interval = null;

		mouse.config.autoDelayMs = 100;
	}

	async arm(startCallback = null, clickCallback = null, endCallback = null) {
		if (this.armed || this.clicking) return;

		const shortcut = this.store.get('shortcut');
		if (!shortcut) return;

		globalShortcut.register(shortcut, async () => {
			if (this.clicking) {
				this.stop(endCallback);
			} else {
				await this.start(startCallback, clickCallback);
			}
		});

		this.armed = true;
		console.log(`[clicker] Successfully armed: ${shortcut}`);
	}

	disarm() {
		if (!this.armed && !this.clicking) return;
		this.armed = false;

		if (this.clicking) {
			this.stop();
		}

		// Unregister shortcuts
		globalShortcut.unregisterAll();
		console.log('[clicker] Disarmed, unregistered shortcuts...');
	}

	async start(startCallback = null, clickCallback = null) {
		if (!this.armed || this.clicking) return;

		this.clicks = 0; // reset click count

		// FIXME: when position lock is enabled, the start is delayed slightly

		const positionLock = this.store.get('positionLock') ?? false;
		let lockedPosition = null;
		if (positionLock) {
			lockedPosition = await mouse.getPosition();
			console.log(`[clicker] Locked position @ '${lockedPosition.x}, ${lockedPosition.y}'`);
		}

		const clickSpeed = this.store.get('click.speed') ?? 10;
		const clickUnit = this.store.get('click.unit') ?? 1000;
		const clickButton = this.store.get('click.button') ?? 'left';

		if (this.store.get('notification.desktop.start', false)) {
			new Notification({ title: 'Clickr', body: `Started ${clickButton} clicking at a rate of ${clickSpeed} clicks per ${{1000:'second',60000:'minute'}[clickUnit]}` }).show();
		}

		if (startCallback) startCallback(clickSpeed, clickUnit, this.store.get('notification.audible.start', false));

		this.interval = setInterval(async () => {
			if (positionLock && lockedPosition != null) {
				await mouse.move(straightTo(lockedPosition));
			}

			switch (clickButton) {
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
		console.log(`[clicker] Started clicking! (${clickSpeed} clicks per ${{1000:'second',60000:'minute'}[clickUnit]})`);
	}

	stop(callback = null) {
		const wasClicking = this.clicking;
		clearInterval(this.interval);
		this.clicking = false;

		if (this.store.get('notification.desktop.stop', false)) {
			new Notification({ title: 'Clickr', body: `Stopped clicking after ${this.clicks} clicks!` }).show();
		}

		if (wasClicking) {
			if (callback) callback(this.clicks, this.store.get('notification.audible.stop', false));
		}

		console.log(`[clicker] Stopped clicking! (${this.clicks} clicks)`);
	}
}

module.exports = Clicker;