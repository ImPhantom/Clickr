import "../static/stylesheet.css";
import * as $ from 'jquery';

import { remote } from 'electron';

import * as ElectronStore from 'electron-store';
import * as StoreSchema from '../static/store_schema.json';

import * as Util from '../common/utilities';
import * as Clicker from '../common/clicker';
import * as Hotkeys from '../common/hotkeys';
import { stat } from "fs";

window.clickr = {};
window.clickr.store = new ElectronStore(StoreSchema);
window.clickr.core = new Clicker(clickr.store);
window.clickr.hotkeys = new Hotkeys(clickr.store);

$(document).ready(function () {
    const _window = remote.BrowserWindow.getFocusedWindow();
    $("#minimize-button").click(() => _window.minimize());
    $("#close-button").click(() => _window.close());

    clickr.hotkeys.registerReadHook(($(document.activeElement).is('input')) ? _active : null);

    /*
        Click Speed
    */
    const clickTimesInput = $("#click-speed > #click-times");
    clickTimesInput.val(clickr.core.clicksPerUnit);
    clickTimesInput.focusout(() => {
        clickr.core.clicksPerUnit = clickTimesInput.val();
        clickr.store.set("clickSpeed.times", clickr.core.clicksPerUnit);
        console.log("Updated clicks per unit");
    });

    const clickingUnitSelect = $("#click-speed > #unit-select");
    clickingUnitSelect.val(clickr.core.clickingUnit);
    clickingUnitSelect.change(() => {
        clickr.core.clickingUnit = clickingUnitSelect.val();
        clickr.store.set("clickSpeed.unit", clickr.core.clickingUnit);
        console.log("Updated clicking unit");
    });

    /*
        Hotkey Input Handling
    */
    const holdInput = $("#trigger-key"), toggleStartInput = $("#start-key"), toggleEndInput = $("#stop-key");
    $("#trigger-key #start-key #stop-key").focus(() => clickr.hotkeys.readInput($(this)));

    clickr.hotkeys.updateInput(holdInput, "holdTrigger.hotkey");
    holdInput.focusout(() => clickr.hotkeys.saveHotkey($(this), "holdTrigger.hotkey"));

    clickr.hotkeys.updateInput(toggleStartInput, "toggleTrigger.startHotkey");
    toggleStartInput.focusout(() => clickr.hotkeys.saveHotkey($(this), "toggleTrigger.startHotkey"));

    clickr.hotkeys.updateInput(toggleEndInput, "toggleTrigger.stopHotkey");
    toggleEndInput.focusout(() => clickr.hotkeys.saveHotkey($(this), "toggleTrigger.stopHotkey"));

    // Ensure current input is visible
    const currentInputWrapper = $(`#${clickr.core.triggerType}-input`);
    Util.setVisibility(currentInputWrapper, true);

    /*
        Trigger Type Handling
    */
    $(`#trigger-type #${clickr.core.triggerType}`).addClass("active");

    $("#trigger-type>#hold  #trigger-type>#toggle").click(() => {
        const typeClicked = $(this).attr("id");
        const currentType = (typeClicked == "hold") ? "toggle" : "hold";
        if (clickr.core.triggerType !== typeClicked) {
            $(`#trigger-type > #${currentType}`).removeClass("active");
            $(`#trigger-type > #${typeClicked}`).addClass("active");
            Util.setVisibility($(`#${currentType}-input`), false);
            Util.setVisibility($(`#${typeClicked}-input`), true);

            clickr.store.set("triggerType", typeClicked);
            clickr.core.triggerType = typeClicked;
        }
    });

    /*
        Mouse Button Select Handling
    */
    $(`#mouse-button #${clickr.core.clickingButton}`).addClass("active");

    $("#mouse-button>#left #mouse-button>#middle #mouse-button>#right").click(() => {
        const typeClicked = $(this).attr("id");
        const others = ["left", "middle", "right"].filter(_ => _ !== typeClicked);
        if (clickr.core.clickingButton !== typeClicked) {
            others.forEach(_elementId => {
                $(`#mouse-button > #${_elementId}`).removeClass("active");
            });
            $(`#mouse-button #${typeClicked}`).addClass("active");

            clickr.core.clickingButton = typeClicked;
        }
    });

    /*
        Arm Button/Functionality
    */
    const armButton = $("#arm-button > a");
    const armedCover = $("#armed-cover");
    armButton.click(() => {
        if (clickr.core.armed) {
            Util.setVisibility(armedCover, false);
            armButton.html("Arm");

            clickr.core.armed = false;
            clickr.hotkeys.stopListening();
            clickr.core.stopClicking();
        } else {
            Util.setVisibility(armedCover, true);
            armButton.html("Awaiting hotkey...");

            clickr.core.armed = true;
            const statusText = $("#info > #status");
            const clicksText = $("#info > #clicks");
            clickr.hotkeys.startListening(clickr.core,
                () => { // Clicker start
                    statusText.html("Clicking...");
                    $("#info>#status #info>#clicks").addClass("active");
                },
                _totalClicks => { // Clicker stop
                    statusText.html("Not clicking yet.");
                    $("#info>#status #info>#clicks").removeClass("active");
                },
                _clicksSoFar => { // OnClick
                    clicksText.html(`${_clicksSoFar} clicks.`);
                }
            );
        }
    });
});