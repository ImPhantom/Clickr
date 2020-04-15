'use strict'
import "../static/stylesheet.css";
import 'weatherstar-switch/dist/switch.css';
import 'selectize/dist/css/selectize.css';
import 'selectize/dist/js/selectize.min.js';

const _PackageJson = require("../../package.json");
const _StoreSchema = require("../static/store_schema.json");

const path = require("path");
const url = require("url");
const { remote, ipcRenderer } = require("electron");

const $ = require("jquery");
const Switch = require("weatherstar-switch");
const semverGreaterThen = require("semver/functions/gt");
const ElectronStore = require("electron-store");
const DataURI = require("datauri");

const { Clicker } = require("../common/clicker");

window.clickr = {};
window.clickr.store = new ElectronStore({
    schema: _StoreSchema
});

console.log(`Configuration Path: '${window.clickr.store.path}'`);
window.clickr.core = new Clicker(window.clickr.store);

/*
    Migrations
*/

// 0.1.2 -> 0.1.3
if (semverGreaterThen(_PackageJson.version, "0.1.2")) {
    // Force triggerType to toggle if its set to hold (pre 0.1.2)
    console.log("Running '0.1.2 -> 0.1.3' migrations...");
    if (window.clickr.store.get("holdTrigger")) { window.clickr.store.delete("holdTrigger"); }
    if (window.clickr.store.get("triggerType") == "hold") { window.clickr.store.set("triggerType", "toggle"); }
}

// 0.1.3 -> 0.1.4
if (semverGreaterThen(_PackageJson.version, "0.1.3")) {
    // Ensure the click speed isnt 0 or a negative value.
    console.log("Running '0.1.3 -> 0.1.4' migrations...");
    const clickSpeed = window.clickr.store.get("clickSpeed.times");
    if (clickSpeed) {
        console.log("Migrating negative click speed...");
        const _cpu = parseInt(clickSpeed);
        if (_cpu && _cpu <= 0) {
            window.clickr.core.clicksPerUnit = 1;
            window.clickr.store.set("clickSpeed.times", 1);
        }
    }
}

// 0.1.4 -> 0.1.5
if (semverGreaterThen(_PackageJson.version, "0.1.4")) {
    console.log(`Running '0.1.4 -> ${_PackageJson.version}' migrations...`);
    if (window.clickr.store.get("triggerType")) {
        window.clickr.store.delete("triggerType");
    }
}

/* A really sloppy way to control which section of DOM is rendered... */
const _query = url.parse(window.location.href, true).query;
function _render(pref = false) {
    if (pref || (_query.route && _query.route == "preferences")) {
        $("#main-app").addClass("hidden");
        $("#preferences").removeClass("hidden");
    } else {
        $("#preferences").addClass("hidden");
        $("#main-app").removeClass("hidden");
    }
}

// Start listening for IPC calls
ipcRenderer.on("async-renderer-channel", (event, arg) => {
    console.log(`[Renderer] (async-channel) ${arg}`);
    if (arg == "render_preferences") { _render(true); }
});

_render();

