'use strict'

import * as robot from 'robotjs';

export class Clicker {
    constructor(dataStore) {
        this.armed = false;
        this.clicks = 0;
        this.clicking = false;
        this.interval = null;

        this.clickingButton = dataStore.get("clickingMouseButton") || "left";
        this.clicksPerUnit = dataStore.get("clickSpeed.times") || 8;
        this.clickingUnit = dataStore.get("clickSpeed.unit") || 1000;

        this.stopAfterToggle = dataStore.get("stopAfter.enabled") || false;
        this.stopAfterClicks = dataStore.get("stopAfter.afterClicks") || 0;

        this.holdShortcut = dataStore.get("holdTrigger.triggerShortcut") || null;
        this.holdHotkey = dataStore.get("holdTrigger.triggerHotkey") || null;

        this.singleHotkeyToggle = dataStore.get("toggleTrigger.singleHotkeyToggle") || false;
        this.startShortcut = dataStore.get("toggleTrigger.startShortcut") || null;
        this.startHotkey = dataStore.get("toggleTrigger.startHotkey") || null;
        this.stopShortcut = dataStore.get("toggleTrigger.stopShortcut") || null;
        this.stopHotkey = dataStore.get("toggleTrigger.stopHotkey") || null;
    }

    startClicking(startCallback = null, onClickCallback = null, stopCallback = null) {
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

            if (this.stopAfterToggle && this.stopAfterClicks > 0 && this.clicks >= this.stopAfterClicks) {
                this.stopClicking(stopCallback);
            }
        }, Math.floor(this.clickingUnit / this.clicksPerUnit));

        this.clicking = true;
        console.log(`Started clicking at ${this.clicksPerUnit} clicks/${{1000:"sec",60000:"min",3600000:"hour"}[this.clickingUnit]}...`);
    }

    stopClicking(stoppedCallback = null) {
        const wasClicking = this.clicking;
        clearInterval(this.interval);
        this.clicking = false;

        if (wasClicking) {
            if (stoppedCallback)
                stoppedCallback(this.clicks);

            console.log(`Stopped clicker after ${this.clicks} clicks!`);
        }
    }

    updateHotkey(tag, hotkey, shortcut) {
        switch(tag) {
            case "hold":
                this.holdHotkey = hotkey;
                this.holdShortcut = shortcut;
                break;
            case "start":
                this.startHotkey = hotkey;
                this.startShortcut = shortcut;
            case "stop": {
                this.stopHotkey = hotkey;
                this.stopShortcut = shortcut;
            }
        }
    }
}