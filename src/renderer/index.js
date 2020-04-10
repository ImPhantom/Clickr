'use strict'

import "../static/stylesheet.css";

import { remote } from 'electron';
import keycode from 'keycode';
import * as $ from 'jquery';

import * as ElectronStore from 'electron-store';
import * as StoreSchema from '../static/store_schema.json';

import * as packageJson from '../../package.json';
import { Clicker } from '../common/clicker';


window.clickr = {};
window.clickr.store = new ElectronStore(StoreSchema);
window.clickr.core = new Clicker(window.clickr.store);

$(document).ready(function () {
    const _window = remote.BrowserWindow.getFocusedWindow();
    $("#minimize-button").click(() => _window.minimize());
    $("#close-button").click(() => _window.close());
    $("#title-bar #version").html(`v${packageJson.version}`);

    /*
        Click Speed
    */
    const clickTimesInput = $("#click-speed > #click-times");
    clickTimesInput.val(window.clickr.core.clicksPerUnit);
    clickTimesInput.focusout(() => {
        window.clickr.core.clicksPerUnit = clickTimesInput.val();
        window.clickr.store.set("clickSpeed.times", window.clickr.core.clicksPerUnit);
        console.log("Updated clicks per unit");
    });

    const clickingUnitSelect = $("#click-speed > #unit-select");
    clickingUnitSelect.val(window.clickr.core.clickingUnit);
    clickingUnitSelect.change(() => {
        window.clickr.core.clickingUnit = clickingUnitSelect.val();
        window.clickr.store.set("clickSpeed.unit", window.clickr.core.clickingUnit);
        console.log("Updated clicking unit");
    });

    /*
        Hotkey Input Handling
    */
    let localHotkeyCache = [];
    function keychar(keyEvent) {
        const _key = keycode(keyEvent.keyCode);
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

    function handleInputKeydown(event, element) {
        if (event.keyCode !== 8 && localHotkeyCache.length < 3) {
            console.log(`wasnt backspace, cache isnt holding more than 3 keys`);
            const _keychar = keychar(event);
            localHotkeyCache.push(_keychar);
        } else if (event.keyCode === 8) {
            console.log(`was backspace`);
            localHotkeyCache.pop();
        }

        element.attr({
            "value": localHotkeyCache.join(" + "),
        });
    }

    function readInputValue(element) {
        localHotkeyCache = [];
        if (element.val() !== "") {
            localHotkeyCache = element.val().split(" + ");
        }
    }

    function updateInputValue(element, hotkey) {
        if (hotkey) {
            element.attr("value", hotkey.join(" + "));
        }
    }

    function saveInputValue(element, saveTag) {
        const hotkey = element.val().split(" + ");
        const shortcut = hotkey.map(_key => (_key == "ctrl") ? "CmdOrCtrl" : _key.charAt(0).toUpperCase() + _key.slice(1));
        window.clickr.store.set(`${saveTag}Hotkey`, hotkey);
        window.clickr.store.set(`${saveTag}Shortcut`, shortcut.join("+"));
        console.log(`Saved '${saveTag}Hotkey' (${hotkey}) & '${saveTag}Shortcut' (${shortcut.join("+")}) to storage!`);
    }
    
    const holdInput = $("#trigger-key"), toggleStartInput = $("#start-key"), toggleEndInput = $("#stop-key");

    updateInputValue(holdInput, window.clickr.core.holdHotkey); // update inital value
    holdInput.focus(() => readInputValue(holdInput)); // load current input hotkey into cache
    holdInput.keydown(_event => handleInputKeydown(event, holdInput)); // update current input hotkey on input
    holdInput.focusout(() => saveInputValue(holdInput, "holdTrigger.trigger")); // save hotkey when user unfocuses the input

    updateInputValue(toggleStartInput, window.clickr.core.startHotkey);
    toggleStartInput.focus(() => readInputValue(toggleStartInput));
    toggleStartInput.keydown(_event => handleInputKeydown(event, toggleStartInput));
    toggleStartInput.focusout(() => saveInputValue(toggleStartInput, "toggleTrigger.start"));

    updateInputValue(toggleEndInput, window.clickr.core.stopHotkey);
    toggleEndInput.focus(() => readInputValue(toggleEndInput));
    toggleEndInput.keydown(_event => handleInputKeydown(event, toggleEndInput));
    toggleEndInput.focusout(() => saveInputValue(toggleEndInput, "toggleTrigger.stop"));

    // Ensure current input is visible
    $(`#${window.clickr.core.triggerType}-input`).removeClass("hidden");

    /*
        Trigger Type Handling
    */
    console.log(`setting current trigger type to: '${window.clickr.core.triggerType}'`);
    $(`#trigger-type #${window.clickr.core.triggerType}`).addClass("active");

    function handleTriggerTypeChange(_clicked) {
        const typeClicked = _clicked.attr("id");
        const currentType = (typeClicked == "hold") ? "toggle" : "hold";
        if (window.clickr.core.triggerType !== typeClicked) {
            $(`#trigger-type > #${currentType}`).removeClass("active");
            $(`#trigger-type > #${typeClicked}`).addClass("active");
            $(`#${currentType}-input`).addClass("hidden");
            $(`#${typeClicked}-input`).removeClass("hidden");

            window.clickr.store.set("triggerType", typeClicked);
            window.clickr.core.triggerType = typeClicked;
        }
    }

    const holdTypeButton = $("#trigger-type > #hold"), toggleTypeButton = $("#trigger-type > #toggle");
    holdTypeButton.click(() => handleTriggerTypeChange(holdTypeButton));
    toggleTypeButton.click(() => handleTriggerTypeChange(toggleTypeButton));

    /*
        Mouse Button Select Handling
    */
    console.log(`setting current mouse button to: '${window.clickr.core.clickingButton}'`);
    $(`#mouse-button #${window.clickr.core.clickingButton}`).addClass("active");
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
        
        if (window.clickr.core.triggerType === "hold") {
            if (!window.clickr.core.holdShortcut) return;       

            disarm();
            remote.dialog.showMessageBox(null, { type: 'error', buttons: ['Okay'], defaultId: 0, title: 'Error', message: 'The "hold" trigger hasn\'t been implemented yet, sorry! Disarming...' });

            // TODO: Finish

        } else if (window.clickr.core.triggerType === "toggle") {
            if (!window.clickr.core.startShortcut || !window.clickr.core.stopShortcut) return;

            // Register start hotkey
            remote.globalShortcut.register(window.clickr.core.startShortcut, () => {
                window.clickr.core.startClicking(() => startCallback(), _clicksSoFar => clickCallback(_clicksSoFar));
            });
            console.log(`Registered start hotkey: '${window.clickr.core.startShortcut}'!`);

            // Register stop hotkey
            remote.globalShortcut.register(window.clickr.core.stopShortcut, () => window.clickr.core.stopClicking(stopCallback));
            console.log(`Registered stop hotkey: '${window.clickr.core.stopShortcut}'!`);
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
            bothTexts.removeClass("active");
        } else {
            arm(() => { // Clicking started
                statusText.html("Clicking...");
                bothTexts.addClass("active");
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
});