$(document).ready(function () {
    const _window = remote.getCurrentWindow();
    $("#minimize-button").click(() => _window.minimize());
    $("#close-button").click(() => _window.close());
    $("#title-bar #version").html(`v${_PackageJson.version}`);

    /* Load the notification sound datauri */
    const clickerStartAudio = $("#clicker-start-sound");
    const dataUri = new DataURI();
    dataUri.encode(path.join(__static, "bongo.mp3"), (err, content) => {
        clickerStartAudio.append(`<source src="${content}">`);
    });

    /*
        Click Speed
    */
    const clickTimesInput = $("#click-speed > #click-times");
    clickTimesInput.val(window.clickr.core.clicksPerUnit);
    clickTimesInput.focusout(() => {
        const _saveVal = clickTimesInput.val();
        if (_saveVal && _saveVal != "" && _saveVal > 0) {
            window.clickr.core.clicksPerUnit = _saveVal;
            window.clickr.store.set("clickSpeed.times", window.clickr.core.clicksPerUnit);
            console.log(`Updated click speed => '${window.clickr.core.clicksPerUnit}cpu'`);
        }
    });

    const clickingUnitSelect = $("#click-speed > #unit-select");
    clickingUnitSelect.selectize();

    clickingUnitSelect.val(window.clickr.core.clickingUnit);
    clickingUnitSelect.change(() => {
        window.clickr.core.clickingUnit = clickingUnitSelect.val();
        window.clickr.store.set("clickSpeed.unit", window.clickr.core.clickingUnit);
        console.log(`Updated click speed unit => 'clicks/${{1000:"sec",60000:"min",3600000:"hour"}[window.clickr.core.clickingUnit]}'`);
    });

    /*
        Hotkey Input Handling
    */
    let currentlyFocusedShortcut = []; // The local shortcut array

    // This function converts KeyboardEvent keycodes to Electron 'Accelerator' keycodes.
    function convertKey(keyboardEvent) {
        // modifier keys
        const modifierReplacements = { "Command": "CmdOrCtrl", "Control": "CmdOrCtrl" };
        if (modifierReplacements[keyboardEvent.key]) {
            return modifierReplacements[keyboardEvent.key];
        }

        // numpad keys
        const numpadReplacements = { "NumpadDivide": "numdiv", "NumpadMultiply": "nummult", "NumpadAdd": "numadd", "NumpadSub": "numsub" };
        if (numpadReplacements[keyboardEvent.code]) {
            return numpadReplacements[keyboardEvent.code];
        } else if (/^Numpad\d$/.test(keyboardEvent.code)) {
            return keyboardEvent.code.replace("Numpad", "num");
        }

        // miscellaneous replacements
        const miscReplacements = { "CapsLock": "Capslock", "NumLock": "Numlock", "ScrollLock": "Scrolllock", "AltLeft": "Alt", "AltRight": "Alt", "ShiftLeft": "Shift", "ShiftRight": "Shift" }
        if (miscReplacements[keyboardEvent.code]) {
            return miscReplacements[keyboardEvent.code];
        }

        if (/^Key\w$/.test(keyboardEvent.code)) {
            return keyboardEvent.code.replace("Key", "");
        }

        return keyboardEvent.code;
    }

    // This function is called on every KeyDown event from the shortcut inputs.
    function listenToInputKeydown(keyboardEvent, inputElement) {
        console.log(keyboardEvent);
        if (keyboardEvent.keyCode !== 8 && currentlyFocusedShortcut.length < 3) { // If key pressed wasn't 'Backspace' and there arent more than 3 keys in the shortcut
            const _key = convertKey(keyboardEvent);
            if (!currentlyFocusedShortcut.includes(_key)) { // Only add key if it isn't in the shortcut already.
                currentlyFocusedShortcut.push(convertKey(keyboardEvent));
            }
        } else if (keyboardEvent.keyCode === 8) { // If key pressed was 'Backspace' (keyCode: 8)
            currentlyFocusedShortcut.pop();
        }

        inputElement.val(currentlyFocusedShortcut.join("+"));
    }

    // This function is called whenever a new input is focused, resetting/updating the local shortcut array.
    function updateFocusedShortcut(inputValue) {
        currentlyFocusedShortcut = [];
        if (inputValue != "") {
            currentlyFocusedShortcut = inputValue.split("+");
        }
    }

    // This function is called when the application loads to populate the shortcut inputs.
    function updateShortcutInput(inputElement, shortcut) {
        if (shortcut) {
            inputElement.val(shortcut);
            console.log(`Loaded saved shortcut: ${shortcut}`);
        }
    }

    // This function is called when the shortcut input is unfocused, saving the current value to application storage.
    function saveShortcut(inputElement, saveTag) {
        const shortcut = inputElement.val();
        window.clickr.store.set(`${saveTag}Shortcut`, shortcut);
        window.clickr.core.updateHotkey(saveTag.split(".")[1], shortcut);
        console.log(`Saved '${saveTag}Shortcut' (${shortcut}) to storage!`);
    }

    const toggleStartInput = $("#start-key"), toggleEndInput = $("#stop-key");
    updateShortcutInput(toggleStartInput, window.clickr.core.startShortcut);
    toggleStartInput.focus(() => updateFocusedShortcut(toggleStartInput.val()));
    toggleStartInput.keydown(_keyboardEvent => listenToInputKeydown(_keyboardEvent, toggleStartInput));
    toggleStartInput.focusout(() => saveShortcut(toggleStartInput, "toggleTrigger.start"));

    updateShortcutInput(toggleEndInput, window.clickr.core.stopShortcut);
    toggleEndInput.focus(() => updateFocusedShortcut(toggleEndInput.val()));
    toggleEndInput.keydown(_keyboardEvent => listenToInputKeydown(_keyboardEvent, toggleEndInput));
    toggleEndInput.focusout(() => saveShortcut(toggleEndInput, "toggleTrigger.stop"));

    /*
        Single hotkey toggle
    */
    const singleHotkeySwitch = new Switch($("#single-hotkey-toggle")[0], { size: "small", onChange: () => {
        const checked = singleHotkeySwitch.getChecked();
        const stopInputLabel = $("label[for='stop-key']");
        
        toggleEndInput.prop("disabled", checked);
        window.clickr.store.set("toggleTrigger.singleHotkeyToggle", checked);
        window.clickr.store.singleHotkeyToggle = checked;
        stopInputLabel.css("color", (checked) ? "var(--dark-text)" : "var(--text)");
        console.log(`Updated single hotkey toggle: ${checked}`);
    }});

    // Update value on load
    if (window.clickr.core.singleHotkeyToggle)
        (window.clickr.core.singleHotkeyToggle) ? singleHotkeySwitch.on() : singleHotkeySwitch.off();

    /*
        Stop After
    */
    const stopAfterInput = $("#stop-after-clicks");
    const stopAfterClicksSuffix = $("#stop-after > #clicks");
    const stopAfterSwitch = new Switch($("#stop-after-toggle")[0], { size: "small", onChange: () => {
        const checked = stopAfterSwitch.getChecked();
        stopAfterInput.prop("disabled", !checked);
        window.clickr.store.set("stopAfter.enabled", checked);
        window.clickr.core.stopAfterToggle = checked;

        (checked) ? stopAfterClicksSuffix.removeClass("active") : stopAfterClicksSuffix.addClass("active");

        console.log(`Updated stop after toggle: ${checked}`);
    }});

    if (window.clickr.core.stopAfterToggle) {
        (window.clickr.core.stopAfterToggle) ? stopAfterSwitch.on() : stopAfterSwitch.off();
        (window.clickr.core.stopAfterToggle) ? stopAfterClicksSuffix.removeClass("active") : stopAfterClicksSuffix.addClass("active");
    }

    stopAfterInput.val(parseInt(window.clickr.core.stopAfterClicks));
    stopAfterInput.focusout(() => {
        const _saveVal = stopAfterInput.val();
        if (_saveVal && _saveVal != "" && _saveVal > 0) {
            window.clickr.core.stopAfterClicks = _saveVal;
            window.clickr.store.set("stopAfter.afterClicks", window.clickr.core.stopAfterClicks);
            console.log(`Updated stop after clicks amount => '${window.clickr.core.stopAfterClicks} clicks'`);
        }
    });

    /*
        Mouse Button Select Handling
    */
    $(`#mouse-button #${window.clickr.core.clickingButton}`).addClass("active");
    console.log(`Loaded saved clicking button: '${window.clickr.core.clickingButton}'`);

    function handleMouseButtonChange(_clicked) {
        const typeClicked = _clicked.attr("id");
        const others = ["left", "middle", "right"].filter(_ => _ !== typeClicked);
        if (window.clickr.core.clickingButton !== typeClicked) {
            others.forEach(_elementId => {
                $(`#mouse-button > #${_elementId}`).removeClass("active");
            });
            $(`#mouse-button #${typeClicked}`).addClass("active");

            window.clickr.store.set("clickingMouseButton", typeClicked);
            window.clickr.core.clickingButton = typeClicked;
            console.log(`Updated clicking mouse button: '${window.clickr.core.clickingButton}'`);
        }
    }

    const mbLeft = $("#mouse-button > #left"), mbMiddle = $("#mouse-button > #middle"), mbRight = $("#mouse-button > #right");
    mbLeft.click(() => handleMouseButtonChange(mbLeft));
    mbMiddle.click(() => handleMouseButtonChange(mbMiddle));
    mbRight.click(() => handleMouseButtonChange(mbRight));

    /*
        Arm Button/Functionality
    */
    const armButton = $("#arm-button a"), armedCover = $("#armed-cover");
    const statusText = $("#info > #status"), clicksText = $("#info > #clicks"), bothTexts = $("#info > #status, #info > #clicks");
    
    function arm(startCallback, clickCallback, stopCallback) {
        armedCover.removeClass("hidden");
        armButton.html("Awaiting hotkey...");

        window.clickr.core.armed = true;
        if (!window.clickr.core.startShortcut || !window.clickr.core.stopShortcut) return;

        if (singleHotkeySwitch.getChecked() && window.clickr.core.startShortcut) {
            // Register single toggle hotkey
            remote.globalShortcut.register(window.clickr.core.startShortcut, () => {
                if (!window.clickr.core.clicking) {
                    window.clickr.core.startClicking(startCallback, clickCallback, stopCallback);
                } else {
                    window.clickr.core.stopClicking(stopCallback);
                }   
            });
            console.log(`Registered single hotkey toggle: '${window.clickr.core.startShortcut}'`);
        } else if (window.clickr.core.startShortcut && window.clickr.core.stopShortcut) {
            // Register start hotkey
            remote.globalShortcut.register(window.clickr.core.startShortcut, () => {
                window.clickr.core.startClicking(startCallback, clickCallback, stopCallback);
            });
            console.log(`Registered start hotkey: '${window.clickr.core.startShortcut}'`);

            // Register stop hotkey
            remote.globalShortcut.register(window.clickr.core.stopShortcut, () => window.clickr.core.stopClicking(stopCallback));
            console.log(`Registered stop hotkey: '${window.clickr.core.stopShortcut}'`);
        }
    }

    function disarm() {
        armedCover.addClass("hidden");
        armButton.html("Arm");

        window.clickr.core.armed = false;
        window.clickr.core.stopClicking();

        remote.globalShortcut.unregisterAll();
        console.log("Unregistered all hotkeys!");
    }
    
    armButton.click(() => {
        if (window.clickr.core.armed) {
            disarm();
        
            const currentClicks = clicksText.val().replace(" clicks.", "");
            clicksText.val(`Last Run: <span class='muted'>${currentClicks} clicks</span>`);
            statusText.html("");
            bothTexts.removeClass("active");
        } else {
            arm(() => { // Clicking started
                statusText.html("Clicking...");
                bothTexts.addClass("active");

                if (window.clickr.core.isStartAlertEnabled()) {
                    clickerStartAudio[0].load();
                    clickerStartAudio[0].play();
                }
            },
            _clicksSoFar => { // On each click
                clicksText.html(`${_clicksSoFar} clicks.`);
            },
            _finalClickTotal => { // Clicking ended
                statusText.html("");
                clicksText.html(`Last Run: <span class='muted'>${_finalClickTotal} clicks</span>`);
                bothTexts.removeClass("active");
            });
        }
    });

    /*
        Preferences
    */
    $("#preferences-button").click(() => ipcRenderer.send("async-channel", "open_preferences_modal"));
    $("#preferences-close-button").click(() => ipcRenderer.send("async-channel", "close_preferences_modal"));

    /* Mouse Event Delay */
    const eventDelayInput = $("#delay-wrapper > #event-delay");
    eventDelayInput.val(window.clickr.core.mouseEventDelay);
    eventDelayInput.focusout(() => {
        const _saveVal = eventDelayInput.val();
        if (_saveVal && _saveVal != "" && _saveVal > 0) {
            window.clickr.core.mouseEventDelay = _saveVal;
            window.clickr.store.set("mouseEventDelay", window.clickr.core.mouseEventDelay);
            console.log(`Updated mouse event delay: '${window.clickr.core.mouseEventDelay}ms'`);
        }
    });

    /* Clicker Start Notification Toggle */
    const alertSoundSwitch = new Switch($("#alert-sound-toggle")[0], { size: "small", onChange: () => {
        const checked = alertSoundSwitch.getChecked();
        window.clickr.store.clickerStartAlert = checked;
        window.clickr.store.set("clickerStartAlert", checked);
        console.log(`Alert sound: '${checked}'`);
    }});

    (window.clickr.core.clickerStartAlert) ? alertSoundSwitch.on() : alertSoundSwitch.off();
});