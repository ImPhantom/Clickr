const robot = require("robotjs");

class Clicker {
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

        this.positionLockEnabled = dataStore.get("positionLock.enabled") || false;
        this.currentLockPosX = null;
        this.currentLockPosY = null;

        this.singleHotkeyToggle = dataStore.get("toggleTrigger.singleHotkeyToggle") || false;
        this.startShortcut = dataStore.get("toggleTrigger.startShortcut") || null;
        this.stopShortcut = dataStore.get("toggleTrigger.stopShortcut") || null;

        this.mouseEventDelay = dataStore.get("mouseEventDelay") || "5";
        this.clickerStartAlert = dataStore.get("clickerStartAlert") || false;

        this.store = dataStore;
    }

    startClicking(startCallback = null, onClickCallback = null, stopCallback = null) {
        if (!this.armed || this.clicking)
            return;

        this.clicks = 0;

        // If enabled, set cursor lock position.
        if (this.isPositionLockEnabled()) {
            const currentMousePos = robot.getMousePos();
            this.currentLockPosX = currentMousePos.x;
            this.currentLockPosY = currentMousePos.y;
            console.log(`Position Locked @ '${this.currentLockPosX}, ${this.currentLockPosY}'`);
        }

        if (startCallback)
            startCallback();

        robot.setMouseDelay(this.getMouseEventDelay());
        this.interval = setInterval(() => {

            // Move mouse if 'PositionLock' is enabled
            if (this.isPositionLockEnabled() && this.currentLockPosX != null && this.currentLockPosY != null) {
                robot.moveMouse(this.currentLockPosX, this.currentLockPosY);
            }

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

    // A function that doesn't need to exist :P
    updateHotkey(tag, shortcut) {
        if (tag === "start") {
            this.startShortcut = shortcut;
        } else if (tag === "stop" ) {
            this.stopShortcut = shortcut;
        }
    }

    // Get Functions for variables modified by a separate thread
    getMouseEventDelay() {
        this.mouseEventDelay = this.store.get("mouseEventDelay") || "5";
        return parseInt(this.mouseEventDelay);
    }

    isPositionLockEnabled() {
        this.positionLockEnabled = this.store.get("positionLock.enabled") || false;
        return this.positionLockEnabled;
    }

    getLockedPosition() {
        if (this.currentLockPosX !== null && this.currentLockPosY !== null) {
            return `${this.currentLockPosX}, ${this.currentLockPosY}`;
        } else {
            return null;
        }
    }

    isStartAlertEnabled() {
        this.clickerStartAlert = this.store.get("clickerStartAlert") || false;
        return this.clickerStartAlert;
    }
}

module.exports = { Clicker: Clicker };