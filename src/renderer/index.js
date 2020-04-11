'use strict'

import * as $ from 'jquery';

import "../static/stylesheet.css";

import 'weatherstar-switch/dist/switch.css';
import Switch from 'weatherstar-switch';

import 'selectize/dist/css/selectize.css';
import 'selectize/dist/js/selectize.min.js';

import { remote } from 'electron';
import keycode from 'keycode';

import * as ElectronStore from 'electron-store';
import * as StoreSchema from '../static/store_schema.json';

import * as packageJson from '../../package.json';
import { Clicker } from '../common/clicker';

window.clickr = {};
window.clickr.store = new ElectronStore({
    schema: StoreSchema
});

console.log(`Configuration Path: '${window.clickr.store.path}'`);

// Manually handle store migrations cause the builtin doesnt seem to work.
// Maybe move this to a separate 'migrations' file/class.

// Force triggerType to toggle if its set to hold (pre 0.1.2)
if (packageJson.version == "0.1.2") {
    if (window.clickr.store.get("holdTrigger")) { window.clickr.store.delete("holdTrigger"); }
    if (window.clickr.store.get("triggerType") == "hold") { window.clickr.store.set("triggerType", "toggle"); }
}

window.clickr.core = new Clicker(window.clickr.store);

$(document).ready(function () {
    const _window = remote.getCurrentWindow();
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
        console.log(`Updated click speed => '${window.clickr.core.clicksPerUnit}cpu'`);
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
            const _keychar = keychar(event);
            localHotkeyCache.push(_keychar);
        } else if (event.keyCode === 8) {
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

    function saveInputValue(element, saveTag, coreTag) {
        const hotkey = element.val().split(" + ");
        const shortcut = hotkey.map(_key => (_key == "ctrl") ? "CmdOrCtrl" : _key.charAt(0).toUpperCase() + _key.slice(1));
        window.clickr.store.set(`${saveTag}Hotkey`, hotkey);
        window.clickr.store.set(`${saveTag}Shortcut`, shortcut.join("+"));
        window.clickr.core.updateHotkey(coreTag, hotkey, shortcut.join("+"));
        console.log(`Saved '${saveTag}Hotkey' (${hotkey}) & '${saveTag}Shortcut' (${shortcut.join("+")}) to storage!`);
    }
    
    const toggleStartInput = $("#start-key"), toggleEndInput = $("#stop-key");

    updateInputValue(toggleStartInput, window.clickr.core.startHotkey); // updates stored value on application load
    toggleStartInput.focus(() => readInputValue(toggleStartInput)); // read new input when focused
    toggleStartInput.keydown(_event => handleInputKeydown(event, toggleStartInput)); // update hotkey on input keydown
    toggleStartInput.focusout(() => saveInputValue(toggleStartInput, "toggleTrigger.start", "start")); // on input unfocus store value to app config & update

    updateInputValue(toggleEndInput, window.clickr.core.stopHotkey);
    toggleEndInput.focus(() => readInputValue(toggleEndInput));
    toggleEndInput.keydown(_event => handleInputKeydown(event, toggleEndInput));
    toggleEndInput.focusout(() => saveInputValue(toggleEndInput, "toggleTrigger.stop", "stop"));

    // Ensure current input is visible
    $(`#${window.clickr.core.triggerType}-input`).removeClass("hidden");

    /*
        Single hotkey toggle
    */
    const singleHotkeySwitch = new switchLib($("#single-hotkey-toggle")[0], { size: "small", onChange: () => {
        const checked = singleHotkeySwitch.getChecked();
        const stopInputLabel = $("label[for='stop-key']");
        
        toggleEndInput.prop("disabled", checked);
        window.clickr.store.set("toggleTrigger.singleHotkeyToggle", checked);
        stopInputLabel.css("color", (checked) ? "var(--dark-text)" : "var(--text)");
        console.log("Single hotkey toggle:", singleHotkeySwitch.getChecked());
    }});

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
        if (window.clickr.core.triggerType === "toggle") {
            if (!window.clickr.core.startShortcut || !window.clickr.core.stopShortcut) return;

            if (singleHotkeySwitch.getChecked() && window.clickr.core.startShortcut) {
                // Register single toggle hotkey
                remote.globalShortcut.register(window.clickr.core.startShortcut, () => {
                    if (!window.clickr.core.clicking) {
                        window.clickr.core.startClicking(startCallback, clickCallback);
                    } else {
                        window.clickr.core.stopClicking(stopCallback);
                    }
                    
                });
                console.log(`Registered single hotkey toggle: '${window.clickr.core.startShortcut}'`);

            } else if (window.clickr.core.startShortcut && window.clickr.core.stopShortcut) {
                // Register start hotkey
                remote.globalShortcut.register(window.clickr.core.startShortcut, () => {
                    window.clickr.core.startClicking(() => startCallback(), _clicksSoFar => clickCallback(_clicksSoFar));
                });
                console.log(`Registered start hotkey: '${window.clickr.core.startShortcut}'`);

                // Register stop hotkey
                remote.globalShortcut.register(window.clickr.core.stopShortcut, () => window.clickr.core.stopClicking(stopCallback));
                console.log(`Registered stop hotkey: '${window.clickr.core.stopShortcut}'`);
            }
        } else {
            console.warn("TriggerType is invalid!");
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