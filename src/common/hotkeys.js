import { remote } from 'electron';
import * as iohook from 'iohook';
import * as keycode from 'keycode';

class Hotkeys {
    constructor(dataStore) {
        this.store = dataStore;

        this.hotkeyCache = [];
        this.rawHotkeyCache = [];
    }

    keychar(keyEvent) {
        const _key = keycode(keyEvent.rawcode);
        if (!_key) {
            if (keyEvent.shiftKey) {
                return "shift";
            } else if (keyEvent.ctrlKey) {
                return "ctrl";
            } else if (keyEvent.altKey) {
                return "alt";
            } else if (keyEvent.metaKey) {
                return "meta";
            }
        } else {
            return _key;
        }
    }

    hotkeyToShortcut(hotkey) {
        return hotkey.map(_key => (_key == "ctrl") ? "CmdOrCtrl" : _key.charAt(0).toUpperCase() + _key.slice(1));
    }

    startListening(clicker, startCallback, stopCallback, clickCallback) {
        if (clicker.triggerType === "hold") {
            if (!clicker.holdShortcut) return;
        } else if (clicker.triggerType === "toggle") {
            if (!clicker.startShortcut || !clicker.stopShortcut) return;

            clicker.startShortcut = this.hotkeyToShortcut(this.store.get("toggleTrigger.startHotkey"));
            clicker.stopShortcut = this.hotkeyToShortcut(this.store.get("toggleTrigger.stopHotkey"));

            remote.globalShortcut.register(this.startShortcut, () => clicker.startClicking(startCallback, clickCallback));
            remote.globalShortcut.register(this.stopShortcut, () => clicker.stopClicking(stopCallback));
        }
    }

    stopListening() {
        remote.globalShortcut.unregisterAll();
    }

    registerReadHook(focusedInput) {
        iohook.on("keydown", _event => {
            if (focusedInput) {
                if (event.rawcode !== 8 && this.hotkeyCache.length < 3) {
                    const keychar = keychar(_event); 
                    this.hotkeyCache.push(keychar);
                    this.rawHotkeyCache.push(_event.rawcode);
                } else if (event.rawcode === 8) {
                    this.hotkeyCache.pop();
                    this.rawHotkeyCache.pop();
                }

                focusedInput.attr({ "value": this.hotkeyCache.join(" + "), "data-raw-hotkey": JSON.stringify(this.rawHotkeyCache) })
            }
        });
        iohook.start();
    }

    readInput(inputElement) {
        this.hotkeyCache = [], this.rawHotkeyCache = [];
        if (inputElement.var() !== "") {
            this.hotkeyCache = inputElement.var().split(" + ");
            this.rawHotkeyCache = JSON.parse(inputElement.attr("data-raw-hotkey"));
        }
    }

    updateInput(inputElement, hotkey, rawHotkey = null) {
        if (hotkey && rawHotkey) {
            inputElement.attr({ "value": hotkey.join(" + "), "data-raw-hotkey": JSON.stringify(rawHotkey) });
        } else if (typeof(hotkey) === "string") {
            const _hotkey = this.store.get(hotkey), _rawHotkey = this.store.get(`${hotkey}Raw`);
            if (_hotkey && _rawHotkey) {
                inputElement.attr({ "value": _hotkey.join(" + "), "data-raw-hotkey": JSON.stringify(_rawHotkey) });
            }
        }
    }

    saveHotkey(inputElement, dataPath) {
        this.store.set(dataPath, inputElement.val().split(" + "));
        this.store.set(`${dataPath}Raw`, JSON.parse(inputElement.attr("data-raw-hotkey")));
        console.log(`Saved '${dataPath}' & '${dataPath}Raw' hotkeys to cache!`);
    }
}

module.exports = { Hotkeys: Hotkeys };