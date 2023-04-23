/**
 * 	Turned this into a class to clean up the main renderer script
 */
class ShortcutInput {
	constructor(inputElementId, initialValue, saveCallback) {
		this.input = document.getElementById(inputElementId);

		// Set initial value if any
		if (initialValue != null && initialValue != '') {
			this.input.value = initialValue;
		}

		this.keys = [];

		// Register focus event
		this.input.onfocus = () => {
			this.keys = [];
			if (this.input.value != '') {
				this.keys = this.input.value.split('+');
			}
		};

		// Register keydown event
		this.input.onkeydown = keyboardEvent => {
			if (keyboardEvent.keyCode !== 8 && this.keys.length < 3) {
				const key = this.convertKeycode(keyboardEvent);
				if (!this.keys.includes(key)) {
					this.keys.push(key);
				}
			} else if (keyboardEvent.keyCode === 8) {
				this.keys.pop();
			}

			this.input.value = this.keys.join('+');
		};

		this.input.onblur = () => {
			saveCallback(this.input.value);
		};
	}

	convertKeycode(keyboardEvent) {
		// modifier keys
		const modifierReplacements = { 'Command': 'CmdOrCtrl', 'Control': 'CmdOrCtrl' };
		if (modifierReplacements[keyboardEvent.key]) {
			return modifierReplacements[keyboardEvent.key];
		}

		// numpad keys
		const numpadReplacements = { 'NumpadDivide': 'numdiv', 'NumpadMultiply': 'nummult', 'NumpadAdd': 'numadd', 'NumpadSub': 'numsub' };
		if (numpadReplacements[keyboardEvent.code]) {
			return numpadReplacements[keyboardEvent.code];
		} else if (/^Numpad\d$/.test(keyboardEvent.code)) {
			return keyboardEvent.code.replace('Numpad', 'num');
		}

		// miscellaneous replacements
		const miscReplacements = { 'CapsLock': 'Capslock', 'NumLock': 'Numlock', 'ScrollLock': 'Scrolllock', 'AltLeft': 'Alt', 'AltRight': 'Alt', 'ShiftLeft': 'Shift', 'ShiftRight': 'Shift' };
		if (miscReplacements[keyboardEvent.code]) {
			return miscReplacements[keyboardEvent.code];
		}

		if (/^Key\w$/.test(keyboardEvent.code)) {
			return keyboardEvent.code.replace('Key', '');
		}

		return keyboardEvent.code;
	}
}

module.exports = ShortcutInput;