import { remote } from 'electron';
import * as robot from 'robotjs';
import * as iohook from 'iohook';

class Clicker {
    constructor(dataStore) {
        this.armed = false;
        this.clicks = 0;
        this.clicking = false;
        this.interval = null;

        this.triggerType = dataStore.get("triggerType") || "hold";
        this.clickingButton = dataStore.get("clickingButton") || "left";
        this.clicksPerUnit = dataStore.get("clickSpeed.times") || 8;
        this.clickingUnit = dataStore.get("clickSpeed.unit") || 1000;

        this.holdShortcut = null;
        this.startShortcut = null;
        this.stopShortcut = null;
    }

    startClicking(startCallback = null, onClickCallback = null) {
        if (!this.armed || this.clicking)
            return;

        this.clicks = 0; // reset clicks every time a loop is started.
        if (startCallback)
            startCallback();

        this.interval = setInterval(() => {
            robot.mouseClick(this.clickingButton);
            this.clicks++;
            if (onClickCallback)
                onClickCallback(this.clicks);
        }, Math.floor(this.clickingUnit / this.clicksPerUnit));

        this.clicking = true;
        console.log(`Started clicking at ${this.clicksPerUnit} clicks/${{1000:"sec",60000:"min",3600000:"hour"}[this.clickingUnit]}...`);
    }

    stopClicking(stoppedCallback = null) {
        clearInterval(this.interval);
        this.clicking = false;

        if (stoppedCallback)
            stoppedCallback(this.clicks);

        console.log(`Stopped clicker after ${this.clicks} clicks!`);
    }

    hotkeyToShortcut(hotkey) {
        return hotkey.map(_key => (_key == "ctrl") ? "CmdOrCtrl" : _key.charAt(0).toUpperCase() + _key.slice(1));
    }
}

module.exports = { Clicker: Clicker };